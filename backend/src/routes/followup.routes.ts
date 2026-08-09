import { Router } from "express";

import {
  create,
  getAll,
} from "../controllers/followup.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/:customerId/follow-ups",
  authorize("ADMIN", "SALES"),
  create
);

router.get(
  "/:customerId/follow-ups",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  getAll
);

export default router;