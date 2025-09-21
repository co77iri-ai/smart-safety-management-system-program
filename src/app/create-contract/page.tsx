"use client";

import "dayjs/locale/ko";
import { BaseLayout, SubHeader } from "@/components";
import { Button, Input } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendarEvent, IconCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import QRCode from "react-qr-code";
import type { Contract } from "@/models";

export default function CreateContract() {
  const [isFetching, setIsFetching] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [createdContract, setCreatedContract] = useState<Contract>();

  const qrContainerRef = useRef<HTMLDivElement>(null);

  const createdContractURL = `${process.env.NEXT_PUBLIC_HOSTNAME}/contract/${createdContract?.id}`;

  const isVaildFormData =
    title.trim() !== "" &&
    startDate &&
    endDate &&
    dayjs(endDate).diff(startDate, "date") >= 0;

  const handleSubmit = async () => {
    if (!isVaildFormData || isFetching) return;
    const fetching = async () => {
      const result = await fetch("/api/contract", {
        method: "POST",
        body: JSON.stringify({
          title,
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
        } satisfies Omit<Contract, "id">),
      })
        .then((res) => {
          return res.json();
        })
        .catch((error) => {
          throw error;
        });
      setCreatedContract(result);
    };

    setIsFetching(true);
    toast.promise(fetching(), {
      loading: "신규 계약을 생성 중입니다...",
      success: "계약이 생성되었습니다!",
      error: "계약 생성을 실패했습니다.",
    });
    setIsFetching(false);
  };

  const handleDownloadQr = async () => {
    try {
      const container = qrContainerRef.current;
      if (!container) return;
      const svg = container.querySelector("svg");
      if (!svg) return;

      const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
      if (!clonedSvg.getAttribute("xmlns")) {
        clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }

      const widthAttr = clonedSvg.getAttribute("width");
      const heightAttr = clonedSvg.getAttribute("height");
      const width = widthAttr ? parseInt(widthAttr, 10) : 223;
      const height = heightAttr ? parseInt(heightAttr, 10) : 223;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `contract-qr-${createdContract?.id ?? "unknown"}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      };
      image.src = url;
    } catch {
      toast.error("QR 코드 저장 중 오류가 발생했습니다.");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(createdContractURL);
      toast.success("URL이 복사되었습니다.");
    } catch {
      try {
        const input = document.createElement("input");
        input.value = createdContractURL;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
        toast.success("URL이 복사되었습니다.");
      } catch {
        toast.error("URL 복사에 실패했습니다.");
      }
    }
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
              <div className="p-[16px]" ref={qrContainerRef}>
                <QRCode size={223} value={createdContractURL} />
              </div>
              <Button
                size="lg"
                variant="light"
                type="button"
                color="dark"
                w="100%"
                radius="lg"
                onClick={handleDownloadQr}
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
                onClick={handleCopyUrl}
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
                disabled={isFetching}
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
                disabled={isFetching}
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
                disabled={isFetching}
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
            disabled={!isVaildFormData || isFetching}
            onClick={handleSubmit}
          >
            계약 생성
          </Button>
        )}
      </div>
    </BaseLayout>
  );
}
