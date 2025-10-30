import { Icon, IconProps } from "@tabler/icons-react";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type ListButtonProps = {
  href: string;
  title: string;
  description?: string;
  Icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  iconColor: string;
  iconBgColor: string;
  onClick?: () => void;
};

export const ListButton = ({
  href,
  title,
  description,
  Icon,
  iconColor,
  iconBgColor,
  onClick,
}: ListButtonProps) => {
  return (
    <Link
      className="flex-1 rounded-[16px] border border-[#DBDAE4] flex justify-center items-center gap-[10px] bg-white shadow-lg active:scale-95 duration-200 px-[16px] py-[12px]"
      href={href}
      onClick={onClick}
    >
      <div
        className="w-[32px] min-w-[32px] h-[32px] rounded-full flex justify-center items-center"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon width={24} height={24} color={iconColor} />
      </div>
      <div className="w-full flex flex-col justify-center items-start gap-[4px]">
        <div className="text-[18px] leading-[20px] font-bold text-[#2D2551] whitespace-pre-wrap">
          {title}
        </div>
        {description && (
          <div className="text-[12px] leading-[12px] text-[#827DA1] whitespace-pre-wrap">
            {description}
          </div>
        )}
      </div>
    </Link>
  );
};
