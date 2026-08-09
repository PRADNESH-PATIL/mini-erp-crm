import prisma from "../prisma/client";

export const createFollowUp = async (
  customerId: string,
  note: string
) => {
  return prisma.followUp.create({
    data: {
      customerId,
      note,
    },
  });
};

export const getFollowUpsByCustomer = async (
  customerId: string
) => {
  return prisma.followUp.findMany({
    where: {
      customerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};