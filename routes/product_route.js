const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = mongoose.model("Product");

// Create a new product (simplified fields)
router.post("/add-product", async (req, res) => {
  try {
    console.log(req.body)
    const { name, description, price, category, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Add multiple products
router.post("/add-multiple-products", async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Provide an array of products." });
    }

    const validProducts = products.filter(product => product.name && product.price);

    if (validProducts.length === 0) {
      return res.status(400).json({ message: "All products must have at least name and price." });
    }

    const insertedProducts = await Product.insertMany(validProducts);

    res.status(201).json({
      message: `${insertedProducts.length} product(s) added successfully`,
      products: insertedProducts
    });
  } catch (error) {
    console.error("Error adding multiple products:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Get product by ID
router.post("/get-product", async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get products by category (category passed in URL params)
router.get("/products/:category", async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    const products = await Product.find({ category });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this category." });
    }

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});



module.exports = router;
