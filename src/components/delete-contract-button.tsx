"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const DeleteContractButton = ({
  contractId,
  contractTitle,
  buttonWidth = 100,
}: {
  contractId: number;
  contractTitle: string;
  buttonWidth?: number;
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `"${contractTitle}" 계약을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contract/${contractId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contract");
      }

      toast.success("계약이 삭제되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("계약 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      size="sm"
      type="button"
      color="red"
      radius="md"
      w={buttonWidth}
      px={8}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "삭제 중..." : "삭제"}
    </Button>
  );
};
