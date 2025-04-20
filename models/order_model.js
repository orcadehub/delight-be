const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: Object,
  cartItems: Array,
  total: String,
  paymentMode: String,
  date: String,
  MUID: String,
  transactionId: String,
});

module.exports = mongoose.model("Order", orderSchema);
