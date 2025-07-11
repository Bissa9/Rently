const dotenv = require("dotenv");
dotenv.config(); 

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const carRoutes = require("./src/routes/carRoutes");
const userRoutes = require("./src/routes/userRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const loyaltyprogRoutes = require("./src/routes/loyaltyprogRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const notifRoutes = require("./src/routes/notificationRoutes");
const authRoutes = require("./src/routes/authRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const withdrawalRoutes = require("./src/routes/withdrawalRoutes");
const { handleStripeWebhook } = require("./src/controllers/webhookController");

const app = express();
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());
app.use(cors());

app.use("/api/cars", carRoutes);
app.use("/api/users", userRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/loyaltyprog", loyaltyprogRoutes);
app.use("/api/notifications", notifRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/withdrawals", withdrawalRoutes);


app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is healthy" });
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });


process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
