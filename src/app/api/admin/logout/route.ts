import { cookies } from "next/headers";

export const POST = async (req: Request) => {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", "", { maxAge: 0, path: "/" });
  return new Response(JSON.stringify({ message: "Logout successful" }), {
    status: 200,
  });
};
