import { Router } from "express";

import {
  create,
  getHistory,
} from "../controllers/stock.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/:id/stock",
  authorize("ADMIN", "WAREHOUSE"),
  create
);

router.get(
  "/:id/stock-movements",
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getHistory
);

export default router;