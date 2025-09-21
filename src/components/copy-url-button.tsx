"use client";

import { Button } from "@mantine/core";
import { toast } from "react-hot-toast";
import { useCallback, useMemo } from "react";

type CopyUrlButtonProps = {
  contractId: string | number;
  buttonWidth?: number;
};

export function CopyUrlButton({
  contractId,
  buttonWidth = 100,
}: CopyUrlButtonProps) {
  const url = useMemo(
    () => `http://localhost:3000/contract/${contractId}`,
    [contractId]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL이 복사되었습니다.");
    } catch {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("URL이 복사되었습니다.");
      } catch {
        toast.error("URL 복사에 실패했습니다.");
      }
    }
  }, [url]);

  return (
    <Button
      size="sm"
      variant="light"
      type="button"
      color="dark"
      radius="md"
      w={buttonWidth}
      px={8}
      onClick={handleCopy}
    >
      URL 복사
    </Button>
  );
}
