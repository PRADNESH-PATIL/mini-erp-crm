import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "../controllers/product.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  create
);

router.get(
  "/",
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getAll
);

router.get(
  "/:id",
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  getById
);

router.put(
  "/:id",
  authorize("ADMIN", "WAREHOUSE"),
  update
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  remove
);

export default router;