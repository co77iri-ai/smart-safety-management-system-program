"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";

export const EditContractButton = ({
  contractId,
  buttonWidth = 100,
}: {
  contractId: number;
  buttonWidth?: number;
}) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/admin/edit-contract/${contractId}`);
  };

  return (
    <Button
      size="sm"
      type="button"
      color="blue"
      radius="md"
      w={buttonWidth}
      px={8}
      onClick={handleEdit}
    >
      수정
    </Button>
  );
};
