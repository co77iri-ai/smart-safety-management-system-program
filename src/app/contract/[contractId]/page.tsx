import {
  convertToMapSpotFromSite,
  getContractById,
  getSitesByContractId,
} from "@/models";
import { ContractDetailScreen } from "./components/contract-detail-screen";
import { notFound } from "next/navigation";

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

  const contract = await getContractById(contractId);
  const sites = await getSitesByContractId(contractId);

  if (!contract) {
    notFound();
  }

  return <ContractDetailScreen contract={contract} sites={sites} />;
}
