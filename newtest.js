const {
  registerRaid,
  finishRaid,
  getAllRaidsDisponibles,
  getAllAvatarsOnRaid,
  getBudsArepartir,
  actualizarBudsArepartir,
} = require("./database");
const mongoose = require("mongoose");

require("dotenv").config();
const WeightedList = require("js-weighted-list");

async function test() {
  await repartirPremioRaid();
 // await finalizoRaids();
 // await crearRaids();
}

async function repartirPremioRaid() {
  console.log("repartir premio");
  let getAllPendingRaid = await getAllRaidsDisponibles();
  let TotalARepartir = parseFloat(await getBudsArepartir());

  if (TotalARepartir == 0) {
    console.log("no hay nada para repartir");
    return;
  }
  let gastoTotal = 0;
  for (const raid of getAllPendingRaid) {
    let dropaRepartir = 0;
    let avatars = await getAllAvatarsOnRaid(raid._id);
    switch (raid.type) {
      case "comun":
        dropaRepartir = TotalARepartir * ((0.1 * parseInt(raid.multiplicator) / 100));
        break;
      case "rara":
        dropaRepartir = TotalARepartir * ((0.05 * parseInt(raid.multiplicator) / 100));
        break;
      case "epica":
        dropaRepartir = TotalARepartir * ((0.05 * parseInt(raid.multiplicator) / 100));
        break;
      case "mitica":
        dropaRepartir = TotalARepartir * ((0.05 * parseInt(raid.multiplicator) / 100));
        break;
      case "legendaria":
        dropaRepartir = TotalARepartir * ((0.05 * parseInt(raid.multiplicator) / 100));
        break;
    }
    let ratio = dropaRepartir / getTotalPower(avatars);
    for (let avatar of avatars) {
      let userGet = (ratio * avatar.power).toFixed(3);
      console.log(
        avatar.user,
        userGet,
        "U get buds for participe on raid " +
          "day " +
          raid.time +
          " " +
          raid.boss +
          "-" +
          raid.type
      );

   //   await contract.updateNft(hivejs, avatar.avatar, { USAGE: av.properties.USAGE - 1 });
    }
    gastoTotal = gastoTotal + dropaRepartir;
  }

  await actualizarBudsArepartir(TotalARepartir - gastoTotal);
}

async function finalizoRaids() {
  console.log("finalizando anteriores raids");
  let getAllPendingRaid = await getAllRaidsDisponibles();

  for (const raid of getAllPendingRaid) {
    await finishRaid(raid._id);
  }
}

function getTotalPower(avatars) {
  let total = 0;
  for (const avatar of avatars) {
    total = total + avatar.power;
  }
  return total;
}

async function crearRaids() {
  console.log("creando raids");
  let boss25 = getBoss()[0];
  let type25 = getType()[0];
  let multiplicador25 = getDropRate("25")[0];

  let boss50 = getBoss()[0];
  let type50 = getType()[0];
  let multiplicador50 = getDropRate("50")[0];

  let boss75 = getBoss()[0];
  let type75 = getType()[0];
  let multiplicador75 = getDropRate("75")[0];

  let boss100 = getBoss()[0];
  let type100 = getType()[0];
  let multiplicador100 = getDropRate("100")[0];

  await registerRaid(
    boss25,
    "25",
    multiplicador25,
    new Date().getTime(),
    type25
  );

  await registerRaid(
    boss50,
    "50",
    multiplicador50,
    new Date().getTime(),
    type50
  );

  await registerRaid(
    boss75,
    "75",
    multiplicador75,
    new Date().getTime(),
    type75
  );

  await registerRaid(
    boss100,
    "100",
    multiplicador100,
    new Date().getTime(),
    type100
  );
}

const getDropRate = (lvl) => {
  var data = [];
  switch (lvl) {
    case "25":
      data = [
        ["2", 75],
        ["5", 24],
        ["10", 1],
      ];
      break;

    case "50":
      data = [
        ["2", 60],
        ["5", 38],
        ["10", 2],
      ];
      break;

    case "75":
      data = [
        ["2", 40],
        ["5", 57],
        ["10", 3],
      ];
      break;

    case "100":
      data = [
        ["2", 25],
        ["5", 70],
        ["10", 5],
      ];
      break;
  }

  var wl = new WeightedList(data);
  return wl.peek();
};

const getBoss = () => {
  let data = [
    ["zeus", 8.33],
    ["anna", 8.33],
    ["chameleon", 8.33],
    ["Cryptolocker", 8.33],
    ["Flashback", 8.33],
    ["fridaythe13th", 8.33],
    ["GameThief", 8.33],
    ["ILOVEYOU", 8.33],
    ["Melissa", 8.33],
    ["Michelangelo", 8.33],
    ["MydoomL", 8.33],
    ["Sobig", 8.33],
  ];

  let wl = new WeightedList(data);
  return wl.peek();
};

const getType = () => {
  let data = [
    ["comun", 20],
    ["rara", 20],
    ["epica", 20],
    ["mitica", 20],
    ["legendaria", 20],
  ];

  let wl = new WeightedList(data);
  return wl.peek();
};

mongoose.Promise = global.Promise;

mongoose
  .connect(
    `mongodb+srv://${process.env.mongouser}@cluster0.trqu4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(async () => {
    console.info(
      "La conexión a la base  de datos se ha realizado correctamente"
    );

    await test();
  })
  .catch((err) => console.error(err));
