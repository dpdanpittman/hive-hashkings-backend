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
  
  
  let transfer = await transferModel.findOne({transaction_id})

  if(!transfer){
    return await new transferModel({
      transaction_id,
      type,
      json: JSON.stringify(json),
      from,
      message,
      status: "pending",
    }).save();
  
  }else{
    console.log("transaccion existe no puedo guardarla otra vez");
  }

  

}

async function updateTransaction(id) {
  return await transferModel
    .updateOne({ transaction_id: id }, { status: "complete" })
}

async function returnToPending(id){
  return await transferModel
    .updateOne({ transaction_id: id }, { status: "pending" })
}

async function getAllTransaction() {
  return await transferModel.find({ status: "pending" });
}

module.exports = {
  saveLog,
  setTransaction,
  getAllTransaction,
  updateTransaction,
  returnToPending
};
