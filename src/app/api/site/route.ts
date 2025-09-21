import { createSite, getSitesByContractId, Site, validateSite } from "@/models";

// create site
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!validateSite(body ?? {})) {
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

    const siteBody: Omit<Site, "id"> = body;

    const createdSite = await createSite(siteBody);

    return new Response(JSON.stringify(createdSite), {
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contractId = Number(searchParams.get("contractId"));

    if (Number.isNaN(contractId)) {
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

    const sites = await getSitesByContractId(contractId);

    return new Response(JSON.stringify(sites), {
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
