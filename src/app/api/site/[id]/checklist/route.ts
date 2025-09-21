import { updateSite } from "@/models";
import type { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const siteId = Number(id);
    const body = await req.json();
    if (
      Number.isNaN(siteId) ||
      !body.checklist ||
      !Array.isArray(body.checklist) ||
      body.checklist.filter((v: unknown) => typeof v !== "string").length > 0
    ) {
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

    const updatedSite = await updateSite(siteId, { checklist: body.checklist });

    return new Response(JSON.stringify(updatedSite), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify(err), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
