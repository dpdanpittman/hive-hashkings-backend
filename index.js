//----------------------------------------------------//
//                       .                            //
//                       M                            //
//                      dM                            //
//                      MMr                           //
//                     4MMML                  .       //
//                     MMMMM.                xf       //
//     .               "MMMMM               .MM-      //
//      Mh..          +MMMMMM            .MMMM        //
//      .MMM.         .MMMMML.          MMMMMh        //
//       )MMMh.        MMMMMM         MMMMMMM         //
//        3MMMMx.     'MMMMMMf      xnMMMMMM"         //
//        '*MMMMM      MMMMMM.     nMMMMMMP"          //
//          *MMMMMx    "MMMMM\    .MMMMMMM=           //
//           *MMMMMh   "MMMMM"   JMMMMMMP             //
//             MMMMMM   3MMMM.  dMMMMMM            .  //
//              MMMMMM  "MMMM  .MMMMM(        .nnMP"  //
//  =..          *MMMMx  MMM"  dMMMM"    .nnMMMMM*    //
//    "MMn...     'MMMMr 'MM   MMM"   .nMMMMMMM*"     //
//     "4MMMMnn..   *MMM  MM  MMP"  .dMMMMMMM""       //
//       ^MMMMMMMMx.  *ML "M .M*  .MMMMMM**"          //
//          *PMMMMMMhn. *x > M  .MMMM**""             //
//             ""**MMMMhx/.h/ .=*"                    //
//                      .3P"%....                     //
//                    nP"     "*MMnx       DaFreakyG  //
//----------------------------------------------------//

require("dotenv").config();

const mongoose = require("mongoose");
var dhive = require("@hiveio/dhive");
var hivejs = require("@hiveio/hive-js");
var axios = require("axios");
const config = require("./config");
var steemState = require("./processor");
var contract = require("./contract.js");
var steemTransact = require("steem-transact");
var fs = require("fs");
var jp = require("jsonpath");
const cors = require("cors");
const express = require("express");
const ENV = process.env;
const SSC = require("sscjs");
const maxEx = process.max_extentions || 8;
const IPFS = require("ipfs-api");
const ipfs = new IPFS({
  host: config.ipfshost,
  port: 5001,
  protocol: "https",
});

hivejs.api.setOptions({ url: "https://api.deathwing.me" });
hivejs.config.set("alternative_api_endpoints", [
  "https://api.hive.blog/",
  "https://api.deathwing.me",
  "https://anyx.io/",
]);

const {
  saveLog,
  setTransaction,
  getAllTransaction,
  updateTransaction,
} = require("./database");

const {
  tohkvault,
  nfttohkvaul,
  plant_plot,
  subdivide_plot,
} = require("./functions");

const init = require("./state");
var Pathwise = require("./pathwise");
var level = require("level");

var store = new Pathwise(level("./db", { createIfEmpty: true }));
//const app = express();
//const port = ENV.PORT || 443;
//const wkey = ENV.wkey;
const skey = dhive.PrivateKey.from(ENV.skey);
const streamname = ENV.streamname;

/******************* Server *************************/

// Dependencies
const http = require("http");
const https = require("https");

const app = express();

// Certificate

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/hashkings.xyz/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/hashkings.xyz/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/hashkings.xyz/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80");
});

httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});

/***************** End Server ************************/

app.use(cors());

/*app.get('/a/:user', (req, res, next) => {
    let user = req.params.user,
        arr = []
    res.setHeader('Content-Type', 'application/json');
    if (state.users[user]) {
        for (var i = 0; i < state.users[user].addrs.length; i++) {
            arr.push(state.users[user].addrs[i])
        }
    }
    for (var i = 0; i < arr.length; i++) {
        insert = ''
        var insert = state.land[arr[i]]
        if (insert) {
            insert.id = arr[i]
            if (insert.care.length > 3) { insert.care.splice(3, insert.care.length - 3) }
            if (insert.aff.length > 3) { insert.aff.splice(3, insert.aff.length - 3) }
            arr.splice(i, 1, insert)
        }
    }
    res.send(JSON.stringify(arr, null, 3))
});*/

//overal game stats i.e. number of farmers, number of plants available, seed prices, land price, weather info
//at each location such as mexico or jamaica etc.
/*app.get('/stats', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    Object.keys(state.users).length
    var ret = state.stats
    ret.farmers = Object.keys(state.users).length
    res.send(JSON.stringify(ret, null, 3))
});*/

//app.listen(port, () => console.log(`HASHKINGS API listening on port ${port}!`))
var state;
var startingBlock = ENV.STARTINGBLOCK || 53815789; //GENESIS BLOCK
const username = ENV.ACCOUNT || "hashkings"; //account with all the SP
const key = dhive.PrivateKey.from(ENV.skey); //active key for account
const ago = ENV.ago || 53815789;
const prefix = ENV.PREFIX || "qwoyn_"; // part of custom json visible on the blockchain during watering etc..
var client = new dhive.Client(
  [
    "https://api.deathwing.me",
    //"https://api.pharesim.me",
    //"https://hived.privex.io",
    //"https://api.hive.blog"
  ],
  { consoleOnFailover: true }
);
var processor;
var recents = [];

const {
  ChainTypes,
  makeBitMaskFilter,
} = require("@hiveio/hive-js/lib/auth/serializer");
const { stats } = require("./state");
const op = ChainTypes.operations;
const walletOperationsBitmask = makeBitMaskFilter([
  op.transfer,
  op.transfer_to_vesting,
  op.withdraw_vesting,
  op.interest,
  op.liquidity_reward,
  op.transfer_to_savings,
  op.transfer_from_savings,
  op.escrow_transfer,
  op.cancel_transfer_from_savings,
  op.escrow_approve,
  op.escrow_dispute,
  op.escrow_release,
  op.fill_convert_request,
  op.fill_order,
  op.claim_reward_balance,
]);

//this rpc sucks
const ssc = new SSC("https://api.hive-engine.com/rpc");

