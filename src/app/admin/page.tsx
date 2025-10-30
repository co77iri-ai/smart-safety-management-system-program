import { BaseLayout, ListButton } from "@/components";
import {
  IconChartBar,
  IconFileDescription,
  IconLock,
  IconMapPin,
} from "@tabler/icons-react";

export default function Home() {
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
      <div className="w-full flex flex-col justify-center items-stretch gap-[8px] px-[24px]">
        <ListButton
          href="/admin/create-contract"
          title="계약 생성"
          description={"신규 사업 계약을 생성합니다"}
          Icon={IconFileDescription}
          iconColor="#4060E4"
          iconBgColor="#DFEAFD"
        />
        <ListButton
          href="/admin/contract"
          title="사업 현황"
          description={"진행 중인 사업 현황을 확인합니다."}
          Icon={IconChartBar}
          iconColor="#4AA153"
          iconBgColor="#E2FBE9"
        />
        <ListButton
          href="/admin/safe-map"
          title="안전 지도"
          description={"작업장 위치와 안전 정보를 봅니다"}
          Icon={IconMapPin}
          iconColor="#C08E2C"
          iconBgColor="#FCFAC8"
        />
        <ListButton
          href="/admin/risk-assessment-helper"
          title="위험성 평가 도우미"
          description={"작업의 위험성을 평가하고 분석합니다."}
          Icon={IconChartBar}
          iconColor="#CA3D2F"
          iconBgColor="#F9E3E3"
        />
        <ListButton
          href="/admin/auth/change-password"
          title="관리자 비밀번호 변경"
          description={"관리자 비밀번호를 변경합니다."}
          Icon={IconLock}
          iconColor="#827DA1"
          iconBgColor="#E2E2E2"
        />
      </div>
      <div className="flex-1" />
    </BaseLayout>
  );
}
