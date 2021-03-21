//                       .                          
//                       M                          
//                      dM                          
//                      MMr                         
//                     4MMML                  .     
//                     MMMMM.                xf     
//     .               "MMMMM               .MM-     
//      Mh..          +MMMMMM            .MMMM      
//      .MMM.         .MMMMML.          MMMMMh      
//       )MMMh.        MMMMMM         MMMMMMM       
//        3MMMMx.     'MMMMMMf      xnMMMMMM"       
//        '*MMMMM      MMMMMM.     nMMMMMMP"        
//          *MMMMMx    "MMMMM\    .MMMMMMM=         
//           *MMMMMh   "MMMMM"   JMMMMMMP           
//             MMMMMM   3MMMM.  dMMMMMM            .
//              MMMMMM  "MMMM  .MMMMM(        .nnMP"
//  =..          *MMMMx  MMM"  dMMMM"    .nnMMMMM*  
//    "MMn...     'MMMMr 'MM   MMM"   .nMMMMMMM*"   
//     "4MMMMnn..   *MMM  MM  MMP"  .dMMMMMMM""     
//       ^MMMMMMMMx.  *ML "M .M*  .MMMMMM**"        
//          *PMMMMMMhn. *x > M  .MMMM**""           
//             ""**MMMMhx/.h/ .=*"                  
//                      .3P"%....                   
//                    nP"     "*MMnx       DaFreakyG


// created at harvest---------------------------------------------
// example contract.createBud(hive, "ricabud", 1, "chocolatoso")
//---------------------------------------------------------------

//created everyday (staking)--------------------------------------
//contract.createSeed(hive, 2, "chocolatoso")
//----------------------------------------------------------------

//purchased by burning buds-----------------------------------------
//contract.createBooster(hive, "BOOSTER LVL1", "Time", "chocolatoso")
//-------------------------------------------------------------------

// purchasable-----------------------------------------------------------
//contract.createPlot(hive,"Asia",1,"chocolatoso"); <----done
//
//contract.createWater(hive,"Water",1,"chocolatoso") <----- done (needs pricing in db)
//--------------------------------------------------------------------------------

require('dotenv').config()
var dhive = require("@hiveio/dhive");
var hivejs = require('@hiveio/hive-js');
var axios = require('axios');
const config = require('./config');
var steemState = require('./processor');
var contract = require('./contract.js')
var steemTransact = require('steem-transact');
var fs = require('fs');
const cors = require('cors');
const express = require('express')
const ENV = process.env;
const SSC = require('sscjs');
const maxEx = process.max_extentions || 8;
const IPFS = require('ipfs-api');
const ipfs = new IPFS({
    host: config.ipfshost,
    port: 5001,
    protocol: 'https'
});

const init = require('./state');
var Pathwise = require('./pathwise');
var level = require('level');

var store = new Pathwise(level('./db', { createIfEmpty: true }));
//const app = express();
//const port = ENV.PORT || 443;
const wkey = ENV.wkey;
const skey = dhive.PrivateKey.from(ENV.skey);
const streamname = ENV.streamname;


/******************* Server *************************/

// Dependencies
const http = require('http');
const https = require('https');

const app = express();

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/hashkings.xyz/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/hashkings.xyz/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/hashkings.xyz/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});


/***************** End Server ************************/


app.use(cors());


app.get('/p/:addr', (req, res, next) => {
    let addr = req.params.addr
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(state.land[addr], null, 3))
});

//shows a log 
app.get('/logs', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(state.cs, null, 3))
});

app.get('/a/:user', (req, res, next) => {
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
});

//overal game stats i.e. number of farmers, number of plants available, seed prices, land price, weather info
//at each location such as mexico or jamaica etc.
app.get('/stats', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    Object.keys(state.users).length
    var ret = state.stats
    ret.farmers = Object.keys(state.users).length
    res.send(JSON.stringify(ret, null, 3))
});

//entire state.json output
app.get('/', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(state, null, 3))
});

//shows seeds by user
app.get('/seeds/:user', (req, res, next) => {
    let user = req.params.user,
        arr = []
    res.setHeader('Content-Type', 'application/json');
    if (state.users[user]) {
        for (var i = 0; i < state.users[user].seeds.length; i++) {
            arr.push(state.users[user].seeds[i])
        }
    }
    res.send(JSON.stringify(arr, null, 3))
});

//shows buds by user
app.get('/buds/:user', (req, res, next) => {
    let user = req.params.user,
        arr = []
    res.setHeader('Content-Type', 'application/json');
    if (state.users[user]) {
        for (var i = 0; i < state.users[user].buds.length; i++) {
            arr.push(state.users[user].buds[i])
        }
    }
    res.send(JSON.stringify(arr, null, 3))
});

//post payouts in que
app.get('/refunds', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        refunds: state.refund,
        bal: state.bal
    }, null, 3))
});

app.get('/u/:user', (req, res, next) => {
    let user = req.params.user
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(state.users[user], null, 3))
});

//app.listen(port, () => console.log(`HASHKINGS API listening on port ${port}!`))
var state;
var startingBlock = ENV.STARTINGBLOCK || 52324042; //GENESIS BLOCK
const username = ENV.ACCOUNT || 'hashkings'; //account with all the SP
const key = dhive.PrivateKey.from(ENV.skey); //active key for account
const ago = ENV.ago || 52324042;
const prefix = ENV.PREFIX || 'qwoyn_'; // part of custom json visible on the blockchain during watering etc..
var client = new dhive.Client([
    "https://api.deathwing.me"
    //"https://api.pharesim.me",
    //"https://hived.privex.io",
    //"https://api.hive.blog"
], {consoleOnFailover: true});
var processor;
var recents = [];

const { ChainTypes, makeBitMaskFilter } = require('@hiveio/hive-js/lib/auth/serializer');
const { stats } = require("./state");
const op = ChainTypes.operations
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
  op.claim_reward_balance
])

const ssc = new SSC('https://api.hive-engine.com/rpc');
/*ssc.stream((err, res) => {
	console.log(err, res);
});*/

dynStart('hashkings')