//this doesnt work 100 percent
function dynStart(account) {
  let accountToQuery = account || config.username;
  hivejs.api.getAccountHistory(
    accountToQuery,
    -1,
    100,
    ...walletOperationsBitmask,
    function (err, result) {
      if (err) {
        console.log(err);
        dynStart("hashkings");
      } else {
        let ebus = result.filter((tx) => tx[1].op[1].id === "qwoyn_report");
        for (i = ebus.length - 1; i >= 0; i--) {
          if (
            JSON.parse(ebus[i][1].op[1].json).hash &&
            parseInt(JSON.parse(ebus[i][1].op[1].json).block) >
              parseInt(config.override)
          ) {
            recents.push(JSON.parse(ebus[i][1].op[1].json).hash);
          }
        }
        if (recents.length) {
          const mostRecent = recents.shift();
          console.log(mostRecent);
          if (recents.length === 0) {
            startWith(config.engineCrank);
          } else {
            startWith(mostRecent);
          }
        } else {
          startWith(config.engineCrank);
        }
      }
    }
  );
}

// gets hive in usd
function hivePriceConversion(amount) {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.binance.com/api/v3/ticker/price")
      .then((res) => {
        const { data } = res;
        const hivePrice = data.find((o) => o.symbol === "HIVEUSDT");
        const hiveCost = amount / hivePrice.price;
        const hiveAmount = hiveCost;

        resolve(hiveAmount.toFixed(3));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

//compares farmer
function userList() {
  try {
    contract.getReport(axios).then((res) => {
      let farmerArray = state.stats.farmerList;
      var arrayLength = farmerArray.length;
      for (let i = 0; i < arrayLength; i++) {
        let username = farmerArray[i];
        if (!state.users[username]) {
          state.users[username] = {
            rentals: [],
            plots: [],
            plotCount: 0,
            seedCount: 0,
            seeds: [],
            hkwater: 0,
            waterCount: 0,
            waterPlants: {
              lvl1: 0,
              lvl2: 0,
              lvl3: 0,
              lvl4: 0,
              lvl5: 0,
              lvl7: 0,
              lvl8: 0,
              lvl9: 0,
              lvl10: 0,
            },
            waterTowers: {
              lvl1: [],
              lvl2: [],
              lvl3: [],
              lvl4: [],
              lvl5: [],
              lvl6: [],
              lvl7: [],
              lvl8: [],
              lvl9: [],
              lvl10: [],
            },
            timeBoosters: {
              lvl1: 0,
              lvl2: 0,
              lvl3: 0,
              lvl4: 0,
              lvl5: 0,
              lvl7: 0,
              lvl8: 0,
              lvl9: 0,
              lvl10: 0,
            },
            buds: 0,
            dailyBudDeposit: 0,
            tokens: {
              buds: {
                balance: 0,
                stake: 0,
              },
              mota: {
                balance: 0,
                stake: 0,
              },
              hkwater: {
                balance: 0,
                stake: 0,
              },
            },
            claimed: {
              water: false,
              avatar: false,
              bud: false,
            },
            xp: 45,
            lvl: 1,
            role: 1,
            joints: [],
            mota: 0,
            motaStake: 0,
            boosters: [],
          };
        } else if (state.users[username]) {
          let report = res[4];
          for (const property in report) {
            if (property == username) {
              /*//get nft data
              seedData = report[property].seeds
              plotData = report[property].plots
              jointData = report[property].consumable
              boosterData = report[property].booster
              avatarData = report[property].avatar*/
              //waterTowerData = report[property].water
              /*waterTowerTempData = report[property].waterTemp

              //set nft data
              state.users[username].avatars = avatarData
              state.users[username].boosters = boosterData
              state.users[username].joints = jointData
              state.users[username].seeds = seedData
              state.users[username].plots = plotData
              state.users[username].waterTowers = waterTowerData

              state.users[username].waterPlants.lvl1 = waterTowerTempData

              //set number of seeds and plots for user
              state.users[username].seedCount = seedData.length
              state.users[username].plotCount = plotData.length

              //if user doesnt exist, create them
              if(state.users[username].tokens.buds.balance > 0) {
                  state.users[username].claimed.water = true
                  state.users[username].claimed.avatar = true
                  state.users[username].claimed.bud = true*/
              //get nft data
              seedData = report[property].seeds;
              plotData = report[property].plots;
              jointData = report[property].consumable;
              boosterData = report[property].booster;
              avatarData = report[property].avatar;
              waterTowerData = report[property].waterTemp;

              //set nft data
              state.users[username].avatars = avatarData;
              state.users[username].boosters = boosterData;
              state.users[username].joints = jointData;
              state.users[username].seeds = seedData;
              state.users[username].plots = plotData;

              //set number of seeds and plots for user
              state.users[username].seedCount = seedData.length;
              state.users[username].plotCount = plotData.length;

            }
          }
          //get the users tokens and set in db
          //contract.getTokens(ssc, username).then( response => { state.users[username].tokens = response } )
        }
      }
    });
  } catch (error) {
    console.log("error when running report");
  }
}

function leveling() {
  var userList = state.stats.farmerList;
  try {
    for (var i = 0; i < userList.length; i++) {
      var user = userList[i];
      if (state.users[user].xp >= 45 && state.users[user].xp <= 47) {
        state.users[user].lvl = 1;
      } else if (state.users[user].xp >= 48 && state.users[user].xp <= 52) {
        state.users[user].lvl = 2;
      } else if (state.users[user].xp >= 53 && state.users[user].xp <= 58) {
        state.users[user].lvl = 3;
      } else if (state.users[user].xp >= 58 && state.users[user].xp <= 62) {
        state.users[user].lvl = 4;
      } else if (state.users[user].xp >= 63 && state.users[user].xp <= 67) {
        state.users[user].lvl = 5;
      } else if (state.users[user].xp >= 68 && state.users[user].xp <= 72) {
        state.users[user].lvl = 6;
      } else if (state.users[user].xp >= 73 && state.users[user].xp <= 78) {
        state.users[user].lvl = 7;
      } else if (state.users[user].xp >= 79 && state.users[user].xp <= 85) {
        state.users[user].lvl = 8;
      } else if (state.users[user].xp >= 86 && state.users[user].xp <= 91) {
        state.users[user].lvl = 9;
      } else if (state.users[user].xp >= 92 && state.users[user].xp <= 99) {
        state.users[user].lvl = 10;
      } else if (state.users[user].xp >= 100 && state.users[user].xp <= 106) {
        state.users[user].lvl = 11;
      } else if (state.users[user].xp >= 107 && state.users[user].xp <= 113) {
        state.users[user].lvl = 12;
      } else if (state.users[user].xp >= 114 && state.users[user].xp <= 122) {
        state.users[user].lvl = 13;
      } else if (state.users[user].xp >= 123 && state.users[user].xp <= 132) {
        state.users[user].lvl = 14;
      } else if (state.users[user].xp >= 133 && state.users[user].xp <= 142) {
        state.users[user].lvl = 15;
      } else if (state.users[user].xp >= 143 && state.users[user].xp <= 154) {
        state.users[user].lvl = 16;
      } else if (state.users[user].xp >= 155 && state.users[user].xp <= 167) {
        state.users[user].lvl = 17;
      } else if (state.users[user].xp >= 168 && state.users[user].xp <= 179) {
        state.users[user].lvl = 18;
      } else if (state.users[user].xp >= 180 && state.users[user].xp <= 195) {
        state.users[user].lvl = 19;
      } else if (state.users[user].xp >= 196 && state.users[user].xp <= 210) {
        state.users[user].lvl = 20;
      } else if (state.users[user].xp >= 211 && state.users[user].xp <= 227) {
        state.users[user].lvl = 21;
      } else if (state.users[user].xp >= 228 && state.users[user].xp <= 245) {
        state.users[user].lvl = 22;
      } else if (state.users[user].xp >= 246 && state.users[user].xp <= 265) {
        state.users[user].lvl = 23;
      } else if (state.users[user].xp >= 266 && state.users[user].xp <= 287) {
        state.users[user].lvl = 24;
      } else if (state.users[user].xp >= 288 && state.users[user].xp <= 309) {
        state.users[user].lvl = 25;
      } else if (state.users[user].xp >= 310 && state.users[user].xp <= 333) {
        state.users[user].lvl = 26;
      } else if (state.users[user].xp >= 334 && state.users[user].xp <= 360) {
        state.users[user].lvl = 27;
      } else if (state.users[user].xp >= 361 && state.users[user].xp <= 389) {
        state.users[user].lvl = 28;
      } else if (state.users[user].xp >= 390 && state.users[user].xp <= 428) {
        state.users[user].lvl = 29;
      } else if (state.users[user].xp >= 429 && state.users[user].xp <= 480) {
        state.users[user].lvl = 30;
      } else if (state.users[user].xp >= 481 && state.users[user].xp <= 530) {
        state.users[user].lvl = 31;
      }
      //need to figure out a better way
    }
  } catch (error) {
    console.log("error updating " + user + "'s lvl");
  }
}

function reporting() {
  contract.getReport(axios).then((res) => {
    try {
      let landTotal = res[2].totalAllPlots;
      let seedTotal = res[2].totalAllSeeds;
      let waterTotal = res[2].totalAllWater;

      let asiaTotal = res[1].Asia;
      let jamaicaTotal = res[1].Jamaica;
      let africaTotal = res[1].Africa;
      let afghanistanTotal = res[1].Afghanistan;
      let mexicoTotal = res[1].Mexico;
      let southAmericaTotal = res[1]["South America"];

      let totalAsiaSupply = 40;
      let totalJamaicaSupply = 116;
      let totalAfricaSupply = 300;
      let totalAfghanistanSupply = 500;
      let totalMexicoSupply = 750;
      let totalSouthAmericaSupply = 1300;
      let totalWaterSupply = 19000;

      state.stats.supply.land.asia = totalAsiaSupply - asiaTotal;
      state.stats.supply.land.asiaC = asiaTotal;
      state.stats.supply.land.jamaica = totalJamaicaSupply - jamaicaTotal;
      state.stats.supply.land.jamaicaC = jamaicaTotal;
      state.stats.supply.land.africa = totalAfricaSupply - africaTotal;
      state.stats.supply.land.africaC = africaTotal;
      state.stats.supply.land.afghanistan =
        totalAfghanistanSupply - afghanistanTotal;
      state.stats.supply.land.afghanistanC = afghanistanTotal;
      state.stats.supply.land.mexico = totalMexicoSupply - mexicoTotal;
      state.stats.supply.land.mexicoC = mexicoTotal;
      state.stats.supply.land.southAmerica =
        totalSouthAmericaSupply - southAmericaTotal;
      state.stats.supply.land.southAmericaC = southAmericaTotal;

      state.stats.farmerList = res[3];
      state.stats.farmers = state.stats.farmerList.length;

      state.stats.supply.totalPlots = landTotal;
      state.stats.supply.totalPlotsC = 3016 - landTotal;

      state.stats.supply.totalSeeds = seedTotal;

      state.stats.supply.totalWaterTowersC = totalWaterSupply - waterTotal;
    } catch (error) {
      console.log("function reporting error");
      console.log(error);
    }
  });
}

function landPriceConversion() {
  return new Promise((resolve, reject) => {
    axios
      .post("https://api.hive-engine.com/rpc/contracts", {
        jsonrpc: "2.0",
        id: 18,
        method: "find",
        params: {
          contract: "market",
          table: "metrics",
          query: { symbol: { $in: ["MOTA"] } },
          limit: 1000,
          offset: 0,
          indexes: [],
        },
      })
      .then((res) => {
        const { data } = res;
        for (let i = 0; i < 1; i++) {
          let thePrice = data.result[0];
          theLastPrice = thePrice.lastDayPrice;
          const hivePriceOfAsia = state.stats.prices.land.asia.price;
          const hivePriceOfAfghanistan =
            state.stats.prices.land.afghanistan.price;
          const hivePriceOfMexico = state.stats.prices.land.mexico.price;
          const hivePriceOfJamaica = state.stats.prices.land.jamaica.price;
          const hivePriceOfAfrica = state.stats.prices.land.africa.price;
          const hivePriceOfSouthAmerica =
            state.stats.prices.land.southAmerica.price;
          const conversionAsia = hivePriceOfAsia / theLastPrice;
          const conversionAfghanistan = hivePriceOfAfghanistan / theLastPrice;
          const conversionMexico = hivePriceOfMexico / theLastPrice;
          const conversionJamaica = hivePriceOfJamaica / theLastPrice;
          const conversionAfrica = hivePriceOfAfrica / theLastPrice;
          const conversionSouthAmerica = hivePriceOfSouthAmerica / theLastPrice;
          state.stats.prices.land.asia.token = conversionAsia;
          state.stats.prices.land.afghanistan.token = conversionAfghanistan;
          state.stats.prices.land.mexico.token = conversionMexico;
          state.stats.prices.land.jamaica.token = conversionJamaica;
          state.stats.prices.land.africa.token = conversionAfrica;
          state.stats.prices.land.southAmerica.token = conversionSouthAmerica;
          resolve(conversionAsia.toFixed(4));
          resolve(conversionAfghanistan.toFixed(4));
          resolve(conversionMexico.toFixed(4));
          resolve(conversionJamaica.toFixed(4));
          resolve(conversionAfrica.toFixed(4));
          resolve(conversionSouthAmerica.toFixed(4));
        }
      })
      .catch((error) => {
        reject(error);
        console.log("error happened during price conversion");
        console.error(error);
      });
  });
}

/****ISSUE****/
function startWith(hash) {
  /*if (hash) {
        console.log(`Attempting to start from IPFS save state ${hash}`);
        ipfs.cat(hash, (err, file) => {
            if (!err) {
                var data = JSON.parse(file.toString())
                startingBlock = data[0]
                if (startingBlock == ago) { 
                    startWith(sh) 
                } else {
                    state = JSON.parse(data[1]);
                    startApp();
                }
            } else {
                const mostRecent = recents.shift()
                console.log('Attempting start from:' + mostRecent)
                startWith(mostRecent)
            }
        });
    } else {*/
  console.log("most recent report doesnt exist");
  state = init;
  startApp();
  //}
}

//entire state.json output
app.get("/", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(state, null, 3));
});

app.get("/u/:user", (req, res, next) => {
  try {
    let user = req.params.user;
    res.setHeader("Content-Type", "application/json");

    res.send(JSON.stringify(state.users[user], null, 3));
  } catch (error) {}
});

//shows a log
app.get("/logs", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(state.cs, null, 3));
});

