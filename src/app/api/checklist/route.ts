import { getCheckedDatesBySiteIds, toggleChecklistByDate } from "@/models";
import dayjs from "dayjs";

// GET /api/checklist?siteId=1&start=YYYYMMDD&end=YYYYMMDD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSiteIds = searchParams.get("siteId");
  const siteIds = rawSiteIds?.split(",").map(Number) ?? [];

  if (siteIds.length === 0) {
    return new Response(JSON.stringify({ message: "Bad request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const result = await getCheckedDatesBySiteIds(siteIds);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

// POST /api/checklist { siteId, contractId, name, date: YYYYMMDD }
export async function POST(req: Request) {
  const body = await req.json();
  const siteId = Number(body.siteId);
  const contractId = Number(body.contractId);
  const name = String(body.name);
  const date = String(body.date);

  if (Number.isNaN(siteId) || Number.isNaN(contractId) || !name || !date) {
    return new Response(JSON.stringify({ message: "Bad request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const result = await toggleChecklistByDate(siteId, contractId, name, date);

  return new Response(JSON.stringify(result), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}
