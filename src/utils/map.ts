import type { MapSpot } from "@/models";

export type LatLng = { lat: number; lng: number };

// 계약 내 스팟들의 위경도 평균값으로 중심 좌표를 계산한다.
export function computeSpotsCenter(
  spots: Array<Pick<MapSpot, "lat" | "lng">>
): LatLng {
  if (!spots || spots.length === 0) {
    return { lat: 35.260773, lng: 126.886545 };
  }

  let sumLat = 0;
  let sumLng = 0;
  for (const spot of spots) {
    sumLat += spot.lat;
    sumLng += spot.lng;
  }
  return { lat: sumLat / spots.length, lng: sumLng / spots.length };
}
