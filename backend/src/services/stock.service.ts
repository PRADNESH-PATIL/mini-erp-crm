import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";

export const createStockMovement = async (
  productId: string,
  type: "IN" | "OUT",
  quantity: number,
  reason: string | undefined,
  createdById: string
) => {
  return prisma.$transaction(async (tx) => {
    // Get the product
    const product = await tx.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Prevent stock from going negative
    if (type === "OUT" && product.stock < quantity) {
      throw new Error(
        `Insufficient stock. Available stock: ${product.stock}`
      );
    }

    // Calculate new stock
    const newStock =
      type === "IN"
        ? product.stock + quantity
        : product.stock - quantity;

    // Update product stock
    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: newStock,
      },
    });

    // Create movement record
    const movement = await tx.stockMovement.create({
      data: {
        type,
        quantity,
        reason,
        productId,
        createdById,
      },
    });

    return {
      product: updatedProduct,
      movement,
    };
  });
};




export const getStockMovements = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.stockMovement.findMany({
    where: {
      productId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};