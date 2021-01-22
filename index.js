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
const app = express();
const port = ENV.PORT || 3000;
const wkey = ENV.wkey;
const skey = dhive.PrivateKey.from(ENV.skey);
const streamname = ENV.streamname;

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

app.listen(port, () => console.log(`HASHKINGS API listening on port ${port}!`))
var state;
var startingBlock = ENV.STARTINGBLOCK || 50655355; //GENESIS BLOCK
const username = ENV.ACCOUNT || 'hashkings'; //account with all the SP
const key = dhive.PrivateKey.from(ENV.skey); //active key for account
const ago = ENV.ago || 50655355;
const prefix = ENV.PREFIX || 'qwoyn_'; // part of custom json visible on the blockchain during watering etc..
var client = new dhive.Client([
    "https://hive.roelandp.nl"
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

/*function tokenPriceConversion() {
    return new Promise ((resolve, reject) => {
        axios.post('https://api.hive-engine.com/rpc/contracts', {"jsonrpc":"2.0","id":18,"method":"find","params":{"contract":"market","table":"metrics","query":{"symbol":{"$in":["MOTA"]}},"limit":1000,"offset":0,"indexes":[]}})
  .then(res => {
    const { data } = res
    for(let i = 0; i < 1; i++) {
        let thePrice = data.result[0]
        theLastPrice = thePrice.lastDayPrice
        console.log("current MOTA price is " + theLastPrice)
        console.log("------------------------------------")
        const hivePriceOfToken = state.stats.prices.seedPacks.price
        const conversion = hivePriceOfToken / theLastPrice
        console.log("Price of seedPacks in MOTA is " + conversion.toFixed(4)) 
        state.stats.prices.seedPacks.token = conversion
        resolve(conversion.toFixed(4))
    }
  })
  .catch(error => {
      reject(error)
    console.error(error)
  })
})}*/

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
        console.log("-------------------------------------")
        console.log("Price of asia in MOTA is " + conversionAsia)
        console.log("Price of afghanistan in MOTA is " + conversionAfghanistan) 
        console.log("Price of mexico in MOTA is " + conversionMexico)
        console.log("Price of jamaica in MOTA is " + conversionJamaica) 
        console.log("Price of africa in MOTA is " + conversionAfrica)
        console.log("Price of south america in MOTA is " + conversionSouthAmerica)
        console.log("-------------------------------------")
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
        if (num % 100 === 0 && !processor.isStreaming()) {
            client.database.getDynamicGlobalProperties().then(function(result) {
                console.log('At block', num, 'with', result.head_block_number - num, 'left until real-time.')
            });
        }

        //sets asset prices
        if (num % 5 === 0 && processor.isStreaming()) {              
            //logging for testing will remove after a while
            console.log('------------------------');
            console.log('bal.c is ' + state.bal.c);
        
            hivePriceConversion(1).then(price => {

                let assetPrice = price;

                state.stats.prices.land.asia.price = Math.ceil((assetPrice * 15));
                state.stats.prices.land.africa.price = Math.ceil((assetPrice * 7.5));
                state.stats.prices.land.afghanistan.price = Math.ceil((assetPrice * 5));
                state.stats.prices.land.southAmerica.price = Math.ceil((assetPrice * 1.75));
                state.stats.prices.land.jamaica.price = Math.ceil((assetPrice * 9.75));
                state.stats.prices.land.mexico.price = Math.ceil((assetPrice * 3.50));
                //sets cut to 0 because bal.c is deprecated
                state.bal.c = 0

                //logging for testing will remove after a while
                console.log('------------------------');
                console.log('Asia hive price is ' + state.stats.prices.land.asia.price);
                console.log('Africa hive price is ' + state.stats.prices.land.africa.price);
                console.log('Afghanistan hive price is ' + state.stats.prices.land.afghanistan.price);
                console.log('South America hive price is ' + state.stats.prices.land.southAmerica.price);
                console.log('Jamaica hive price is ' + state.stats.prices.land.jamaica.price);
                console.log('Mexico hive price is ' + state.stats.prices.land.mexico.price);
                console.log('------------------------');
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

                    console.log('------------------------');
                    console.log('Asia bundle price is ' + state.stats.prices.bundles.asiaBundle);
                    console.log('Africa bundle price is ' + state.stats.prices.bundles.africaBundle);
                    console.log('Afghanistan bundle price is ' + state.stats.prices.bundles.afghanistanBundle);
                    console.log('South America bundle price is ' + state.stats.prices.bundles.southAmericaBundle);
                    console.log('Jamaica bundle price is ' + state.stats.prices.bundles.jamaicaBundle);
                    console.log('Mexico bundle price is ' + state.stats.prices.bundles.mexicoBundle);
                    console.log('------------------------');
                })
        }

        //saves state to ipfs hash
        if (num % 100 === 1) {
            store.get([], function(err, data) {
                const blockState = Buffer.from(JSON.stringify([num, data]))
                ipfsSaveState(num, blockState)
            })
        }
    })
    
    //called when qwoyn_harvest is detected
    processor.on('harvest', function(json, from) {
        let plot = json.plots,
            plant = json.plants,
            seed = json.seed
            plantnames = ''
        for (var i = 0; i < plants.length; i++) {
            try {
                if (state.users[from] === from) {
                    //harvest buds
                    try {
                        if (state.users.from[plot] === plot && state.users.from[plot][plant] === plant 
                            && state.users.from[plot][plant][seed].water < 1 
                            && state.users.from[plot][plant][seed].spt < 1) {
                            const parcel = {
                                owner: state.land[plants[i]].owner,
                                strain: '',
                                care: [
                                    [processor.getCurrentBlockNumber(), 'tilled']
                                ],
                                aff: [],
                                stage: -1,
                                substage: 0,
                                traits: [],
                                terps: [],
                                stats: [],
                                pollinated: false
                            }
                            state.land[plants[i]] = parcel;

                            contract.createBud(hivejs, "ricabud", 1, from)
                            state.users[state.land[plants[i]].owner].xps += 25;

                        }
                    } catch (e) {
                        console.log('buds harvested', e.message)
                    }

                    //pollen at harvest if male
                    try {
                        if (state.land[plants[i]].sex === 'male' && state.land[plants[i]].stage > 3) {
                            var pollen1 = {
                                strain: state.land[plants[i]].strain,
                                owner: state.land[plants[i]].owner,
                                traits: ['Beta Pollen'],
                                terps: [],
                                thc: 'coming soon',
                                cbd: 'coming soon',
                                familyTree: state.land[plants[i]].strain,
                                father: 'Sensimilla',
                                hybrid: false
                            }
                            var pollen2 = {
                                strain: state.land[plants[i]].strain,
                                owner: state.land[plants[i]].owner,
                                traits: ['Beta Pollen'],
                                terps: [],
                                thc: 'coming soon',
                                cbd: 'coming soon',
                                familyTree: state.land[plants[i]].strain,
                                father: 'Sensimilla',
                                hybrid: false
                            }

                            const parcel = {
                                owner: state.land[plants[i]].owner,
                                strain: '',
                                xp: 0,
                                care: [
                                    [processor.getCurrentBlockNumber(), 'tilled']
                                ],
                                aff: [],
                                terps: [],
                                stats: [],
                                stage: -1,
                                substage: 0,
                                pollinated: false
                            }
                            state.land[plants[i]] = parcel;

                            state.users[state.land[plants[i]].owner].pollen.push(pollen1)
                            state.users[state.land[plants[i]].owner].pollen.push(pollen2)
                            state.users[state.land[plants[i]].owner].xps += 25;

                        }
                    } catch (e) {
                        console.log('pollen harvested', e.message)
                    }
                }
            } catch (e) {
                state.cs[`${json.block_num}:${from}`] = `${from} can't harvest what is not theirs`
            }
        }

        ///----------------------------------------------------------------------------------------

        state.cs[`${json.block_num}:${from}`] = `${from} harvested ${plantnames}`
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

    // search for qwoyn_kief from user on blockchain since genesis
    processor.on('craft_kief', function(json, from) {
        let buds = json.buds,
            budNames = '',
            dateCreated = json.block_num
        var bud = ''

        try {
            for (var i = 0; i < state.users[from].buds.length; i++) {
                if (state.users[from].buds[i].strain == json.buds && state.users[from].xps > 99) { bud = state.users[from].buds.splice(i, 1)[0]; break; }
            }
        } catch (e) {}
        if (!bud) {
            try {
                if (state.users[from].buds.length) bud == state.users[from].buds.splice(0, 1)[0]
            } catch (e) {}
        }

        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'crafted_kief']);
            budNames += `${buds}`;

            state.users[from].kiefbox--;

            var kief = {
                strain: buds,
                createdBy: from,
                createdOn: dateCreated
            }
            if (state.users[from].xps > 99) {
                state.users[from].kief.push(kief)
            }
        }

        state.users[from].xps += 50;
        state.cs[`${json.block_num}:${from}`] = `${from} crafted kief with ${budNames}`
    });

    // search for qwoyn_joint from user on blockchain since genesis
    processor.on('craft_joint', function(json, from) {
        let buds = json.buds,
            budNames = '',
            dateCreated = json.block_num
        var bud = ''

        try {
            for (var i = 0; i < state.users[from].buds.length; i++) {
                if (state.users[from].buds[i].strain == json.buds && state.users[from].xps > 99) { bud = state.users[from].buds.splice(i, 1)[0]; break; }
            }
        } catch (e) {}
        if (!bud) {
            try {
                if (state.users[from].buds.length) bud == state.users[from].buds.splice(0, 1)[0]
            } catch (e) {}
        }

        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'crafted_joint']);
            budNames += `${buds}`;

            state.users[from].papers--;

            var joint = {
                strain: buds,
                createdBy: from,
                createdOn: dateCreated
            }

            if (state.users[from].xps > 99) {
                state.users[from].joints.push(joint)
            }
        }
        state.users[from].xps += 25;
        state.cs[`${json.block_num}:${from}`] = `${from} crafted edibles with ${budNames}`
    });

    // search for qwoyn_joint from user on blockchain since genesis
    processor.on('craft_blunt', function(json, from) {
        let buds = json.buds,
            budNames = ''
        dateCreated = json.block_num
        var bud = ''

        try {
            for (var i = 0; i < state.users[from].buds.length; i++) {
                if (state.users[from].buds[i].strain == json.buds && state.users[from].xps > 4999) { bud = state.users[from].buds.splice(i, 1)[0]; break; }
            }
        } catch (e) {}
        
        state.cs[`${json.block_num}:${from}`] = `${from} crafted a blunt with ${budNames}`
    });

    // search for qwoyn_pollinate from user on blockchain since genesis
    processor.on('craft_pinner_joint', function(json, from) {
        let buds = json.buds,
            budNames = '',
            oil = json.oil,
            oilNames = '',
            kief = json.kief,
            kiefNames = ''
        for (var i = 0; i < 1; i++) {}
        state.cs[`${json.block_num}:${from}`] = `${from} created a moonrock from ${budNames} bud, ${oilNames} oil and ${kiefNames} kief`
    });

    // search for qwoyn_craft_moonrocks from user on blockchain since genesis
    processor.on('craft_wax_joint', function(json, from) {
        let buds = json.buds,
            budNames = '',
            oil = json.oil,
            oilNames = '',
            kief = json.kief,
            kiefNames = ''
        
        state.cs[`${json.block_num}:${from}`] = `${from} created a dipped joint from ${budNames} bud, ${oilNames} oil and ${kiefNames} kief`
    });

    // search for qwoyn_craft_cannagar from user on blockchain since genesis
    processor.on('craft_kief_joint', function(json, from) {
        let buds = json.buds,
            budNames = '',
            oil = json.oil,
            oilNames = '',
            kief = json.kief,
            kiefNames = ''

        
        state.cs[`${json.block_num}:${from}`] = `${from} created a cannagar from ${budNames} bud, ${oilNames} oil and ${kiefNames} kief`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_joint', function(json, from) {
        let joint = json.joint,
            jointName = '',
            friend1 = json.friend1,
            friend1Name = '',
            friend2 = json.friend2,
            friend2Name = '',
            friend3 = json.friend3,
            friend3Name = '',
            friend4 = json.friend4,
            friend4Name = '',
            friend5 = json.friend5,
            friend5Name = ''
        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${jointName} joint with ${friend1Name}, ${friend2Name}, ${friend3Name}, ${friend4Name} and ${friend5Name}`
    });

    // search for qwoyn_smoke_blunt from user on blockchain since genesis
    processor.on('smoke_blunt', function(json, from) {
        let blunt = json.blunt,
            bluntName = '',
            friend1 = json.friend1,
            friend1Name = '',
            friend2 = json.friend2,
            friend2Name = '',
            friend3 = json.friend3,
            friend3Name = '',
            friend4 = json.friend4,
            friend4Name = '',
            friend5 = json.friend5,
            friend5Name = ''
        
        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${bluntName} joint with ${friend1Name}, ${friend2Name}, ${friend3Name}, ${friend4Name} and ${friend5Name}`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_kief_joint', function(json, from) {
        let edibles = json.edibles,
            ediblesName = '',
            friend1 = json.friend1,
            friend1Name = '',
            friend2 = json.friend2
       
        state.cs[`${json.block_num}:${from}`] = `${from} ate a ${ediblesName} brownie with ${friend1Name} and ${friend2Name}`
    });

    // search for qwoyn_smoke_blunt from user on blockchain since genesis
    processor.on('smoked_wax_joint', function(json, from) {
        let dippedJoint = json.dippedJoint,
            dippedJointName = '',
            friend1 = json.friend1,
            friend1Name = '',
            friend2 = json.friend2,
            friend2Name = '',
            friend3 = json.friend3,
            friend3Name = '',
            friend4 = json.friend4,
            friend4Name = '',
            friend5 = json.friend5,
            friend5Name = ''
       
        
        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${dippedJointName} dipped joint with ${friend1Name}, ${friend2Name}, ${friend3Name}, ${friend4Name} and ${friend5Name}`
    });

    // search for qwoyn_smoke_blunt from user on blockchain since genesis
    processor.on('smoked_splif_joint', function(json, from) {
        let cannagar = json.cannagar,
            cannagarName = '',
            friend1 = json.friend1,
            friend1Name = '',
            friend2 = json.friend2,
            friend2Name = '',
            friend3 = json.friend3,
            friend3Name = '',
            friend4 = json.friend4,
            friend4Name = '',
            friend5 = json.friend5,
            friend5Name = ''
        
        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${cannagarName} cannagar with ${friend1Name}, ${friend2Name}, ${friend3Name}, ${friend4Name} and ${friend5Name}`
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
    

    // checks for qwoyn_plant and plants the seed
    processor.on('plant', function(json, from) {
        var index, seed = ''
        if (!seed) {
            try {
                if (state.users[from].seeds.length) seed == state.users[from].seeds.splice(0, 1)[0]
            } catch (e) {}
        }
        if (index >= 0 && seed) {
            if (!state.land[json.addr]) {
                const parcel = {
                    owner: from,
                    strain: seed.strain,
                    xp: seed.xp,
                    care: [],
                    aff: [],
                    inv: [],
                    terps: [seed.terps],
                    traits: [seed.traits],
                    planted: processor.getCurrentBlockNumber(),
                    stage: 1,
                    substage: 0,
                    pollinated: seed.pollinated,
                    father: seed.father,
                    hybrid: seed.hybrid
                }
                state.land[json.addr] = parcel
            } else if (state.land[json.addr].stage < 0) {
                state.cs[`${json.block_num}:${from}`] = `planted on harvested plot ${json.addr} `
                state.land[json.addr].strain = seed.strain
                state.land[json.addr].xp = seed.xp
                state.land[json.addr].care = []
                state.land[json.addr].aff = []
                state.land[json.addr].inv = []
                state.land[json.addr].traits = seed.traits || []
                state.land[json.addr].terps = seed.terps || []
                state.land[json.addr].planted = processor.getCurrentBlockNumber()
                state.land[json.addr].stage = 1
                state.land[json.addr].substage = 0
                state.land[json.addr].pollinated = seed.pollinated
                state.land[json.addr].father = seed.father
                state.land[json.addr].hybrid = seed.hybrid
            } else {
                state.users[from].seeds.unshift(seed);
                state.cs[`${json.block_num}:${from}`] = `${from} can't plant that.`
            }
        } else if (seed) {
            state.users[from].seeds.unshift(seed);
            state.cs[`${json.block_num}:${from}`] = `${from} doesn't own that plot`
        } else {
            state.cs[`${json.block_num}:${from}`] = `${from} did something unexpected with a plant!`
        }
    });

    processor.onOperation('transfer', function(json, from) {
        if (json.to == username && json.amount.split(' ')[1] == 'HIVE') {
                                        //if user does not exist in db create user and db entry
                                        if (!state.users[json.from]) {
                                            state.users[json.from] = {
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
                                                plotCount: 0,
                                                seedCount: 0,
                                                seeds: [],
                                                water: 0,
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
                                                recollectors: {
                                                    lvl1: 0,
                                                    lvl2: 0,
                                                    lvl3: 0,
                                                    lvl4: 0,
                                                    lvl5: 0,
                                                    lvl7: 0,
                                                    lvl8: 0,
                                                    vl9: 0,
                                                    lvl10: 0
                                                },
                                                buds: 0,
                                                xp: 0,
                                                lvl: 1,
                                                role: 1,
                                                joints: {
                                                    splif: 0,
                                                    joint: 0,
                                                    cone: 0,
                                                    kiefJoint: 0,
                                                    waxJoint: 0,
                                                    blunt: 0
                                                },
                                                MOTA: 0,
                                                MOTAstake: 0
                                            }

                                            state.stats.farmers++
                                            state.stats.farmerList.push(json.from)
                                        }

                                //purchasing
                                const amount = parseInt(parseFloat(json.amount) * 1000)
                                var want = json.memo.split(" ")[0].toLowerCase() || json.memo.toLowerCase(),
                                    type = json.memo.split(" ")[1] || ''
                                if (want === 'asia' && amount > (state.stats.prices.land.asia.price * 1000) - 3000 &&  amount < (state.stats.prices.land.asia.price * 1000) + 3000 && state.stats.supply.land.asia >= 1
                                || want === 'afghanistan' && amount > (state.stats.prices.land.afghanistan.price * 1000) - 3000 &&  amount < (state.stats.prices.land.afghanistan.price * 1000) + 3000 && state.stats.supply.land.afghanistan >= 1
                                || want === 'africa' && amount > (state.stats.prices.land.africa.price * 1000) - 3000 &&  amount < (state.stats.prices.land.africa.price * 1000) + 3000 && state.stats.supply.land.africa >= 1
                                || want === 'jamaica' && amount > (state.stats.prices.land.jamaica.price * 1000) - 3000 &&  amount < (state.stats.prices.land.jamaica.price * 1000) + 3000 && state.stats.supply.land.jamaica >= 1
                                || want === 'mexico' && amount > (state.stats.prices.land.mexico.price * 1000) - 3000 &&  amount < (state.stats.prices.land.mexico.price * 1000) + 3000 && state.stats.supply.land.mexico >= 1
                                || want === 'southAmerica' && amount > (state.stats.prices.land.southAmerica.price * 1000) - 3000 &&  amount < (state.stats.prices.land.southAmerica.price * 1000) + 3000 && state.stats.supply.land.southAmerica >= 1
                                //purchase 
                                || want === 'asia_bundle' && amount > (state.stats.prices.bundles.asiaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.asiaBundle * 1000) + 3000 && state.stats.supply.land.asia >= 1
                                || want === 'afghanistan_bundle' && amount > (state.stats.prices.bundles.afghanistanBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.afghanistanBundle * 1000) + 3000 && state.stats.supply.land.afghanistan >= 1
                                || want === 'africa_bundle' && amount > (state.stats.prices.bundles.africaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.africaBundle * 1000) + 3000 && state.stats.supply.land.frica >= 1    
                                || want === 'jamaica_bundle' && amount > (state.stats.prices.bundles.jamaicaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.jamaicaBundle * 1000) + 3000 && state.stats.supply.land.jamaica >= 1
                                || want === 'mexico_bundle' && amount > (state.stats.prices.bundles.mexicoBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.mexicoBundle * 1000) + 3000 && state.stats.supply.land.mexico >= 1
                                || want === 'southAmerica_bundle' && amount > (state.stats.prices.bundles.southAmericaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.southAmericaBundle * 1000) + 3000 && state.stats.supply.land.southAmerica >= 1
                                //purchase water plants
                                || want === 'water1' && amount > (state.stats.prices.waterPlant.lvl1.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl1.price * 1000) + 3000 && type === '1' 
                                || want === 'water2' && amount > (state.stats.prices.waterPlant.lvl2.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl2.price * 1000) + 3000 && type === '2' && state.stats.users[json.from].lvl >= 10
                                || want === 'water3' && amount > (state.stats.prices.waterPlant.lvl3.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl3.price * 1000) + 3000 && type === '3' && state.stats.users[json.from].lvl >= 20
                                || want === 'water4' && amount > (state.stats.prices.waterPlant.lvl4.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl4.price * 1000) + 3000 && type === '4' && state.stats.users[json.from].lvl >= 30
                                || want === 'water5' && amount > (state.stats.prices.waterPlant.lvl5.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl5.price * 1000) + 3000 && type === '5' && state.stats.users[json.from].lvl >= 40
                                || want === 'water6' && amount > (state.stats.prices.waterPlant.lvl6.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl6.price * 1000) + 3000 && type === '6' && state.stats.users[json.from].lvl >= 50
                                || want === 'water7' && amount > (state.stats.prices.waterPlant.lvl7.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl7.price * 1000) + 3000 && type === '7' && state.stats.users[json.from].lvl >= 60
                                || want === 'water8' && amount > (state.stats.prices.waterPlant.lvl8.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl8.price * 1000) + 3000 && type === '8' && state.stats.users[json.from].lvl >= 70
                                || want === 'water9' && amount > (state.stats.prices.waterPlant.lvl9.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl9.price * 1000) + 3000 && type === '9' && state.stats.users[json.from].lvl >= 80
                                || want === 'water10' && amount > (state.stats.prices.waterPlant.lvl10.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl10.price * 1000) + 3000 && type === '10' && state.stats.users[json.from].lvl >= 90) {
                                    if (want == 'asia_bundle' && amount > (state.stats.prices.bundles.asiaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.asiaBundle * 1000) + 3000 && state.stats.supply.land.asia != 0) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++

                                // add 1 plot to user inventory
                                state.users[json.from].plots.asia++

                                //add 1 water to user inventory
                                state.users[json.from].waterPlants.lvl1++

                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.asia -= 1

                                // adds 1 plot to plots used count
                                state.stats.supply.land.asiaC +=1

                                // adds water to users water supply
                                state.users[json.from].water += 30

                                // adds 1 seed to users seedCount
                                state.users[json.from].seedCount++

                                // create one seed nft and return type of seed
                                contract.createOneSeed(hivejs, 1, json.from).then(res => {
                                    const seedData = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                                    //update total seed count since genesis
                                    state.stats.seedCount++

                                    let strain = seedData.NAME

                                    if(strain === "Aceh"){ 
                                        strain = "ach"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                ach: []
                                            }
                                        }
                                    } else if(strain === "Thai"){ 
                                        strain = "tha"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                tha: []
                                            }
                                        }
                                    } else if(strain === "Thai Chocolate"){ 
                                        strain = "cht"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                cht: []
                                            }
                                        }

                                        var seedName = {
                                            name: seedData.NAME,
                                            spt: seedData.SPT,
                                            water: seedData.WATER, 
                                            pr: seedData.PR,
                                            planted: false
                                        }
    
                                        state.users[json.from].seeds[strain].push(seedName)
                                    } 
                                })

                                // create one asia plot NFT
                                contract.createPlot(hivejs,"Asia",1,json.from)

                                // create level 1 water plant
                                contract.createWater(hivejs,"Water",30,json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased an asia bundle`
                             
                                } if (want == 'jamaica_bundle' && amount > (state.stats.prices.bundles.jamaicaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundle.jamaicaBundle * 1000) + 3000 && state.stats.supply.land.jamaica >= 1) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // add 1 plot to user inventory
                                state.users[json.from].plots.jamaica++

                                //add 1 water to user inventory
                                state.users[json.from].waterPlants.lvl1++

                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.jamaicaC -= 1

                                // adds 1 plot to plots used count
                                state.stats.supply.land.jamaicaC += 1

                                // adds water to users water supply
                                state.users[json.from].water += 30

                                // adds 1 seed to users seedCount
                                state.users[json.from].seedCount++

                                // create one seed nft and return type of seed
                                contract.createOneSeed(hivejs, 2, json.from).then(res => {
                                    const seedData = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                                    //update total seed count since genesis
                                    state.stats.seedCount++

                                    let strain = seedData.NAME
                                    
                                    if(strain === "Lamb's Bread")
                                    { 
                                        strain = "lb"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                lb: []
                                            }
                                        }
                                    } else if(strain === "King's Bread")
                                    { 
                                        strain = "kbr"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                kbr: []
                                            }
                                        }

                                        var seedName = {
                                            name: seedData.NAME,
                                            spt: seedData.SPT,
                                            water: seedData.WATER, 
                                            pr: seedData.PR,
                                            planted: false
                                        }
    
                                        state.users[json.from].seeds[strain].push(seedName)
                                    } 
                                })

                                // create one jamaica plot NFT
                                contract.createPlot(hivejs,"Jamaica",1,json.from)

                                // create one lvl 1 water plant NFT
                                contract.createWater(hivejs,"Water",30,json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased a jamaica bundle`
                             
                                } if (want == 'africa_bundle' && amount > (state.stats.prices.bundles.africaBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.africaBundle * 1000) + 3000 && state.stats.supply.land.africa >= 1) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // add 1 plot to user inventory
                                state.users[json.from].plots.africa++

                                //add 1 water tower to user inventory
                                state.users[json.from].waterPlants.lvl1++

                                // subtracts 1 plot from total land supply
                                state.stats.supply.land.africa -= 1

                                // adds 1 plot to plots used count
                                state.stats.supply.land.africaC += 1

                                // adds water to users water supply
                                state.users[json.from].water += 30

                                // adds 1 seed to users seedCount
                                state.users[json.from].seedCount++

                                // create one seed nft and return type of seed
                                contract.createOneSeed(hivejs, 1, json.from).then(res => {
                                    const seedData = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                                    //update total seed count since genesis
                                    state.stats.seedCount++

                                    let strain = seedData.NAME
                                    
                                    if(strain === "Swazi Gold")
                                    { 
                                        strain = "sg"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                sg: []
                                            }
                                        }
                                    } else if(strain === "Kilimanjaro")
                                    { 
                                        strain = "kmj"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                kmj: []
                                            }
                                        }
                                    } else if(strain === "Durban Poison") { 
                                        strain = "dp"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                dp: []
                                            }
                                        }
                                    } else if(strain === "Malawi") { 
                                        strain = "mal"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                mal: []
                                            }
                                        }

                                        var seedName = {
                                            name: seedData.NAME,
                                            spt: seedData.SPT,
                                            water: seedData.WATER, 
                                            pr: seedData.PR,
                                            planted: false
                                        }
    
                                        state.users[json.from].seeds[strain].push(seedName)
                                    }
                                })

                                // create one africa NFT
                                contract.createPlot(hivejs,"Africa",1,json.from);

                                // create one lvl 1 water nft
                                contract.createWater(hivejs,"Water",30,json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased an africa bundle`
                             
                                } if (want == 'afghanistan_bundle' && amount > (state.stats.prices.bundles.afghanistanBundle.price * 1000) - 3000 &&  amount < (state.stats.prices.bundles.afghanistanBundle.price * 1000) + 3000 && state.stats.supply.land.afghanistan >= 1) {
                                
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
                                contract.createOneSeed(hivejs, 1, json.from).then(res => {
                                    const seedData = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                                    //update total seed count since genesis
                                    state.stats.seedCount++

                                    let strain = seedData.NAME

                                    if(strain === "Hindu Kush") { 
                                        strain = "hk"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                hk: []
                                            }
                                        }
                                    } else if(strain === "Afghani") { 
                                        strain = "afg"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                afg: []
                                            }
                                        }
                                    } else if(strain === "Lashkar Gah") { 
                                        strain = "lg"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                lg: []
                                            }
                                        }
                                    } else if(strain === "Mazar I Sharif") { 
                                        strain = "mis"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                mis: []
                                            }
                                        }

                                        var seedName = {
                                            name: seedData.NAME,
                                            spt: seedData.SPT,
                                            water: seedData.WATER, 
                                            pr: seedData.PR,
                                            planted: false
                                        }
    
                                        state.users[json.from].seeds[strain].push(seedName)
                                    }
                                })

                                // create one afghanistan plot NFT
                                contract.createPlot(hivejs,"Afghanistan",1,json.from);

                                // create one water lvl 1 water NFT
                                contract.createWater(hivejs,"Water",30,json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased an afghanistan bundle`
                             
                                } if (want == 'mexico_bundle' && amount > (state.stats.prices.bundles.mexicoBundle * 1000) - 3000 &&  amount < (state.stats.prices.bundles.mexicoBundle * 1000) + 3000 && state.stats.supply.land.mexico >= 1) {
                                
                                // update total number of plots
                                state.users[json.from].plotCount++
                                
                                // subtracts 1 plot from total land supply and adds one to land taken
                                state.stats.supply.land.mexico--
                                state.stats.supply.land.mexicoC++

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
                                contract.createOneSeed(hivejs, 5, json.from).then((res) => {
                                    const seedData = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                                    //update total seed count since genesis
                                    state.stats.seedCount++

                                    let strain = seedData.NAME

                                    if(strain === "Acapulco Gold") { 
                                        strain = "aca"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                aca: []
                                            }
                                        }

                                        var seedName = {
                                            name: seedData.NAME,
                                            spt: seedData.SPT,
                                            water: seedData.WATER, 
                                            pr: seedData.PR,
                                            planted: false
                                        }
    
                                        state.users[json.from].seeds[strain].push(seedName)
                                    }
                                })
                                
                                // create one mexico NFT
                                contract.createPlot(hivejs,"Mexico",1,json.from);
                                console.log("createdPlot")

                                // create one lvl 1 water nft
                                contract.createWater(hivejs,"Water",30,json.from)
                                console.log("created water")
                            
                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased a mexico bundle`
                             
                                } if (want == 'southAmerica_bundle' && amount > (state.stats.prices.bundles.southAmericaBundle.price * 1000) - 3000 &&  amount < (state.stats.prices.bundles.southAmericaBundle * 1000) + 3000 && state.stats.supply.land.southAmerica >= 1) {
                                
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
                                contract.createOneSeed(hivejs, 6, json.from).then(res => {
                                    const seedData = JSON.parse(res.operations[0][1].json).contractPayload.instances[0].properties

                                    //update total seed count since genesis
                                    state.stats.seedCount++

                                    let strain = seedData.NAME

                                    if(strain === "Colombian Gold")
                                    { 
                                        strain = "cg"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                cg: []
                                            }
                                        }
                                    } else if(strain === "Panama Red")
                                    { 
                                        strain = "pr"

                                        if(!state.users[json.from].seeds[strain])
                                        {
                                            state.users[json.from].seeds = {
                                                pr: []
                                            }
                                        }

                                        var seedName = {
                                            name: seedData.NAME,
                                            spt: seedData.SPT,
                                            water: seedData.WATER, 
                                            pr: seedData.PR,
                                            planted: false
                                        }
    
                                        state.users[json.from].seeds[strain].push(seedName)
                                    } 
                                })

                                // create one south america NFT
                                contract.createPlot(hivejs,"South America",1,json.from);

                                // create one lvl 1 water NFT
                                contract.createWater(hivejs,"Water",30,json.from)

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
                             } else if (want === 'water2' && amount > (state.stats.prices.waterPlant.lvl2.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl2.price * 1000) + 3000 && type === '2' && state.stats.users[json.from].lvl >= 10) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl2

                                // add 1 plot to user inventory
                                state.users[from].waterPlants.lvl2++

                                // create nft
                                contract.createWater(hivejs, "Water", 2, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water3' && amount > (state.stats.prices.waterPlant.lvl3.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl3.price * 1000) + 3000 && type === '3' && state.stats.users[json.from].lvl >= 20) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl3

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl3++

                                // create nft
                                contract.createWater(hivejs, "Water", 3, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water4' && amount > (state.stats.prices.waterPlant.lvl4.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl4.price * 1000) + 3000 && type === '4' && state.stats.users[json.from].lvl >= 30) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl4

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl4++

                                // create nft
                                contract.createWater(hivejs, "Water", 4, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water5' && amount > (state.stats.prices.waterPlant.lvl5.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl5.price * 1000) + 3000 && type === '5' && state.stats.users[json.from].lvl >= 40) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl5

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl5++

                                // create nft
                                contract.createWater(hivejs, "Water", 5, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water6' && amount > (state.stats.prices.waterPlant.lvl6.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl6.price * 1000) + 3000 && type === '6' && state.stats.users[json.from].lvl >= 50) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl6

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl6++

                                // create nft
                                contract.createWater(hivejs, "Water", 6, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water7' && amount > (state.stats.prices.waterPlant.lvl7.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl7.price * 1000) + 3000 && type === '7' && state.stats.users[json.from].lvl >= 60) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl7

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl7++

                                // create nft
                                contract.createWater(hivejs, "Water", 7, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water8' && amount > (state.stats.prices.waterPlant.lvl8.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl8.price * 1000) + 3000 && type === '8' && state.stats.users[json.from].lvl >= 70) {
                                
                                // update total number of plots
                                state.users[from].water += state.stats.waterPlant.lvl8

                                // add 1 plot to user inventory
                                state.users[from].waterPlants.lvl8++

                                // create nft
                                contract.createWater(hivejs, "Water", 8, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water9' && amount > (state.stats.prices.waterPlant.lvl9.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl9.price * 1000) + 3000 && type === '9' && state.stats.users[json.from].lvl >= 80) {
                                
                                // update total number of plots
                                state.users[json.from].water += state.stats.waterPlant.lvl9

                                // add 1 plot to user inventory
                                state.users[json.from].waterPlants.lvl9++

                                // create nft
                                contract.createWater(hivejs, "Water", 9, json.from)

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${json.want}`
                             } else if (want === 'water10' && amount > (state.stats.prices.waterPlant.lvl10.price * 1000) - 3000 &&  amount < (state.stats.prices.waterPlant.lvl10.price * 1000) + 3000 && type === '10' && state.stats.users[json.from].lvl >= 90) {
                                
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
                        } else {
                            state.bal.r += amount
                            state.refund.push(['xfer', json.from, amount, 'something strange happened your item might not be available or try again'])
                            state.cs[`${json.block_num}:${json.from}`] = `${json.from} sent a weird transfer trying to purchase seeds, land or water.`
                            }
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
    var grown = false
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
    }
}