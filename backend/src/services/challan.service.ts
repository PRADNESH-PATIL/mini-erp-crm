import prisma from "../prisma/client";

interface CreateChallanItemInput {
  productId: string;
  quantity: number;
}

interface CreateChallanInput {
  customerId: string;
  items: CreateChallanItemInput[];
}

const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.challan.count();
  return `CHL-${year}-${String(count + 1).padStart(4, "0")}`;
};

export const createDraftChallan = async (
  data: CreateChallanInput,
  createdById: string
) => {
  // Check customer
  const customer = await prisma.customer.findUnique({
    where: {
      id: data.customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (data.items.length === 0) {
    throw new Error("Challan must contain at least one item");
  }

  // Get all products
  const productIds = data.items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  // Make sure every product exists
  if (products.length !== productIds.length) {
    throw new Error("One or more products not found");
  }

  // Create product lookup
  const productMap = new Map(
    products.map((product) => [product.id, product])
  );

  // Prepare challan items with product snapshots
  const challanItems = data.items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const total = product.price * item.quantity;

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity,
      total,
    };
  });

  const totalAmount = challanItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const totalQuantity = challanItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const challanNumber = await generateChallanNumber();

  // Create DRAFT challan
  const challan = await prisma.challan.create({
    data: {
      challanNumber,
      customerId: data.customerId,
      createdById,
      status: "DRAFT",
      totalAmount,
      totalQuantity,
      items: {
        create: challanItems,
      },
    },
    include: {
      customer: true,
      items: true,
    },
  });

  return challan;
};

export const getChallanById = async (challanId: string) => {
  const challan = await prisma.challan.findUnique({
    where: {
      id: challanId,
    },
    include: {
      customer: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      items: true,
    },
  });

  if (!challan) {
    throw new Error("Challan not found");
  }

  return challan;
};

export const updateDraftChallan = async (
  challanId: string,
  data: {
    customerId: string;
    items: {
      productId: string;
      quantity: number;
    }[];
  }
) => {
  const challan = await prisma.challan.findUnique({
    where: {
      id: challanId,
    },
  });

  if (!challan) {
    throw new Error("Challan not found");
  }

  if (challan.status !== "DRAFT") {
    throw new Error("Only DRAFT challans can be updated");
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: data.customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const productIds = data.items.map(
    (item) => item.productId
  );

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products not found");
  }

  const productMap = new Map(
    products.map((product) => [product.id, product])
  );

  const items = data.items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(
        `Product not found: ${item.productId}`
      );
    }

    const total = Number(product.price) * item.quantity;

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity,
      total,
    };
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const updatedChallan = await prisma.$transaction(
    async (tx) => {
      await tx.challanItem.deleteMany({
        where: {
          challanId,
        },
      });

      return tx.challan.update({
        where: {
          id: challanId,
        },
        data: {
          customerId: data.customerId,
          totalAmount,
          totalQuantity,
          items: {
            create: items,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    }
  );

  return updatedChallan;
};

export const confirmChallan = async (challanId: string) => {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });

    if (!challan) {
      throw new Error("Challan not found");
    }

    if (challan.status !== "DRAFT") {
      throw new Error("Only DRAFT challans can be confirmed");
    }

    // Step 1: Check stock for ALL items first (no partial deduction)
    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
        );
      }
    }

    // Step 2: Deduct stock + create OUT movements
    for (const item of challan.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          type: "OUT",
          quantity: item.quantity,
          reason: `Challan confirmed: ${challan.challanNumber}`,
          productId: item.productId,
          createdById: challan.createdById,
        },
      });
    }

    // Step 3: Flip status to CONFIRMED
    return tx.challan.update({
      where: { id: challanId },
      data: { status: "CONFIRMED" },
      include: {
        customer: true,
        items: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  });
};

export const cancelChallan = async (challanId: string) => {
  const challan = await prisma.challan.findUnique({
    where: { id: challanId },
  });

  if (!challan) {
    throw new Error("Challan not found");
  }

  if (challan.status !== "DRAFT") {
    throw new Error("Only DRAFT challans can be cancelled");
  }

  return prisma.challan.update({
    where: { id: challanId },
    data: { status: "CANCELLED" },
  });
};

export const getChallans = async (
  search?: string,
  status?: "DRAFT" | "CONFIRMED" | "CANCELLED",
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      {
        challanNumber: {
          contains: search,
          mode: "insensitive" as const,
        },
      },
      {
        customer: {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      },
    ];
  }

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
        items: true,
      },
    }),

    prisma.challan.count({
      where,
    }),
  ]);

  return {
    challans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};