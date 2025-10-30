"use client";

import { BottomDrawer } from "@/components";
import { Site } from "@/models";
import { Button, Input } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendarEvent } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export type EditSiteBottomDrawerProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (siteId: Site["id"], siteBody: Partial<Omit<Site, "id">>) => void;
  site?: Site;
};

export const EditSiteBottomDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  site,
}: EditSiteBottomDrawerProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const nowDateString = dayjs().format("YYYYMMDD");
  const isVaildDates =
    site?.startDate &&
    site?.endDate &&
    (site?.startDate !== nowDateString || site?.endDate !== nowDateString);

  const reset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = () => {
    if (!isVaildDates) return;

    const body: Partial<Omit<Site, "id">> = {
      startDate: dayjs(startDate).format("YYYYMMDD"),
      endDate: dayjs(endDate).format("YYYYMMDD"),
    };

    onSubmit?.(site.id, body);
    handleClose();
  };

  useEffect(() => {
    if (site) {
      setStartDate(dayjs(site.startDate).toDate());
      setEndDate(dayjs(site.endDate).toDate());
    }
  }, [site]);

  return (
    <BottomDrawer
      isOpen={isOpen}
      containerClassName="flex flex-col justify-between items-stretch gap-[24px]"
    >
      <h1 className="text-[18px] font-bold text-black leading-[110%] text-center w-full">
        작업장 기한 변경
      </h1>

      {isOpen && (
        <Input.Wrapper label="시작일" required size="lg">
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
            minDate={dayjs().toDate()}
            maxDate={endDate}
            value={startDate}
            onChange={(date) => setStartDate(dayjs(date).toDate())}
          />
        </Input.Wrapper>
      )}

      {isOpen && (
        <Input.Wrapper label="종료일" required size="lg">
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
          />
        </Input.Wrapper>
      )}

      <div className="w-full flex justify-between items-center gap-[10px]">
        <div className="flex-1">
          <Button
            size="xl"
            variant="light"
            type="button"
            color="dark"
            w="100%"
            radius="lg"
            onClick={handleClose}
          >
            닫기
          </Button>
        </div>
        <div className="flex-1">
          <Button
            size="xl"
            type="button"
            color="indigo"
            w="100%"
            radius="lg"
            px="xs"
            onClick={handleSubmit}
            disabled={!isVaildDates}
          >
            등록하기
          </Button>
        </div>
      </div>
    </BottomDrawer>
  );
};
