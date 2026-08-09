import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import followUpRoutes from "./routes/followup.routes";
import productRoutes from "./routes/product.routes";
import stockRoutes from "./routes/stock.routes";
import challanRoutes from "./routes/challan.routes";



const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customers", followUpRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", stockRoutes);
app.use("/api/challans", challanRoutes);




app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ERP CRM API is running 🚀",
  });
});

export default app;