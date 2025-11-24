"use client";

import type { MapSpot } from "@/models";
import { cn } from "@/utils";
import { IconChevronLeft, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type MapLayoutProps = {
  title: string;
  spots?: MapSpot[];
  selectedSpotId?: number;
  onMarkerClick?: (spot: MapSpot) => void;
  onClickDimmer?: () => void;
  isShowAddButton?: boolean;
  onClickAdd?: () => void;
  isShowDimmer?: boolean;
  selectable?: boolean;
  initialCenter?: {
    lat: number;
    lng: number;
  };
  children?: ReactNode;
  goBackHref?: string;
  onClickGoBack?: () => void;
  isSelectingLocation?: boolean;
  onConfirmLocation?: (lat: number, lng: number) => void;
  onCancelLocationSelection?: () => void;
};

const getSiteSpotMarker = (isSafe?: boolean) => {
  return isSafe
    ? `<div style="transform:translate(-50%,-50%);width:20px;height:20px;border:1px solid white;border-radius:9999px;background:linear-gradient(0deg,#31c442 0%, #5eef6c 100%);"></div>`
    : `<div style="transform:translate(-50%,-50%);width:20px;height:20px;border:1px solid white;border-radius:9999px;background:linear-gradient(0deg,#FF4343 0%, #FF7575 100%);"></div>`;
};

export const MapLayout = ({
  title,
  spots,
  selectedSpotId,
  onMarkerClick,
  onClickDimmer,
  isShowAddButton,
  onClickAdd,
  isShowDimmer,
  selectable,
  initialCenter,
  children,
  goBackHref,
  onClickGoBack,
  isSelectingLocation,
  onConfirmLocation,
  onCancelLocationSelection,
}: MapLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const onMarkerClickRef = useRef<MapLayoutProps["onMarkerClick"] | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<Map<number, naver.maps.Marker>>(new Map());

  const spotIdMap = useMemo(
    () => Object.fromEntries(spots?.map((spot) => [spot.id, spot]) ?? []),
    [spots]
  );

  // 최신 콜백을 ref에 보관하여 지도 초기화 useEffect의 의존성에서 제외
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    if (naver?.maps?.Map) {
      setIsLoading(true);

      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current.clear();

      const map =
        mapRef.current ??
        new naver.maps.Map("naver-map-id", {
          center: initialCenter
            ? new naver.maps.LatLng(initialCenter.lat, initialCenter.lng)
            : new naver.maps.LatLng(35.260773, 126.886545),
          zoom: 12,
          minZoom: 10,
          disableDoubleTapZoom: true,
          disableDoubleClickZoom: true,
          disableTwoFingerTapZoom: true,
        });
      mapRef.current = map;

      spots?.forEach((spot) => {
        const marker = new naver.maps.Marker({
          map,
          title: spot.name,
          position: new naver.maps.LatLng(spot.lat, spot.lng),
          icon: {
            content:
              spot.labelNumber === undefined
                ? getSiteSpotMarker(spot.isSafe)
                : `
              <div style="transform:translate(-50%,-50%);display:flex;justify-content:center;align-items:center;font-size:24px;font-weight:bold;color:white;width:48px;height:48px;border:1px solid white;border-radius:9999px;background:linear-gradient(0deg,#FF434355 0%, #FF757555 100%);">
                ${spot.labelNumber}
              </div>
            `,
          },
        });

        markersRef.current.set(spot.id, marker);

        // 공식 문서: naver.maps.Event.addListener(marker, 'click', handler)
        naver.maps.Event.addListener(marker, "click", () => {
          onMarkerClickRef.current?.(spot);
        });
      });

      setIsLoading(false);
    }
  }, [spots, initialCenter]);

  // 선택된 마커만 색상 업데이트
  useEffect(() => {
    if (!selectable) return;
    markersRef.current.forEach((marker, id) => {
      const isSelected = selectedSpotId === id;
      if (isSelected) {
        // 기본 아이콘으로 복원
        marker.setOptions("icon", null);
      } else {
        // 커스텀 아이콘 유지
        marker.setIcon({
          content: getSiteSpotMarker(spotIdMap[id].isSafe),
        });
      }
    });
  }, [selectedSpotId, selectable, spotIdMap]);

  useEffect(() => {
    if (!initialCenter) return;
    const map = mapRef.current;
    if (!map) return;
    const center = new naver.maps.LatLng(initialCenter.lat, initialCenter.lng);
    map.setCenter(center);
  }, [initialCenter]);

  const handleConfirmLocation = () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter() as naver.maps.LatLng;
    const lat = center.lat();
    const lng = center.lng();
    onConfirmLocation?.(lat, lng);
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute left-0 top-0 w-full px-[19px] pt-[21px] flex justify-between items-center gap-[10px] z-[1000]">
        <Link href={goBackHref || "#"} onClick={onClickGoBack}>
          <button
            type="button"
            className="w-[48px] h-[48px] bg-white rounded-full flex justify-center items-center border border-[#DBDAE4] shadow-lg active:scale-95 duration-200"
          >
            <IconChevronLeft size={32} color="#828282" />
          </button>
        </Link>
        <div className="flex-1 h-[48px] rounded-full bg-white border border-[#DBDAE4] flex justify-center items-center text-[18px] leading-[155%] font-semibold text-[#000000] shadow-lg">
          {title}
        </div>
        <div className="w-[48px]"></div>
      </div>
      <div id="naver-map-id" className="w-full h-full"></div>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClickDimmer}
        className={cn(
          "bg-black/40 absolute top-0 left-0 w-full h-full opacity-0 duration-200 pointer-events-none select-none",
          {
            "opacity-100 pointer-events-auto select-auto":
              (isShowDimmer && !isSelectingLocation) || isLoading,
          }
        )}
      ></button>
      {isShowAddButton && !isSelectingLocation && (
        <button
          type="button"
          className="w-[72px] h-[72px] bg-indigo-500 rounded-full flex justify-center items-center shadow-lg active:scale-95 duration-200 absolute bottom-[32px] right-[24px]"
          onClick={onClickAdd}
        >
          <IconPlus size={32} color="#ffffff" />
        </button>
      )}
      {isSelectingLocation && (
        <>
          {/* 중앙 고정 마커 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none">
            <div className="relative">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <circle cx="24" cy="24" r="6" fill="#4F46E5" />
                <circle cx="24" cy="24" r="4" fill="white" />
              </svg>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2">
                <div className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                  이 위치에 작업장을 추가합니다
                </div>
              </div>
            </div>
          </div>
          {/* 위치 선택 버튼들 */}
          <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 z-[500] flex gap-3">
            <button
              type="button"
              className="px-6 py-4 bg-white border-2 border-gray-300 rounded-full flex justify-center items-center shadow-lg active:scale-95 duration-200 font-semibold text-gray-700"
              onClick={onCancelLocationSelection}
            >
              취소
            </button>
            <button
              type="button"
              className="px-6 py-4 bg-indigo-500 rounded-full flex justify-center items-center shadow-lg active:scale-95 duration-200 font-semibold text-white"
              onClick={handleConfirmLocation}
            >
              이 위치로 선택
            </button>
          </div>
        </>
      )}
      {children}
    </div>
  );
};