function dynStart(account) {
    let accountToQuery = account || config.username
    hivejs.api.getAccountHistory(accountToQuery, -1, 100, ...walletOperationsBitmask, function(err, result) {
        if (err) {
            console.log(err)
            dynStart('hashkings')
        } else {
            let ebus = result.filter(tx => tx[1].op[1].id === 'qwoyn_report')
            for (i = ebus.length - 1; i >= 0; i--) {
                if (JSON.parse(ebus[i][1].op[1].json).hash && parseInt(JSON.parse(ebus[i][1].op[1].json).block) > parseInt(config.override)) {
                    recents.push(JSON.parse(ebus[i][1].op[1].json).hash)
                }
            }
            if (recents.length) {
                const mostRecent = recents.shift()
                console.log(mostRecent)
                if (recents.length === 0) {
                    startWith(config.engineCrank)
                } else {
                    startWith(mostRecent)
                }
            } else {
                startWith(config.engineCrank)
            }
        }
    });
}



// gets hive in usd
function hivePriceConversion(amount) {
    return new Promise((resolve, reject) => {
      axios.get('https://api.binance.com/api/v3/ticker/price').then((res) => {
        const { data } = res
        const hivePrice = data.find(o => o.symbol === "HIVEUSDT")
        const hiveCost = amount / hivePrice.price
        const hiveAmount = hiveCost

        resolve(hiveAmount.toFixed(3))
      }).catch((err) => {
        reject(err)
    })
})}

//compares farmer
function userList() {
    contract.getReport(axios).then((res) => {
        let farmerArray = state.stats.farmerList
        var arrayLength = farmerArray.length
        for (let i = 0; i < arrayLength; i++) {
            let username = farmerArray[i]
            if(!state.users[username]) {
                state.users[username] = {
                    subdivisions: {
                        asia: 0,
                        jamaica: 0,
                        africa: 0,
                        afghanistan: 0,
                        mexico: 0,
                        southAmerica: 0,
                        asiaC: 0,
                        jamaicaC: 0,
                        africaC: 0,
                        afghanistanC: 0,
                        mexicoC: 0,
                        southAmericaC: 0
                    },
                    plots: {
                        asia: 0,
                        asiaUsed: 0,
                        africa: 0,
                        africaUsed: 0,
                        afghanistan: 0,
                        afghanistanUsed: 0,
                        southAmerica: 0,
                        southAmericaUsed: 0,
                        jamaica: 0,
                        jamaicaUsed: 0,
                        mexico: 0,
                        mexicoUsed: 0
                    },
                    farm:[],
                    plotCount: 0,
                    seedCount: 0,
                    seeds: [],
                    hkwater: 0,
                    waterCount: 0,
                    waterPlants:{
                        lvl1: 0,
                        lvl2: 0,
                        lvl3: 0,
                        lvl4: 0,
                        lvl5: 0,
                        lvl7: 0,
                        lvl8: 0,
                        lvl9: 0,
                        lvl10: 0
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
                        lvl10: 0
                    },
                    buds: 0,
                    dailyBudDeposit: 0,
                    tokens: {
                        buds: {
                           balance: 0,
                           stake: 0
                        },
                        mota: {
                           balance: 0,
                           stake: 0
                        },
                        hkwater: {
                           balance: 0,
                           stake: 0
                        }
                     },
                    claimed: {
                        water: false,
                        avatar: false,
                        bud: false
                     },
                    xp: 0,
                    lvl: 1,
                    role: 1,
                    joints: {
                        pinner: 0,
                        hempWrappedJoint: 0,
                        crossJoint: 0,
                        blunt: 0,
                        hempWrappedBlunt: 0,
                        twaxJoint: 0
                    },
                    mota: 0,
                    motaStake: 0
                }
            } else if (state.users[username]) {
                let report = res[4]
                for (const property in report) {
                    if(property == username) {
                        //get nft data
                        seedData = report[property].seeds
                        plotData = report[property].plots
                        jointData = report[property].consumables
                        boosterData = report[property].booster
                        avatarData = report[property].avatar
                        waterTowerData = report[property].waterTemp

                        //set nft data
                        state.users[username].avatars = avatarData
                        state.users[username].boosters = boosterData
                        state.users[username].joints = jointData
                        state.users[username].seeds = seedData
                        state.users[username].plots = plotData

                        //set number of seeds and plots for user
                        state.users[username].seedCount = seedData.length
                        state.users[username].plotCount = plotData.length

                        //set hkwater for claiming
                        let waterTowerNumber = waterTowerData.length
                        let HKwater = waterTowerNumber * 30
                        state.users[username].hkwater = HKwater

                        //if user doesnt exist, create them
                        if(state.users[username].tokens.buds.balance > 0) {
                            state.users[username].claimed.water = true
                            state.users[username].claimed.avatar = true
                            state.users[username].claimed.bud = true
                        }
                    }
                }
                //get the users tokens and set in db
                contract.getTokens(ssc, username).then( response => { state.users[username].tokens = response } )
            } 
        }
    })
}

function reporting() {
    contract.getReport(axios).then((res) => {
        

        let landTotal = res[2].totalAllPlots
        let waterTotal = res[4].qwoyn.waterTemp.length
        let seedTotal = res[2].totalAllSeeds
        
        let asiaTotal = res[1].Asia
        let jamaicaTotal = res[1].Jamaica
        let africaTotal = res[1].Africa
        let afghanistanTotal = res[1].Afghanistan
        let mexicoTotal = res[1].Mexico
        let southAmericaTotal = res[1]['South America']

        let totalAsiaSupply = 40
        let totalJamaicaSupply = 116
        let totalAfricaSupply = 300
        let totalAfghanistanSupply = 500
        let totalMexicoSupply = 750
        let totalSouthAmericaSupply = 1300

        state.stats.supply.land.asia = totalAsiaSupply - asiaTotal
        state.stats.supply.land.asiaC = asiaTotal
        state.stats.supply.land.jamaica = totalJamaicaSupply - jamaicaTotal
        state.stats.supply.land.jamaicaC = jamaicaTotal
        state.stats.supply.land.africa = totalAfricaSupply - africaTotal
        state.stats.supply.land.africaC = africaTotal
        state.stats.supply.land.afghanistan = totalAfghanistanSupply - afghanistanTotal
        state.stats.supply.land.afghanistanC = afghanistanTotal
        state.stats.supply.land.mexico = totalMexicoSupply - mexicoTotal
        state.stats.supply.land.mexicoC = mexicoTotal
        state.stats.supply.land.southAmerica = totalSouthAmericaSupply - southAmericaTotal
        state.stats.supply.land.southAmericaC = southAmericaTotal

        state.stats.farmerList = res[3]
        state.stats.farmers = state.stats.farmerList.length

        state.stats.supply.totalPlots = landTotal
        state.stats.supply.totalPlotsC = 3016 - landTotal

        state.stats.supply.totalSeeds = seedTotal

        state.stats.supply.totalWaterTowers = waterTotal
        state.stats.supply.totalWaterTowersC = 19000 - waterTotal

        //fix true or false for claim

    }
)}

