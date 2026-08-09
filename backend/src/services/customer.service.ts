import prisma from "../prisma/client";

interface CreateCustomerData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface UpdateCustomerData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const createCustomer = async (
  data: CreateCustomerData
) => {
  return prisma.customer.create({
    data,
  });
};

export const getCustomers = async (
  search?: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            phone: {
              contains: search,
            },
          },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.customer.count({
      where,
    }),
  ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerById = async (id: string) => {
  return prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      followUps: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};

export const updateCustomer = async (
  id: string,
  data: UpdateCustomerData
) => {
  return prisma.customer.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteCustomer = async (id: string) => {
  return prisma.customer.delete({
    where: {
      id,
    },
  });
};