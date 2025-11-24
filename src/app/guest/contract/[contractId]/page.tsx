import {
  getCheckedDatesBySiteIds,
  getContractById,
  getSitesByContractId,
} from "@/models";
import { ContractDetailScreen } from "./components/contract-detail-screen";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ContractDetail({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId: _contractId } = await params;
  const contractId = Number.isNaN(Number(_contractId))
    ? 0
    : Number(_contractId);

  // 쿠키에서 guest-contract-id 확인
  const cookieStore = await cookies();
  const guestContractId = cookieStore.get("guest-contract-id")?.value;
  const cookieContractId = guestContractId
    ? parseInt(guestContractId, 10)
    : null;

  // 요청한 contractId와 쿠키의 contractId가 다르면 404
  if (!cookieContractId || cookieContractId !== contractId) {
    notFound();
  }

  const contract = await getContractById(contractId);
  const sites = await getSitesByContractId(contractId);
  const checklist = await getCheckedDatesBySiteIds(
    sites.map((site) => site.id)
  );

  if (!contract) {
    notFound();
  }

  return (
    <ContractDetailScreen
      contract={contract}
      sites={sites}
      checklist={checklist}
    />
  );
}