function landPriceConversion() {
    return new Promise ((resolve, reject) => {
        axios.post('https://api.hive-engine.com/rpc/contracts', {"jsonrpc":"2.0","id":18,"method":"find","params":{"contract":"market","table":"metrics","query":{"symbol":{"$in":["MOTA"]}},"limit":1000,"offset":0,"indexes":[]}})
  .then(res => {
    const { data } = res
    for(let i = 0; i < 1; i++) {
        let thePrice = data.result[0]
        theLastPrice = thePrice.lastDayPrice
        const hivePriceOfAsia = state.stats.prices.land.asia.price
        const hivePriceOfAfghanistan = state.stats.prices.land.afghanistan.price
        const hivePriceOfMexico = state.stats.prices.land.mexico.price
        const hivePriceOfJamaica = state.stats.prices.land.jamaica.price
        const hivePriceOfAfrica = state.stats.prices.land.africa.price
        const hivePriceOfSouthAmerica = state.stats.prices.land.southAmerica.price
        const conversionAsia = hivePriceOfAsia / theLastPrice
        const conversionAfghanistan = hivePriceOfAfghanistan / theLastPrice
        const conversionMexico = hivePriceOfMexico / theLastPrice
        const conversionJamaica = hivePriceOfJamaica / theLastPrice
        const conversionAfrica = hivePriceOfAfrica / theLastPrice
        const conversionSouthAmerica = hivePriceOfSouthAmerica / theLastPrice
        state.stats.prices.land.asia.token = conversionAsia
        state.stats.prices.land.afghanistan.token = conversionAfghanistan
        state.stats.prices.land.mexico.token = conversionMexico
        state.stats.prices.land.jamaica.token = conversionJamaica
        state.stats.prices.land.africa.token = conversionAfrica
        state.stats.prices.land.southAmerica.token = conversionSouthAmerica
        resolve(conversionAsia.toFixed(4))
        resolve(conversionAfghanistan.toFixed(4))
        resolve(conversionMexico.toFixed(4))
        resolve(conversionJamaica.toFixed(4))
        resolve(conversionAfrica.toFixed(4))
        resolve(conversionSouthAmerica.toFixed(4))
    }
  })
  .catch(error => {
      reject(error)
    console.error(error)
  })
})}

