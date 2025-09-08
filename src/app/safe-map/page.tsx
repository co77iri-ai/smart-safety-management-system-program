"use client";

import { BaseLayout, MapLayout } from "@/components";
import { dummyContracts, dummyMapSpots } from "@/constants";
import { MapSpot } from "@/models";
import { computeSpotsCenter } from "@/utils";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function SafeMap() {
  const router = useRouter();

  const contractIdMap = useMemo(
    () =>
      Object.fromEntries(
        dummyContracts.map((contract) => [contract.id, contract])
      ),
    []
  );

  const spots: MapSpot[] = useMemo(
    () =>
      Object.entries(dummyMapSpots).map(
        ([contractId, contractSpots], index) => {
          const { lat, lng } = computeSpotsCenter(contractSpots);
          return {
            contractId,
            lat,
            lng,
            id: String(index),
            name: contractIdMap[contractId].title,
            address: "",
            labelNumber: contractSpots.length,
          };
        }
      ),
    [contractIdMap]
  );

  return (
    <BaseLayout>
      <MapLayout
        title="안전 지도"
        spots={spots}
        onMarkerClick={(spot) => {
          console.log("select spot:", spot);
          router.push(`/contract/${spot.contractId}`);
        }}
        goBackHref="/"
      />
    </BaseLayout>
  );
}
