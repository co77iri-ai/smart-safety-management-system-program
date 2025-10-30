import { prisma } from "@/services/prisma";
import argon2 from "argon2";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const POST = async (req: Request) => {
  const body = await req.json();
  const password = body.password;

  const adminPasswordHash = await prisma.systemConfig.findFirst({
    where: {
      key: "admin_password",
    },
  });

  if (!adminPasswordHash) {
    return new Response(
      JSON.stringify({ message: "Admin password not found" }),
      {
        status: 500,
      }
    );
  }

  const isPasswordValid = await argon2.verify(
    adminPasswordHash.value,
    password
  );

  const accessTokenSecret = process.env.ADMIN_ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    return new Response(
      JSON.stringify({ message: "Access token secret not found" }),
      {
        status: 500,
      }
    );
  }

  const accessToken = jwt.sign(
    { createdAt: dayjs().format("YYYYMMDDHHmmss") },
    accessTokenSecret,
    {
      expiresIn: "2h",
    }
  );

  if (!isPasswordValid) {
    return new Response(JSON.stringify({ message: "Invalid password" }), {
      status: 400,
    });
  } else {
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7200,
      path: "/",
    });

    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200,
    });
  }
};
