import { getSiteById, updateSite, deleteSite, validatePartialSite } from "@/models";
import type { NextRequest } from "next/server";

export async function POST(
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

  const site = await getSiteById(searchId);
  return new Response(JSON.stringify(site), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchId = Number(id);
  const body = await _req.json();

  if (Number.isNaN(searchId) || !validatePartialSite(body)) {
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

  const site = await updateSite(searchId, { ...body });

  return new Response(JSON.stringify(site), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const deletedSite = await deleteSite(searchId);

    if (!deletedSite) {
      return new Response(
        JSON.stringify({
          message: "Site not found",
        }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(deletedSite), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify(err), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
