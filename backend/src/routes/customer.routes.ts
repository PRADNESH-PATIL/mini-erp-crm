import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "../controllers/customer.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "SALES"),
  create
);

router.get(
  "/",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  getAll
);

router.get(
  "/:id",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  getById
);

router.put(
  "/:id",
  authorize("ADMIN", "SALES"),
  update
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  remove
);

export default router;