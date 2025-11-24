"use client";

import { BaseLayout, MapLayout } from "@/components";
import type { Checklist, Contract, Site } from "@/models";
import {
  convertToMapSpotFromSite,
  getIsCheckedAllSite,
  MapSpot,
} from "@/models";
import { computeSitesCenter, LatLng } from "@/utils";
import { useMemo, useState } from "react";
import { SiteDetailInfoBottomDrawer } from "./site-detail-info-bottom-drawer";
import toast from "react-hot-toast";
import { SiteChecklistEditBottomDrawer } from "./site-checklist-edit-bottom-drawer";
import { AddSiteBottomDrawer } from "./add-site-bottom-drawer";
import { EditSiteBottomDrawer } from "./edit-site-bottom-drawer";

export type ContractDetailScreenProps = {
  contract: Contract;
  sites: Site[];
  checklist: Record<Site["id"], Checklist>;
};

export const ContractDetailScreen = ({
  contract,
  sites: _sites,
  checklist: _checklist,
}: ContractDetailScreenProps) => {
  const [sites, setSites] = useState(_sites);
  const [checklist, setChecklist] = useState(_checklist);
  const [selectedSiteId, setSelectedSiteId] = useState<number>();
  const [isOpenSiteDetailDrawer, setIsOpenSiteDetailDrawer] = useState(false);
  const [isOpenAddSiteDrawer, setIsOpenAddSiteDrawer] = useState(false);
  const [centerSpot, setCenterSpot] = useState<LatLng>(
    computeSitesCenter(sites ?? [])
  );
  const [isOpenEditChecklistDrawer, setIsOpenEditChecklistDrawer] =
    useState(false);
  const [isOpenEditDeadlineDrawer, setIsOpenEditDeadlineDrawer] =
    useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const contractSiteIdMap = useMemo(
    () => Object.fromEntries(sites.map((site) => [site.id, site])),
    [sites]
  );
  const selectedSite = useMemo(
    () => (selectedSiteId ? contractSiteIdMap[selectedSiteId] : undefined),
    [contractSiteIdMap, selectedSiteId]
  );
  const siteMapSpots = useMemo<MapSpot[]>(
    () =>
      sites.map((site) => {
        const spot = convertToMapSpotFromSite(site);
        spot.isSafe = getIsCheckedAllSite(site, checklist[site.id] ?? {});
        return spot;
      }),
    [sites, checklist]
  );

  const isShowDimmer = !!selectedSiteId || isOpenAddSiteDrawer;

  const handleCreateSite = (siteBody: Omit<Site, "id">, onDone: () => void) => {
    const fetching = async () => {
      try {
        const result = await fetch("/api/site", {
          method: "POST",
          body: JSON.stringify(siteBody),
        })
          .then((res) => res.json())
          .catch((err) => {
            throw err;
          });
        const nextSites: Site[] = Array.isArray(result) ? result : [result];
        setSites((prev) => [...prev, ...nextSites]);
        setCenterSpot({
          lat: nextSites[0].latitude,
          lng: nextSites[0].longitude,
        });
      } finally {
        onDone();
      }
    };

    toast.promise(fetching(), {
      loading: "신규 작업장을 추가하는 중입니다...",
      success: "신규 작업장이 추가되었습니다!",
      error: "신규 작업장 추가를 실패했습니다.",
    });
  };

  const handleEditSite = (
    siteId: Site["id"],
    siteBody: Partial<Omit<Site, "id">>
  ) => {
    const fetching = async () => {
      await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        body: JSON.stringify(siteBody),
      })
        .then((res) => res.json())
        .catch((err) => {
          throw err;
        });
      await refreshSites();
      await refreshChecklist();
    };

    toast.promise(fetching(), {
      loading: "작업장 정보를 수정하는 중입니다...",
      success: "작업장 정보가 수정되었습니다!",
      error: "작업장 정보 수정을 실패했습니다.",
    });
  };

  const refreshSites = async () => {
    const result = await fetch(`/api/site?contractId=${contract.id}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .catch((err) => {
        throw err;
      });
    const nextSites: Site[] = Array.isArray(result) ? result : [result];
    setSites((prev) => [...prev, ...nextSites]);
  };

  const refreshChecklist = async () => {
    const result = await fetch(
      `/api/checklist?siteId=${sites.map((site) => site.id).join(",")}`,
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .catch((err) => {
        throw err;
      });
    setChecklist(result);
  };

  const handleStartLocationSelection = () => {
    setIsSelectingLocation(true);
    setSelectedLocation(null);
  };

  const handleCancelLocationSelection = () => {
    setIsSelectingLocation(false);
    setSelectedLocation(null);
  };

  const handleConfirmLocation = async (lat: number, lng: number) => {
    try {
      // Reverse Geocoding: 좌표 -> 주소
      const res = await fetch(
        `/api/naver/reverse-geocode?lat=${lat}&lng=${lng}`
      );
      const data = await res.json();

      let address = "";
      if (data?.results?.[0]) {
        const result = data.results[0];
        if (result.region) {
          // 도로명 주소 우선
          const land = result.land;
          if (land?.addition0?.value) {
            address = land.addition0.value;
          } else {
            // 지번 주소
            const region = result.region;
            address = `${region.area1?.name || ""} ${
              region.area2?.name || ""
            } ${region.area3?.name || ""} ${region.area4?.name || ""}`.trim();
          }
        }
      }

      if (!address) {
        toast.error("주소를 가져올 수 없습니다. 다시 시도해주세요.");
        return;
      }

      setSelectedLocation({ lat, lng, address });
      setIsSelectingLocation(false);
      setIsOpenAddSiteDrawer(true);
    } catch (error) {
      toast.error("주소를 가져오는 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <BaseLayout>
      <MapLayout
        title={contract.title}
        spots={siteMapSpots}
        selectedSpotId={selectedSiteId}
        onMarkerClick={(site) => {
          setSelectedSiteId(site.id);
          setIsOpenSiteDetailDrawer(true);
        }}
        isShowDimmer={isShowDimmer}
        onClickDimmer={() => {
          setSelectedSiteId(undefined);
          setIsOpenAddSiteDrawer(false);
          setIsOpenSiteDetailDrawer(false);
          setIsOpenEditChecklistDrawer(false);
          setIsOpenEditDeadlineDrawer(false);
          handleCancelLocationSelection();
        }}
        selectable
        initialCenter={centerSpot}
        isShowAddButton
        onClickAdd={handleStartLocationSelection}
        goBackHref="/guest/contract"
        isSelectingLocation={isSelectingLocation}
        onConfirmLocation={handleConfirmLocation}
        onCancelLocationSelection={handleCancelLocationSelection}
      >
        <SiteDetailInfoBottomDrawer
          site={selectedSite}
          isOpen={isOpenSiteDetailDrawer}
          onClose={() => {
            setSelectedSiteId(undefined);
            setIsOpenSiteDetailDrawer(false);
          }}
          onClickEditChecklist={() => {
            setIsOpenSiteDetailDrawer(false);
            setIsOpenEditChecklistDrawer(true);
          }}
          onClickEditDeadline={() => {
            setIsOpenSiteDetailDrawer(false);
            setIsOpenEditDeadlineDrawer(true);
          }}
          onToggleChecklist={() => {
            refreshChecklist();
          }}
        />
        <AddSiteBottomDrawer
          isOpen={isOpenAddSiteDrawer}
          contractId={contract.id}
          onClose={() => {
            setIsOpenAddSiteDrawer(false);
            setSelectedLocation(null);
          }}
          onSubmit={handleCreateSite}
          initialLatitude={selectedLocation?.lat}
          initialLongitude={selectedLocation?.lng}
          initialAddress={selectedLocation?.address}
        />
        <EditSiteBottomDrawer
          isOpen={isOpenEditDeadlineDrawer}
          onClose={() => {
            setIsOpenEditDeadlineDrawer(false);
            setIsOpenSiteDetailDrawer(true);
          }}
          onSubmit={handleEditSite}
          site={isOpenEditDeadlineDrawer ? selectedSite : undefined}
        />
        <SiteChecklistEditBottomDrawer
          site={isOpenEditChecklistDrawer ? selectedSite : undefined}
          onClose={() => {
            setIsOpenEditChecklistDrawer(false);
            setIsOpenSiteDetailDrawer(true);
          }}
          onSave={refreshSites}
        />
      </MapLayout>
    </BaseLayout>
  );
};
