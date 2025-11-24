import { prisma } from "@/services/prisma";
import type { Decimal, JsonValue } from "@prisma/client/runtime/library";
import type { Contract } from "./contract";
import z, { ZodObject, ZodType } from "zod";

export type Site = {
  id: number;
  contractId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  checklist: string[];
  startDate: string;
  endDate: string;
};

const siteWithoutIdSchema = z.object<
  Record<Exclude<keyof Site, "id">, ZodType>
>({
  contractId: z.number(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  checklist: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string(),
});

export const validateSite = (data: unknown): boolean => {
  const result = siteWithoutIdSchema.safeParse(data);
  return result.success;
};

export const validatePartialSite = (data: unknown): boolean => {
  const result = siteWithoutIdSchema.partial().safeParse(data);
  return result.success;
};

const isStringArray = (value: JsonValue): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};

const coerceJsonValueToStringArray = (value: JsonValue): string[] => {
  return isStringArray(value) ? value : [];
};

const convertToSiteFromDBData = (data: {
  id: number;
  contractId: number;
  name: string;
  address: string;
  latitude: Decimal;
  longitude: Decimal;
  checklist: JsonValue;
  startDate: string;
  endDate: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): Site => {
  return {
    id: data.id,
    contractId: data.contractId,
    name: data.name,
    address: data.address,
    latitude: data.latitude.toNumber(),
    longitude: data.longitude.toNumber(),
    checklist: coerceJsonValueToStringArray(data.checklist),
    startDate: data.startDate,
    endDate: data.endDate,
  };
};

export const createSite = async (site: Omit<Site, "id">): Promise<Site> => {
  const createdSite = await prisma.site.create({
    data: {
      contractId: site.contractId,
      name: site.name,
      address: site.address,
      latitude: site.latitude,
      longitude: site.longitude,
      checklist: site.checklist,
      startDate: site.startDate,
      endDate: site.endDate,
    },
  });

  return convertToSiteFromDBData(createdSite);
};

export const getSites = async (): Promise<Site[]> => {
  const data = await prisma.site.findMany({
    where: {
      deletedAt: null,
    },
  });

  return data.map(convertToSiteFromDBData);
};

export const getSitesByContractId = async (
  contractId: Contract["id"]
): Promise<Site[]> => {
  const data = await prisma.site.findMany({
    where: {
      contractId,
      deletedAt: null,
    },
  });

  return data.map(convertToSiteFromDBData);
};

export const getSiteById = async (id: Site["id"]): Promise<Site | null> => {
  const data = await prisma.site.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  return data ? convertToSiteFromDBData(data) : null;
};

export const getSiteByContractIds = async (
  ...ids: Contract["id"][]
): Promise<Site[]> => {
  const data = await prisma.site.findMany({
    where: {
      contractId: { in: ids },
      deletedAt: null,
    },
  });

  return data.map(convertToSiteFromDBData);
};

export const updateSite = async (
  id: Site["id"],
  site: Partial<Omit<Site, "id">>
): Promise<Site> => {
  const data = await prisma.site.update({
    where: {
      id,
      deletedAt: null,
    },
    data: {
      ...site,
    },
  });
  return convertToSiteFromDBData(data);
};

export const deleteSite = async (
  id: Site["id"]
): Promise<Site | null> => {
  const site = await prisma.site.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!site) {
    return null;
  }

  const deletedSite = await prisma.site.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return convertToSiteFromDBData(deletedSite);
};
