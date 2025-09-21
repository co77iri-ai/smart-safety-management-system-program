import { getContracts, getSiteByContractIds } from "@/models";
import { SafeMapScreen } from "./components";

export default async function SafeMap() {
  const contracts = await getContracts();
  const contractSites = await getSiteByContractIds(
    ...contracts.map((contract) => contract.id)
  );

  return <SafeMapScreen contracts={contracts} sites={contractSites} />;
}
