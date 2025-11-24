"use client";

import { BaseLayout, SubHeader } from "@/components";
import { Button, Input } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

export default function ChangeAdminPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const isVaildFormData =
    currentPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    newPassword === confirmPassword;

  const router = useRouter();

  const handleChangePassword = async () => {
    if (!isVaildFormData || isFetching) return;
    setIsFetching(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.ok) {
        toast.success("비밀번호 변경에 성공했습니다.");
        router.push("/admin");
      } else if (response.status === 401) {
        toast.error("현재 비밀번호가 일치하지 않습니다.");
      } else {
        toast.error("비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("비밀번호 변경에 실패했습니다.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <BaseLayout mainContainerClassName="flex justify-center items-center flex-col">
      <SubHeader goBackHref="/admin" title="관리자 비밀번호 변경" />
      <div className="w-full overflow-x-hidden overflow-y-auto h-full px-[24px] flex flex-col justify-start items-stretch gap-[16px]">
        <Input.Wrapper label="현재 비밀번호" required size="lg">
          <Input
            placeholder="현재 비밀번호를 입력해주세요"
            size="lg"
            radius="lg"
            mt="xs"
            value={currentPassword}
            disabled={isFetching}
            type="password"
            onChange={(e) => setCurrentPassword(e.currentTarget.value)}
          />
        </Input.Wrapper>
        <Input.Wrapper label="새 비밀번호" required size="lg">
          <Input
            placeholder="새 비밀번호를 입력해주세요"
            size="lg"
            radius="lg"
            mt="xs"
            value={newPassword}
            disabled={isFetching}
            type="password"
            onChange={(e) => setNewPassword(e.currentTarget.value)}
          />
        </Input.Wrapper>
        <Input.Wrapper label="비밀번호 확인" required size="lg">
          <Input
            placeholder="비밀번호 확인을 입력해주세요"
            size="lg"
            radius="lg"
            mt="xs"
            value={confirmPassword}
            disabled={isFetching}
            type="password"
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          />
        </Input.Wrapper>
      </div>
      <div className="w-full p-[24px] flex justify-between items-center gap-[10px]">
        <Button
          size="xl"
          type="button"
          color="indigo"
          w="100%"
          radius="lg"
          disabled={!isVaildFormData || isFetching}
          onClick={handleChangePassword}
        >
          비밀번호 변경하기
        </Button>
      </div>
    </BaseLayout>
  );
}
