const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Cart = mongoose.model("Cart");
const authMiddleware = require("../middlewares/AuthMiddleware");

// Add item to cart (protected)
router.post("/cart/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, qty } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, qty: qty || 1 }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].qty += qty || 1;
      } else {
        cart.items.push({ product: productId, qty: qty || 1 });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.delete("/cart/remove", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.body;
  
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
  
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      await cart.save();
  
      res.status(200).json({ message: "Product removed from cart", cart });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });


  // GET /cart
router.get("/cart", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      res.status(200).json({ cart });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

module.exports = router;
