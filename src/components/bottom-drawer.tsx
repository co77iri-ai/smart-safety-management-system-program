import { cn } from "@/utils";
import { ReactNode } from "react";

export type BottomDrawerProps = {
  isOpen?: boolean;
  children?: ReactNode;
  containerClassName?: string;
};

export const BottomDrawer = ({
  isOpen,
  children,
  containerClassName,
}: BottomDrawerProps) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2 w-full p-[24px] rounded-t-[32px] bg-white shadow-2xl duration-400 opacity-100 z-[100] max-w-[500px] border border-[#e6e7eb]",
        { "translate-y-full opacity-0": !isOpen },
        containerClassName
      )}
    >
      {children}
    </div>
  );
};
