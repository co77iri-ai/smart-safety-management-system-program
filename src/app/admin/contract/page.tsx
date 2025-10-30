import {
  BaseLayout,
  SubHeader,
  QrDownloadButton,
  CopyUrlButton,
} from "@/components";
import { getContracts } from "@/models";
import { Button } from "@mantine/core";
import dayjs from "dayjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContractList() {
  const contracts = await getContracts();

  return (
    <BaseLayout mainContainerClassName="flex flex-col justify-start items-center h-[calc(100%-85px)]">
      <SubHeader goBackHref="/admin" title="사업 현황" />
      <div className="w-full overflow-x-hidden overflow-y-auto h-full max-h-full">
        <div className="flex flex-col justify-start items-stretch gap-[16px] px-[24px] pb-[64px]">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="w-full bg-white border border-[#DBDAE4] rounded-2xl p-[16px] flex flex-col justify-center items-center gap-[8px]"
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col justify-center items-start flex-1 relative">
                  <h1 className="w-full overflow-hidden text-ellipsis text-[20px] leading-[155%] font-bold text-[#000000]">
                    {contract.title}
                  </h1>
                  <h2 className="w-full overflow-hidden text-ellipsis text-[14px] leading-[155%] text-[#000000]">
                    계약기간: {dayjs(contract.startDate).format("YYYY.MM.DD")} ~{" "}
                    {dayjs(contract.endDate).format("YYYY.MM.DD")}
                  </h2>
                </div>
                <Link href={`/admin/contract/${contract.id}`}>
                  <Button
                    size="sm"
                    type="button"
                    color="indigo"
                    radius="md"
                    w={100}
                    px={8}
                  >
                    안전현황 보기
                  </Button>
                </Link>
              </div>
              <hr className="border-[#DBDAE4] w-full" />
              <div className="flex justify-start items-center gap-[8px] w-full">
                <QrDownloadButton
                  contractId={contract.id}
                  contractTitle={contract.title}
                  buttonWidth={100}
                />
                <CopyUrlButton contractId={contract.id} buttonWidth={100} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseLayout>
  );
}
