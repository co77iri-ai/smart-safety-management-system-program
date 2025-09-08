import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";

import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { ToastContainer } from "@/components";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" {...mantineHtmlProps}>
      <head>
        <title>스마트 안전관리 체계 프로그램 - 한국도로공사 광주전남본부</title>
        <meta
          name="description"
          content="스마트 안전관리 체계 프로그램 - 한국도로공사 광주전남본부"
        />
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <Script
          strategy="beforeInteractive"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLOUD_PLATFORM_MAP_CLIENT_ID}`}
        />
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <MantineProvider>{children}</MantineProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
