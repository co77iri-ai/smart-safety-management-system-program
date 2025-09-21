"use client";

import { ProgressProvider as _ProgressProvider } from "@bprogress/next/app";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export type ProgressProviderProps = {
  children?: ReactNode;
};

export const ProgressProvider = ({ children }: ProgressProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (window) {
      setIsMounted(true);
    }
  }, []);

  // SSR과 초기 클라이언트 렌더에서 동일한 마크업을 유지하기 위해
  // 마운트 전에는 Provider를 렌더링하지 않는다.
  if (!isMounted) return <>{children}</>;

  return (
    <_ProgressProvider
      height="4px"
      color="#4C6EF5"
      options={{ showSpinner: true }}
      shallowRouting
    >
      {children}
    </_ProgressProvider>
  );
};
