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
  getIsPending,
  updateBlock,
  getLastBlock,
  getAllPendings,
  setactiveAvatar,
  getactiveAvatar,
  removePendingRefund,
  addPendingRefund,
  getAllRefunds,
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

httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80");
});

const httpsServer = https.createServer(credentials, app);
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
var startingBlock = ENV.STARTINGBLOCK || 54158471; //GENESIS BLOCK
const username = ENV.ACCOUNT || "hashkings"; //account with all the SP
const key = dhive.PrivateKey.from(ENV.skey); //active key for account
let ago = ENV.ago || 54158471;
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
const ssc = new SSC("https://rpc.hashkings.xyz");

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
      .get(
        "https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd&include_24hr_change=true"
      )
      .then((res) => {
        const hiveCost = amount / res.data.hive.usd;
        const hiveAmount = hiveCost;

        resolve(hiveAmount.toFixed(3));
      })
      .catch(async (err) => {
        console.log("error al leer precio de coingekko", err);
        resolve(await hivePriceConversion(1));
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
            activeAvatar: {},
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

function leveling(user) {
  try {
    let xp = state.users[user].xp;
    if (xp >= 45 && xp <= 93) {
      state.users[user].lvl = 1;
    } else if (xp >= 94 && xp <= 146) {
      state.users[user].lvl = 2;
    } else if (xp >= 147 && xp <= 202) {
      state.users[user].lvl = 3;
    } else if (xp >= 203 && xp <= 263) {
      state.users[user].lvl = 4;
    } else if (xp >= 264 && xp <= 401) {
      state.users[user].lvl = 5;
    } else if (xp >= 402 && xp <= 478) {
      state.users[user].lvl = 6;
    } else if (xp >= 479 && xp <= 561) {
      state.users[user].lvl = 7;
    } else if (xp >= 562 && xp <= 651) {
      state.users[user].lvl = 8;
    } else if (xp >= 652 && xp <= 749) {
      state.users[user].lvl = 9;
    } else if (xp >= 750 && xp <= 853) {
      state.users[user].lvl = 10;
    } else if (xp >= 854 && xp <= 967) {
      state.users[user].lvl = 11;
    } else if (xp >= 968 && xp <= 1089) {
      state.users[user].lvl = 12;
    } else if (xp >= 1090 && xp <= 1221) {
      state.users[user].lvl = 13;
    } else if (xp >= 1222 && xp <= 1364) {
      state.users[user].lvl = 14;
    } else if (xp >= 1365 && xp <= 1518) {
      state.users[user].lvl = 15;
    } else if (xp >= 1519 && xp <= 1658) {
      state.users[user].lvl = 16;
    } else if (xp >= 1659 && xp <= 1865) {
      state.users[user].lvl = 17;
    } else if (xp >= 1866 && xp <= 2059) {
      state.users[user].lvl = 18;
    } else if (xp >= 2060 && xp <= 2269) {
      state.users[user].lvl = 19;
    } else if (xp >= 2270 && xp <= 2495) {
      state.users[user].lvl = 20;
    } else if (xp >= 2496 && xp <= 2740) {
      state.users[user].lvl = 21;
    } else if (xp >= 2741 && xp <= 3004) {
      state.users[user].lvl = 22;
    } else if (xp >= 3005 && xp <= 3289) {
      state.users[user].lvl = 23;
    } else if (xp >= 3290 && xp <= 3597) {
      state.users[user].lvl = 24;
    } else if (xp >= 3598 && xp <= 3930) {
      state.users[user].lvl = 25;
    } else if (xp >= 3931 && xp <= 4290) {
      state.users[user].lvl = 26;
    } else if (xp >= 4291 && xp <= 4678) {
      state.users[user].lvl = 27;
    } else if (xp >= 4679 && xp <= 5097) {
      state.users[user].lvl = 28;
    } else if (xp >= 5098 && xp <= 5550) {
      state.users[user].lvl = 29;
    } else if (xp >= 5551 && xp <= 6039) {
      state.users[user].lvl = 30;
    } else if (xp >= 6040 && xp <= 6567) {
      state.users[user].lvl = 31;
    } else if (xp >= 6568 && xp <= 7138) {
      state.users[user].lvl = 32;
    } else if (xp >= 7139 && xp <= 7754) {
      state.users[user].lvl = 33;
    } else if (xp >= 7755 && xp <= 8419) {
      state.users[user].lvl = 34;
    } else if (xp >= 8420 && xp <= 9138) {
      state.users[user].lvl = 35;
    } else if (xp >= 9139 && xp <= 9914) {
      state.users[user].lvl = 36;
    } else if (xp >= 9915 && xp <= 10752) {
      state.users[user].lvl = 37;
    } else if (xp >= 10753 && xp <= 11657) {
      state.users[user].lvl = 38;
    } else if (xp >= 11658 && xp <= 12635) {
      state.users[user].lvl = 39;
    } else if (xp >= 12636 && xp <= 13690) {
      state.users[user].lvl = 40;
    } else if (xp >= 13691 && xp <= 14831) {
      state.users[user].lvl = 41;
    } else if (xp >= 14832 && xp <= 16062) {
      state.users[user].lvl = 42;
    } else if (xp >= 16063 && xp <= 17392) {
      state.users[user].lvl = 43;
    } else if (xp >= 17393 && xp <= 18829) {
      state.users[user].lvl = 44;
    } else if (xp >= 18830 && xp <= 20380) {
      state.users[user].lvl = 45;
    } else if (xp >= 20381 && xp <= 22055) {
      state.users[user].lvl = 46;
    } else if (xp >= 22056 && xp <= 23865) {
      state.users[user].lvl = 47;
    } else if (xp >= 23866 && xp <= 25819) {
      state.users[user].lvl = 48;
    } else if (xp >= 25820 && xp <= 27930) {
      state.users[user].lvl = 49;
    } else if (xp >= 27931 && xp <= 30209) {
      state.users[user].lvl = 50;
    } else if (xp >= 30210 && xp <= 32671) {
      state.users[user].lvl = 51;
    } else if (xp >= 32672 && xp <= 35330) {
      state.users[user].lvl = 52;
    } else if (xp >= 35331 && xp <= 38201) {
      state.users[user].lvl = 53;
    } else if (xp >= 38202 && xp <= 41302) {
      state.users[user].lvl = 54;
    } else if (xp >= 41303 && xp <= 44651) {
      state.users[user].lvl = 55;
    } else if (xp >= 44652 && xp <= 48269) {
      state.users[user].lvl = 56;
    } else if (xp >= 48270 && xp <= 52175) {
      state.users[user].lvl = 57;
    } else if (xp >= 52176 && xp <= 56394) {
      state.users[user].lvl = 58;
    } else if (xp >= 56395 && xp <= 60951) {
      state.users[user].lvl = 59;
    } else if (xp >= 60952 && xp <= 65872) {
      state.users[user].lvl = 60;
    } else if (xp >= 65873 && xp <= 71187) {
      state.users[user].lvl = 61;
    } else if (xp >= 71188 && xp <= 76927) {
      state.users[user].lvl = 62;
    } else if (xp >= 76928 && xp <= 83126) {
      state.users[user].lvl = 63;
    } else if (xp >= 83127 && xp <= 89821) {
      state.users[user].lvl = 64;
    } else if (xp >= 89822 && xp <= 97051) {
      state.users[user].lvl = 65;
    } else if (xp >= 97052 && xp <= 104861) {
      state.users[user].lvl = 66;
    } else if (xp >= 104862 && xp <= 113295) {
      state.users[user].lvl = 67;
    } else if (xp >= 113296 && xp <= 122403) {
      state.users[user].lvl = 68;
    } else if (xp >= 122404 && xp <= 132240) {
      state.users[user].lvl = 69;
    } else if (xp >= 132241 && xp <= 142865) {
      state.users[user].lvl = 70;
    } else if (xp >= 142866 && xp <= 154339) {
      state.users[user].lvl = 71;
    } else if (xp >= 154340 && xp <= 166731) {
      state.users[user].lvl = 72;
    } else if (xp >= 166732 && xp <= 180115) {
      state.users[user].lvl = 73;
    } else if (xp >= 180116 && xp <= 194569) {
      state.users[user].lvl = 74;
    } else if (xp >= 194570 && xp <= 210179) {
      state.users[user].lvl = 75;
    } else if (xp >= 210180 && xp <= 227039) {
      state.users[user].lvl = 76;
    } else if (xp >= 227040 && xp <= 264912) {
      state.users[user].lvl = 77;
    } else if (xp >= 264913 && xp <= 286150) {
      state.users[user].lvl = 78;
    } else if (xp >= 286151 && xp <= 309087) {
      state.users[user].lvl = 79;
    } else if (xp >= 309088 && xp <= 333859) {
      state.users[user].lvl = 80;
    } else if (xp >= 333860 && xp <= 360612) {
      state.users[user].lvl = 81;
    } else if (xp >= 360613 && xp <= 389506) {
      state.users[user].lvl = 82;
    } else if (xp >= 389507 && xp <= 420712) {
      state.users[user].lvl = 83;
    } else if (xp >= 420713 && xp <= 454414) {
      state.users[user].lvl = 84;
    } else if (xp >= 454415 && xp <= 490812) {
      state.users[user].lvl = 85;
    } else if (xp >= 490813 && xp <= 530122) {
      state.users[user].lvl = 86;
    } else if (xp >= 530123 && xp <= 572577) {
      state.users[user].lvl = 87;
    } else if (xp >= 572578 && xp <= 618428) {
      state.users[user].lvl = 88;
    } else if (xp >= 618429 && xp <= 667947) {
      state.users[user].lvl = 89;
    } else if (xp >= 667948 && xp <= 721428) {
      state.users[user].lvl = 90;
    } else if (xp >= 721429 && xp <= 779187) {
      state.users[user].lvl = 91;
    }
    //need to figure out a better way
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
      .post("https://rpc.hashkings.xyz/contracts", {
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
  let status = Object.assign({}, state);
  status.users = [];
  res.send(JSON.stringify(status, null, 3));
});

app.get("/u/:user", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  try {
    let user = req.params.user;
    res.send(JSON.stringify(state.users[user], null, 3));
  } catch (error) {
    res.send(JSON.stringify({}, null, 3));
  }
});

app.get("/utest/:user", async (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  let user = req.params.user;
  try {
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
        activeAvatar: {},
      };
    }

    let { plots, seeds, tokens, waterTowers, waterPlants, avatars, joints } =
      await contract.getUserNft(ssc, axios, user);

    state.users[user].seeds = seeds;
    state.users[user].plots = plots;
    state.users[user].tokens = tokens;
    state.users[user].waterTowers = waterTowers;
    state.users[user].waterPlants = waterPlants;
    state.users[user].avatars = avatars;
    state.users[user].joints = joints;

    let actualActiveAvatar = await getactiveAvatar(user);

    if (!actualActiveAvatar) {
      if (avatars.length > 0) {
        let ava = await contract.getNFT(axios, avatars[0].id);
        ava.id = ava._id;
        ava.properties = ava.properties;
        ava.owner = user;
        state.users[user].activeAvatar = ava;
        state.users[user].xp = state.users[user].activeAvatar.properties.XP;
        await setactiveAvatar(user, ava.id);
      } else {
        state.users[user].activeAvatar = {};
      }
    } else {
      let ava = await contract.getNFT(axios, parseInt(actualActiveAvatar, 10));
      if (ava) {
        ava.id = ava._id;
        ava.properties = ava.properties;
        ava.owner = user;
        state.users[user].activeAvatar = ava;
        state.users[user].xp = state.users[user].activeAvatar.properties.XP;
      } else {
        if (avatars.length > 0) {
          let ava = await contract.getNFT(axios, avatars[0].id);
          ava.id = ava._id;
          ava.properties = ava.properties;
          ava.owner = user;
          state.users[user].activeAvatar = ava;
          state.users[user].xp = state.users[user].activeAvatar.properties.XP;
          await setactiveAvatar(user, ava.id);
        } else {
          state.users[user].activeAvatar = {};
        }
      }
    }

    await leveling(user);
    res.send(JSON.stringify(state.users[user], null, 3));
  } catch (error) {
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
        activeAvatar: {},
      };
      res.send(JSON.stringify(state.users[user], null, 3));
    } else {
      res.send(JSON.stringify(state.users[user], null, 3));
    }
  }
});

