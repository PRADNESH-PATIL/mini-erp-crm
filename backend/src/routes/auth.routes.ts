import { Router } from "express";
import {
  register,
  login,
} from "../controllers/auth.controller";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, (req: AuthRequest, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  (req: AuthRequest, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  }
);

export default router;