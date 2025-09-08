// error.tsx
"use client";

import { BaseLayout } from "@/components";
import { Button } from "@mantine/core";
import Link from "next/link";

export default function GlobalUnexpectedError() {
  return (
    <BaseLayout mainContainerClassName="flex flex-col justify-center items-center gap-[16px]">
      <h1 className="text-[64px] font-black text-[#2D2551] text-center">500</h1>
      <h2 className="text-[#2D2551] text-center text-[24px]">
        예기치 못한 오류가 발생했습니다.
      </h2>
      <Link href="/" className="mt-[100px]">
        <Button size="xl" type="button" color="indigo" w="100%" radius="lg">
          홈으로 돌아가기
        </Button>
      </Link>
    </BaseLayout>
  );
}
