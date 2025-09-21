"use client";

import { BaseLayout, IconButton, SubHeader } from "@/components";
import { Button } from "@mantine/core";
import { IconFileDescription } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

export default function RiskAssessmentHelper() {
  const [isUpload, setIsUpload] = useState(false);

  return (
    <BaseLayout mainContainerClassName="flex-col flex justify-between items-stretch">
      <SubHeader goBackHref="/" title="위험성 평가 도우미" />
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {!isUpload ? (
          <div className="w-[181px] h-[181px] flex justify-stretch items-stretch">
            <IconButton
              href="#"
              title="파일 업로드"
              Icon={IconFileDescription}
              iconColor="#4060E4"
              iconBgColor="#DFEAFD"
              onClick={() => setIsUpload(true)}
            />
          </div>
        ) : (
          <div className="px-[24px] w-full h-[calc(100vh-85.2px-57px-108px)] overflow-y-auto overflow-x-hidden">
            <div className="w-full bg-white border border-[#E6E7EB] rounded-2xl p-[24px] shadow-md">
              <h1 className="font-black text-[20px] mb-[16px]">작업 개요</h1>
              <h2 className="text-[16px] text-gray-500">세부 작업</h2>
              <p className="text-[16px] font-bold text-black">교량보수</p>
            </div>
            <div className="w-full bg-white border border-[#E6E7EB] rounded-2xl p-[24px] shadow-md mt-[24px]">
              <h1 className="font-black text-[20px] mb-[16px]">
                유해위험요인 파악
              </h1>
              <h2 className="text-[16px] text-gray-500">위험 분류</h2>
              <p className="text-[16px] font-bold text-black">기계적요인</p>
              <h2 className="text-[16px] text-gray-500 mt-[16px] mb-[8px]">
                유해/위험 상황 및 결과
              </h2>
              <p className="text-[16px] font-bold text-black bg-gray-100 p-[16px] rounded-xl">
                교량 바단판 균열보수 작업을 마치고 굴절차 사다리를 접는 중에
                구조물과 간섭이 발생하여 확인차 굴절차 운전자가 사다리로 내리는
                중에 추락
              </p>
            </div>
            <div className="w-full bg-white border border-[#E6E7EB] rounded-2xl p-[24px] shadow-md mt-[24px] mb-[32px]">
              <h1 className="font-black text-[20px] mb-[16px]">
                위험성 비교 분석
              </h1>
              <div className="flex justify-between items-start gap-[16px]">
                <div className="flex flex-col justify-start items-center flex-1 gap-[16px] p-[16px]">
                  <h2 className="text-[20px] text-gray-600 font-bold">
                    기존 보고서
                  </h2>
                  <div className="flex flex-col justify-center items-center bg-gray-100 w-full rounded-2xl py-[16px] gap-[4px]">
                    <h3 className="text-gray-600 text-[16px] leading-[16px]">
                      가능성
                    </h3>
                    <p className="text-black text-[20px] font-bold leading-[20px]">
                      3
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-center bg-gray-100 w-full rounded-2xl py-[16px] gap-[4px]">
                    <h3 className="text-gray-600 text-[16px] leading-[16px]">
                      중대성
                    </h3>
                    <p className="text-black text-[20px] font-bold leading-[20px]">
                      3
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-center bg-gray-100 w-full rounded-2xl py-[16px] gap-[4px]">
                    <h3 className="text-gray-600 text-[16px] leading-[16px]">
                      위험성
                    </h3>
                    <p className="text-black text-[20px] font-bold leading-[20px]">
                      3
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-start items-center flex-1 gap-[16px] bg-blue-100 p-[16px] rounded-2xl border border-blue-300">
                  <h2 className="text-[20px] text-indigo-600 font-bold">
                    AI 제안
                  </h2>
                  <div className="flex flex-col justify-center items-center bg-gray-100 w-full rounded-2xl py-[16px] gap-[4px]">
                    <h3 className="text-gray-600 text-[16px] leading-[16px]">
                      가능성
                    </h3>
                    <p className="text-black text-[20px] font-bold leading-[20px]">
                      3
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-center bg-gray-100 w-full rounded-2xl py-[16px] gap-[4px]">
                    <h3 className="text-gray-600 text-[16px] leading-[16px]">
                      중대성
                    </h3>
                    <p className="text-black text-[20px] font-bold leading-[20px]">
                      3
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-center bg-gray-100 w-full rounded-2xl py-[16px] gap-[4px]">
                    <h3 className="text-gray-600 text-[16px] leading-[16px]">
                      위험성
                    </h3>
                    <p className="text-black text-[20px] font-bold leading-[20px]">
                      3
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isUpload && (
        <div className="w-full p-[24px] flex justify-between items-center gap-[10px]">
          <Button
            size="xl"
            variant="light"
            type="button"
            color="dark"
            w="100%"
            radius="lg"
            className="flex-1"
            onClick={() => setIsUpload(false)}
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
          >
            보고서 저장
          </Button>
        </div>
      )}
    </BaseLayout>
  );
}
