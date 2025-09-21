import { getContractById } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const searchId = Number(params.id);
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
