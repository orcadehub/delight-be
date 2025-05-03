// Required Modules
import express from "express";
import cors from "cors";
import dotenv  from "dotenv";
import {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} from "pg-sdk-node";
import { randomUUID } from "crypto";
import "./models/user_model.js";
import "./models/cart_model.js";
import "./models/product_model.js";
import "./models/order_model.js";

import userRoutes from "./routes/user_route.js";
import productRoutes from "./routes/product_route.js";
import cartRoutes from "./routes/cart_route.js";
import orderRoutes from "./routes/order_route.js";
import mongoose from "mongoose";
import bodyParser from "body-parser";
dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = [
  "https://delight-fe-production.up.railway.app",
  "http://localhost:5173"
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Allow credentials (cookies, tokens)
    optionsSuccessStatus: 200,
  })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Environment Variables
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = 1;
const env = Env.SANDBOX;

const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const APP_BE_URL = process.env.APP_BE_URL || "http://localhost:5173";
const PORT = process.env.PORT || 3002;

// MongoDB Setup
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("connected", () => console.log("Connected to MongoDB"));
db.on("error", (error) => console.error("MongoDB connection error:", error));



app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(orderRoutes);


// Routes
app.get("/", (req, res) => {
  res.json("It Works");
});

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

// Route to initiate payment
app.post("/pay", async (req, res) => {
  try {
    let { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const merchantOrderId = randomUUID();

    // Create the payment request with redirect URLs (still required by PhonePe API)
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount)
      .redirectUrl("http://localhost:5173/success")  // still sent to PhonePe, not frontend
      .failureUrl("http://localhost:5173/checkout")
      .build();

    // Send payment request to PhonePe
    const response = await client.pay(request);
    console.log(response);

    // Respond based on payment status
    if (response.status === 'SUCCESS') {
      res.json({
        paymentStatus: 'success',
        orderId: merchantOrderId,
      });
    } else {
      res.json({
        paymentStatus: 'failure',
        orderId: merchantOrderId,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Payment processing failed" });
  }
});




// Check payment status
app.post('/status', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const response = await client.getOrderStatus(orderId);
    console.log(response)
    if (!response || !response.success) {
      return res.status(400).json({ status: "failed", message: "Unable to fetch order status" });
    }

    const state = response.data?.state;

    if (state === "COMPLETED") {
      return res.json({ status: "success", message: "Payment completed successfully" });
    } else if (state === "PENDING") {
      return res.json({ status: "pending", message: "Payment is still in process" });
    } else {
      return res.json({ status: "failed", message: "Payment failed or was cancelled" });
    }
  } catch (err) {
    console.error("Error checking payment status:", err);
    res.status(500).json({ status: "error", message: err.message || "Payment status check failed" });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});