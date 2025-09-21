import { getCheckedDatesBySite, toggleChecklistByDate } from "@/models";
import dayjs from "dayjs";

// GET /api/checklist?siteId=1&start=YYYYMMDD&end=YYYYMMDD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = Number(searchParams.get("siteId"));
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (Number.isNaN(siteId) || !start) {
    return new Response(JSON.stringify({ message: "Bad request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const startYyyymmdd = dayjs(start).format("YYYYMMDD");
  const endYyyymmdd = dayjs(end || new Date()).format("YYYYMMDD");
  const result = await getCheckedDatesBySite(
    siteId,
    startYyyymmdd,
    endYyyymmdd
  );

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
