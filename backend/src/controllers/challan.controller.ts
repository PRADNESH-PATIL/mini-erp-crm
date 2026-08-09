import { Request, Response } from "express";

import {
    createChallanSchema,
    updateChallanSchema,
} from "../validators/challan.validator";
import {
    createDraftChallan,
    getChallanById,
    updateDraftChallan,
    confirmChallan,
    cancelChallan,
    getChallans,
} from "../services/challan.service";

export const createDraft = async (
    req: Request,
    res: Response
) => {
    try {
        const data = createChallanSchema.parse(req.body);

        const user = (req as any).user;

        if (!user?.id) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found",
            });
        }

        const challan = await createDraftChallan(
            data,
            user.id
        );

        return res.status(201).json({
            success: true,
            message: "Draft challan created successfully",
            data: challan,
        });
    } catch (error: any) {
        const message =
            error?.message || "Failed to create draft challan";

        if (message === "Customer not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message === "One or more products not found" ||
            message.startsWith("Product not found")
        ) {
            return res.status(404).json({
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


export const getById = async (
    req: Request,
    res: Response
) => {
    try {
        const id = req.params.id as string;

        const challan = await getChallanById(id);

        return res.status(200).json({
            success: true,
            data: challan,
        });
    } catch (error: any) {
        const message =
            error?.message || "Failed to fetch challan";

        if (message === "Challan not found") {
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


export const updateDraft = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const data = updateChallanSchema.parse(req.body);

    const challan = await updateDraftChallan(
      id,
      data
    );

    return res.status(200).json({
      success: true,
      message: "Draft challan updated successfully",
      data: challan,
    });
  } catch (error: any) {
    const message =
      error?.message || "Failed to update challan";

    if (
      message === "Challan not found" ||
      message === "Customer not found" ||
      message === "One or more products not found" ||
      message.startsWith("Product not found")
    ) {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message ===
      "Only DRAFT challans can be updated"
    ) {
      return res.status(400).json({
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


export const confirm = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const challan = await confirmChallan(id);

    return res.status(200).json({
      success: true,
      message: "Challan confirmed successfully",
      data: challan,
    });
  } catch (error: any) {
    const message =
      error?.message || "Failed to confirm challan";

    if (message === "Challan not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message === "Only DRAFT challans can be confirmed" ||
      message.startsWith("Insufficient stock") ||
      message.startsWith("Product not found")
    ) {
      return res.status(400).json({
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


export const cancel = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const challan = await cancelChallan(id);

    return res.status(200).json({
      success: true,
      message: "Challan cancelled successfully",
      data: challan,
    });
  } catch (error: any) {
    const message =
      error?.message || "Failed to cancel challan";

    if (message === "Challan not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message === "Only DRAFT challans can be cancelled") {
      return res.status(400).json({
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

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? (req.query.status as "DRAFT" | "CONFIRMED" | "CANCELLED")
        : undefined;

    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 10;

    const result = await getChallans(
      search,
      status,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch challans",
    });
  }
};