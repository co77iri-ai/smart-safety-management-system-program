import { prisma } from "@/services/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) => {
  const { contractId } = await params;
  const searchContractId = Number(contractId);
  if (Number.isNaN(searchContractId)) {
    return new Response(JSON.stringify({ message: "Bad request" }), {
      status: 400,
    });
  }

  const isExistContract = await prisma.contract.findUnique({
    where: {
      id: searchContractId,
    },
  });

  if (!isExistContract) {
    return new Response(JSON.stringify({ message: "Contract not found" }), {
      status: 404,
    });
  }

  const cookieStore = await cookies();
  cookieStore.set("guest-contract-id", contractId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  // redirect to the contract page
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_HOSTNAME}/guest`);
};
