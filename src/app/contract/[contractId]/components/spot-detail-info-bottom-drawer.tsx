/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { BottomDrawer } from "@/components";
import { MapSpot } from "@/models";
import { Button } from "@mantine/core";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";

export type SpotDetailInfoBottomDrawerProps = {
  spot?: MapSpot;
  onClose?: () => void;
};

const spotDetailInfo = {
  papers: [
    { name: "TBM일지", checks: ["DONE", undefined, "ERROR", "DONE", "DONE"] },
    {
      name: "안전작업허가",
      checks: ["DONE", undefined, "ERROR", "DONE", "DONE"],
    },
    {
      name: "작업계획서",
      checks: ["DONE", undefined, "ERROR", "DONE", "DONE"],
    },
    { name: "특별교육", checks: ["DONE", undefined, "ERROR", "DONE", "DONE"] },
    {
      name: "건설기계 체크리스트",
      checks: ["DONE", undefined, "ERROR", "DONE", "DONE"],
    },
  ],
};

export const SpotDetailInfoBottomDrawer = ({
  spot,
  onClose,
}: SpotDetailInfoBottomDrawerProps) => {
  return (
    <BottomDrawer
      isOpen={!!spot}
      containerClassName="flex flex-col justify-between items-stretch gap-[24px]"
    >
      <h1 className="text-[18px] font-bold text-black leading-[110%] text-center w-full">
        {spot?.address}
        <br />
        작업장 상세
      </h1>
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table>
          <thead>
            <tr>
              <th className="font-bold w-[150px] min-w-[150px] h-[50px] border-b border-[#E4DBDB] bg-[#fcfbfb]">
                안전의무사항
              </th>
              <th className="font-bold w-[80px] min-w-[80px] h-[50px] border-b border-l border-[#E4DBDB]">
                7/1
              </th>
              <th className="font-bold w-[80px] min-w-[80px] h-[50px] border-b border-l border-[#E4DBDB]">
                7/2
              </th>
              <th className="font-bold w-[80px] min-w-[80px] h-[50px] border-b border-l border-[#E4DBDB]">
                7/3
              </th>
              <th className="font-bold w-[80px] min-w-[80px] h-[50px] border-b border-l border-[#E4DBDB]">
                7/4
              </th>
              <th className="font-bold w-[80px] min-w-[80px] h-[50px] border-b border-l border-[#E4DBDB]">
                7/5
              </th>
            </tr>
          </thead>
          <tbody>
            {spotDetailInfo.papers.map(({ name, checks }) => (
              <tr key={name} className="h-[50px]">
                <td className="text-center border-b border-[#E4DBDB] bg-[#fcfbfb]">
                  {name}
                </td>
                {checks.map((check, index) => (
                  <td
                    key={index}
                    className="border-b border-l border-[#E4DBDB]"
                  >
                    {check === "DONE" ? (
                      <IconCircleCheckFilled
                        size={24}
                        color="#88E059"
                        className="mx-auto"
                      />
                    ) : check === "ERROR" ? (
                      <IconCircleXFilled
                        size={24}
                        color="#FF2F2F"
                        className="mx-auto"
                      />
                    ) : undefined}
                  </td>
                ))}
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
          >
            기한변경
          </Button>
        </div>
      </div>
    </BottomDrawer>
  );
};
