"use client";

import { BaseLayout, IconButton, SubHeader } from "@/components";
import { Button, Loader } from "@mantine/core";
import { IconFileDescription } from "@tabler/icons-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE_MB = 4.5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface AiAssessment {
  possibility: number;
  severity: number;
  risk: number;
}

interface AssessmentResult {
  originalText: string;
  aiSuggestion?: AiAssessment;
  error?: string;
  taskName?: string; // 세부작업
  hazardType?: string; // 위험분류
  hazardOutcome?: string; // 위험상황결과
  prevPossibility?: number; // 기존 보고서 가능성
  prevSeverity?: number; // 기존 보고서 중대성
  prevRisk?: number; // 기존 보고서 위험성
}

export default function RiskAssessmentHelper() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = new Set([
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ]);

    if (!allowed.has(file.type)) {
      setError("PDF, PNG, JPG, JPEG 파일만 업로드할 수 있습니다.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`파일 크기는 ${MAX_FILE_SIZE_MB}MB를 초과할 수 없습니다.`);
      return;
    }

    setIsProcessing(true);
    setResults([]);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/risk-assessment/stream", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API 호출에 실패했습니다.");

      const data = await response.json();
      const normalized = Array.isArray(data) ? data : [data];

      const mapped: AssessmentResult[] = normalized.map((item: any) => {
        const possibility = item.가능성 ?? item.possibility ?? item.pos ?? 0;
        const severity = item.중대성 ?? item.severity ?? 0;
        const risk = item.위험성 ?? item.risk ?? 0;
        const aiSuggestion: AiAssessment = {
          possibility: Number(possibility) || 0,
          severity: Number(severity) || 0,
          risk: Number(risk) || 0,
        };
        const taskName = item.세부작업 ?? item.task ?? item.taskName ?? "";
        const hazardType = item.위험분류 ?? item.hazardType ?? "";
        const hazardOutcome =
          item.위험상황결과 ??
          item["유해/위험 상황 및 결과"] ??
          item.hazardOutcome ??
          "";

        const prevPossibility =
          Number(item["기존보고서의가능성점수"] ?? item.prevPossibility ?? 0) ||
          0;
        const prevSeverity =
          Number(item["기존보고서의중대성점수"] ?? item.prevSeverity ?? 0) || 0;
        const prevRisk =
          Number(item["기존보고서의위험성점수"] ?? item.prevRisk ?? 0) || 0;

        return {
          originalText: "",
          aiSuggestion,
          taskName,
          hazardType,
          hazardOutcome,
          prevPossibility,
          prevSeverity,
          prevRisk,
        };
      });

      setResults(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setIsProcessing(false);
    setResults([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!results.length) return;
    const rows = results.map((r, idx) => ({
      번호: idx + 1,
      세부작업: r.taskName ?? "",
      위험분류: r.hazardType ?? "",
      위험상황결과: r.hazardOutcome ?? "",
      기존_가능성: r.prevPossibility ?? 0,
      기존_중대성: r.prevSeverity ?? 0,
      기존_위험성: r.prevRisk ?? 0,
      AI_가능성: r.aiSuggestion?.possibility ?? 0,
      AI_중대성: r.aiSuggestion?.severity ?? 0,
      AI_위험성: r.aiSuggestion?.risk ?? 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "위험성평가");

    const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `risk-assessment-${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <BaseLayout mainContainerClassName="flex-col flex justify-between items-stretch">
      <SubHeader goBackHref="/guest" title="위험성 평가 도우미" />
      <div className="w-full flex-1 flex flex-col">
        {/* 스크롤 영역 */}
        <div className="w-full flex-1 flex flex-col px-[24px] overflow-y-auto max-h-[calc(100dvh-252px)]">
          {results.length === 0 && !isProcessing && (
            <div className="w-full h-full flex flex-col justify-center items-center gap-[8px]">
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
                ref={fileInputRef}
              />
              <div className="w-[181px] h-[181px] flex justify-stretch items-stretch">
                <IconButton
                  href="#"
                  title={`위험성평가자료\n업로드`}
                  Icon={IconFileDescription}
                  iconColor="#4060E4"
                  iconBgColor="#DFEAFD"
                  onClick={() => fileInputRef.current?.click()}
                />
              </div>
              <p className="text-[12px] text-gray-500">
                허용 형식: PDF, PNG, JPG, JPEG · 최대 용량: {MAX_FILE_SIZE_MB}MB
              </p>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          )}

          {isProcessing && (
            <div className="w-full h-full flex flex-col justify-center items-center gap-[16px]">
              <Loader />
              <p className="text-gray-600 text-center">
                스마트 안전관리 LLM이 위험성을 평가 중입니다...
                <br />
                화면을 닫지 말고 기다려주세요.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="w-full">
              <div className="w-full overflow-x-auto">
                <table className="min-w-[900px] w-full table-auto border-collapse bg-white rounded-2xl overflow-hidden border border-[#E6E7EB]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="px-4 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[100px]">
                        세부작업
                      </th>
                      <th className="px-4 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[120px]">
                        위험분류
                      </th>
                      <th className="px-4 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB]">
                        유해·위험 상황 및 결과
                      </th>
                      <th className="px-3 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[70px]">
                        기존
                        <br />
                        가능성
                      </th>
                      <th className="px-3 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[70px]">
                        기존
                        <br />
                        중대성
                      </th>
                      <th className="px-3 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[70px]">
                        기존
                        <br />
                        위험성
                      </th>
                      <th className="px-3 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[70px]">
                        AI제안
                        <br />
                        가능성
                      </th>
                      <th className="px-3 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[70px]">
                        AI제안
                        <br />
                        중대성
                      </th>
                      <th className="px-3 py-3 text-center text-[13px] sm:text-[14px] font-bold border-b border-[#E6E7EB] w-[70px]">
                        AI제안
                        <br />
                        위험성
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={index}
                        className="border-b last:border-0 border-[#E6E7EB]"
                      >
                        <td className="px-4 py-3 text-[14px] sm:text-[15px] text-gray-700 align-top whitespace-pre-wrap text-center">
                          {result.taskName || ""}
                        </td>
                        <td className="px-4 py-3 text-[14px] sm:text-[15px] text-gray-700 align-top whitespace-pre-wrap text-center">
                          {result.hazardType || ""}
                        </td>
                        <td className="px-4 py-3 text-[14px] sm:text-[15px] text-gray-700 align-top whitespace-pre-wrap">
                          {result.hazardOutcome || ""}
                        </td>
                        <td className="px-3 py-3 text-center text-[22px] sm:text-[26px] text-gray-900 align-top font-extrabold leading-none">
                          {result.prevPossibility ?? 0}
                        </td>
                        <td className="px-3 py-3 text-center text-[22px] sm:text-[26px] text-gray-900 align-top font-extrabold leading-none">
                          {result.prevSeverity ?? 0}
                        </td>
                        <td className="px-3 py-3 text-center text-[22px] sm:text-[26px] text-gray-900 align-top font-extrabold leading-none">
                          {result.prevRisk ?? 0}
                        </td>
                        <td className="px-3 py-3 text-center text-[22px] sm:text-[26px] text-indigo-700 align-top font-extrabold leading-none">
                          {result.aiSuggestion?.possibility ?? 0}
                        </td>
                        <td className="px-3 py-3 text-center text-[22px] sm:text-[26px] text-indigo-700 align-top font-extrabold leading-none">
                          {result.aiSuggestion?.severity ?? 0}
                        </td>
                        <td className="px-3 py-3 text-center text-[22px] sm:text-[26px] text-indigo-700 align-top font-extrabold leading-none">
                          {result.aiSuggestion?.risk ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {(isProcessing || results.length > 0) && (
        <div className="sticky bottom-0 left-0 right-0 w-full bg-white p-[24px] flex justify-between items-center gap-[10px] z-50">
          <Button
            size="xl"
            variant="light"
            type="button"
            color="dark"
            w="100%"
            radius="lg"
            className="flex-1"
            onClick={handleReset}
            disabled={isProcessing}
          >
            다시 분석하기
          </Button>
          <Button
            size="xl"
            type="button"
            color="indigo"
            w="100%"
            radius="lg"
            className="flex-1"
            disabled={isProcessing}
            onClick={handleDownload}
          >
            보고서 저장
          </Button>
        </div>
      )}
    </BaseLayout>
  );
}
