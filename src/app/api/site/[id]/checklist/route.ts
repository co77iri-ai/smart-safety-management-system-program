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

    if (Number.isNaN(siteId) || !body || !Array.isArray(body.checklist)) {
      return new Response(JSON.stringify({ message: "Bad request" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Normalize items: trim spaces, collapse inner spaces, enforce length, deduplicate
    const normalize = (value: unknown): string => {
      if (typeof value !== "string") return "";
      const collapsed = value.replace(/\s+/g, " ");
      return collapsed.trim();
    };

    const sanitized = body.checklist
      .map((v: unknown) => normalize(v))
      .filter((v: string) => v.length >= 2 && v.length <= 50);

    // Deduplicate while preserving order
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const item of sanitized) {
      if (!seen.has(item)) {
        seen.add(item);
        deduped.push(item);
      }
    }

    // Optional max length guard
    if (deduped.length > 50) {
      return new Response(JSON.stringify({ message: "Too many items" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const updatedSite = await updateSite(siteId, { checklist: deduped });

    return new Response(JSON.stringify(updatedSite), {
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
