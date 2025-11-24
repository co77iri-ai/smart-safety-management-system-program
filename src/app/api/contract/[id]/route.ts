import { getContractById, deleteContract, updateContract } from "@/models";
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

export async function PUT(
  req: NextRequest,
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

    const body = await req.json();
    const updatedContract = await updateContract(searchId, body);

    if (!updatedContract) {
      return new Response(
        JSON.stringify({
          message: "Contract not found",
        }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(updatedContract), {
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

    const deletedContract = await deleteContract(searchId);

    if (!deletedContract) {
      return new Response(
        JSON.stringify({
          message: "Contract not found",
        }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(deletedContract), {
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
