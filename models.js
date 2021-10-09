const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transferSchema = new Schema({
  transaction_id: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
  },
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

const blockSchema = new Schema({
  blockid: String,
  block: String,
});

const blockModel = mongoose.model("Block", blockSchema);

const xpUserSchema = new Schema({
  user: String,
  xp: String,
  date: String,
});

const xpUserModel = mongoose.model("xpUser", xpUserSchema);

const activeAvatarSchema = new Schema({
  user: String,
  avatarId: String,
});

const activeAvatarModel = mongoose.model("activeavatar", activeAvatarSchema);

const refundSchema = new Schema({
  usuario: String,
  value: Number,
  memo: String,
  status: String,
});

const refundModel = mongoose.model("Refund", refundSchema);

const refundMotaSchema = new Schema({
  usuario: String,
  value: Number,
  memo: String,
  status: String,
});

const refundModelmota = mongoose.model("Refundmota", refundMotaSchema);

const refundBudsSchema = new Schema({
  usuario: String,
  value: Number,
  memo: String,
  status: String,
});

const refundModelbuds = mongoose.model("Refundbuds", refundBudsSchema);

const adrsSchema = new Schema({
  user: String,
  adrs: String,
});

const adrsModel = mongoose.model("Adrs", adrsSchema);

const distributeErrorSchema = new Schema({
  usuario: String,
  value: Number,
  moneda: String,
  time: Number,
  status: String,
});

const distributeErrorModel = mongoose.model(
  "distributeError",
  distributeErrorSchema
);

const notificationUserSchema = new Schema({
  user: String,
  registrationToken: String,
});

const notificationModel = mongoose.model(
  "notificationUser",
  notificationUserSchema
);

const raidsSchema = new Schema({
  boss: String,
  lvl: String,
  multiplicator: String,
  time: String,
  status: String,
  type: String,
});

const raidsModel = mongoose.model("raids", raidsSchema);

const userOnraidsSchema = new Schema({
  avatar: String,
  power: String,
  user: String,
  raid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "raids",
  },
});

const userOnraidsModel = mongoose.model("userxraids", userOnraidsSchema);

const infobudsSchema = new Schema({
  infoid: String,
  value: String,
});

const infoBudsModel = mongoose.model("infobud", infobudsSchema);

const userOnbotSchema = new Schema({
  user: String,
  value: String,
  time: String,
});

const userOnbotModel = mongoose.model("userOnbot", userOnbotSchema);

const ProcesarCompraSchema = new Schema({
  trxid: String,
  username: String,
  cantidad: String,
  token_amount: String,
  token: String,
  status: String,
});

const procesarCompraModel = mongoose.model(
  "procesarcompra",
  ProcesarCompraSchema
);

const poolBudsSchema = new Schema({
  user: String,
  quantity: String,
  status: String,
});

const poolBudsModel = mongoose.model("procesarcompra", poolBudsSchema);

module.exports = {
  transferModel,
  logModel,
  blockModel,
  xpUserModel,
  activeAvatarModel,
  refundModel,
  refundModelmota,
  adrsModel,
  distributeErrorModel,
  notificationModel,
  raidsModel,
  userOnraidsModel,
  refundModelbuds,
  infoBudsModel,
  userOnbotModel,
  procesarCompraModel,
  poolBudsModel,
};
