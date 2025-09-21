"use client";

import { BaseLayout, MapLayout } from "@/components";
import { Contract, MapSpot, Site } from "@/models";
import { computeSitesCenter, LatLng } from "@/utils";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export type SafeMapScreenProps = {
  contracts: Contract[];
  sites: Site[];
};

export const SafeMapScreen = ({ contracts, sites }: SafeMapScreenProps) => {
  const router = useRouter();

  const groupedContractSites = useMemo<
    {
      contract: Contract;
      sites: Site[];
      siteCounts: number;
      centerPosition: LatLng;
    }[]
  >(
    () =>
      contracts
        .map((contract) => {
          const filteredSites = sites.filter(
            (site) => site.contractId === contract.id
          );
          const centerPosition = computeSitesCenter(filteredSites);

          return {
            contract,
            sites: filteredSites,
            siteCounts: filteredSites.length,
            centerPosition,
          };
        })
        .filter(({ siteCounts }) => siteCounts !== 0),
    [contracts, sites]
  );

  const mapSpots = useMemo<MapSpot[]>(
    () =>
      groupedContractSites.map(({ contract, siteCounts, centerPosition }) => ({
        id: contract.id,
        contractId: contract.id,
        name: contract.title,
        address: "",
        lat: centerPosition.lat,
        lng: centerPosition.lng,
        labelNumber: siteCounts,
      })),
    [groupedContractSites]
  );

  return (
    <BaseLayout>
      <MapLayout
        title="안전 지도"
        spots={mapSpots}
        onMarkerClick={({ contractId }) => {
          router.push(`/contract/${contractId}`);
        }}
        goBackHref="/"
      ></MapLayout>
    </BaseLayout>
  );
};
