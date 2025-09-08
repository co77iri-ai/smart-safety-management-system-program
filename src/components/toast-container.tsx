"use client";

import { toast, Toaster, useToasterStore } from "react-hot-toast";
import { useEffect } from "react";

const TOAST_MAX_COUNT = 3;

export const ToastContainer = () => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, index) => index >= TOAST_MAX_COUNT)
      .forEach((t) => {
        toast.dismiss(t.id);
      });
  }, [toasts]);

  return <Toaster position="top-right" containerStyle={{ top: "72px" }} />;
};
