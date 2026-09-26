const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  category: {
    type: String,
  },
  details: {
    type: String,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    required: [true, "image url is required"],
  },
});

module.exports = mongoose.model("Product", productSchema);
