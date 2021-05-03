const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transferSchema = new Schema({
  transaction_id: String,
  type: String,
  json: String,
  from: String,
  message: String,
  status: String,
});

const transferModel = mongoose.model("Transfer", transferSchema);

const logSchema = new Schema({
  type: String,
  json: String,
  from: String,
  message: String,
});

const logModel = mongoose.model("Log", logSchema);

module.exports = {
  transferModel,
  logModel,
};