/****ISSUE****/
function startWith(hash) {
    if (hash) {
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
    } else {
        console.log('most recent report doesnt exist')
        state = init
        startApp()
    }
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

function startApp() {
    if (state.cs == null) {
        state.cs = {}
    }
    processor = steemState(client, dhive, startingBlock, 10, prefix);

    processor.onBlock(function(num, block) {
        /*var td = []
        for (var i = 0; i < td.length; i++) {
            daily(td[i])
        }*/

        //processes payments from state.refund
        if (num % 5 === 0 && state.refund.length && processor.isStreaming() || processor.isStreaming() && state.refund.length > 60) {
            if (state.refund[0].length == 4) {
                bot[state.refund[0][0]].call(this, state.refund[0][1], state.refund[0][2], state.refund[0][3])
            } else if (state.refund[0].length == 3) {
                bot[state.refund[0][0]].call(this, state.refund[0][1], state.refund[0][2])
            } else if (state.refund[0].length == 2) {
                bot[state.refund[0][0]].call(this, state.refund[0][1])
            }
            if (state.bal.r < 0) {
                state.bal.r = 0
            }
        }

        //used to catch up on replay
        if (num % 5 === 0 && !processor.isStreaming()) {
            client.database.getDynamicGlobalProperties().then(function(result) {
                console.log('At block', num, 'with', result.head_block_number - num, 'left until real-time.')
            });
        }

        //sets asset prices
        if (num % 5 === 0 && processor.isStreaming()) {
        
            hivePriceConversion(1).then(price => {

                let assetPrice = price;

                state.stats.prices.land.asia.price = Math.ceil((assetPrice * 45));
                state.stats.prices.land.africa.price = Math.ceil((assetPrice * 22.50));
                state.stats.prices.land.afghanistan.price = Math.ceil((assetPrice * 15));
                state.stats.prices.land.southAmerica.price = Math.ceil((assetPrice * 7.50));
                state.stats.prices.land.jamaica.price = Math.ceil((assetPrice * 30));
                state.stats.prices.land.mexico.price = Math.ceil((assetPrice * 11.25));
                //sets cut to 0 because bal.c is deprecated
                state.bal.c = 0

                })
                landPriceConversion();
                hivePriceConversion(1).then(prices => {
                    let bundlePrice = prices;

                    state.stats.prices.bundles.asiaBundle = Math.ceil((bundlePrice * 29.99));
                    state.stats.prices.bundles.africaBundle = Math.ceil((bundlePrice * 14.99));
                    state.stats.prices.bundles.afghanistanBundle= Math.ceil((bundlePrice * 9.99));
                    state.stats.prices.bundles.southAmericaBundle = Math.ceil((bundlePrice * 4.99));
                    state.stats.prices.bundles.jamaicaBundle = Math.ceil((bundlePrice * 19.99));
                    state.stats.prices.bundles.mexicoBundle = Math.ceil((bundlePrice * 7.49));
                })      
                hivePriceConversion(1).then(prices => {
                    let bundlePrice = prices;

                    state.stats.prices.waterPlants.lvl1.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl2.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl3.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl4.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl5.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl6.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl7.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl8.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl9.price = Math.ceil((bundlePrice * 1));
                    state.stats.prices.waterPlants.lvl10.price = Math.ceil((bundlePrice * 1));
                })                       
        }

        // makes sure database is up to date every 5 minutes
        if (num % 10 === 0 && processor.isStreaming()) {
            userList()
        }

        // makes sure database is up to date every 5 minutes
        if (num % 5 === 0 && processor.isStreaming()) {
            reporting();
        }

        // makes sure database is up to date every 5 minutes
        if (num % 1 === 0 && processor.isStreaming()) {
            console.log(num);
        }

        //saves state to ipfs hash every 5 minutes
        if (num % 100 === 1) {
            store.get([], function(err, data) {
                const blockState = Buffer.from(JSON.stringify([num, data]))
                ipfsSaveState(num, blockState)
            })
        }
    })
    
    /*--------------------------------Claim Goodies---------------------------*/
            // checks for qwoyn_plant and plants the seed
            processor.on('claim_water', function(json, from) {

                if(state.users[from] && state.users[from].claimed.water === false){
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

                if(state.users[from] && state.users[from].claimed.avatar === false){
                    //send avatar 1 and 2
                    contract.createAvatar(hivejs, "Magical Male", from)
                    contract.createAvatar(hivejs, "Magical Female", from)
                    //set claimed avatar to true
                    state.users[from].claimed.avatar = true
                }                
            });

            // checks for qwoyn_plant and plants the seed
            processor.on('claim_bud', function(json, from) {

                if(state.users[from] && state.users[from].claimed.bud === false){
                    //send bud
                    contract.generateToken(hivejs, "BUDS", "1", from)
                    //set claimed avatar to true
                    state.users[from].claimed.bud = true
                }                
            });




    /*------------------------------- Farm Actions ---------------------------*/

        // checks for qwoyn_plant and plants the seed
        processor.on('plant_plot', function(json, from) {
            let seedID = json.seed
            let plotID = json.plot

            let plotIDString = "" + plotID
            let seedIDString = "" + seedID

            if(state.users[from] 
                /*&& state.users[from].plots.id[plotID] 
                && state.users[from].seeds.id[seedID]
                && state.users[from].seeds.id[seedID].properties.USED === false
                && state.users[from].plots[plotID].properties.OCCUPIED === false*/
                ){
                //make seed used and designate plot
                contract.updateNft(hivejs, seedIDString, { "PLANTED":  true })
                contract.updateNft(hivejs, seedIDString, { "PLOTID":  plotID })
                
                //make plot occupied and designate seed
                contract.updateNft(hivejs, plotIDString, { "OCCUPIED":  true })
                contract.updateNft(hivejs, plotIDString, { "SEEDID":  seedID })
                
                //just an example
                /*let usedPlotData = {
                    [plotID]: {
                        water: {plantedPlotWater},
                        //spt: {plantedPlotSPT},
                        //prod: {plantedPlotProd}
                    }
                }

                //state.users[from].farm.push(usedPlotData);*/

                //subtract 1 from user region inventory

            }
            
        });

        // checks for qwoyn_plant and plants the seed
        processor.on('plant_subdivison', function(json, from) {
            let seedID = id.json,
                region = sub.json,
                seedSpt = spt.json,
                seedWater = water.json,
                seedPr = pr.json

        /*if(theuserexists && theplotexists && theseedexists? && theplotisnotoccupied){
            //remove seed from user inventory
            //add seed data to user subdivision -- data includes how much water, seed production and sprouting time push it
            //subtract 1 from user region inventory

        }*/
            
        });

    //called when qwoyn_harvest is detected
    processor.on('harvest_plot', function(json, from) {
        let plot = json.plots
        let plotName = json.region

        if(state.users[from] && state.users[from].plot.planted === true && state.users[from].plot.water <= 0 && state.users[from].plot.spt <= 0){
            
            state.users[from].plot.planted = false
            state.users[from].plot.water = 0
            state.users[from].plot.spt = 0

            let amountOfBuds = state.users[from].plot.pr

            //createbuds
            contract.createBud(hivejs, amountOfBuds, from)
        }

        state.cs[`${json.block_num}:${from}`] = `${from} harvested ${plot} in ${plotName}`
    });

        // search for qwoyn_water from user on blockchain since genesis
    //steemconnect link
    //https://app.steemconnect.com/sign/custom-json?required_auths=%5B%5D&required_posting_auths=%5B%22USERNAME%22%5D&id=qwoyn_water&json=%7B%22plants%22%3A%5B%22c35%22%5D%7D
    processor.on('water', function(json, from) {
        let plants = json.plants,
            plantnames = ''
        for (var i = 0; i < plants.length; i++) {
            try {
                if (state.land[plants[i]].owner === from) {
                    state.land[plants[i]].care.unshift([processor.getCurrentBlockNumber(), 'watered']);
                    plantnames += `${plants[i]} `
                }
            } catch (e) {
                state.cs[`${json.block_num}:${from}`] = `${from} can't water what is not theirs`
            }
        }
        state.cs[`${json.block_num}:${from}`] = `${from} watered ${plantnames}`
    });

    //called when qwoyn_harvest is detected
    processor.on('harvest_subdivision', function(json, from) {
        let subdivisions = json.plots
        let subName = json.region

        if(state.users[from] && state.users[from].subdivision.planted === true && state.users[from].subdivision.water <= 0 && state.users[from].subdivision.spt <= 0){
            
            state.users[from].subdivision.id.planted = false
            state.users[from].subdivision.id.water = 0
            state.users[from].subdivision.id.spt = 0

            let amountOfBuds = state.users[from].subdivision.id.pr

            //createbuds
            contract.createBud(hivejs, amountOfBuds, from)
            
            // set property to availabe on main subdivision
        }

        state.cs[`${json.block_num}:${from}`] = `${from} harvested ${subdivisions} in ${subName}`
    });

    //called when qwoyn_harvest is detected
    processor.on('subdivide_asia', function(json, from) {
        let plot = json.plots
        let region = json.region

        if(state.users[from] && state.users[from].plot && state.users[from].plot.subdivided === false){
            
            state.users[from].plot.subdivided = true
            state.users[from].subdivision.asia += 1

            //createbuds
            contract.createSubdivision(hivejs, region, from)
            
            // set property to subdivided on main plot
        }

        state.cs[`${json.block_num}:${from}`] = `${from} subdivided ${plot} in ${region}`
    });

    //called when qwoyn_harvest is detected
    processor.on('subdivide_jamaica', function(json, from) {
        let subdivisions = json.plots
        let subName = json.region

        if(state.users[from] && state.users[from].plot && state.users[from].plot.subdivided === false){
            
            state.users[from].plot.subdivided = true
            state.users[from].subdivision.jamaica += 1

            //createbuds
            contract.createSubdivision(hivejs, region, from)
            
            // set property to subdivided on main plot
        }

        state.cs[`${json.block_num}:${from}`] = `${from} subdivided ${plot} in ${region}`
    });

    //called when qwoyn_harvest is detected
    processor.on('subdivide_africa', function(json, from) {
    let plot = json.plots
    let region = json.region

    if(state.users[from] && state.users[from].plot && state.users[from].plot.subdivided === false){
            
        state.users[from].plot.subdivided = true
        state.users[from].subdivision.africa += 1

        //createbuds
        contract.createSubdivision(hivejs, region, from)
        
            // set property to subdivided on main plot
    }

    state.cs[`${json.block_num}:${from}`] = `${from} subdivided ${plot} in ${region}`
    });

    //called when qwoyn_harvest is detected
    processor.on('subdivide_afghanistan', function(json, from) {
        let plot = json.plots
        let region = json.region

        if(state.users[from] && state.users[from].plot && state.users[from].plot.subdivided === false){
            
            state.users[from].plot.subdivided = true
            state.users[from].subdivision.afghanistan += 1

            //createbuds
            contract.createSubdivision(hivejs, region, from)
            
            // set property to subdivided on main plot
        }

        state.cs[`${json.block_num}:${from}`] = `${from} subdivided ${plot} in ${region}`
    });

    //called when qwoyn_harvest is detected
    processor.on('subdivide_mexico', function(json, from) {
        let plot = json.plots
        let region = json.region

        if(state.users[from] && state.users[from].plot && state.users[from].plot.subdivided === false){
            
            state.users[from].plot.subdivided = true
            state.users[from].subdivision.mexico += 1

            //createbuds
            contract.createSubdivision(hivejs, region, from)
            
            // set property to subdivided on main plot
        }

        state.cs[`${json.block_num}:${from}`] = `${from} subdivided ${plot} in ${region}`
    });

    //called when qwoyn_harvest is detected
    processor.on('subdivide_southAmerica', function(json, from) {
        let plot = json.plots
        let region = json.region

        if(state.users[from] && state.users[from].plot && state.users[from].plot.subdivided === false){
            
            state.users[from].plot.subdivided = true
            state.users[from].subdivision.southAmerica += 1

            //createbuds
            contract.createSubdivision(hivejs, plot, from)
            
            // set property to subdivided on main plot
        }

        state.cs[`${json.block_num}:${from}`] = `${from} subdivided ${plot} in ${region}`
    });

    /*-------------------------- RENTALS  ---------------------------*/




    /*-------------------------- CRAFTING ----------------------------*/

    // search for qwoyn_pinner from user on blockchain since genesis
    processor.on('pinner', function(json, from) {
        let type = json.type

        if(state.users[from] && state.users[from].buds > state.stats.joints.pinner) {
            //mint pinner and send to user
            contract.createConsumable(hivejs,"Pinner", from)
            state.users[from].buds -= state.stats.joints.pinner
            state.users[from].joints.pinner += 1
        }

        state.cs[`${json.block_num}:${from}`] = `${from} crafted ${type}`
    });

    // search for qwoyn_pinner from user on blockchain since genesis
    processor.on('cross_joint', function(json, from) {
        let type = json.type

        if(state.users[from] && state.users[from].buds > state.stats.joints.crossJoint) {
            //mint cross joint and send to user
            contract.createConsumable(hivejs,"Cross Joint", from)
            state.users[from].buds -= state.stats.joints.crossJoint
            state.users[from].joints.crossJoint += 1
        }

        state.cs[`${json.block_num}:${from}`] = `${from} crafted ${type}`
    });

    // search for qwoyn_pinner from user on blockchain since genesis
    processor.on('hemp_wrapped_blunt', function(json, from) {
        let type = json.type

        if(state.users[from] && state.users[from].buds > state.stats.joints.hempWrappedBlunt) {
            //mint pinner and send to user
            contract.createConsumable(hivejs,"Hemp Wrapped Blunt", from)
            state.users[from].buds -= state.stats.joints.hempWrappedBlunt
            state.users[from].joints.hempWrappedBlunt += 1
        }

        state.cs[`${json.block_num}:${from}`] = `${from} crafted ${type}`
    });

    // search for qwoyn_pinner from user on blockchain since genesis
    processor.on('hemp_wrapped_joint', function(json, from) {
        let type = json.type

        if(state.users[from] && state.users[from].buds > state.stats.joints.hempWrappedJoint) {
            //mint pinner and send to user
            contract.createConsumable(hivejs,"Hemp Wrapped Joint", from)
            state.users[from].buds -= state.stats.joints.hempWrappedJoint
            state.users[from].joints.hempWrappedJoint += 1
        }

        state.cs[`${json.block_num}:${from}`] = `${from} crafted ${type}`
    });

    // search for qwoyn_pinner from user on blockchain since genesis
    processor.on('twax_joint', function(json, from) {
        let type = json.type

        if(state.users[from] && state.users[from].buds > state.stats.joints.twaxJoint) {
            //mint pinner and send to user
            contract.createConsumable(hivejs,"Twax Joint", from)
            state.users[from].buds -= state.stats.joints.twaxJoint
            state.users[from].joints.twaxJoint += 1
        }

        state.cs[`${json.block_num}:${from}`] = `${from} crafted ${type}`
    });

    // search for qwoyn_pinner from user on blockchain since genesis
    processor.on('blunt', function(json, from) {
        let type = json.type

        if(state.users[from] && state.users[from].buds > state.stats.joints.blunt) {
            //mint pinner and send to user
            contract.createConsumable(hivejs,"Blunt", from)
            state.users[from].buds -= state.stats.joints.blunt
            state.users[from].joints.blunt += 1
        }

        state.cs[`${json.block_num}:${from}`] = `${from} crafted ${type}`
    });

    /*------------------------ Consumables ------------------------- */

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_pinner', function(json, from) {
        let type = json.type

        if(state.users[from].joints.pinner > 0){

        state.users[from].xp += 15
        state.users[from].joints.pinner -= 1

        }

        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${type}`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_hemp_wrapped_joint', function(json, from) {
        let type = json.type

        if(state.users[from].joints.hempWrappedJoint > 0){

        state.users[from].xp += 75
        state.users[from].joints.hempWrappedJoint -= 1
        
        }

        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${type}`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_cross_joint', function(json, from) {
        let type = json.type

        if(state.users[from].joints.crossJoint > 0){

            state.users[from].xp += 400
            state.users[from].joints.crossJoint -= 1
            
            }

        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${type}`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_blunt', function(json, from) {
        let type = json.type

        if(state.users[from].joints.blunt > 0){

            state.users[from].xp += 1100
            state.users[from].joints.blunt -= 1
            }

        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${type}`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_hemp_wrapped_blunt', function(json, from) {
        let type = json.type

        if(state.users[from].joints.hempWrappedBlunt > 0){

            state.users[from].xp += 5000
            state.users[from].joints.hempWrappedBlunt -= 1
            }

        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${type}`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_twax_joint', function(json, from) {
        let type = json.type

        if(state.users[from].joints.twaxJoint > 0){

            state.users[from].xp += 1100
            state.users[from].joints.twaxJoint -= 1
            }

        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${type}`
    });


    processor.on('adjust', function(json, from) {
        if (from == username && json.dust > 1) state.stats.dust = json.dust
        if (from == username && json.time > 1) state.stats.time = json.time
    });

    processor.on('report', function(json, from) {
        try {
            for (var i = 0; i < state.refund.length; i++) {
                if (state.refund[i][2].block == json.block) state.refund.splice(i, 1)
            }
        } catch (e) {
            console.log('Reports not being made', e.message)
        }
    });
    

    processor.onOperation('transfer', function(json, from) {
        if (json.to === username && json.amount.split(' ')[1] === 'HIVE') {

            //if user does not exist in db create user and db entry
            if (!state.users[json.from]) {
                state.users[json.from] = {
                    subdivisions: {
                        asia: 0,
                        jamaica: 0,
                        africa: 0,
                        afghanistan: 0,
                        mexico: 0,
                        southAmerica: 0,
                        asiaC: 0,
                        jamaicaC: 0,
                        africaC: 0,
                        afghanistanC: 0,
                        mexicoC: 0,
                        southAmericaC: 0
                    },
                    plots: {
                        asia: 0,
                        asiaUsed: 0,
                        africa: 0,
                        africaUsed: 0,
                        afghanistan: 0,
                        afghanistanUsed: 0,
                        southAmerica: 0,
                        southAmericaUsed: 0,
                        jamaica: 0,
                        jamaicaUsed: 0,
                        mexico: 0,
                        mexicoUsed: 0
                    },
                    farm:[],
                    plotCount: 0,
                    seedCount: 0,
                    seeds: [],
                    hkwater: 0,
                    waterCount: 0,
                    waterPlants:{
                        lvl1: 0,
                        lvl2: 0,
                        lvl3: 0,
                        lvl4: 0,
                        lvl5: 0,
                        lvl7: 0,
                        lvl8: 0,
                        lvl9: 0,
                        lvl10: 0
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
                        lvl10: 0
                    },
                    buds: 0,
                    dailyBudDeposit: 0,
                    xp: 0,
                    lvl: 1,
                    role: 1,
                    joints: {
                        pinner: 0,
                        hempWrappedJoint: 0,
                        crossJoint: 0,
                        blunt: 0,
                        hempWrappedBlunt: 0,
                        twaxJoint: 0
                    },
                    mota: 0,
                    motaStake: 0
                }

                state.stats.farmers++
                state.stats.farmerList.push(json.from)
            }

            //purchasing
            const amount = parseInt(parseFloat(json.amount) * 1000)
            var want = json.memo.split(" ")[0].toLowerCase() || json.memo.toLowerCase(),
                type = json.memo.split(" ")[1] || ''
            if (want === 'afghanistan_bundle' && amount > (state.stats.prices.bundles.afghanistanBundle * 1000) - 3000 && amount < (state.stats.prices.bundles.afghanistanBundle * 1000) + 3000 && state.stats.supply.land.afghanistan >= 1000) {
                        
                // update total number of plots
                state.users[json.from].plotCount++

                // add 1 plot to user inventory
                state.users[json.from].plots.afghanistan++

                //add 1 water to user inventory
                state.users[json.from].waterPlants.lvl1++

                // subtracts 1 plot from total land supply
                state.stats.supply.land.afghanistan -= 1

                // adds 1 plot to plots used count
                state.stats.supply.land.afghanistanC += 1

                // adds water to users water supply
                state.users[json.from].water += 30

                // adds 1 seed to users seedCount
                state.users[json.from].seedCount++

                // create one seed nft and return type of seed
                contract.generateBundle(hivejs, 4, "Afghanistan", 30, json.from).then(res => {
                    const seedData4 = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                    //update total seed count since genesis
                    state.stats.seedCount++

                    let strain4 = seedData4.NAME

                    if(strain4 === "Hindu Kush") { 
                        strain4 = "hk"
                    } else if(strain4 === "Afghani") { 
                        strain4 = "afg"
                    } else if(strain4 === "Lashkar Gah") { 
                        strain4 = "lg"
                    } else if(strain4 === "Mazar I Sharif") { 
                        strain4 = "mis"
                    }

                    var seedName4 = {
                        name: seedData4.NAME,
                        spt: seedData4.SPT,
                        water: seedData4.WATER, 
                        pr: seedData4.PR,
                        planted: false
                    }

                        state.users[json.from].seeds.push(seedName4)
                    })

                    const c = parseInt(amount)
                    state.bal.c += c
                    state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased an afghanistan bundle`
                    
                } else if (want === 'mexico_bundle' && amount > (state.stats.prices.bundles.mexicoBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.mexicoBundle * 1000) + 3000 && state.stats.supply.land.mexico >= 1000) {
                            
                    // update total number of plots
                    state.users[json.from].plotCount++

                    // add 1 plot to user inventory
                    state.users[json.from].plots.mexico++

                    //add 1 water to user inventory
                    state.users[json.from].waterPlants.lvl1++

                    // subtracts 1 plot from total land supply
                    state.stats.supply.land.mexico -= 1

                    // adds 1 plot to plots used count
                    state.stats.supply.land.mexicoC += 1

                    // adds water to users water supply
                    state.users[json.from].water += 30

                    // adds 1 seed to users seedCount
                    state.users[json.from].seedCount++

                    // create one seed nft and return type of seed
                    contract.generateBundle(hivejs, 5, "Mexico", 30, json.from).then((res) => {
                        const seedData5 = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                        //update total seed count since genesis
                        state.stats.seedCount++

                        let strain5 = seedData5.NAME

                        if(strain5 === "Acapulco Gold") { 
                            strain5 = "aca"
                        }

                        var seedName5 = {
                            name: seedData5.NAME,
                            spt: seedData5.SPT,
                            water: seedData5.WATER, 
                            pr: seedData5.PR,
                            planted: false
                        }

                            state.users[json.from].seeds.push(seedName5)
                        })

                        const c = parseInt(amount)
                        state.bal.c += c
                        state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased a mexico bundle`
                        
                    } else if (want === 'southamerica_bundle' && amount > (state.stats.prices.bundles.southAmericaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.southAmericaBundle * 1000) + 3000 && state.stats.supply.land.southAmerica >= 1000) {
                                
                        // update total number of plots
                        state.users[json.from].plotCount++

                        // add 1 plot to user inventory
                        state.users[json.from].plots.southAmerica++

                        //add 1 water to user inventory
                        state.users[json.from].waterPlants.lvl1++

                        // subtracts 1 plot from total land supply
                        state.stats.supply.land.southAmerica -= 1

                        // adds 1 plot to plots used count
                        state.stats.supply.land.southAmericaC += 1

                        // adds water to users water supply
                        state.users[json.from].water += 30

                        // adds 1 seed to users seedCount
                        state.users[json.from].seedCount++

                        // create one seed nft and return type of seed
                        contract.generateBundle(hivejs, 6, "South America", 30, json.from).then(res => {
                            const seedData6 = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                            //update total seed count since genesis
                            state.stats.seedCount++

                            let strain6 = seedData6.NAME

                            if(strain6 === "Colombian Gold")
                            { 
                                strain6 = "cg"
                            } else if(strain6 === "Panama Red")
                            { 
                                strain6 = "pr"
                            } 

                            var seedName6 = {
                                name: seedData6.NAME,
                                spt: seedData6.SPT,
                                water: seedData6.WATER, 
                                pr: seedData6.PR,
                                planted: false
                            }

                                state.users[json.from].seeds.push(seedName6)
                            })

                            const c = parseInt(amount)
                            state.bal.c += c
                            state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased south america bundle`
                            
                        } else if (want == 'asia' && amount > (state.stats.prices.land.asia.price * 1000) - 3000 &&  amount < (state.stats.prices.land.asia.price * 1000) + 3000 && state.stats.supply.land.asia != 0) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.asia -= 1

                                // adds 1 plot to plots used count
                                state.stats.supply.land.asiaC += 1

                                // add 1 plot to user inventory
                                state.users[json.from].plots.asia++

                                // create nft
                                contract.createPlot(hivejs, "Asia", 1, json.from);

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                                } else if (want == 'afghanistan' && amount > (state.stats.prices.land.afghanistan.price * 1000) - 3000 &&  amount < (state.stats.prices.land.afghanistan.price * 1000) + 3000 && state.stats.supply.land.afghanistan != 0) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.afghanistan--
                                state.stats.supply.land.afghanistanC++

                                // add 1 plot to user inventory
                                state.users[json.from].plots.afghanistan++

                                // create nft
                                contract.createPlot(hivejs, "Afghanistan", 1, json.from);

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want == 'africa' && amount > (state.stats.prices.land.africa.price * 1000) - 3000 &&  amount < (state.stats.prices.land.africa.price * 1000) + 3000 && state.stats.supply.land.africa != 0) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.africa--
                                state.stats.supply.land.africaC++

                                // add 1 plot to user inventory
                                state.users[json.from].plots.africa++

                                // create nft
                                contract.createPlot(hivejs, "Africa", 1, json.from);

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want == 'jamaica' && amount > (state.stats.prices.land.jamaica.price * 1000) - 3000 &&  amount < (state.stats.prices.land.jamaica.price * 1000) + 3000 && state.stats.supply.land.jamaica != 0) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.jamaica--
                                state.stats.supply.land.jamaicaC++

                                // add 1 plot to user inventory
                                state.users[json.from].plots.jamaica++

                                // create nft
                                contract.createPlot(hivejs, "Jamaica", 1, json.from);

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want == 'mexico' && amount > (state.stats.prices.land.mexico.price * 1000) - 3000 &&  amount < (state.stats.prices.land.mexico.price * 1000) + 3000 && state.stats.supply.land.mexico != 0) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.mexico--
                                state.stats.supply.land.mexicoC++

                                // add 1 plot to user inventory
                                state.users[json.from].plots.mexico++

                                // create nft
                                contract.createPlot(hivejs, "Mexico", 1, json.from);

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want == 'southAmerica' && amount > (state.stats.prices.land.southAmerica.price * 1000) - 3000 &&  amount < (state.stats.prices.land.southAmerica.price * 1000) + 3000 && state.stats.supply.land.southAmerica != 0) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.southAmerica--
                                state.stats.supply.land.southAmericaC++

                                // add 1 plot to user inventory
                                state.users[json.from].plots.southAmerica++

                                // create nft
                                contract.createPlot(hivejs, "South America", 1, json.from);

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water1' && amount > (state.stats.prices.waterPlant.lvl1.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl1.price * 1000) + 3000 && type === '1') {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl1

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl1++

                                // create nft
                                contract.createWater(hivejs, "Water", 1, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water2' && amount > (state.stats.prices.waterPlant.lvl2.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl2.price * 1000) + 3000 && type === '2' && state.users[json.from].lvl >= 10) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl2

                                // add 1 plot to user inventory
                                state.users[from].waterPlants.lvl2++

                                // create nft
                                contract.createWater(hivejs, "Water", 2, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water3' && amount > (state.stats.prices.waterPlant.lvl3.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl3.price * 1000) + 3000 && type === '3' && state.users[json.from].lvl >= 20) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl3

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl3++

                                // create nft
                                contract.createWater(hivejs, "Water", 3, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water4' && amount > (state.stats.prices.waterPlant.lvl4.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl4.price * 1000) + 3000 && type === '4' && state.users[json.from].lvl >= 30) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl4

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl4++

                                // create nft
                                contract.createWater(hivejs, "Water", 4, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water5' && amount > (state.stats.prices.waterPlant.lvl5.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl5.price * 1000) + 3000 && type === '5' && state.users[json.from].lvl >= 40) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl5

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl5++

                                // create nft
                                contract.createWater(hivejs, "Water", 5, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water6' && amount > (state.stats.prices.waterPlant.lvl6.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl6.price * 1000) + 3000 && type === '6' && state.users[json.from].lvl >= 50) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl6

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl6++

                                // create nft
                                contract.createWater(hivejs, "Water", 6, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water7' && amount > (state.stats.prices.waterPlant.lvl7.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl7.price * 1000) + 3000 && type === '7' && state.users[json.from].lvl >= 60) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl7

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl7++

                                // create nft
                                contract.createWater(hivejs, "Water", 7, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water8' && amount > (state.stats.prices.waterPlant.lvl8.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl8.price * 1000) + 3000 && type === '8' && state.users[json.from].lvl >= 70) {
                                
                                // update total number of plots
                                state.users[from].water += state.stats.waterPlant.lvl8

                                // add 1 plot to user inventory
                                state.users[from].waterPlants.lvl8++

                                // create nft
                                contract.createWater(hivejs, "Water", 8, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water9' && amount > (state.stats.prices.waterPlant.lvl9.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl9.price * 1000) + 3000 && type === '9' && state.users[json.from].lvl >= 80) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl9

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl9++

                                // create nft
                                contract.createWater(hivejs, "Water", 9, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water10' && amount > (state.stats.prices.waterPlant.lvl10.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl10.price * 1000) + 3000 && type === '10' && state.users[json.from].lvl >= 90) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl10

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl10++

                                // create nft
                                contract.createWater(hivejs, "Water", 10, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                            } 
                        /*} else {
                            state.bal.r += amount
                            state.refund.push(['xfer', json.from, amount, 'something strange happened your item might not be available or try again'])
                            state.cs[`${json.block_num}:${json.from}`] = `${json.from} sent a weird transfer trying to purchase seeds, land or water.`
                            }*/
        } else if (json.from === username) {
            const amount = parseInt(parseFloat(json.amount) * 1000)
            for (var i = 0; i < state.refund.length; i++) {
                if (state.refund[i][1] == json.to && state.refund[i][2] == amount) {
                    state.refund.splice(i, 1);
                    state.bal.r -= amount;
                    state.cs[`${json.block_num}:${json.to}`] = `${json.to} refunded successfully`
                    break;
                }
            }
        }
    });
    processor.onStreamingStart(function() {
        console.log("At real time.")
    });

    processor.start();

    function exit() {
        console.log('Exiting...');
        processor.stop(function() {
            saveState(function() {
                process.exit();
                //console.log('Process exited.');
            });
        });
    }
}

function ipfsSaveState(blocknum, hashable) {
    ipfs.add(hashable, (err, IpFsHash) => {
        if (!err) {
            var hash = ''
            try {
                hash = IpFsHash[0].hash
                state.stats.bu = hash
                state.stats.bi = blocknum
            } catch (e) {
                console.log("hash didnt get set")
            }
            state.refund.push(['customJson', 'report', {
                hash: state.stats.bu,// fuck this up to update state.js manually
                block: blocknum
            }])
            console.log(blocknum + ` :Saved:  ${hash}`)
        } else {
            console.log({
                cycle
            }, 'IPFS Error', err)
            cycleipfs(cycle++)
            if (cycle >= 25) {
                cycle = 0;
                return;
            }
        }
    })
};

var bot = {
    xfer: function(toa, amount, memo) {
        const float = parseFloat(amount / 1000).toFixed(3)
        const data = {
            amount: `${float} HIVE`,
            from: username,
            to: toa,
            memo: memo
        }
        console.log(data, key)
        client.broadcast.transfer(data, key).then(
            function(result) {
                console.log(result)
            },
            function(error) {
                console.log(error)
            }
        );
    },
    customJson: function(id, json, callback) {
        if (json.block > processor.getCurrentBlockNumber() - 1000) {
            client.broadcast.json({
                required_auths: [],
                required_posting_auths: [username],
                id: prefix + id,
                json: JSON.stringify(json),
            }, key).then(
                result => {
                    console.log('Signed ${json}')
                },
                error => {
                    console.log('Error sending customJson')
                }
            )
        } else { state.refund.splice(0, 1) }
    },
    sign: function(op, callback) {
        console.log('attempting' + op[0])
        client.broadcast.sendOperations(op, key).then(
            function(result) {
                console.log(result)
            },
            function(error) {
                console.log(error)
                state.refund.pop()
            }
        );
    },
    ssign: function(op, callback) {
        console.log('attempting' + op[0])
        client.broadcast.sendOperations(op, skey).then(
            function(result) {
                console.log(result)
            },
            function(error) {
                console.log(error)
                state.refund.pop()
            }
        );
    },
    power: function(toa, amount, callback) {
        const op = [
            'transfer_to_vesting',
            {
                from: username,
                to: toa,
                amount: `${parseFloat(amount/1000).toFixed(3)} HIVE`,
            },
        ];
        client.broadcast.sendOperations([op], key).then(
            function(result) {
                console.log(result)
            },
            function(error) {
                console.log(error)
            }
        );
    },
    sendOp: function(op) {
        client.broadcast.sendOperations(op, key).then(
            function(result) {
                console.log(result)
            },
            function(error) {
                console.log(error)
            }
        );
    }
}

function daily(addr) {
    /*var grown = false
    if (state.land[addr]) {
        for (var i = 0; i < state.land[addr].care.length; i++) {
            if (state.land[addr].care[i][0] <= processor.getCurrentBlockNumber() - 28800) {
                state.land[addr].care.splice(i, 1)
            } else if (state.land[addr].care[i][0] > processor.getCurrentBlockNumber() - 28800 && state.land[addr].care[i][1] == 'watered') {
                if (!grown) {
                    state.land[addr].care[i].push('')
                }
                if (state.land[addr].substage < 7 && state.land[addr].stage > 0 && !grown) {
                    if (!grown) {
                        state.land[addr].substage++;
                        grown = true;
                    } else {
                        state.land[addr].aff.push([processor.getCurrentBlockNumber(), 'You watered too soon']);
                    }
                }
                if (state.land[addr].substage == 7) {
                    state.land[addr].substage = 0;
                    state.land[addr].stage++
                }
            }
        }
    }*/


}
