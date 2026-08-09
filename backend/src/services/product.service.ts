import prisma from "../prisma/client";

export const createProduct = async (data: {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  minStockAlert?: number;
  location?: string;
}) => {
  return prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      minStockAlert: data.minStockAlert,
      location: data.location,
    },
  });
};

export const getProductBySku = async (sku: string) => {
  return prisma.product.findUnique({
    where: {
      sku,
    },
  });
};

export const getProducts = async (
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
            sku: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: {
      id,
    },
  });
};

export const updateProduct = async (
  id: string,
  data: {
    sku?: string;
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    minStockAlert?: number;
    location?: string;
  }
) => {
  return prisma.product.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: {
      id,
    },
  });
};