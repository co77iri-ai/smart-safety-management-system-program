import { prisma } from "@/services/prisma";
import dayjs, { Dayjs } from "dayjs";
import { Site } from "./site";

export type ChecklistToggleResult = {
  checked: boolean;
};

export type CheckItem = string[];
export type Checklist = Record<string, CheckItem>;

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
    await prisma.checklist.delete({
      where: { id: existing.id },
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

export const getCheckedDatesBySiteId = async (
  siteId: number
): Promise<Checklist> => {
  const rows = await prisma.checklist.findMany({
    where: {
      siteId,
      deletedAt: null,
    },
  });

  const result: Checklist = {};
  for (const row of rows) {
    const key = row.name;
    const date = dayjs(row.createdAt).format("YYYYMMDD");
    if (!result[key]) result[key] = [];
    if (!result[key].includes(date)) result[key].push(date);
  }
  return result;
};

export const getCheckedDatesBySiteIds = async (
  siteIds: number[]
): Promise<Record<Site["id"], Checklist>> => {
  const rows = await prisma.checklist.findMany({
    where: {
      siteId: { in: siteIds },
      deletedAt: null,
    },
  });

  const result: Record<Site["id"], Checklist> = {};
  rows.forEach((row) => {
    if (!result[row.siteId]) result[row.siteId] = {};
    if (!result[row.siteId][row.name]) result[row.siteId][row.name] = [];
    const dateString = dayjs(row.createdAt).format("YYYYMMDD");
    if (!result[row.siteId][row.name].includes(dateString)) {
      result[row.siteId][row.name].push(dateString);
    }
  });

  return result;
};

export const getIsCheckedAllSite = (site: Site, checklist: Checklist) => {
  const startDate = dayjs(site.startDate);
  const endDate = dayjs(site.endDate);
  const nowDate = dayjs();
  const realEndDate = endDate.diff(nowDate, "day") >= 0 ? nowDate : endDate;
  const targetDateLength = realEndDate.diff(startDate, "day") + 1;
  const isCheckedAll =
    site.checklist
      .map((checkItem) =>
        checklist[checkItem]
          ? [...new Set(checklist[checkItem])].filter(
              (date) =>
                startDate.diff(date, "day") <= 0 &&
                realEndDate.diff(date, "day") >= 0
            ).length === targetDateLength
          : false
      )
      .filter((v) => !!v).length === site.checklist.length;

  return isCheckedAll;
};
