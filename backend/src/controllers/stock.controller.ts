import { Request, Response } from "express";

import { stockMovementSchema } from "../validators/stock.validator";
import {
  createStockMovement,
  getStockMovements,
} from "../services/stock.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const data = stockMovementSchema.parse(req.body);

    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const result = await createStockMovement(
      id,
      data.type,
      data.quantity,
      data.reason,
      user.id
    );

    return res.status(201).json({
      success: true,
      message: `Stock ${data.type} movement created successfully`,
      data: result,
    });
  } catch (error: any) {
    const message =
      error?.message || "Failed to create stock movement";

    if (message === "Product not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message.startsWith("Insufficient stock")) {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const movements = await getStockMovements(id);

    return res.status(200).json({
      success: true,
      data: movements,
    });
  } catch (error: any) {
    const message =
      error?.message || "Failed to fetch stock movements";

    if (message === "Product not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
};