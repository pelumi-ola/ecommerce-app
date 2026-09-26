require("dotenv").config();
const express = require("express");
const connectDB = require("./config/connect");
const authRoutes = require("./routes/authRoutes");
const productRoute = require("./routes/productRoute");
const orderRoute = require("./routes/orderRoute");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
connectDB();

app.use(authRoutes);
app.use(productRoute);
app.use(orderRoute);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
