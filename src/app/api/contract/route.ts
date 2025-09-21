import {
  Contract,
  createContract,
  getContracts,
  validateContract,
} from "@/models";

// create contract
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!validateContract(body ?? {})) {
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

    const contractBody: Omit<Contract, "id"> = body;

    const createdContract = await createContract(contractBody);

    return new Response(JSON.stringify(createdContract), {
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

// get all contracts
export async function GET(req: Request) {
  try {
    const contracts = await getContracts();

    return new Response(JSON.stringify(contracts), {
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
