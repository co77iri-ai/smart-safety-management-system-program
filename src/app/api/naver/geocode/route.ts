export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryInput = searchParams.get("query");
    if (!queryInput) {
      return new Response(JSON.stringify({ message: "query required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const host = "https://maps.apigw.ntruss.com";
    const path = "/map-geocode/v2/geocode";
    const query = new URLSearchParams({ query: queryInput }).toString();

    // 문서 기준: API Gateway Key Pair 헤더 사용
    const apiKeyId = process.env.NCP_MAPS_API_KEY_ID;
    const apiKey = process.env.NCP_MAPS_API_KEY;
    if (!apiKeyId || !apiKey) {
      return new Response(
        JSON.stringify({
          message: "NCP_MAPS_API_KEY_ID / NCP_MAPS_API_KEY missing",
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const res = await fetch(`${host}${path}?${query}`, {
      headers: {
        Accept: "application/json",
        "x-ncp-apigw-api-key-id": apiKeyId,
        "x-ncp-apigw-api-key": apiKey,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ message: "server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
