"use client";

import { BaseLayout } from "@/components";
import { Button, Input } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const router = useRouter();

  const isVaildPassword = password.trim() !== "";

  const handleLogin = async () => {
    if (isFetching || !isVaildPassword) return;
    setIsFetching(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        toast.success("로그인에 성공했습니다.");
        router.push("/admin");
      } else {
        toast.error("로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };
  return (
    <BaseLayout mainContainerClassName="flex justify-center items-center flex-col">
      <div className="flex flex-col justify-center items-center gap-[4px] flex-1 min-h-[180px]">
        <h1 className="text-[32px] leading-[32px] font-black text-[#2D2551]">
          유지 관리 작업장
        </h1>
        <h2 className="text-[18px] leading-[18px] text-[#2D2551]">
          스마트 안전관리체계 프로그램
        </h2>
      </div>
      <div className="w-full flex flex-col justify-start items-stretch gap-[16px] h-full px-[24px]">
        <Input.Wrapper label="비밀번호 입력" required size="lg">
          <Input
            placeholder="관리자 비밀번호를 입력해주세요"
            size="lg"
            radius="lg"
            mt="xs"
            value={password}
            disabled={isFetching}
            onChange={(e) => setPassword(e.currentTarget.value)}
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
          disabled={isFetching || !isVaildPassword}
          onClick={handleLogin}
        >
          로그인
        </Button>
      </div>
    </BaseLayout>
  );
}
