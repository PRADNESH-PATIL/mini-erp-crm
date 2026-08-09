import { Router } from "express";

import {
    createDraft,
    getById,
    updateDraft,
    confirm,
    cancel,
    getAll,
} from "../controllers/challan.controller";

import {
    authenticate,
    authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    authorize("ADMIN", "SALES"),
    createDraft
);

router.get(
    "/",
    authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
    getAll
);

router.get(
    "/:id",
    authorize("ADMIN", "SALES"),
    getById
);

router.patch(
    "/:id",
    authorize("ADMIN", "SALES"),
    updateDraft
);

router.post(
    "/:id/confirm",
    authorize("ADMIN", "SALES"),
    confirm
);

router.post(
    "/:id/cancel",
    authorize("ADMIN", "SALES"),
    cancel
);

export default router;