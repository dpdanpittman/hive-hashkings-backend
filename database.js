const { transferModel, logModel } = require("./models");

async function saveLog(type, json, from, message) {
  return await new logModel({
    type,
    json: JSON.stringify(json),
    from,
    message,
  }).save();
}

async function setTransaction(transaction_id, type, json, from, message) {
  return await new transferModel({
    transaction_id,
    type,
    json: JSON.stringify(json),
    from,
    message,
    status: "pending",
  }).save();
}

async function updateTransaction(id) {
  return await transferModel
    .updateOne({ transaction_id: id }, { status: "complete" })
}

async function getAllTransaction() {
  return await transferModel.find({ status: "pending" });
}

module.exports = {
  saveLog,
  setTransaction,
  getAllTransaction,
  updateTransaction,
};
