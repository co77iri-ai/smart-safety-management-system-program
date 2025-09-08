"use client";

import { BaseLayout, BottomDrawer, MapLayout } from "@/components";
import { dummyContracts, dummyMapSpots } from "@/constants";
import { computeSpotsCenter } from "@/utils";
import { use, useMemo, useState } from "react";
import { AddSpotBottomDrawer, SpotDetailInfoBottomDrawer } from "./components";

export default function ContractDetail({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = use(params);
  const [selectedSpotId, setSelectedSpotId] = useState<string>();
  const [isOpenAddSpotDrawer, setIsOpenAddSpotDrawer] = useState(false);

  const contractIdMap = useMemo(
    () =>
      Object.fromEntries(
        dummyContracts.map((contract) => [contract.id, contract])
      ),
    []
  );

  const targetContract = useMemo(
    () => contractIdMap[contractId],
    [contractIdMap, contractId]
  );

  const centerSpot = useMemo(
    () => computeSpotsCenter(dummyMapSpots[contractId]),
    [contractId]
  );

  const targetContractSpots = useMemo(
    () => dummyMapSpots[targetContract.id],
    [targetContract.id]
  );
  const targetContractSpotIdMap = useMemo(
    () =>
      Object.fromEntries(targetContractSpots.map((spot) => [spot.id, spot])),
    [targetContractSpots]
  );
  const targetSpot = useMemo(
    () =>
      selectedSpotId ? targetContractSpotIdMap[selectedSpotId] : undefined,
    [targetContractSpotIdMap, selectedSpotId]
  );

  const isShowDimmer = !!selectedSpotId || isOpenAddSpotDrawer;

  return (
    <BaseLayout>
      <MapLayout
        title={targetContract.title}
        spots={dummyMapSpots[contractId]}
        selectedSpotId={selectedSpotId}
        onMarkerClick={(spot) => {
          setSelectedSpotId(spot.id);
        }}
        isShowDimmer={isShowDimmer}
        onClickDimmer={() => {
          setSelectedSpotId(undefined);
          setIsOpenAddSpotDrawer(false);
        }}
        selectable
        initialCenter={centerSpot}
        isShowAddButton
        onClickAdd={() => setIsOpenAddSpotDrawer(true)}
        goBackHref="/contract"
      >
        <SpotDetailInfoBottomDrawer
          spot={targetSpot}
          onClose={() => setSelectedSpotId(undefined)}
        />
        <AddSpotBottomDrawer
          isOpen={isOpenAddSpotDrawer}
          contractId={targetContract.id}
          onClose={() => setIsOpenAddSpotDrawer(false)}
          onSubmit={(spot) => {
            console.log("test", spot);
          }}
        />
      </MapLayout>
    </BaseLayout>
  );
}
