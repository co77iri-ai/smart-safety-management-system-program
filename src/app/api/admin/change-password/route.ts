import { prisma } from "@/services/prisma";
import argon2 from "argon2";

export const POST = async (req: Request) => {
  const body = await req.json();
  const currentPassword = body.currentPassword;
  const newPassword = body.newPassword;

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

  const isCurrentPasswordValid = await argon2.verify(
    adminPasswordHash.value,
    currentPassword
  );

  if (!isCurrentPasswordValid) {
    return new Response(
      JSON.stringify({ message: "Invalid current password" }),
      {
        status: 401,
      }
    );
  }

  const newPasswordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
  });

  await prisma.systemConfig.update({
    where: { key: "admin_password" },
    data: { value: newPasswordHash },
  });

  return new Response(
    JSON.stringify({ message: "Password changed successfully" }),
    {
      status: 201,
    }
  );
};
