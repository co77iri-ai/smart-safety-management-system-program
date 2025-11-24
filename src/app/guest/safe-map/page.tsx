import { getContractById, getSiteByContractIds } from "@/models";
import { SafeMapScreen } from "./components";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SafeMap() {
  // 쿠키에서 guest-contract-id 가져오기
  const cookieStore = await cookies();
  const guestContractId = cookieStore.get("guest-contract-id")?.value;
  const contractId = guestContractId ? parseInt(guestContractId, 10) : null;

  // 해당 contract만 조회하여 배열로 감싸기
  const contract = contractId ? await getContractById(contractId) : null;
  const contracts = contract ? [contract] : [];

  const contractSites = await getSiteByContractIds(
    ...contracts.map((contract) => contract.id)
  );

  return <SafeMapScreen contracts={contracts} sites={contractSites} />;
}
