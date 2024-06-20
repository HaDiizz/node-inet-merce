const Product = require("../models/productModel");

const productCtrl = {
  getAllProducts: async (_, res) => {
    try {
      const products = await Product.find();
      res.status(200).json({
        data: products,
        message: "Get products successful",
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  getProduct: async (req, res) => {
    const { product_id } = req.params;
    try {
      const product = await Product.findById(product_id);
      if (!product) throw { status: 404, message: "Product not found" };
      res.status(200).json({
        data: product,
        message: "Get product successful",
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  createProduct: async (req, res) => {
    const { product_name, price, amount, detail, product_code } = req.body;
    try {
      if (!product_code)
        throw { status: 400, message: "Product code is required" };
      if (!product_name)
        throw { status: 400, message: "Product name is required" };
      if (!req.body.hasOwnProperty("price") || Number(price) < 0)
        throw { status: 400, message: "Price is required" };
      if (!req.body.hasOwnProperty("amount") || Number(amount) < 0)
        throw { status: 400, message: "Amount is required" };

      const isDuplicateProductCode = await Product.findOne({ product_code });

      if (isDuplicateProductCode)
        throw { status: 400, message: "Product code has already used" };

      const newProduct = new Product({
        product_code,
        product_name,
        price: Number(price),
        amount: Number(amount),
        detail,
      });
      const product = await newProduct.save();
      res.status(201).json({
        data: product,
        message: "Product created successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  updateProduct: async (req, res) => {
    const { product_name, price, amount, detail } = req.body;
    const { product_id } = req.params;
    try {
      if (!product_id) throw { status: 400, message: "Product ID is required" };
      if (!product_name)
        throw { status: 400, message: "Product name is required" };
      if (!req.body.hasOwnProperty("price") || Number(price) < 0)
        throw { status: 400, message: "Price is required" };
      if (!req.body.hasOwnProperty("amount") || Number(amount) < 0)
        throw { status: 400, message: "Amount is required" };

      await Product.updateOne(
        { _id: product_id },
        {
          $set: {
            product_name,
            price: Number(price),
            amount: Number(amount),
            detail,
          },
        },
        { new: true }
      );
      const product = await Product.findById(product_id);
      if (!product) throw { status: 404, message: "Product not found" };
      res.status(201).json({
        data: product,
        message: "Updated successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  deleteProduct: async (req, res) => {
    const { product_id } = req.params;
    try {
      if (!product_id) throw { status: 400, message: "Product ID is required" };

      const product = await Product.findOneAndDelete({ _id: product_id });

      if (!product) throw { status: 404, message: "Product not found" };

      res.status(200).json({
        data: product,
        message: "Deleted successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
};

module.exports = productCtrl;
