import argon2 from "argon2";

export const GET = async (req: Request) => {
  const hash = await argon2.hash("25042504", { type: argon2.argon2id });
  return new Response(JSON.stringify({ message: hash }), {
    status: 200,
  });
};
