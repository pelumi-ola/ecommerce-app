const Cart = require("../models/carts");
const Product = require("../models/product");

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "productId is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!product.inStock) {
      return res.status(400).json({
        message: "Product is out of stock",
      });
    }

    const qty = quantity || 1;

    let cart = await Cart.findOne({
      userId: req.user.id,
    });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [
          {
            productId,
            quantity: qty,
          },
        ],
      });

      return res.status(201).json({
        message: "Product added to cart",
        data: cart,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({
        productId,
        quantity: qty,
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Product added to cart",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user.id,
    }).populate("items.productId");

    if (!cart) {
      return res.json({
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get cart",
      error: error.message,
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      userId: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === req.params.productId,
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not in cart",
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.json({
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId,
    );

    await cart.save();

    res.json({
      message: "Product removed from cart",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product",
      error: error.message,
    });
  }
};
