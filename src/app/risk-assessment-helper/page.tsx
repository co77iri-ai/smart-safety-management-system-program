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
      <SubHeader goBackHref="/" title="위험성 평가 도우미" />
      <div className="w-full flex-1 flex flex-col">
        {/* 스크롤 영역 */}
        <div className="w-full flex-1 flex flex-col px-[24px] overflow-y-auto py-[70px] max-h-[calc(100dvh-252px)]">
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
            <div className="w-full flex flex-col gap-[24px]">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="w-full bg-white border border-[#E6E7EB] rounded-2xl p-[24px] shadow-md"
                >
                  <h1 className="font-bold text-[16px] mb-[16px] text-gray-700">
                    분석 항목 #{index + 1}
                  </h1>

                  {(result.taskName ||
                    result.hazardType ||
                    result.hazardOutcome) && (
                    <div className="grid grid-cols-1 gap-[8px] bg-gray-50 p-[16px] rounded-xl">
                      {result.taskName && (
                        <p className="text-[14px]">
                          <span className="text-gray-600">세부작업</span>:{" "}
                          {result.taskName}
                        </p>
                      )}
                      {result.hazardType && (
                        <p className="text-[14px]">
                          <span className="text-gray-600">위험분류</span>:{" "}
                          {result.hazardType}
                        </p>
                      )}
                      {result.hazardOutcome && (
                        <p className="text-[14px]">
                          <span className="text-gray-600">위험상황결과</span>:{" "}
                          {result.hazardOutcome}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="w-full my-[24px]" />

                  {result.error ? (
                    <div>
                      <h1 className="font-bold text-[16px] mb-[8px] text-red-600">
                        AI 분석 실패
                      </h1>
                      <p className="text-red-500 bg-red-50 p-4 rounded-lg">
                        {result.error}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[16px]">
                      <h1 className="font-bold text-[16px] text-indigo-600">
                        위험성 평가 점수 비교
                      </h1>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                        {/* 기존 보고서 */}
                        <div className="flex flex-col justify-start items-center gap-[16px] p-[16px] bg-blue-50 rounded-2xl border border-blue-200">
                          <h2 className="text-[14px] font-bold text-blue-700">
                            기존 보고서
                          </h2>
                          <div className="grid w-full grid-cols-3 gap-[8px]">
                            <div className="bg-white rounded-xl py-[12px] px-[8px] flex flex-col items-center gap-[4px]">
                              <span className="text-gray-600 text-[11px] sm:text-[12px] leading-none">
                                가능성
                              </span>
                              <span className="text-[18px] sm:text-[20px] font-bold leading-none">
                                {result.prevPossibility ?? 0}
                              </span>
                            </div>
                            <div className="bg-white rounded-xl py-[12px] px-[8px] flex flex-col items-center gap-[4px]">
                              <span className="text-gray-600 text-[11px] sm:text-[12px] leading-none">
                                중대성
                              </span>
                              <span className="text-[18px] sm:text-[20px] font-bold leading-none">
                                {result.prevSeverity ?? 0}
                              </span>
                            </div>
                            <div className="bg-white rounded-xl py-[12px] px-[8px] flex flex-col items-center gap-[4px]">
                              <span className="text-gray-600 text-[11px] sm:text-[12px] leading-none">
                                위험성
                              </span>
                              <span className="text-[18px] sm:text-[20px] font-bold leading-none">
                                {result.prevRisk ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AI 분석 */}
                        <div className="flex flex-col justify-start items-center gap-[16px] p-[16px] bg-indigo-50 rounded-2xl border border-indigo-200">
                          <h2 className="text-[14px] font-bold text-indigo-700">
                            AI 분석
                          </h2>
                          <div className="grid w-full grid-cols-3 gap-[8px]">
                            <div className="bg-white rounded-xl py-[12px] px-[8px] flex flex-col items-center gap-[4px]">
                              <span className="text-gray-600 text-[11px] sm:text-[12px] leading-none">
                                가능성
                              </span>
                              <span className="text-[18px] sm:text-[20px] font-bold leading-none">
                                {result.aiSuggestion?.possibility}
                              </span>
                            </div>
                            <div className="bg-white rounded-xl py-[12px] px-[8px] flex flex-col items-center gap-[4px]">
                              <span className="text-gray-600 text-[11px] sm:text-[12px] leading-none">
                                중대성
                              </span>
                              <span className="text-[18px] sm:text-[20px] font-bold leading-none">
                                {result.aiSuggestion?.severity}
                              </span>
                            </div>
                            <div className="bg-white rounded-xl py-[12px] px-[8px] flex flex-col items-center gap-[4px]">
                              <span className="text-gray-600 text-[11px] sm:text-[12px] leading-none">
                                위험성
                              </span>
                              <span className="text-[18px] sm:text-[20px] font-bold leading-none">
                                {result.aiSuggestion?.risk}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