app.get("/utest/:user", async (req, res, next) => {
  try {
    let user = req.params.user;
    if (!state.users[user]) {
      state.users[user] = {
        rentals: [],
        plots: [],
        plotCount: 0,
        seedCount: 0,
        seeds: [],
        hkwater: 0,
        waterCount: 0,
        waterPlants: {
          lvl1: 0,
          lvl2: 0,
          lvl3: 0,
          lvl4: 0,
          lvl5: 0,
          lvl7: 0,
          lvl8: 0,
          lvl9: 0,
          lvl10: 0,
        },
        waterTowers: {
          lvl1: [],
          lvl2: [],
          lvl3: [],
          lvl4: [],
          lvl5: [],
          lvl6: [],
          lvl7: [],
          lvl8: [],
          lvl9: [],
          lvl10: [],
        },
        timeBoosters: {
          lvl1: 0,
          lvl2: 0,
          lvl3: 0,
          lvl4: 0,
          lvl5: 0,
          lvl7: 0,
          lvl8: 0,
          lvl9: 0,
          lvl10: 0,
        },
        buds: 0,
        dailyBudDeposit: 0,
        tokens: {
          buds: {
            balance: 0,
            stake: 0,
          },
          mota: {
            balance: 0,
            stake: 0,
          },
          hkwater: {
            balance: 0,
            stake: 0,
          },
        },
        claimed: {
          water: false,
          avatar: false,
          bud: false,
        },
        xp: 45,
        lvl: 1,
        role: 1,
        joints: [],
        mota: 0,
        motaStake: 0,
        boosters: [],
      };
    }
    res.setHeader("Content-Type", "application/json");
    let {
      plots,
      seeds,
      tokens,
      waterTowers,
      waterPlants,
    } = await contract.getUserNft(ssc, axios, user);
    state.users[user].seeds = seeds;
    state.users[user].plots = plots;
    state.users[user].tokens = tokens;
    state.users[user].waterTowers = waterTowers;
    state.users[user].waterPlants = waterPlants;

    res.send(JSON.stringify(state.users[user], null, 3));
  } catch (error) {
    console.log("Couldn't find user", error);
    if (!state.users[user]) {
      state.users[user] = {
        rentals: [],
        plots: [],
        plotCount: 0,
        seedCount: 0,
        seeds: [],
        hkwater: 0,
        waterCount: 0,
        waterPlants: {
          lvl1: 0,
          lvl2: 0,
          lvl3: 0,
          lvl4: 0,
          lvl5: 0,
          lvl7: 0,
          lvl8: 0,
          lvl9: 0,
          lvl10: 0,
        },
        waterTowers: {
          lvl1: [],
          lvl2: [],
          lvl3: [],
          lvl4: [],
          lvl5: [],
          lvl6: [],
          lvl7: [],
          lvl8: [],
          lvl9: [],
          lvl10: [],
        },
        timeBoosters: {
          lvl1: 0,
          lvl2: 0,
          lvl3: 0,
          lvl4: 0,
          lvl5: 0,
          lvl7: 0,
          lvl8: 0,
          lvl9: 0,
          lvl10: 0,
        },
        buds: 0,
        dailyBudDeposit: 0,
        tokens: {
          buds: {
            balance: 0,
            stake: 0,
          },
          mota: {
            balance: 0,
            stake: 0,
          },
          hkwater: {
            balance: 0,
            stake: 0,
          },
        },
        claimed: {
          water: false,
          avatar: false,
          bud: false,
        },
        xp: 45,
        lvl: 1,
        role: 1,
        joints: [],
        mota: 0,
        motaStake: 0,
        boosters: [],
      };
    }
  }
});

