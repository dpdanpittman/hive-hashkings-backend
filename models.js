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

const adrsSchema = new Schema({
  user: String,
  adrs: String,
});

const adrsModel = mongoose.model("Adrs", adrsSchema);

module.exports = {
  transferModel,
  logModel,
  blockModel,
  xpUserModel,
  activeAvatarModel,
  refundModel,
  adrsModel,
};
