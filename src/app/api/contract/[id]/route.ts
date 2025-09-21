import { getContractById } from "@/models";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchId = Number(id);
  if (Number.isNaN(searchId)) {
    return new Response(
      JSON.stringify({
        message: "Bad request",
      }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const contract = await getContractById(searchId);

  return new Response(JSON.stringify(contract), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
