"use client";

import { Button } from "@mantine/core";
import QRCode from "react-qr-code";
import { useCallback, useMemo, useRef } from "react";

type QrDownloadButtonProps = {
  contractId: string | number;
  buttonWidth?: number;
};

export function QrDownloadButton({
  contractId,
  buttonWidth = 100,
}: QrDownloadButtonProps) {
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);

  const qrUrl = useMemo(
    () => `${process.env.NEXT_PUBLIC_HOSTNAME}/contract/${contractId}`,
    [contractId]
  );

  const handleDownload = useCallback(async () => {
    const container = hiddenContainerRef.current;
    if (!container) return;

    const svg = container.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    // Ensure no CORS tainting issues
    image.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = (e) => reject(e);
      image.src = svgUrl;
    }).catch(() => {
      URL.revokeObjectURL(svgUrl);
    });

    try {
      const widthAttr = svg.getAttribute("width");
      const heightAttr = svg.getAttribute("height");
      const width = widthAttr ? Number(widthAttr) : 512;
      const height = heightAttr ? Number(heightAttr) : 512;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contract-${contractId}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }, [contractId]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -99999,
          top: -99999,
          pointerEvents: "none",
        }}
        aria-hidden
        ref={hiddenContainerRef}
      >
        <QRCode value={qrUrl} size={512} bgColor="#ffffff" fgColor="#000000" />
      </div>
      <Button
        size="sm"
        variant="light"
        type="button"
        color="dark"
        radius="md"
        w={buttonWidth}
        px={8}
        onClick={handleDownload}
      >
        QR 코드 저장
      </Button>
    </>
  );
}