app.get("/prices", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(state.stats.prices, null, 3));
});

app.get("/time", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");

  let today = new Date();
  today.setHours(23);
  today.setMinutes(59);
  today.setMilliseconds(0);

  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(23);
  yesterday.setMinutes(59);
  yesterday.setMilliseconds(0);

  let t = Math.floor(today.getTime() / 1000.0);
  let y = Math.floor(yesterday.getTime() / 1000.0);

  res.send(JSON.stringify({ t, y }, null, 3));
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/pending", async (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  try {
    let user = req.body.user;
    let json = req.body.json;
    let response = await getIsPending(user, JSON.stringify(json));

    res.send(JSON.stringify(response, null, 3));
  } catch (error) {
    res.send(JSON.stringify({}, null, 3));
  }
});

app.get("/getallpendings/:user", async (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  try {
    let user = req.params.user;
    let response = await getAllPendings(user);
    if (!user) {
      response = {};
    }

    res.send(JSON.stringify(response, null, 3));
  } catch (error) {
    console.log("retorno error al llamar pending", error);
    res.send(JSON.stringify({}, null, 3));
  }
});

async function updateHkVault(user = "hk-vault") {
  let { seeds, joints } = await contract.getHKVaultNFts(ssc, axios, user);
  state.users[user].seeds = seeds;
  state.users[user].joints = joints;
}

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

