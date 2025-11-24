import { prisma } from "@/services/prisma";
import dayjs from "dayjs";
import z, { ZodAny, ZodType } from "zod";

export type Contract = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
};

const contractWithoutIdSchema = z.object<
  Record<Exclude<keyof Contract, "id">, ZodType>
>({
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export const validateContract = (data: unknown): boolean => {
  const result = contractWithoutIdSchema.safeParse(data);
  return result.success;
};

const convertToContractFromDBData = (data: {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): Contract => {
  return {
    id: data.id,
    title: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
  };
};

export const createContract = async (
  contract: Omit<Contract, "id">
): Promise<Contract> => {
  const createdContract = await prisma.contract.create({
    data: {
      name: contract.title,
      startDate: dayjs(contract.startDate).format("YYYYMMDD"),
      endDate: dayjs(contract.endDate).format("YYYYMMDD"),
    },
  });

  return convertToContractFromDBData(createdContract);
};

export const getContracts = async (): Promise<Contract[]> => {
  const data = await prisma.contract.findMany({
    where: {
      deletedAt: null,
    },
  });

  return data.map(convertToContractFromDBData);
};

export const getContractById = async (
  id: Contract["id"]
): Promise<Contract | null> => {
  const data = await prisma.contract.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  return data ? convertToContractFromDBData(data) : null;
};

export const updateContract = async (
  id: Contract["id"],
  contract: Partial<Omit<Contract, "id">>
): Promise<Contract | null> => {
  const existingContract = await prisma.contract.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingContract) {
    return null;
  }

  const updatedContract = await prisma.contract.update({
    where: {
      id,
    },
    data: {
      ...(contract.title && { name: contract.title }),
      ...(contract.startDate && {
        startDate: dayjs(contract.startDate).format("YYYYMMDD"),
      }),
      ...(contract.endDate && {
        endDate: dayjs(contract.endDate).format("YYYYMMDD"),
      }),
    },
  });

  return convertToContractFromDBData(updatedContract);
};

export const deleteContract = async (
  id: Contract["id"]
): Promise<Contract | null> => {
  const contract = await prisma.contract.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!contract) {
    return null;
  }

  const deletedContract = await prisma.contract.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return convertToContractFromDBData(deletedContract);
};