app.get("/prices", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(state.stats.prices, null, 3));
});

/*
function startWith(hash) {
    console.log(`${hash} inserted`)
    if (hash) {
        console.log(`Attempting to start from IPFS save state ${hash}`);
        ipfs.cat(hash, (err, file) => {
            if (!err) {
                var data = JSON.parse(file);
                startingBlock = data[0]
                if (!startingBlock) {
                    startWith(sh)
                }
            } else {
                startWith(config.engineCrank)
                console.log(`${sh} failed to load, Replaying from genesis.\nYou may want to set the env var STARTHASH\nFind it at any token API such as token.dlux.io`)
            }
        });
    } else {
        startApp()
    }
}*/

function startApp() {
  if (state.cs == null) {
    state.cs = {};
  }
  processor = steemState(client, dhive, startingBlock, 10, prefix);

  processor.onBlock(function (num, block) {
    /*var td = []
        for (var i = 0; i < td.length; i++) {
            daily(td[i])
        }*/

    //processes payments from state.refund
    try {
      if (
        (num % 5 === 0 && state.refund.length && processor.isStreaming()) ||
        (processor.isStreaming() && state.refund.length > 60)
      ) {
        if (state.refund[0].length == 4) {
          bot[state.refund[0][0]].call(
            this,
            state.refund[0][1],
            state.refund[0][2],
            state.refund[0][3]
          );
        } else if (state.refund[0].length == 3) {
          bot[state.refund[0][0]].call(
            this,
            state.refund[0][1],
            state.refund[0][2]
          );
        } else if (state.refund[0].length == 2) {
          bot[state.refund[0][0]].call(this, state.refund[0][1]);
        }
        if (state.bal.r < 0) {
          state.bal.r = 0;
        }
      }
    } catch (error) {
      console.log("error when processing refunds | line 581");
    }

    //used to catch up on replay
    if (num % 5 === 0 && !processor.isStreaming()) {
      client.database.getDynamicGlobalProperties().then(function (result) {
        console.log(
          "At block",
          num,
          "with",
          result.head_block_number - num,
          "left until real-time."
        );
      });
    }

    //sets asset prices
    try {
      if (num % 5 === 0 && processor.isStreaming()) {
        hivePriceConversion(1).then((price) => {
          let assetPrice = price;

          state.stats.prices.land.asia.price = Math.ceil(assetPrice * 45);
          state.stats.prices.land.africa.price = Math.ceil(assetPrice * 22.5);
          state.stats.prices.land.afghanistan.price = Math.ceil(
            assetPrice * 15
          );
          state.stats.prices.land.southAmerica.price = Math.ceil(
            assetPrice * 7.5
          );
          state.stats.prices.land.jamaica.price = Math.ceil(assetPrice * 30);
          state.stats.prices.land.mexico.price = Math.ceil(assetPrice * 11.25);
          //sets cut to 0 because bal.c is deprecated
          state.bal.c = 0;
        });
        landPriceConversion();
        hivePriceConversion(1).then((prices) => {
          let bundlePrice = prices;

          state.stats.prices.bundles.asiaBundle = Math.ceil(
            bundlePrice * 29.99
          );
          state.stats.prices.bundles.africaBundle = Math.ceil(
            bundlePrice * 14.99
          );
          state.stats.prices.bundles.afghanistanBundle = Math.ceil(
            bundlePrice * 9.99
          );
          state.stats.prices.bundles.southAmericaBundle = Math.ceil(
            bundlePrice * 4.99
          );
          state.stats.prices.bundles.jamaicaBundle = Math.ceil(
            bundlePrice * 19.99
          );
          state.stats.prices.bundles.mexicoBundle = Math.ceil(
            bundlePrice * 7.49
          );
        });

        hivePriceConversion(1).then((prices) => {
          let bundlePrice = prices;

          state.stats.prices.waterPlants.lvl1.price = bundlePrice;
          state.stats.prices.waterPlants.lvl2.price = bundlePrice;
          state.stats.prices.waterPlants.lvl3.price = bundlePrice;
          state.stats.prices.waterPlants.lvl4.price = bundlePrice;
          state.stats.prices.waterPlants.lvl5.price = bundlePrice;
          state.stats.prices.waterPlants.lvl6.price = bundlePrice;
          state.stats.prices.waterPlants.lvl7.price = bundlePrice;
          state.stats.prices.waterPlants.lvl8.price = bundlePrice;
          state.stats.prices.waterPlants.lvl9.price = bundlePrice;
          state.stats.prices.waterPlants.lvl10.price = bundlePrice;
        });
      }
    } catch (error) {
      console.log("error when converting prices | line 637");
    }

    // makes sure database is up to date every 6 blocks
    try {
      if (num % 6 === 0 && processor.isStreaming()) {
        userList();
      }
    } catch (error) {
      console.log("error when calling userList | line 646");
    }

    // makes sure database is up to date every 2 blocks
    if (num % 2 === 0 && processor.isStreaming()) {
      reporting();
    }

    // performs the leveling check
    if (num % 11 === 0 && processor.isStreaming()) {
      leveling();
    }

    // show the block number in the console every block
    if (num % 1 === 0 && processor.isStreaming()) {
      console.log(num);
    }

    //saves state to ipfs hash every 5 minutes
    try {
      if (num % 100 === 1) {
        if (!sending) {
          checkPendings();
        } else {
          console.log("me encuentro enviando ahora");
        }
        store.get([], function (err, data) {
          const blockState = Buffer.from(JSON.stringify([num, data]));
          ipfsSaveState(num, blockState);
        });
      }
    } catch (error) {
      console.log("error when running ipfsSaveState | line 678");
    }
  });

  var sending = false;

  checkPendings = async () => {
    console.log("checking... ");
    sending = true;
    await getAllTransaction()
      .then(async (resxp) => {

        for (let index = 0; index < resxp.length; index++) {

          let resx = resxp[index];
          await ssc
            .getTransactionInfo(resx.transaction_id)
            .then(async (res) => {
              let errors = null;

              if (res) {
                try {
                  errors = JSON.parse("" + res.logs).errors;
                } catch (e) {
                  errors = false;
                }

                if (errors) {
                  console.error("no se pudo procesar la transaccion", errors);
                  await updateTransaction(resx.transaction_id)
                    .then((red) => {
                      console.log("actualizando transaccion erronea");
                    })
                    .catch((e) => {
                      console.log("ocurrio un error", e);
                    });
                } else {

                  console.log("init updateTransaction")
                  await updateTransaction(resx.transaction_id)
                    .then(async (red) => {

                      switch (resx.type) {
                        case "tohk-vault":
                          console.log("processing tohk-vault pending");
                          
                          await tohkvault(
                            JSON.parse(resx.json),
                            resx.from,
                            state
                          );
                    
                          break;

                        case "nfttohk-vault":
                          console.log("processing  nft tohk-vault pending");
                          
                          await nfttohkvaul(
                            JSON.parse(resx.json),
                            resx.from,
                            state
                          );
                          
                          break;

                        
                      }
                    })
                    .catch((e) => {
                      console.log("ocurrio un error", e);
                    });

                    console.log("finish updateTransaction")

                }
              } else {
                console.log(
                  "no se pudo procesar otra vez esta transaccion",
                  res,
                  resx
                );
              }
            });
        }
        sending = false;
      })
      .catch((e) => {
        sending = false;
        console.log("ERROR ON GET ALL TRANSACTION", e);
      });
  };

  processor.on("tohk-vault", async function (json, from) {
    /*----------------------Fungible Tokens----------------------*/
    ssc.getTransactionInfo(json.transaction_id).then(async (res) => {
      let errors = null;

      if (res) {
        try {
          errors = JSON.parse("" + res.logs).errors;
        } catch (e) {
          errors = false;
        }

        if (errors) {
          await saveLog(
            "tohk-vault",
            json,
            from,
            "hive-engine error transac " + json.transaction_id
          );
        } else {
          //Water Plot
          //user sends HKWater to hk-vault with memo seedID

          if (json.hasOwnProperty("contractName")) {
            if (json.contractName == "nft") {
              await nfttohkvaul(json, from, state);
            } else if (json.contractName == "tokens") {
              await tohkvault(json, from, state);
            }
          }
        }
      } else {
        // if DONT RECIBE ANY TRANSAC

        if (json.hasOwnProperty("contractName")) {
          if (json.contractName == "nft") {
            await setTransaction(
              json.transaction_id,
              "nfttohk-vault",
              json,
              from,
              "error hive-engine dont have process this block "
            );
          }
          else if (json.contractName == "tokens") {
            await setTransaction(
              json.transaction_id,
              "tohk-vault",
              json,
              from,
              "error hive-engine dont have process this block "
            );
          }
        }
      }
    });
  });

  /*--------------------------------Claim Goodies---------------------------*/

  /*// checks for qwoyn_plant and plants the seed
    processor.on('claim_water', function(json, from) {

        if(state.users[from] && state.users[from].claimed.water === false && state.users[from].hkwater > 0){
            //check how much water they get
            let totalWaterCount = state.users[from].hkwater
            //send water
            let waterString = ""+totalWaterCount
            contract.generateToken(hivejs, "HKWATER", waterString, from)
            //set claimed.water to true
            state.users[from].claimed.water = true
        }                
    });

    // checks for qwoyn_plant and plants the seed
    processor.on('claim_avatar', function(json, from) {

        if(state.users[from] && state.users[from].claimed.avatar === false && state.users[from].hkwater > 0){
            //send avatar 1 and 2
            contract.createAvatar(hivejs, "Magical Male", from)
            contract.createAvatar(hivejs, "Magical Female", from)
            //set claimed avatar to true
            state.users[from].claimed.avatar = true
        }                
    });

    // checks for qwoyn_plant and plants the seed
    processor.on('claim_bud', function(json, from) {

        if(state.users[from] && state.users[from].claimed.bud === false && state.users[from].hkwater > 0){
            //send bud
            contract.generateToken(hivejs, "BUDS", "1", from)
            //set claimed avatar to true
            state.users[from].claimed.bud = true
        }                
    });*/

  /*------------------------------- Farm Actions ---------------------------*/

  // checks for qwoyn_plant and plants the seed
  processor.on("plant_plot", async function (json, from) {
    console.log("planting plot", from);
    await plant_plot(json, from, state);
  });

  //called when qwoyn_subdivide_plot is detected
  processor.on("subdivide_plot", async function (json, from) {
    console.log("subdivide_plot", from);
    await subdivide_plot(json, from, state);
  });

  // checks for qwoyn_plant_rental and plants the seed on a rental
  processor.on("plant_rental", function (json, from) {
    let seedID = json.seedID;
    let rentalID = json.rentalID;

    let seedIDString = "" + seedID;

    try {
      var plotStatus = jp.query(
        state.users[from],
        `$.rentals[?(@.id==${rentalID})].properties.OCCUPIED`
      );
      var seedStatus = jp.query(
        state.users[from],
        `$.seeds[?(@.id==${seedID})].properties.PLANTED`
      );
    } catch (error) {
      console.log(
        "an error when planting a seed occured " + from + " sent the request"
      );
      console.log(error);
    }

    if (state.users[from].rentals[rentalID]) {
      //make seed used and designate plot
      contract.updateNft(hivejs, seedIDString, {
        PLANTED: true,
        PLOTID: plotID,
      });

      //make plot occupied and designate seed
      state.users[from].rentals[rentalID].OCCUPIED = true;
      state.users[from].rentals[rentalID].SEEDID = seedID;

      state.stats.seedsUsedLastDay += 1;
    }
  });

  // change avatar
  processor.on("change_avatar", function (json, from) {
    let avatar = json.avatar;

    if (state.users[from] && avatar === 1) {
      state.users[from].claimed.role = 1;
    } else if (state.users[from] && avatar === 2) {
      state.users[from].claimed.role = 2;
    } else if (state.users[from] && avatar === 3) {
      state.users[from].claimed.role = 3;
    } else if (state.users[from] && avatar === 4) {
      state.users[from].claimed.role = 4;
    } else if (state.users[from] && avatar === 5) {
      state.users[from].claimed.role = 5;
    }
  });

  processor.on("change_buds", function (json, from) {
    let changeme = json.change;
    var userList = state.stats.farmerList;

    //set dailyBudDeposit to 0
    if (from === username) {
      for (var i = 0; i < userList.length; i++) {
        let user = userList[i];
        state.users[user].dailyBudDeposit = 0;
      }

      state.stats.seedsUsedLastDay = 0;
    }
  });

  // use a claimed booster
  /*processor.on('use_booster', function(json, from) {
        let plotID = json.type
        let level = json.lvl

        var sptStatus = jp.query(state.users[from], `$.seeds[?(@.id==${seedID})].properties.SPT`);

        let plotIDString = "" + plotID
        //reduce spt with booster based on lvl and remove booster
        if(state.users[from].timeBoosters.lvl1 > 0 && level === 1) {

            let newSPT = sptStatus * 0.95

            contract.updateNft(hivejs, plotIDString, { "SPT":  newSPT })
            state.users[from].timeBoosters.lvl1 -= 1

        } else if(state.users[from].timeBoosters.lvl2 > 0 && level === 2) {

            let newSPT = sptStatus * 0.90

            contract.updateNft(hivejs, plotIDString, { "SPT":  newSPT })
            state.users[from].timeBoosters.lvl2 -= 1

        } else if(state.users[from].timeBoosters.lvl3 > 0 && level === 3) {

            let newSPT = sptStatus * 0.85

            contract.updateNft(hivejs, plotIDString, { "SPT":  newSPT })
            state.users[from].timeBoosters.lvl3 -= 1

        } else if(state.users[from].timeBoosters.lvl4 > 0 && level === 4) {

            let newSPT = sptStatus * 0.80

            contract.updateNft(hivejs, plotIDString, { "SPT":  newSPT })
            state.users[from].timeBoosters.lvl4 -= 1

        } else if(state.users[from].timeBoosters.lvl5 > 0 && level === 5) {

            let newSPT = sptStatus * 0.75

            contract.updateNft(hivejs, plotIDString, { "SPT":  newSPT })
            state.users[from].timeBoosters.lvl5 -= 1

        } else if(state.users[from].timeBoosters.lvl6 > 0 && level === 6) {

            let newSPT = sptStatus * 0.70

            contract.updateNft(hivejs, plotIDString, { "SPT":  newSPT })
            state.users[from].timeBoosters.lvl6 -= 1
        }
        
    });*/

  /*-------------------------- RENTALS  ---------------------------*/

  // search for qwoyn_pinner from user on blockchain since genesis <----- transfer
  processor.on("rent_subdivision", function (json, from) {
    let plotID = json.type;
    let price = json.price;
    let owner = json.owner;

    //change rented to true
    //change renter to from
    //change duration to 6 months
    // add the plot info to from with r at end of plotID
    // add owner of the plot

    // send percentage to owner
  });

  // list plot for rent
  processor.on("list_subdivision", function (json, from) {
    let plotID = json.type;
    let price = json.price;

    //change listed to true
    //add price
  });

  processor.on("report", function (json, from) {
    try {
      for (var i = 0; i < state.refund.length; i++) {
        if (state.refund[i][2].block == json.block) state.refund.splice(i, 1);
      }
    } catch (e) {
      console.log("Reports not being made", e.message);
    }
  });

  processor.onOperation("transfer", async function (json, from) {
    if (json.to === username && json.amount.split(" ")[1] === "HIVE") {
      //if user does not exist in db create user and db entry
      if (!state.users[json.from]) {
        state.users[username] = {
          rentals: [],
          plots: [],
          plotCount: 0,
          seedCount: 0,
          seeds: [],
          hkwater: 0,
          waterCount: 0,
          waterPlants: {
            lvl1: 0,
            lvl2: 0,
            lvl3: 0,
            lvl4: 0,
            lvl5: 0,
            lvl7: 0,
            lvl8: 0,
            lvl9: 0,
            lvl10: 0,
          },
          waterTowers: {
            lvl1: [],
            lvl2: [],
            lvl3: [],
            lvl4: [],
            lvl5: [],
            lvl6: [],
            lvl7: [],
            lvl8: [],
            lvl9: [],
            lvl10: [],
          },
          timeBoosters: {
            lvl1: 0,
            lvl2: 0,
            lvl3: 0,
            lvl4: 0,
            lvl5: 0,
            lvl7: 0,
            lvl8: 0,
            lvl9: 0,
            lvl10: 0,
          },
          buds: 0,
          dailyBudDeposit: 0,
          tokens: {
            buds: {
              balance: 0,
              stake: 0,
            },
            mota: {
              balance: 0,
              stake: 0,
            },
            hkwater: {
              balance: 0,
              stake: 0,
            },
          },
          claimed: {
            water: false,
            avatar: false,
            bud: false,
          },
          xp: 45,
          lvl: 1,
          role: 1,
          joints: [],
          mota: 0,
          motaStake: 0,
          boosters: [],
        };
      }

      //purchasing
      const amount = parseInt(parseFloat(json.amount) * 1000);
      var want =
          json.memo.split(" ")[0].toLowerCase() || json.memo.toLowerCase(),
        type = json.memo.split(" ")[1] || "";

      if (
        want === "water1" &&
        amount > state.stats.prices.waterPlants.lvl1.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlants.lvl1.price * 1000 + 300
      ) {
        // create nft
        await contract.createWaterTower(hivejs, "Water", json.from, 30);
        const c = parseInt(amount);
        state.bal.c += c;
      }

      if (
        want === "water2" &&
        amount > state.stats.prices.waterPlant.lvl2.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl2.price * 1000 + 300 &&
        state.users[json.from].lvl >= 10
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 2, WATER: 96 });

        const c = parseInt(amount);
        state.bal.c += c;
      } else if (
        want === "water3" &&
        amount > state.stats.prices.waterPlant.lvl3.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl3.price * 1000 + 300 &&
        state.users[json.from].lvl >= 20
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 3, WATER: 166 });
        const c = parseInt(amount);
        state.bal.c += c;
      } else if (
        want === "water4" &&
        amount > state.stats.prices.waterPlant.lvl4.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl4.price * 1000 + 300 &&
        state.users[json.from].lvl >= 30
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 4, WATER: 234 });

        const c = parseInt(amount);
        state.bal.c += c;
        state.cs[
          `${json.block_num}:${json.from}`
        ] = `${json.from} purchased ${json.want}`;
      } else if (
        want === "water5" &&
        amount > state.stats.prices.waterPlant.lvl5.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl5.price * 1000 + 300 &&
        state.users[json.from].lvl >= 40
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 5, WATER: 302 });

        const c = parseInt(amount);
        state.bal.c += c;
      } else if (
        want === "water6" &&
        amount > state.stats.prices.waterPlant.lvl6.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl6.price * 1000 + 300 &&
        state.users[json.from].lvl >= 50
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 6, WATER: 370 });

        const c = parseInt(amount);
        state.bal.c += c;
      } else if (
        want === "water7" &&
        amount > state.stats.prices.waterPlant.lvl7.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl7.price * 1000 + 300 &&
        state.users[json.from].lvl >= 60
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 7, WATER: 438 });

        const c = parseInt(amount);
        state.bal.c += c;
      } else if (
        want === "water8" &&
        amount > state.stats.prices.waterPlant.lvl8.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl8.price * 1000 + 300 &&
        state.users[json.from].lvl >= 70
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 8, WATER: 506 });

        const c = parseInt(amount);
        state.bal.c += c;
      } else if (
        want === "water9" &&
        amount > state.stats.prices.waterPlant.lvl9.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl9.price * 1000 + 300 &&
        state.users[json.from].lvl >= 80
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 9, WATER: 574 });

        const c = parseInt(amount);
        state.bal.c += c;
      } else if (
        want === "water10" &&
        amount > state.stats.prices.waterPlant.lvl10.price * 1000 - 300 &&
        amount < state.stats.prices.waterPlant.lvl10.price * 1000 + 300 &&
        state.users[json.from].lvl >= 90
      ) {

        // create nft
        await contract.updateNft(hivejs, type, { LVL: 10, WATER: 642 });

        const c = parseInt(amount);
        state.bal.c += c;
      }
    } else if (json.from === username) {
      const amount = parseInt(parseFloat(json.amount) * 1000);
      for (var i = 0; i < state.refund.length; i++) {
        if (state.refund[i][1] == json.to && state.refund[i][2] == amount) {
          state.refund.splice(i, 1);
          state.bal.r -= amount;
          state.cs[
            `${json.block_num}:${json.to}`
          ] = `${json.to} refunded successfully`;
          break;
        }
      }
    }
  });

  processor.onStreamingStart(function () {
    console.log("At real time.");
  });

  processor.start();

  function exit() {
    console.log("Exiting...");
    processor.stop(function () {
      saveState(function () {
        process.exit();
        //console.log('Process exited.');
      });
    });
  }
}

