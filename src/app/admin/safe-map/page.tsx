import { getContracts, getSiteByContractIds } from "@/models";
import { SafeMapScreen } from "./components";

export const dynamic = "force-dynamic";

export default async function SafeMap() {
  const contracts = await getContracts();
  const contractSites = await getSiteByContractIds(
    ...contracts.map((contract) => contract.id)
  );

  return <SafeMapScreen contracts={contracts} sites={contractSites} />;
}
