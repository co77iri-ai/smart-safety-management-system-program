"use client";

import { ProgressProvider as _ProgressProvider } from "@bprogress/next/app";
import type { ReactNode } from "react";

export type ProgressProviderProps = {
  children?: ReactNode;
};

export const ProgressProvider = ({ children }: ProgressProviderProps) => {
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
