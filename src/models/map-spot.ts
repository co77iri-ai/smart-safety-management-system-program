import { Site } from "./site";

export type MapSpot = {
  id: number;
  contractId: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  labelNumber?: number;
  isSafe?: boolean;
};

export const convertToMapSpotFromSite = (site: Site): MapSpot => {
  return {
    id: site.id,
    contractId: site.contractId,
    name: site.name,
    address: site.address,
    lat: site.latitude,
    lng: site.longitude,
    labelNumber: undefined,
  };
};
