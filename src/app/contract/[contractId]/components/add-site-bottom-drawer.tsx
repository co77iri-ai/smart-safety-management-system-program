"use client";

import "dayjs/locale/ko";
import { BottomDrawer } from "@/components";
import type { Site } from "@/models";
import { Button, Input, Modal } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendarEvent } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import DaumPostcodeEmbed from "react-daum-postcode";

export type AddSiteBottomDrawerProps = {
  contractId: number;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (siteBody: Omit<Site, "id">, onDone: () => void) => void;
};

export const AddSiteBottomDrawer = ({
  contractId,
  isOpen,
  onClose,
  onSubmit,
}: AddSiteBottomDrawerProps) => {
  const [isOpenSearchAddress, setIsOpenSearchAddress] = useState(false);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isFetching, setIsFetching] = useState(false);

  const isVaildFormData =
    title.trim() !== "" &&
    address.trim() !== "" &&
    startDate &&
    endDate &&
    dayjs(endDate).diff(startDate, "date") >= 0;

  const reset = () => {
    setTitle("");
    setAddress("");
    setStartDate(undefined);
    setEndDate(undefined);
    setIsFetching(false);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!isVaildFormData || isFetching || !onSubmit) return;
    setIsFetching(true);
    try {
      // NCP Geocoding: 주소 -> 좌표
      let lat = 0;
      let lng = 0;
      try {
        const res = await fetch(
          `/api/naver/geocode?query=${encodeURIComponent(address)}`
        );
        const data = await res.json();
        const item = data?.addresses?.[0];
        if (item) {
          lat = Number(item.y);
          lng = Number(item.x);
        }
      } catch {}
      const body: Omit<Site, "id"> = {
        name: title,
        address,
        contractId,
        latitude: lat,
        longitude: lng,
        startDate: dayjs(startDate).format("YYYYMMDD"),
        endDate: dayjs(endDate).format("YYYYMMDD"),
        checklist: [
          "TBM일지",
          "안전작업허가",
          "작업계획서",
          "특별교육",
          "건설기계 체크리스트",
        ],
      };
      onSubmit(body, () => {
        setIsFetching(false);
      });
      handleClose();
    } catch {
      setIsFetching(false);
    }
  };

  return (
    <>
      <BottomDrawer
        isOpen={isOpen}
        containerClassName="flex flex-col justify-between items-stretch gap-[24px]"
      >
        <h1 className="text-[18px] font-bold text-black leading-[110%] text-center w-full">
          신규 작업장 등록
        </h1>
        <div className="w-full overflow-x-auto overflow-y-hidden flex flex-col justify-between items-stretch gap-[10px]">
          <Input.Wrapper label="작업장명" required size="lg">
            <Input
              placeholder="예: 스마트 안전관리 시스템 구축"
              size="lg"
              radius="lg"
              mt="xs"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
          </Input.Wrapper>
          <Input.Wrapper label="주소" required size="lg">
            <div className="flex justify-between w-full items-center gap-[10px] mt-[10px]">
              <Input
                placeholder="주소를 입력해주세요"
                size="lg"
                radius="lg"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                className="flex-1"
              />
              <Button
                size="lg"
                type="button"
                color="indigo"
                radius="lg"
                px="xs"
                onClick={() => setIsOpenSearchAddress(true)}
              >
                주소찾기
              </Button>
            </div>
          </Input.Wrapper>
          {isOpen && (
            <Input.Wrapper label="시작일" required size="lg">
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
          )}
          {isOpen && (
            <Input.Wrapper label="종료일" required size="lg">
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
          )}
        </div>
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
              disabled={!isVaildFormData || isFetching}
            >
              등록하기
            </Button>
          </div>
        </div>
      </BottomDrawer>
      <Modal
        opened={isOpenSearchAddress}
        onClose={() => setIsOpenSearchAddress(false)}
        title="주소 검색"
        centered
        radius="lg"
        zIndex={99999}
        transitionProps={{ transition: "fade-up" }}
      >
        <DaumPostcodeEmbed
          onComplete={(address) => {
            setIsOpenSearchAddress(false);
            setAddress(address.address);
          }}
        />
      </Modal>
    </>
  );
};
