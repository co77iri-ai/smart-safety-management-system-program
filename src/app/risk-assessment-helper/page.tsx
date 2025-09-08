import { BaseLayout, IconButton, SubHeader } from "@/components";
import { IconFileDescription } from "@tabler/icons-react";

export default function RiskAssessmentHelper() {
  return (
    <BaseLayout mainContainerClassName="flex-col flex justify-between items-stretch">
      <SubHeader goBackHref="/" title="위험성 평가 도우미" />
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        <div className="w-[181px] h-[181px] flex justify-stretch items-stretch">
          <IconButton
            href="#"
            title="파일 업로드"
            Icon={IconFileDescription}
            iconColor="#4060E4"
            iconBgColor="#DFEAFD"
          />
        </div>
      </div>
    </BaseLayout>
  );
}
