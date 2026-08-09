import { Request, Response } from "express";
import prisma from "../prisma/client";

import {
  createFollowUp,
  getFollowUpsByCustomer,
} from "../services/followup.service";

import {
  createFollowUpSchema,
} from "../validators/followup.validator";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const { customerId } = req.params;

    if (typeof customerId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const data = createFollowUpSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const followUp = await createFollowUp(
      customerId,
      data.note
    );

    return res.status(201).json({
      success: true,
      message: "Follow-up note created successfully",
      data: followUp,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to create follow-up",
    });
  }
};

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const { customerId } = req.params;

    if (typeof customerId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const followUps =
      await getFollowUpsByCustomer(customerId);

    return res.status(200).json({
      success: true,
      data: followUps,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch follow-ups",
    });
  }
};