var sending = false;
var sendingRefunds = false;

checkPendings = async () => {
  console.log("checking pendings... ");
  sending = true;
  await getAllTransaction()
    .then(async (resxp) => {
      if (resxp.length >= 1) {
        await updateHkVault();
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
                  console.error(
                    "no se pudo procesar otra vez la transaccion",
                    errors
                  );

                  await updateTransaction(resx.transaction_id)
                    .then((red) => {
                      console.log("actualizando con exito transaccion erronea");
                    })
                    .catch((e) => {
                      console.log("ocurrio un error", e);
                    });
                } else {
                  switch (resx.type) {
                    case "tohk-vault":
                      console.log("processing tohk-vault pending");

                      await tohkvault(JSON.parse(resx.json), resx.from, state);

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
      }
      sending = false;
    })
    .catch((e) => {
      sending = false;
      console.log("ERROR ON GET ALL TRANSACTION", e);
    });

  console.log("checking pendings finalice");
};

getAllRefund = async () => {
  console.log("checking refunds... ");
  sendingRefunds = true;
  await getAllRefunds().then(async (resxp) => {
    if (resxp.length >= 1) {
      for (let index = 0; index < resxp.length; index++) {
        let resx = resxp[index];
        await refundTest(resx.usuario, resx.value, resx.memo, resx._id);
      }
    }
    sendingRefunds = false;
  });
};

function startApp() {
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
        hivePriceConversion(1).then((prices) => {
          let bundlePrice = prices;

          state.stats.prices.waterPlants.lvl1.price = bundlePrice / 2;
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
      //reporting();
    }

    // performs the leveling check
    if (num % 11 === 0 && processor.isStreaming()) {
      //leveling();
      updateBlock("1", num).then((r) => {
        console.log("update hive block");
      });
    }

    // show the block number in the console every block
    if (num % 1 === 0 && processor.isStreaming()) {
      console.log(num);
    }

    //saves state to ipfs hash every 5 minutes
    try {
      if (num % 100 === 1) {
        store.get([], function (err, data) {
          const blockState = Buffer.from(JSON.stringify([num, data]));
          ipfsSaveState(num, blockState);
        });
      }
    } catch (error) {
      console.log("error when running ipfsSaveState | line 678");
    }
  });

  /*------------------------------- Farm Actions ---------------------------*/

  // checks for qwoyn_plant and plants the seed
  processor.on("plant_plot", async function (json, from) {
    console.log("this user is planting plot", from);

    let valid = await getIsPending(from, JSON.stringify(json));

    if (valid.response) {
      console.log("this action is ", valid.status);
    } else {
      await plant_plot(json, from, state);
    }
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
  processor.on("change_avatar", async function (json, from) {
    let avatar = json.avatar;
    console.log("changin avatar ", avatar, from);
    let av = await contract.getNFT(axios, parseInt(avatar, 10));

    if (av) {
      await setactiveAvatar(from, av._id);
      av.id = av._id;
      av.properties = av.properties;
      av.owner = from;
      state.users[from].activeAvatar = av;
      state.users[from].xp = state.users[from].activeAvatar.properties.XP;
      console.log("avatar cambiado con exito", av);
    } else {
      console.log("no se pudo cambiar el avatar", avatar);
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

  //qwoyn_rent a plot
  processor.on("set_rent", async function (json, from) {
    let term = parseInt(json.term, 10);
    let price = parseFloat(json.price);
    let plot = json.plot;

    if (from != json.from) {
      console.log("you can try to rent a plot from other person");
      return;
    }

    if (term != 1 || term != 3 || term != 6) {
      console.log("error u need set a correct term time");
      return;
    }

    if (term && price && plot) {
      let plotInfo = await contract.getNFT(axios, parseInt(plot, 10));
      if (plotInfo) {
        if (plotInfo.account != json.from) {
          console.log("you can try to set a rent from other person plot");
          return;
        }
        let plotProperties = plotInfo.properties;

        if (plotProperties.RENTED) {
          console.log("plot is already rented");
          return;
        }

        if (plotProperties.RENTEDINFO != "null") {
          console.log("plot is already set to rented");
          return;
        }

        if (plotProperties.OCCUPIED) {
          console.log("plot is occupied");
          return;
        }

        let rentStatus = {
          term,
          price,
        };

        await contract.updateNft(hivejs, plot, {
          RENTEDINFO: "available",
          RENTEDSTATUS: JSON.stringify(rentStatus),
        });
      } else {
        console.log(
          "no se pudo traer la info de este plot o water tower",
          plot
        );
      }
    } else {
      console.log("algo falta para rentar");
    }
  });

  processor.on("cancel_set_rent", async function (json, from) {
    let plot = json.plot;

    if (from != json.from) {
      console.log("you can try to cancel a rent from other person plot");
      return;
    }

    if (plot) {
      let plotInfo = await contract.getNFT(axios, parseInt(plot, 10));
      if (plotInfo) {
        if (plotInfo.account != json.from) {
          console.log("you can try to cancel a rent from other person plot");
          return;
        }

        let plotProperties = plotInfo.properties;

        if (plotProperties.RENTEDINFO != "available") {
          console.log("plot isnt set to rent");
          return;
        }

        await contract.updateNft(hivejs, plot, {
          RENTEDINFO: "null",
          RENTEDSTATUS: "null",
        });
      } else {
        console.log(
          "no se pudo traer la info de este plot o water tower",
          plot
        );
      }
    } else {
      console.log("algo falta para rentar");
    }
  });

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
      const amount = parseInt(json.amount.split(" ")[0] * 1000);
      var want =
          json.memo.split(" ")[0].toLowerCase() || json.memo.toLowerCase(),
        type = json.memo.split(" ")[1] || "";

      state.stats.prices.waterPlants.lvl1.price = state.stats.prices.waterPlants
        .lvl1.price
        ? state.stats.prices.waterPlants.lvl1.price
        : amount;

      state.stats.prices.waterPlants.lvl2.price = state.stats.prices.waterPlants
        .lvl2.price
        ? state.stats.prices.waterPlants.lvl2.price
        : amount;

      if (contains(want, "water")) {
        processWaterBuy(json, from, amount, want, type);
      }

      if (contains(want, "avatar")) {
        processAvatarBuy(json, from, amount, want, type);
      }
      //purchasing
    } else if (json.from === username) {
      const amount = parseInt(parseFloat(json.amount) * 1000);
      for (var i = 0; i < state.refund.length; i++) {
        if (state.refund[i][1] == json.to && state.refund[i][2] == amount) {
          state.refund.splice(i, 1);
          state.bal.r -= amount;
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

async function processAvatarBuy(json, from, amount, want, type) {
  let canBuy =
    amount > state.stats.prices.waterPlants.lvl1.price * 1000 - 100 &&
    amount < state.stats.prices.waterPlants.lvl1.price * 1000 + 100;

  if (!canBuy) {
    //refound hive
    addPendingRefund(
      json.from,
      parseFloat(json.amount.split(" ")[0]),
      "Refund for " + want + " error amount, try again"
    );
    return;
  }

  if (want === "avatar1" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Magical Male", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar2" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Magical Female", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar3" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Farmer Shaggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar4" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Farmer Maggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar5" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Lucky Shaggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar6" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Lucky Maggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar7" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Water Baron Shaggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar8" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Water Baroness Maggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar9" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Scientist Shaggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }

  if (want === "avatar10" && canBuy) {
    // create nft
    await contract.createAvatar(hivejs, "Scientist Maggi", json.from);
    const c = parseInt(amount);
    state.bal.c += c;
  }
}

async function processWaterBuy(json, from, amount, want, type) {
  let canBuy =
    amount > state.stats.prices.waterPlants.lvl2.price * 1000 - 300 &&
    amount < state.stats.prices.waterPlants.lvl2.price * 1000 + 300;

  if (!canBuy) {
    //refound hive
    addPendingRefund(
      json.from,
      parseFloat(json.amount.split(" ")[0]),
      "Refund for " + want + " error amount, try again"
    );

    return;
  }

  let waterTower = await contract.getNFT(axios, parseInt(type, 10));

  if (!waterTower) {
    addPendingRefund(
      json.from,
      parseFloat(json.amount.split(" ")[0]),
      "Refund for " + want + " error no found this nft, try again."
    );

    return;
  }

  if ("water" + waterTower.properties.LVL == want) {
    addPendingRefund(
      json.from,
      parseFloat(json.amount.split(" ")[0]),
      "Refund for " +
        want +
        " error this water tower has already been raised to this level."
    );

    return;
  }

  if (want === "water2" && canBuy && state.users[json.from].lvl >= 10) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 2, WATER: 96 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water3" && canBuy && state.users[json.from].lvl >= 20) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 3, WATER: 166 });
    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water4" && canBuy && state.users[json.from].lvl >= 30) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 4, WATER: 234 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water5" && canBuy && state.users[json.from].lvl >= 40) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 5, WATER: 302 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water6" && canBuy && state.users[json.from].lvl >= 50) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 6, WATER: 370 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water7" && canBuy && state.users[json.from].lvl >= 60) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 7, WATER: 438 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water8" && canBuy && state.users[json.from].lvl >= 70) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 8, WATER: 506 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water9" && canBuy && state.users[json.from].lvl >= 80) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 9, WATER: 574 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water10" && canBuy && state.users[json.from].lvl >= 90) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 10, WATER: 642 });

    const c = parseInt(amount);
    state.bal.c += c;
  }
}

//check if string contain text
function contains(string, text) {
  return string.indexOf(text) !== -1;
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

const processxor = require("./hiveEngineProcessor");

function hiveEngineStart(starBlock) {
  processxor(
    ssc,
    starBlock,
    async (payload) => {
      let valid = await getIsPending(
        payload.from,
        JSON.stringify(payload.json)
      );

      if (valid.response) {
        if (
          payload.json.contractPayload.symbol === "HKWATER" &&
          payload.json.contractPayload.memo
        ) {
          if (valid.status == "pending") {
            state.refund.push([
              "customJson",
              "ssc-mainnet-hive",
              {
                contractName: "tokens",
                contractAction: "transfer",
                contractPayload: {
                  symbol: "HKWATER",
                  to: payload.from,
                  quantity: "" + payload.contractPayload.quantity,
                  memo:
                    "watering has status " +
                    valid.status +
                    ", please dont try again.",
                },
              },
            ]);
          }
        }
      } else {
        await tohkvault(payload.json, payload.from, state);
      }
    },
    async (nft) => {
      let valid = await getIsPending(nft.from, JSON.stringify(nft.json));
      if (valid.response) {
        console.log("this transaction is done", nft);
      } else {
        await nfttohkvaul(nft.json, nft.from, state);
      }
    },
    async (block) => {
      updateBlock("2", block).then((r) => {
        console.log("update hive-engine block");
      });
    }
  );
}

async function refundTest(usuario, value, memo, id) {
  const data = {
    amount: `${value} HIVE`,
    from: username,
    to: usuario,
    memo: memo,
  };
  let r = await client.broadcast.transfer(data, key).then(
    (result) => {
      console.log("refund Exitoso");
      removePendingRefund(id);
      return true;
    },
    function (error) {
      return r;
    }
  );

  return r;
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

var cron = require("node-cron");

cron.schedule("*/2 * * * *", () => {
  if (!sending) {
    checkPendings();
  } else {
    console.log("me encuentro enviando ahora espera 2 minutos mas");
  }
});

cron.schedule("*/10 * * * *", () => {
  if (!sendingRefunds) {
    getAllRefund();
  } else {
    console.log(
      "me encuentro enviando los pendientes ahora espera 10 minutos mas"
    );
  }
});

mongoose.Promise = global.Promise;

mongoose
  .connect(
    "mongodb+srv://hashkings:JtZa8bb0Yi3jnfNZ@cluster0.trqu4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.info(
      "La conexión a la base  de datos se ha realizado correctamente"
    );
    getLastBlock()
      .then((res) => {
        console.log("get las block respondio", res);
        if (res.hb.block) {
          startingBlock = res.hb.block;
          ago = res.hb.block;

          console.log("starting block at ", startingBlock, res.heb.block);
          if (res.hb.block && res.heb.block) {
            dynStart("hashkings");
            hiveEngineStart(parseInt(res.heb.block, 10));
          }
        }
      })
      .catch((e) => {
        console.log("error no puede traer get last block", e);
      });
  })
  .catch((err) => console.error(err));


