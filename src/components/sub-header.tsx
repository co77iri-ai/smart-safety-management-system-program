"use client";

import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";

export type SubHeaderProps = {
  title: string;
  goBackHref?: string;
  onClickGoBack?: () => void;
};

export const SubHeader = ({
  title,
  goBackHref,
  onClickGoBack,
}: SubHeaderProps) => {
  return (
    <div className="w-full p-[24px] flex justify-between items-stretch">
      <Link
        href={goBackHref || "#"}
        className="w-[32px] flex justify-center items-center"
        onClick={onClickGoBack}
      >
        <IconChevronLeft width={32} height={32} color="#000000" />
      </Link>
      <h1 className="flex-1 text-[24px] font-semibold leading-[155%] text-[#000000] text-center">
        {title}
      </h1>
      <div className="w-[32px]"></div>
    </div>
  );
};
