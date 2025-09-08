import { ReactNode } from "react";
import HeaderIconImage from "@/../public/images/header-1.png";
import Image from "next/image";
import { cn } from "@/utils";

export type BaseLayoutProps = {
  children?: ReactNode;
  mainContainerClassName?: string;
};

export const BaseLayout = ({
  children,
  mainContainerClassName,
}: BaseLayoutProps) => {
  return (
    <div className="w-full max-w-[500px] mx-auto h-full relative flex flex-col justify-between border-x border-[#E6E7EB] overflow-hidden">
      <header className="w-full px-[22px] py-[10px] flex justify-between items-center bg-white border-b border-[#E6E7EB]">
        <div className="flex justify-start items-center gap-[4px]">
          <Image
            src={HeaderIconImage}
            alt="header-icon"
            width={32}
            height={32}
          />
          <div className="flex flex-col justify-center items-start">
            <h2 className="text-[#827DA1] leading-[16px] text-[14px]">
              한국도로공사 광주전남본부
            </h2>
            <h1 className="font-bold text-[#2D2551] leading-[20px] text-[18px]">
              스마트 안전관리 체계 프로그램
            </h1>
          </div>
        </div>
      </header>
      <main
        className={cn("flex-1 w-full bg-[#F9FAFB]", mainContainerClassName)}
      >
        {children}
      </main>
    </div>
  );
};
