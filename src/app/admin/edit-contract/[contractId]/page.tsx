"use client";

import "dayjs/locale/ko";
import { BaseLayout, SubHeader } from "@/components";
import { Button, Input } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendarEvent } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { Contract } from "@/models";

export default function EditContract({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const router = useRouter();
  const [contractId, setContractId] = useState<string>();
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    params.then((p) => {
      setContractId(p.contractId);
    });
  }, [params]);

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contract/${contractId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contract");
        }
        const contract: Contract = await response.json();
        setTitle(contract.title);
        setStartDate(dayjs(contract.startDate).toDate());
        setEndDate(dayjs(contract.endDate).toDate());
      } catch (error) {
        console.error("Error fetching contract:", error);
        toast.error("계약 정보를 불러오는데 실패했습니다.");
        router.push("/admin/contract");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [contractId, router]);

  const isVaildFormData =
    title.trim() !== "" &&
    startDate &&
    endDate &&
    dayjs(endDate).diff(startDate, "date") >= 0;

  const handleSubmit = async () => {
    if (!isVaildFormData || isFetching || !contractId) return;

    const fetching = async () => {
      const response = await fetch(`/api/contract/${contractId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
        } satisfies Omit<Contract, "id">),
      });

      if (!response.ok) {
        throw new Error("Failed to update contract");
      }

      return response.json();
    };

    setIsFetching(true);
    try {
      await toast.promise(fetching(), {
        loading: "계약을 수정 중입니다...",
        success: "계약이 수정되었습니다!",
        error: "계약 수정을 실패했습니다.",
      });
      router.push("/admin/contract");
    } catch (error) {
      console.error("Error updating contract:", error);
    } finally {
      setIsFetching(false);
    }
  };

  if (isLoading) {
    return (
      <BaseLayout mainContainerClassName="flex flex-col justify-center items-center">
        <div className="text-[16px] text-[#827DA1]">로딩 중...</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout mainContainerClassName="flex flex-col justify-start items-center">
      <SubHeader goBackHref="/admin/contract" title="계약 수정" />
      <div className="w-full flex-1 px-[24px] flex flex-col justify-start items-stretch gap-[8px]">
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
              <IconCalendarEvent size={28} color="#868E96" strokeWidth={1.5} />
            }
            placeholder="연도. 월. 일"
            valueFormat="YYYY. MM. DD"
            size="lg"
            radius="lg"
            mt="xs"
            locale="ko"
            maxDate={endDate}
            value={startDate}
            onChange={(date) => setStartDate(dayjs(date).toDate())}
            disabled={isFetching}
          />
        </Input.Wrapper>
        <Input.Wrapper label="계약 종료일" required size="lg">
          <DateInput
            leftSection={
              <IconCalendarEvent size={28} color="#868E96" strokeWidth={1.5} />
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
      </div>
      <div className="w-full p-[24px] flex justify-between items-center gap-[10px]">
        <Button
          size="xl"
          variant="light"
          type="button"
          color="dark"
          w="100%"
          radius="lg"
          onClick={() => router.push("/admin/contract")}
          disabled={isFetching}
        >
          취소
        </Button>
        <Button
          size="xl"
          type="button"
          color="indigo"
          w="100%"
          radius="lg"
          disabled={!isVaildFormData || isFetching}
          onClick={handleSubmit}
        >
          {isFetching ? "수정 중..." : "수정 완료"}
        </Button>
      </div>
    </BaseLayout>
  );
}
