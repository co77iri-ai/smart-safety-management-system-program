"use client";

import { BottomDrawer } from "@/components";
import type { Site } from "@/models";
import { Button } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type SiteDetailInfoBottomDrawerProps = {
  site?: Site;
  isOpen: boolean;
  onClose?: () => void;
  onClickEditChecklist?: () => void;
  onClickEditDeadline?: () => void;
  onToggleChecklist?: () => void;
};

type CheckedMap = Record<string, Set<string>>; // name -> set of YYYYMMDD

const generateDateKeys = (startYyyymmdd: string, endYyyymmdd: string) => {
  const start = dayjs(startYyyymmdd, "YYYYMMDD");
  const end = dayjs(endYyyymmdd, "YYYYMMDD");
  const result: string[] = [];
  for (
    let d = start;
    d.isBefore(end) || d.isSame(end, "day");
    d = d.add(1, "day")
  ) {
    result.push(d.format("YYYYMMDD"));
  }
  return result;
};

export const SiteDetailInfoBottomDrawer = ({
  site,
  isOpen,
  onClose,
  onClickEditChecklist,
  onClickEditDeadline,
  onToggleChecklist,
}: SiteDetailInfoBottomDrawerProps) => {
  const [dateKeys, setDateKeys] = useState<string[]>([]);
  const [checkedMap, setCheckedMap] = useState<CheckedMap>({});

  const headerLabels = useMemo(
    () => dateKeys.map((k) => dayjs(k, "YYYYMMDD").format("M/D")),
    [dateKeys]
  );

  useEffect(() => {
    if (!site) {
      setDateKeys([]);
      setCheckedMap({});
      return;
    }
    const today = dayjs().format("YYYYMMDD");
    const end = dayjs(today, "YYYYMMDD").isAfter(
      dayjs(site.endDate, "YYYYMMDD")
    )
      ? site.endDate
      : today;
    const keys = generateDateKeys(site.startDate, end);
    setDateKeys(keys);

    const fetching = async () => {
      const query = new URLSearchParams({
        siteId: String(site.id),
        start: site.startDate,
        end,
      }).toString();
      const result: Record<string, string[]> = await fetch(
        `/api/checklist?${query}`
      )
        .then((res) => res.json())
        .catch(() => ({}));
      const map: CheckedMap = {};
      Object.entries(result[site.id] || {}).forEach(([name, dates]) => {
        map[name] = new Set(dates);
      });
      setCheckedMap(map);
    };
    fetching();
  }, [site]);

  const handleToggle = (name: string, dateKey: string) => () => {
    if (!site) return;

    const fetching = async () => {
      const body = {
        siteId: site.id,
        contractId: site.contractId,
        name,
        date: dateKey,
      };
      const result = await fetch(`/api/checklist`, {
        method: "POST",
        body: JSON.stringify(body),
      }).then((res) => res.json());

      setCheckedMap((prev) => {
        const next: CheckedMap = { ...prev };
        const set = new Set(next[name] ? Array.from(next[name]) : []);
        if (result?.checked) {
          set.add(dateKey);
        } else {
          set.delete(dateKey);
        }
        next[name] = set;
        return next;
      });

      onToggleChecklist?.();
    };

    toast.promise(fetching(), {
      loading: "안전의무사항을 반영하는 중입니다...",
      success: "안전의무사항이 반영되었습니다!",
      error: "안전의무사항 반영을 실패했습니다.",
    });
  };

  return (
    <BottomDrawer
      isOpen={isOpen && !!site}
      containerClassName="flex flex-col justify-between items-stretch gap-[24px]"
    >
      <h1 className="text-[18px] font-bold text-black leading-[110%] text-center w-full">
        {site?.address}
        <br />
        작업장 상세
      </h1>
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table>
          <thead>
            <tr>
              <th className="font-bold w-[150px] min-w-[150px] h-[50px] border-b border-[#E4DBDB] bg-[#fcfbfb] sticky left-0 z-20">
                안전의무사항
              </th>
              {headerLabels.map((date) => (
                <th
                  key={`head-${date}`}
                  className="font-bold w-[80px] min-w-[80px] h-[50px] border-b border-l border-[#E4DBDB]"
                >
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {site?.checklist.map((name) => (
              <tr key={name} className="h-[50px]">
                <td className="text-center border-b border-[#E4DBDB] bg-[#fcfbfb] sticky left-0 z-10">
                  {name}
                </td>
                {dateKeys.map((dateKey, index) => {
                  const isChecked = !!checkedMap[name]?.has(dateKey);
                  const displayDate = headerLabels[index];
                  return (
                    <td
                      key={`${name}-${displayDate}`}
                      className="border-b border-l border-[#E4DBDB]"
                    >
                      <button
                        type="button"
                        className="w-full h-full py-[13px] cursor-pointer flex items-center justify-center"
                        onClick={handleToggle(name, dateKey)}
                        aria-label={`${name} ${displayDate} 체크 토글`}
                      >
                        {isChecked ? (
                          <IconCircleCheckFilled
                            size={24}
                            color="#88E059"
                            className="mx-auto"
                          />
                        ) : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
            onClick={onClose}
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
            className="flex-1"
            onClick={onClickEditChecklist}
          >
            내용변경
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
            onClick={onClickEditDeadline}
          >
            기한변경
          </Button>
        </div>
      </div>
    </BottomDrawer>
  );
};
