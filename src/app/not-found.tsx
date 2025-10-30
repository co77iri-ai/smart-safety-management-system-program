// error.tsx
"use client";

import { BaseLayout } from "@/components";
import { Button } from "@mantine/core";
import Link from "next/link";

export default function GlobalNotFound({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <BaseLayout mainContainerClassName="flex flex-col justify-center items-center gap-[16px]">
      <h1 className="text-[64px] font-black text-[#2D2551] text-center">404</h1>
      <h2 className="text-[#2D2551] text-center text-[24px]">
        페이지를 찾을 수 없습니다
      </h2>
    </BaseLayout>
  );
}
