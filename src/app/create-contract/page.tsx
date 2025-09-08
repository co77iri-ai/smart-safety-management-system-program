"use client";

import "dayjs/locale/ko";
import { BaseLayout, SubHeader } from "@/components";
import { Button, Input } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendarEvent, IconCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Contract } from "@/models";

export default function CreateContract() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [createdContract, setCreatedContract] = useState<Contract>();

  const createdContractURL = `https://localhost:3000/contract/${createdContract?.id}`;

  const isVaildFormData =
    title.trim() !== "" &&
    startDate &&
    endDate &&
    dayjs(endDate).diff(startDate, "date") >= 0;

  const handleSubmit = async () => {
    if (!isVaildFormData) return;
    toast.success("계약이 생성되었습니다.");
    setCreatedContract({
      id: "12312412412",
      title: title,
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
    });
  };

  return (
    <BaseLayout mainContainerClassName="flex flex-col justify-start items-center">
      {!createdContract && <SubHeader goBackHref="/" title="계약 생성" />}
      <div className="w-full flex-1 px-[24px] flex flex-col justify-start items-stretch gap-[8px]">
        {createdContract ? (
          <>
            <div className="w-full flex flex-col justify-start items-center gap-[16px] pt-[32px]">
              <div className="w-[64px] h-[64px] rounded-full bg-[#E2FBE9] flex justify-center items-center">
                <IconCheck size={44} color="#4AA153" />
              </div>
              <div className="w-full flex flex-col justify-center items-center gap-[8px]">
                <h1 className="text-[20px] leading-[20px] font-bold text-[#2D2551]">
                  계약이 성공적으로 생성되었습니다!
                </h1>
                <p className="text-[14px] leading-[14px] text-[#827DA1]">
                  작업자에게 QR코드 또는 URL 링크를 공유하세요
                </p>
              </div>
            </div>
            <div className="w-full bg-white border border-[#DBDAE4] rounded-2xl p-[16px] mt-[24px] flex flex-col justify-center items-center gap-[16px]">
              <div className="p-[16px]">
                <QRCode size={223} value={createdContractURL} />
              </div>
              <Button
                size="lg"
                variant="light"
                type="button"
                color="dark"
                w="100%"
                radius="lg"
              >
                갤러리에 저장
              </Button>
            </div>
            <div className="w-full bg-white border border-[#DBDAE4] rounded-2xl p-[16px] mt-[24px] flex justify-between items-center gap-[16px]">
              <div className="text-[#000000] font-bold text-[16px] leading-[155%] flex-1 overflow-hidden text-ellipsis">
                {createdContractURL}
              </div>
              <Button
                size="lg"
                variant="light"
                type="button"
                color="dark"
                radius="lg"
                miw={70}
              >
                URL 링크 복사
              </Button>
            </div>
          </>
        ) : (
          <>
            <Input.Wrapper label="계약명" required size="lg">
              <Input
                placeholder="예: 스마트 안전관리 시스템 구축"
                size="lg"
                radius="lg"
                mt="xs"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
              />
            </Input.Wrapper>
            <Input.Wrapper label="계약 시작일" required size="lg">
              <DateInput
                leftSection={
                  <IconCalendarEvent
                    size={28}
                    color="#868E96"
                    strokeWidth={1.5}
                  />
                }
                placeholder="연도. 월. 일"
                valueFormat="YYYY. MM. DD"
                size="lg"
                radius="lg"
                mt="xs"
                locale="ko"
                minDate={dayjs().toDate()}
                maxDate={endDate}
                value={startDate}
                onChange={(date) => setStartDate(dayjs(date).toDate())}
              />
            </Input.Wrapper>
            <Input.Wrapper label="계약 종료일" required size="lg">
              <DateInput
                leftSection={
                  <IconCalendarEvent
                    size={28}
                    color="#868E96"
                    strokeWidth={1.5}
                  />
                }
                placeholder="연도. 월. 일"
                valueFormat="YYYY. MM. DD"
                size="lg"
                radius="lg"
                mt="xs"
                locale="ko"
                minDate={startDate || dayjs().toDate()}
                value={endDate}
                onChange={(date) => setEndDate(dayjs(date).toDate())}
              />
            </Input.Wrapper>
          </>
        )}
      </div>
      <div className="w-full p-[24px] flex justify-between items-center gap-[10px]">
        {createdContract ? (
          <>
            <Link href="/" className="flex-1">
              <Button
                size="xl"
                variant="light"
                type="button"
                color="dark"
                w="100%"
                radius="lg"
              >
                처음으로
              </Button>
            </Link>
            <Link href="/contract" className="flex-1">
              <Button
                size="xl"
                type="button"
                color="indigo"
                w="100%"
                radius="lg"
              >
                사업현황
              </Button>
            </Link>
          </>
        ) : (
          <Button
            size="xl"
            type="button"
            color="indigo"
            w="100%"
            radius="lg"
            disabled={!isVaildFormData}
            onClick={handleSubmit}
          >
            계약 생성
          </Button>
        )}
      </div>
    </BaseLayout>
  );
}
