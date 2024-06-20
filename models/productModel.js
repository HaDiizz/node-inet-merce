const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_code: {
    type: String,
    require: true,
    unique: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  detail: {
    type: Object,
  },
});

module.exports = mongoose.model("products", productSchema);
