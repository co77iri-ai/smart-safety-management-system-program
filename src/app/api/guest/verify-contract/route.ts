import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prisma";

export async function GET(req: NextRequest) {
  const contractId = req.nextUrl.searchParams.get("contractId");

  if (!contractId) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const id = parseInt(contractId, 10);
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  try {
    const contract = await prisma.contract.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return NextResponse.json({ valid: !!contract });
  } catch (error) {
    console.error("Error verifying contract:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
