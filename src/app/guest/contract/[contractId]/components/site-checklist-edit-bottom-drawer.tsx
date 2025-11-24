import { BottomDrawer } from "@/components";
import type { Site } from "@/models";
import { Button, TextInput } from "@mantine/core";
import { IconSquarePlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type SiteChecklistEditBottomDrawerProps = {
  site?: Site;
  onSave?: (updatedSite: Site) => void;
  onClose?: () => void;
};

const checklistItems = [
  "TBM일지",
  "안전작업허가",
  "작업계획서",
  "특별교육",
  "건설기계 체크리스트",
] as const;

export const SiteChecklistEditBottomDrawer = ({
  site,
  onSave,
  onClose,
}: SiteChecklistEditBottomDrawerProps) => {
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const defaultItems = useMemo<string[]>(() => [...checklistItems], []);
  const customItems = useMemo(
    () => checklist.filter((name) => !defaultItems.includes(name)),
    [checklist, defaultItems]
  );

  const normalizeName = (value: string) => value.replace(/\s+/g, " ").trim();

  const handleAddItem = (name: string) => () => {
    setChecklist((state) => {
      const newState = [...state, name];
      return newState;
    });
    toast.success(`"${name}" 사항을 추가했어요.\n저장하기 버튼을 눌러주세요!`);
  };

  const handleRemoveItem = (name: string) => () => {
    setChecklist((state) => {
      const newState = [...state.filter((v) => v !== name)];
      return newState;
    });
    toast.success(`"${name}" 사항을 제거했어요.\n저장하기 버튼을 눌러주세요!`);
  };

  const handleAddCustom = () => {
    const value = normalizeName(newItem);
    if (value.length < 2 || value.length > 50) {
      toast.error("항목은 2~50자 사이여야 해요.");
      return;
    }
    if (checklist.includes(value)) {
      toast.error("이미 추가된 항목이에요.");
      return;
    }
    setChecklist((state) => [...state, value]);
    setNewItem("");
    toast.success(`"${value}" 사항을 추가했어요.\n저장하기 버튼을 눌러주세요!`);
  };

  const handleSave = () => {
    if (!site) return;

    const fetching = async () => {
      const result = await fetch(`/api/site/${site.id}/checklist`, {
        method: "PUT",
        body: JSON.stringify({ checklist }),
      })
        .then((res) => res.json())
        .catch((err) => {
          throw err;
        });
      onSave?.(result);
      onClose?.();
    };

    toast.promise(fetching(), {
      loading: "안전의무사항의 변경내용을 저장중입니다...",
      success: "안전의무사항의 내용이 변경되었습니다!",
      error: "안전의무사항의 변경내용 저장을 실패했습니다.",
    });
  };

  useEffect(() => {
    if (site) {
      setChecklist(site.checklist);
    } else {
      setChecklist([]);
    }
  }, [site]);

  return (
    <BottomDrawer
      isOpen={!!site}
      containerClassName="flex flex-col justify-between items-stretch gap-[24px]"
    >
      <h1 className="text-[18px] font-bold text-black leading-[110%] text-center w-full">
        안전의무사항 내용변경
      </h1>
      <div className="w-full flex items-center gap-[8px]">
        <TextInput
          placeholder="사용자 정의 항목을 입력하세요"
          value={newItem}
          onChange={(e) => setNewItem(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCustom();
          }}
          radius="lg"
          className="flex-1"
        />
        <Button
          size="md"
          type="button"
          color="indigo"
          radius="lg"
          className="min-h-[36px] max-h-[36px]"
          onClick={handleAddCustom}
          leftSection={<IconSquarePlus size={18} />}
        >
          추가
        </Button>
      </div>
      <div className="w-full overflow-x-hidden overflow-y-auto max-h-[43dvh]">
        <table className="w-full">
          <thead>
            <tr>
              <th className="font-bold w-[200px] min-w-[200px] h-[50px] border-b border-[#E4DBDB] bg-[#fcfbfb] sticky left-0 z-20">
                안전의무사항
              </th>
              <th className="font-bold w-[80px] min-w-[80px] h-[50px] border-b border-l border-[#E4DBDB]"></th>
            </tr>
          </thead>
          <tbody>
            {site &&
              defaultItems.map((name) => (
                <tr key={`opt-${name}`} className="h-[40px]">
                  <td className="text-center border-b border-[#E4DBDB] bg-[#fcfbfb] sticky left-0 z-10">
                    {name}
                  </td>
                  <td className="border-b border-l border-[#E4DBDB]">
                    {checklist.includes(name) ? (
                      <IconTrash
                        size={28}
                        color="#FF2F2F"
                        className="mx-auto cursor-pointer"
                        onClick={handleRemoveItem(name)}
                      />
                    ) : (
                      <IconSquarePlus
                        size={28}
                        color="#5560DD"
                        className="mx-auto cursor-pointer"
                        onClick={handleAddItem(name)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            {site &&
              customItems.map((name) => (
                <tr key={`custom-${name}`} className="h-[40px]">
                  <td className="text-center border-b border-[#E4DBDB] bg-[#fcfbfb] sticky left-0 z-10">
                    {name}
                  </td>
                  <td className="border-b border-l border-[#E4DBDB]">
                    <IconTrash
                      size={28}
                      color="#FF2F2F"
                      className="mx-auto cursor-pointer"
                      onClick={handleRemoveItem(name)}
                    />
                  </td>
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
            onClick={handleSave}
          >
            저장하기
          </Button>
        </div>
      </div>
    </BottomDrawer>
  );
};
