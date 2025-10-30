import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const LOGIN_PATH = "/admin/auth/login";

async function isValidAccessToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("accessToken")?.value;
  const secret = process.env.ADMIN_ACCESS_TOKEN_SECRET;

  // 로그인 페이지: 이미 로그인 상태면 /admin으로 리다이렉트
  if (pathname === LOGIN_PATH) {
    if (token && secret) {
      const valid = await isValidAccessToken(token, secret);
      if (valid) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // 어드민 경로만 보호 (matcher로도 제한됨, 이중확인)
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const redirectToLogin = () => {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    const res = NextResponse.redirect(url);
    // 잘못된 쿠키 정리
    res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    return res;
  };

  if (!token || !secret) {
    return redirectToLogin();
  }

  const valid = await isValidAccessToken(token, secret);
  if (!valid) {
    return redirectToLogin();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
