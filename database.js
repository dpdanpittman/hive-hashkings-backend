const { admin } = require("./firebaseConfig");

const {
  transferModel,
  logModel,
  blockModel,
  xpUserModel,
  activeAvatarModel,
  refundModel,
  adrsModel,
  distributeErrorModel,
  notificationModel,
  refundModelmota,
  refundModelbuds,
  raidsModel,
  userOnraidsModel,
  infoBudsModel,
  userOnbotModel,
  procesarCompraModel,
  poolBudsModel,
  compraConsumableModel,
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
    let nxp = parseInt(u.xp, 10) + parseInt(xp, 10);
    return await xpUserModel.updateOne({ user: user }, { xp: nxp });
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

async function getactiveAvatar(user) {
  let data = await activeAvatarModel.findOne({ user: user });
  if (data) {
    return data.avatarId;
  } else {
    return false;
  }
}

async function setactiveAvatar(user, id) {
  let data = await activeAvatarModel.findOne({ user });
  if (data) {
    return await activeAvatarModel.updateOne({ user: user }, { avatarId: id });
  } else {
    return await new activeAvatarModel({
      user: user,
      avatarId: id,
    }).save();
  }
}

async function removePendingRefund(id) {
  return await refundModel.updateOne({ _id: id }, { status: "complete" });
}

async function removePendingRefundMota(id) {
  return await refundModelmota.updateOne({ _id: id }, { status: "complete" });
}

async function removePendingRefundBuds(id) {
  return await refundModelbuds.updateOne({ _id: id }, { status: "complete" });
}

async function addPendingRefund(usuario, value, memo) {
  return await new refundModel({
    usuario,
    value,
    memo,
    status: "pending",
  }).save();
}

async function addPendingRefundMota(usuario, value, memo) {
  return await new refundModelmota({
    usuario,
    value,
    memo,
    status: "pending",
  }).save();
}

async function addPendingRefundBuds(usuario, value, memo) {
  return await new refundModelbuds({
    usuario,
    value,
    memo,
    status: "pending",
  }).save();
}

async function getAllRefunds() {
  return await refundModel.find({ status: "pending" });
}

async function getAllRefundsMota() {
  return await refundModelmota.find({ status: "pending" });
}

async function getAllRefundsBuds() {
  return await refundModelbuds.find({ status: "pending" });
}

async function setAdrs(user, adrs) {
  adrs = ("" + adrs).toLowerCase();
  let data = await adrsModel.findOne({ user: user });
  if (data) {
    return await adrsModel.updateOne({ user: user }, { adrs: adrs });
  } else {
    return await new adrsModel({
      user: user,
      adrs: adrs,
    }).save();
  }
}

async function getAdrs(user) {
  let u = await adrsModel.findOne({ user });

  if (!u) {
    return "none";
  }
  return u.adrs;
}

async function addRefund(usuario, value, moneda, time) {
  return await new distributeErrorModel({
    usuario,
    value,
    moneda,
    time,
    status: "pending",
  }).save();
}

async function sendNotificationToUser(user, message) {
  let data = await notificationModel.findOne({ user: user });

  if (!data) {
    return;
  }
  const registrationToken = data.registrationToken;
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
  };

  const mensaje = {
    notification: {
      title: "hk message",
      body: message,
    },
  };
  await admin
    .messaging()
    .sendToDevice(registrationToken, mensaje, options)
    .then((response) => {})
    .catch((error) => {});
}

async function registrarUsuarioNotificacion(user, token) {
  let data = await notificationModel.findOne({ user: user });
  if (data) {
    if (data.registrationToken != token) {
      return await notificationModel.updateOne(
        { user: user },
        { registrationToken: token }
      );
    } else {
      return "ok";
    }
  } else {
    return await new notificationModel({
      user: user,
      registrationToken: token,
    }).save();
  }
}

async function registerRaid(boss, lvl, multiplicator, time, type) {
  return await new raidsModel({
    boss,
    lvl,
    multiplicator,
    time,
    status: "pending",
    type,
  }).save();
}

async function finishRaid(id) {
  return await raidsModel.updateOne({ _id: id }, { status: "complete" });
}

async function getAllRaidsDisponibles() {
  return await raidsModel.find({ status: "pending" });
}

async function getRaid(id) {
  return await raidsModel.findOne({ _id: id });
}

async function getAvatarOnRaid(avatar, raid) {
  return await userOnraidsModel
    .findOne({ avatar: avatar, raid: raid })
    .populate("raid");
}

async function registerAvatarOnRaid(avatar, power, user, raid) {
  return await new userOnraidsModel({
    avatar,
    power,
    user,
    raid,
  }).save();
}

async function getAllAvatarsOnRaid(raid) {
  return await userOnraidsModel.find({ raid: raid });
}

async function getBudsArepartir() {
  let buds = await infoBudsModel.findOne({ infoid: "1" });
  if (!buds) {
    return 0;
  } else {
    return buds.value;
  }
}

async function actualizarBudsArepartir(value) {
  return await infoBudsModel.updateOne({ infoid: "1" }, { value: "" + value });
}

async function getAllCompras(user) {
  return await procesarCompraModel.find({ username: user, status: "pending" });
}

async function actualizarCompras(uid) {
  return await procesarCompraModel.updateOne(
    { _id: uid },
    { status: "complete" }
  );
}

async function getuserOnBot(user) {
  return await userOnbotModel.findOne({ user: user });
}

async function addToPoolBuds(user, quantity) {
  return await new poolBudsModel({
    user,
    quantity: "" + quantity,
    status: "pending",
  }).save();
}

async function getAllPoolBuds() {
  return await poolBudsModel.find({ status: "pending" });
}

async function getAllConsumablesbuy() {
  return await compraConsumableModel.find({ status: "pending" });
}
async function updateCompraConsumable(uid) {
  return await compraConsumableModel.updateOne(
    { _id: uid },
    { status: "complete" }
  );
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
  getactiveAvatar,
  setactiveAvatar,

  removePendingRefund,
  addPendingRefund,
  getAllRefunds,
  addRefund,

  removePendingRefundMota,
  addPendingRefundMota,
  getAllRefundsMota,

  removePendingRefundBuds,
  addPendingRefundBuds,
  getAllRefundsBuds,

  setAdrs,
  getAdrs,
  sendNotificationToUser,
  registrarUsuarioNotificacion,

  registerRaid,
  registerAvatarOnRaid,
  finishRaid,
  getAllRaidsDisponibles,
  getRaid,
  getAvatarOnRaid,
  getAllAvatarsOnRaid,
  getBudsArepartir,
  actualizarBudsArepartir,

  getuserOnBot,
  getAllCompras,
  actualizarCompras,
  addToPoolBuds,
  getAllPoolBuds,
  getAllConsumablesbuy,
  updateCompraConsumable,
};
