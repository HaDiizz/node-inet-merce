const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const orderCtrl = {
  getAllOrders: async (req, res) => {
    try {
      let orders;
      if (req.user.role === "admin") {
        orders = await Order.find()
          .populate({
            path: "customer_id",
            model: User,
            select: "username full_name last_name age gender user_id",
          })
          .populate({
            path: "orderItems",
            model: OrderItem,
            select: "quantity product",
            populate: {
              path: "product",
              model: Product,
              select: "product_code product_name price amount detail",
            },
          });
      } else {
        orders = await Order.find({ customer_id: req.user._id })
          .populate({
            path: "customer_id",
            model: User,
            select: "username full_name last_name age gender user_id",
          })
          .populate({
            path: "orderItems",
            model: OrderItem,
            select: "quantity product",
            populate: {
              path: "product",
              model: Product,
              select: "product_code product_name price amount detail",
            },
          });
      }
      res.status(200).json({
        data: orders || [],
        message: "Get orders successful",
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  getOrder: async (req, res) => {
    const { order_id } = req.params;
    try {
      let order;
      if (req.user.role === "admin") {
        order = await Order.findById(order_id)
          .populate({
            path: "customer_id",
            model: User,
            select: "username full_name last_name age gender user_id",
          })
          .populate({
            path: "orderItems",
            model: OrderItem,
            select: "quantity product",
            populate: {
              path: "product",
              model: Product,
              select: "product_code product_name price amount detail",
            },
          });
      } else {
        order = await Order.findOne({
          order_id,
          customer_id: req.user._id,
        })
          .populate({
            path: "customer_id",
            model: User,
            select: "username full_name last_name age gender user_id",
          })
          .populate({
            path: "orderItems",
            model: OrderItem,
            select: "quantity product",
            populate: {
              path: "product",
              model: Product,
              select: "product_code product_name price amount detail",
            },
          });
      }
      if (!order) throw { status: 404, message: "Order not found" };
      res.status(200).json({
        data: order,
        message: "Get order successful",
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
  createOrder: async (req, res) => {
    const { customer_id, orderItems } = req.body;
    try {
      if (!customer_id)
        throw { status: 400, message: "Customer ID is required" };
      if (orderItems?.length <= 0)
        throw { status: 400, message: "Product is required" };

      for (const orderItem of orderItems) {
        const product = await Product.findById(orderItem.product);
        if (!product)
          throw {
            status: 404,
            message: `Product not found: ${orderItem.product}`,
          };

        if (product.amount < orderItem.quantity) {
          throw {
            status: 400,
            message: `Not enough stock for product: ${product.product_name}`,
          };
        }
      }

      const orderItemsIds = Promise.all(
        orderItems.map(async (orderItem) => {
          let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
          });

          await newOrderItem.save();

          await Product.findByIdAndUpdate(orderItem.product, {
            $inc: { amount: -orderItem.quantity },
          });

          return newOrderItem._id;
        })
      );

      const orderItemsIdsResolved = await orderItemsIds;

      const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
          const orderItem = await OrderItem.findById(orderItemId).populate(
            "product",
            "price"
          );
          const totalPrice = orderItem.product.price * orderItem.quantity;
          return totalPrice;
        })
      );

      const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
      let order = new Order({
        customer_id,
        orderItems: orderItemsIdsResolved,
        totalPrice,
      });
      order = await order.save();

      if (!order) throw { status: 400, message: "The order cannot be created" };
      res.status(201).json({
        data: order,
        message: "Order created successful",
        success: true,
      });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: true });
    }
  },
};

module.exports = orderCtrl;
