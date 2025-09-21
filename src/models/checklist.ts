import { prisma } from "@/services/prisma";
import dayjs from "dayjs";

export type ChecklistToggleResult = {
  checked: boolean;
};

const getDayRange = (yyyymmdd: string): { start: Date; end: Date } => {
  const start = dayjs(yyyymmdd, "YYYYMMDD").startOf("day").toDate();
  const end = dayjs(yyyymmdd, "YYYYMMDD").endOf("day").toDate();
  return { start, end };
};

export const toggleChecklistByDate = async (
  siteId: number,
  contractId: number,
  name: string,
  yyyymmdd: string
): Promise<ChecklistToggleResult> => {
  const { start, end } = getDayRange(yyyymmdd);

  const existing = await prisma.checklist.findFirst({
    where: {
      siteId,
      name,
      deletedAt: null,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  if (existing) {
    await prisma.checklist.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
    return { checked: false };
  }

  await prisma.checklist.create({
    data: {
      contractId,
      siteId,
      name,
      // createdAt will be set by DB default; but ensure date aligns with selected day
      createdAt: dayjs(yyyymmdd, "YYYYMMDD").toDate(),
    },
  });
  return { checked: true };
};

export const getCheckedDatesBySite = async (
  siteId: number,
  startYyyymmdd: string,
  endYyyymmdd: string
): Promise<Record<string, string[]>> => {
  const start = dayjs(startYyyymmdd, "YYYYMMDD").startOf("day").toDate();
  const end = dayjs(endYyyymmdd, "YYYYMMDD").endOf("day").toDate();

  const rows = await prisma.checklist.findMany({
    where: {
      siteId,
      deletedAt: null,
      createdAt: { gte: start, lte: end },
    },
  });

  const result: Record<string, string[]> = {};
  for (const row of rows) {
    const key = row.name;
    const date = dayjs(row.createdAt).format("YYYYMMDD");
    if (!result[key]) result[key] = [];
    if (!result[key].includes(date)) result[key].push(date);
  }
  return result;
};
