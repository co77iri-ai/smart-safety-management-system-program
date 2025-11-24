import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const cookieStore = await cookies();
  const guestContractId = cookieStore.get("guest-contract-id")?.value;

  // 쿠키에 guest-contract-id가 있으면 /guest로 리다이렉트
  if (guestContractId) {
    const contractId = parseInt(guestContractId, 10);
    if (!isNaN(contractId) && contractId > 0) {
      redirect("/guest");
    }
  }

  // 쿠키가 없으면 어드민 로그인 페이지로 리다이렉트
  redirect("/admin/auth/login");
}

