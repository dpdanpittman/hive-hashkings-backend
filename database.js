const {
  transferModel,
  logModel,
  blockModel,
  xpUserModel,
} = require("./models");

async function saveLog(type, json, from, message) {
  return await new logModel({
    type,
    json: JSON.stringify(json),
    from,
    message,
  }).save();
}

async function setTransaction(
  transaction_id,
  type,
  json,
  from,
  message,
  status = "pending"
) {
  let transfer = await transferModel.findOne({ transaction_id });

  if (!transfer) {
    return await new transferModel({
      transaction_id,
      type,
      json: JSON.stringify(json),
      from,
      message,
      status: status,
    }).save();
  } else {
    console.log("transaccion existe no puedo guardarla otra vez");
  }
}

async function updateTransaction(id) {
  return await transferModel.updateOne(
    { transaction_id: id },
    { status: "complete" }
  );
}

async function updateOrsetTransaction(
  transaction_id,
  type,
  json,
  from,
  message
) {
  let transfer = await transferModel.findOne({ transaction_id });

  if (!transfer) {
    await setTransaction(transaction_id, type, json, from, message, "complete");
    return true;
  } else {
    await transferModel.updateOne(
      { transaction_id: transaction_id },
      { status: "complete" }
    );
    return true;
  }
}

async function updateorSetPendingTransaction(
  transaction_id,
  type,
  json,
  from,
  message
) {
  let transfer = await transferModel.findOne({ transaction_id });

  if (!transfer) {
    await setTransaction(
      transaction_id,
      type,
      json,
      from,
      "setting  pending transaction for failure execution"
    );
    return true;
  } else {
    await transferModel.updateOne(
      { transaction_id: transaction_id },
      { status: "pending" }
    );
    return true;
  }

  return false;
}

async function returnToPending(id) {
  return await transferModel.updateOne(
    { transaction_id: id },
    { status: "pending" }
  );
}

async function getAllTransaction() {
  return await transferModel.find({ status: "pending" });
}

async function storeUpdateXp(user, xp) {
  let u = await xpUserModel.findOne({ user: user });

  if (u) {
    u.xp = u.xp + xp;
    return await xpUserModel.updateOne({ user: user }, { xp: xp });
  } else {
    return await new xpUserModel({
      user: user,
      xp: xp,
      date: new Date().getTime(),
    }).save();
  }
}

async function updateBlock(id, blockid) {
  await blockModel.updateOne({ blockid: id }, { block: blockid });
  return getLastBlock();
}

async function getLastBlock() {
  let hb = await blockModel.findOne({ blockid: "1" });
  let heb = await blockModel.findOne({ blockid: "2" });
  return { hb, heb };
}

async function getIsPending(user, json) {
  let jsont = JSON.parse(json);

  jsont.transaction_id = null;
  jsont.block_num = null;

  jsont = JSON.stringify(jsont);

  let transfer = await transferModel.find({ from: user });

  if (transfer) {
    for (let index = 0; index < transfer.length; index++) {
      let temp = JSON.parse(transfer[index].json);
      temp.transaction_id = null;
      temp.block_num = null;

      temp = JSON.stringify(temp);

      if (temp == jsont) {
        return { response: true, status: transfer[index].status };
      }
    }
  } else {
    return { response: false };
  }

  return { response: false };
}

async function getAllPendings(user) {
  let transfer = await transferModel.find({ status: "pending", from: user });

  return { response: true, data: transfer };
}

module.exports = {
  saveLog,
  setTransaction,
  getAllTransaction,
  updateTransaction,
  returnToPending,
  getIsPending,
  updateorSetPendingTransaction,
  updateOrsetTransaction,
  updateBlock,
  getLastBlock,
  getAllPendings,
  storeUpdateXp,
};
