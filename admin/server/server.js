require("dotenv").config();
const express = require("express");
const connectDB = require("./config/connect");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cors = require("cors");

const app = express();
//cors for production
const corsOptions = {
  origin: ["https://ecommerce-app-1-5ra4.onrender.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
connectDB();

app.use(authRoutes);
app.use(productRoutes);
app.use(orderRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
