const mongoose = require("mongoose");
const Counter = require("./counterModel");

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    unique: true,
  },
  customer_id: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orderItems",
      required: true,
    },
  ],
  totalPrice: Number,
});

orderSchema.pre("save", async function (next) {
  const order = this;

  if (order.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "order_id" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );

      order.order_id = counter.value;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("orders", orderSchema);