function ipfsSaveState(blocknum, hashable) {
  ipfs.add(hashable, (err, IpFsHash) => {
    try {
      if (!err) {
        var hash = "";
        try {
          hash = IpFsHash[0].hash;
          state.stats.bu = hash;
          state.stats.bi = blocknum;
        } catch (e) {
          console.log("hash didnt get set");
        }
        state.refund.push([
          "customJson",
          "report",
          {
            hash: state.stats.bu, // fuck this up to update state.js manually
            block: blocknum,
          },
        ]);
        console.log(blocknum + ` :Saved:  ${hash}`);
      } else {
        console.log(
          {
            cycle,
          },
          "IPFS Error",
          err
        );
        cycleipfs(cycle++);
        if (cycle >= 25) {
          cycle = 0;
          return;
        }
      }
    } catch (error) {
      console.log("there was an ipfs error");
    }
  });
}

var bot = {
  xfer: function (toa, amount, memo) {
    const float = parseFloat(amount / 1000).toFixed(3);
    const data = {
      amount: `${float} HIVE`,
      from: username,
      to: toa,
      memo: memo,
    };
    console.log(data, key);
    client.broadcast.transfer(data, key).then(
      function (result) {
        console.log(result);
      },
      function (error) {
        console.log(error);
      }
    );
  },
  customJson: function (id, json, callback) {
    if (json.block > processor.getCurrentBlockNumber() - 1000) {
      client.broadcast
        .json(
          {
            required_auths: [],
            required_posting_auths: [username],
            id: prefix + id,
            json: JSON.stringify(json),
          },
          key
        )
        .then(
          (result) => {
            console.log("Signed ${json}");
          },
          (error) => {
            console.log("Error sending customJson");
          }
        );
    } else {
      state.refund.splice(0, 1);
    }
  },
  sign: function (op, callback) {
    console.log("attempting" + op[0]);
    client.broadcast.sendOperations(op, key).then(
      function (result) {
        console.log(result);
      },
      function (error) {
        console.log(error);
        state.refund.pop();
      }
    );
  },
  ssign: function (op, callback) {
    console.log("attempting" + op[0]);
    client.broadcast.sendOperations(op, skey).then(
      function (result) {
        console.log(result);
      },
      function (error) {
        console.log(error);
        state.refund.pop();
      }
    );
  },
  power: function (toa, amount, callback) {
    const op = [
      "transfer_to_vesting",
      {
        from: username,
        to: toa,
        amount: `${parseFloat(amount / 1000).toFixed(3)} HIVE`,
      },
    ];
    client.broadcast.sendOperations([op], key).then(
      function (result) {
        console.log(result);
      },
      function (error) {
        console.log(error);
      }
    );
  },
  sendOp: function (op) {
    client.broadcast.sendOperations(op, key).then(
      function (result) {
        console.log(result);
      },
      function (error) {
        console.log(error);
      }
    );
  },
};

mongoose.Promise = global.Promise;
// Usamos el método connect para conectarnos a nuestra base de datos
mongoose
  .connect(
    "mongodb+srv://hashkings:JtZa8bb0Yi3jnfNZ@cluster0.trqu4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    // Cuando se realiza la conexión, lanzamos este mensaje por consola
    console.info(
      "La conexión a la base  de datos se ha realizado correctamente"
    );
    //state = init;
    //userList();
    //leveling();
    //reporting();
    //landPriceConversion();
    dynStart("hashkings");
  })
  // Si no se conecta correctamente escupimos el error
  .catch((err) => console.error(err));
