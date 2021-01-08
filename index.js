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

// example contract.createBud(hive, "ricabud", 1, "chocolatoso")

//contract.createSeed(hive, 2, "chocolatoso")

//contract.createBooster(hive, "BOOSTER LVL1", "Time", "chocolatoso")

//contract.createPlot(hive,"Asia",1,"chocolatoso");

//contract.createWater(hive,"Water",1,"chocolatoso")


var dhive = require("@hiveio/dhive");
var hivejs = require('@hiveio/hive-js');
var axios = require('axios');
const config = require('./config');
var steemState = require('./processor');
var steemTransact = require('steem-transact');
var fs = require('fs');
const cors = require('cors');
const express = require('express')
const ENV = process.env;
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

/*plot info from state.js by plot number
            {
            "owner": "qwoyn",
            "strain": "",
            "xp": 0,
            "care": [
                [
                    39562272,
                    "watered"
                ],
                [
                    39533519,
                    "watered"
                ],
                [
                    39504770,
                    "watered",
                    "c"
                ]
            ],
            "aff": [],
            "stage": -1,
            "substage": 0,
            "traits": [],
            "terps": [],
            "id": "a10"
            }
*/
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

//overal game stats i.e. number of gardeners, number of plants available, seed prices, land price, weather info
//at each location such as mexico or jamaica etc.
app.get('/stats', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    Object.keys(state.users).length
    var ret = state.stats
    ret.gardeners = Object.keys(state.users).length
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

app.listen(port, () => console.log(`HASHKINGS token API listening on port ${port}!`))
var state;
var startingBlock = ENV.STARTINGBLOCK || 50253995; //GENESIS BLOCK
const username = ENV.ACCOUNT || 'hashkings'; //account with all the SP
const key = dhive.PrivateKey.from(ENV.skey); //active key for account
const ago = ENV.ago || 50253995;
const prefix = ENV.PREFIX || 'qwoyn_'; // part of custom json visible on the blockchain during watering etc..
var client = new dhive.Client([
    "https://hive.roelandp.nl"
    //"https://api.pharesim.me",
    //"https://hived.privex.io",
    //"https://api.hive.blog"
], {consoleOnFailover: true});
var processor;
var recents = [];

const { ChainTypes, makeBitMaskFilter } = require('@hiveio/hive-js/lib/auth/serializer')
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

function startApp() {
    if (state.cs == null) {
        state.cs = {}
    }
    processor = steemState(client, dhive, startingBlock, 10, prefix);

    processor.onBlock(function(num, block) {
        var td = []
        for (var i = 0; i < td.length; i++) {
            daily(td[i])
        }

        //processes payments from state.refund
        if (num % 5 === 0 && state.refund.length && processor.isStreaming() || processor.isStreaming() && state.refund.length > 60) {
            if (state.refund[0].length == 4) {
                bot[state.refund[0][0]].call(this, state.refund[0][1], state.refund[0][2], state.refund[0][3])
            } else if (state.refund[0].length == 3) {
                bot[state.refund[0][0]].call(this, state.refund[0][1], state.refund[0][2])
            } else if (state.refund[0].length == 2) {
                bot[state.refund[0][0]].call(this, state.refund[0][1])
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
                
                // sets state to seed price
                state.stats.prices.seedPacks.price = Math.ceil((assetPrice * 5));

                state.stats.prices.land.asia = Math.ceil((assetPrice * 15));
                state.stats.prices.land.africa = Math.ceil((assetPrice * 7.5));
                state.stats.prices.land.afghanistan = Math.ceil((assetPrice * 5));
                state.stats.prices.land.southAmerica = Math.ceil((assetPrice * 1.75));
                state.stats.prices.land.jamaica = Math.ceil((assetPrice * 9.75));
                state.stats.prices.land.mexico = Math.ceil((assetPrice * 3.50));
                //sets cut to 0 because bal.c is deprecated
                state.bal.c = 0

                //logging for testing will remove after a while
                console.log('------------------------');
                console.log('at block ' + num);
                console.log('Seed Pack price is ' + state.stats.prices.seedPacks.price);
                console.log('------------------------');
                console.log('Asia price is ' + state.stats.prices.land.asia);
                console.log('Africa price is ' + state.stats.prices.land.africa);
                console.log('Afghanistan price is ' + state.stats.prices.land.afghanistan);
                console.log('South America price is ' + state.stats.prices.land.southAmerica);
                console.log('Jamaica price is ' + state.stats.prices.land.jamaica);
                console.log('Mexico price is ' + state.stats.prices.land.mexico);
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
        let plants = json.plants,
            plantnames = '',
            harvester = json.from
        for (var i = 0; i < plants.length; i++) {
            try {
                if (state.land[plants[i]].owner === from) {
                    state.land[plants[i]].care.unshift([processor.getCurrentBlockNumber(), 'harvested']);
                    plantnames += `${plants[i]} `

                    ///---------------------------------------------------------------------------------------
                    //female harvested pollinated plant
                    try {
                        if (state.land[plants[i]].sex === 'female' && state.land[plants[i]].pollinated === true && state.land[plants[i]].stage > 3) {
                            var harvestedSeed = {
                                strain: state.land[plants[i]].strain,
                                owner: state.land[plants[i]].owner,
                                traits: ['beta pollinated seed'],
                                terps: [],
                                thc: 'coming soon',
                                cbd: 'coming soon',
                                breeder: state.land[plants[i]].owner,
                                familyTree: state.land[plants[i]].strain,
                                pollinated: false,
                                father: "",
                                hybrid: state.land[plants[i]].strain + " x " + state.land[plants[i]].father
                            }
                            var harvestedSeed2 = {
                                strain: state.land[plants[i]].strain,
                                owner: state.land[plants[i]].owner,
                                traits: ['beta pollinated seed'],
                                terps: [],
                                thc: 'coming soon',
                                cbd: 'coming soon',
                                familyTree: state.land[plants[i]].strain,
                                pollinated: false,
                                father: "",
                                hybrid: state.land[plants[i]].strain + " x " + state.land[plants[i]].father
                            }

                            const parcel = {
                                owner: state.land[plants[i]].owner,
                                strain: '',
                                xp: 0,
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

                            state.users[state.land[plants[i]].owner].seeds.push(harvestedSeed)
                            state.users[state.land[plants[i]].owner].seeds.push(harvestedSeed2)
                            state.users[state.land[plants[i]].owner].xps += 25;

                        }
                    } catch (e) {
                        console.log('', e.message)
                    }

                    //harvest buds if female not pollinated
                    try {
                        if (state.land[plants[i]].sex === 'female' && state.land[plants[i]].pollinated === false && state.land[plants[i]].stage > 3) {
                            var bud1 = {
                                strain: state.land[plants[i]].strain,
                                owner: state.land[plants[i]].owner,
                                traits: ['Beta Buds'],
                                terps: [state.land[plants[i]].strain.terps],
                                thc: 'coming soon',
                                cbd: 'coming soon',
                                familyTree: state.land[plants[i]].strain,
                                father: 'Sensimilla',
                                hybrid: false
                            }
                            var bud2 = {
                                strain: state.land[plants[i]].strain,
                                owner: state.land[plants[i]].owner,
                                traits: ['Beta Buds'],
                                thc: 'coming soon',
                                cbd: 'coming soon',
                                terps: [state.land[plants[i]].strain.terps],
                                familyTree: state.land[plants[i]].strain,
                                father: 'Sensimilla',
                                hybrid: false
                            }

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

                            state.users[state.land[plants[i]].owner].buds.push(bud1)
                            state.users[state.land[plants[i]].owner].buds.push(bud2)
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
        if (!bud) {
            try {
                if (state.users[from].buds.length) bud == state.users[from].buds.splice(0, 1)[0]
            } catch (e) {}
        }

        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'crafted_blunt']);
            budNames += `${buds}`;

            state.users[from].bluntwraps--;

            var blunt = {
                strain: buds,
                createdBy: from,
                createdOn: dateCreated
            }
            if (state.users[from].buds[i].strain == json.buds && state.users[from].xps > 4999) {
                state.users[from].blunts.push(blunt)
            }

        }
        state.users[from].xps += 250;
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
        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'crafted_moonrocks']);
            budNames += `${buds}`;
            oilNames += `${oil}`;
            kiefNames += `${kief}`;

            var bud = ''

            try {
                for (var i = 0; i < state.users[from].buds.length; i++) {
                    if (state.users[from].buds[i].strain == json.buds) { bud = state.users[from].buds.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!bud) {
                try {
                    if (state.users[from].buds.length) bud == state.users[from].buds.splice(0, 1)[0]
                } catch (e) {}
            }

            var kiefs = ''

            try {
                for (var i = 0; i < state.users[from].kief.length; i++) {
                    if (state.users[from].kief[i].strain == json.kief) { kiefs = state.users[from].kief.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!kiefs) {
                try {
                    if (state.users[from].kief.length) kiefs == state.users[from].kief.splice(0, 1)[0]
                } catch (e) {}
            }

            var oils = ''

            try {
                for (var i = 0; i < state.users[from].oil.length; i++) {
                    if (state.users[from].oil[i].strain == json.oil) { oils = state.users[from].oil.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!oils) {
                try {
                    if (state.users[from].oil.length) oils == state.users[from].oil.splice(0, 1)[0]
                } catch (e) {}
            }

            var craftedMoonrock = {
                buds: buds,
                oil: oil,
                kief: kief,
                createdBy: from,
                createdOn: json.block_num
            }

            state.users[from].moonrocks.push(craftedMoonrock)
        }
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
        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'crafted_dipped_joint']);
            budNames += `${buds}`;
            oilNames += `${oil}`;
            kiefNames += `${kief}`;

            state.users[from].papers--;

            var bud = ''

            try {
                for (var i = 0; i < state.users[from].buds.length; i++) {
                    if (state.users[from].buds[i].strain == json.buds && state.users[from].xps > 99999) { bud = state.users[from].buds.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!bud) {
                try {
                    if (state.users[from].buds.length) bud == state.users[from].buds.splice(0, 1)[0]
                } catch (e) {}
            }

            var kiefs = ''

            try {
                for (var i = 0; i < state.users[from].kief.length; i++) {
                    if (state.users[from].kief[i].strain == json.kief && state.users[from].xps > 99999) { kiefs = state.users[from].kief.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!kiefs) {
                try {
                    if (state.users[from].kief.length) kiefs == state.users[from].kief.splice(0, 1)[0]
                } catch (e) {}
            }

            var oils = ''

            try {
                for (var i = 0; i < state.users[from].oil.length; i++) {
                    if (state.users[from].oil[i].strain == json.oil && state.users[from].xps > 99999) { oils = state.users[from].oil.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!oils) {
                try {
                    if (state.users[from].oil.length) oils == state.users[from].oil.splice(0, 1)[0]
                } catch (e) {}
            }

            var dippedJoint = {
                buds: buds,
                oil: oil,
                kief: kief,
                createdBy: from,
                createdOn: json.block_num
            }
            if (state.users[from].buds[i].strain == json.buds && state.users[from].xps > 99999) {
                state.users[from].dippedjoints.push(dippedJoint)
            }
        }
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

        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'crafted_cannagar']);
            budNames += `${buds}`;
            oilNames += `${oil}`;;
            kiefNames += `${kief}`;

            state.users[from].hempwraps--;

            var bud = ''

            try {
                for (var i = 0; i < state.users[from].buds.length; i++) {
                    if (state.users[from].buds[i].strain == json.buds && state.users[from].xps > 999999) { bud = state.users[from].buds.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!bud) {
                try {
                    if (state.users[from].buds.length) bud == state.users[from].buds.splice(0, 1)[0]
                } catch (e) {}
            }

            var kiefs = ''

            try {
                for (var i = 0; i < state.users[from].kief.length; i++) {
                    if (state.users[from].kief[i].strain == json.kief && state.users[from].xps > 999999) { kiefs = state.users[from].kief.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!kiefs) {
                try {
                    if (state.users[from].kief.length) kiefs == state.users[from].kief.splice(0, 1)[0]
                } catch (e) {}
            }

            var oils = ''

            try {
                for (var i = 0; i < state.users[from].oil.length; i++) {
                    if (state.users[from].oil[i].strain == json.oil && state.users[from].xps > 999999) { oils = state.users[from].oil.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!oils) {
                try {
                    if (state.users[from].oil.length) oils == state.users[from].oil.splice(0, 1)[0]
                } catch (e) {}
            }

            var cannagar = {
                buds: buds,
                oil: oil,
                kief: kief,
                createdBy: from,
                createdOn: json.block_num
            }
            if (state.users[from].xps > 999999) {
                state.users[from].cannagars.push(cannagar)
            }
        }
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
        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'smoked_joint']);
            jointName += `${joint}`;
            friend1Name += `${friend1}`;
            friend2Name += `${friend2}`;
            friend3Name += `${friend3}`;
            friend4Name += `${friend4}`;
            friend5Name += `${friend5}`;

            state.users[from].xps += 25;
            state.users[friend1].xps += 5;
            state.users[friend2].xps += 5;
            state.users[friend3].xps += 5;
            state.users[friend4].xps += 5;
            state.users[friend5].xps += 5;


            var joints = ''

            try {
                for (var i = 0; i < state.users[from].joints.length; i++) {
                    if (state.users[from].joints[i].strain == json.joint) { joints = state.users[from].joints.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!joints) {
                try {
                    if (state.users[from].joints.length) joints == state.users[from].joints.splice(0, 1)[0]
                } catch (e) {}
            }
        }
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
        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'smoked_blunt']);
            bluntName += `${blunt}`;
            friend1Name += `${friend1}`;
            friend2Name += `${friend2}`;
            friend3Name += `${friend3}`;
            friend4Name += `${friend4}`;
            friend5Name += `${friend5}`;

            state.users[from].xps += 50;
            state.users[friend1].xps += 10;
            state.users[friend2].xps += 10;
            state.users[friend3].xps += 10;
            state.users[friend4].xps += 10;
            state.users[friend5].xps += 10;


            var blunts = ''

            try {
                for (var i = 0; i < state.users[from].blunts.length; i++) {
                    if (state.users[from].blunts[i].strain == json.blunt) { blunts = state.users[from].blunts.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!blunts) {
                try {
                    if (state.users[from].blunts.length) blunts == state.users[from].blunts.splice(0, 1)[0]
                } catch (e) {}
            }
        }
        state.cs[`${json.block_num}:${from}`] = `${from} smoked a ${bluntName} joint with ${friend1Name}, ${friend2Name}, ${friend3Name}, ${friend4Name} and ${friend5Name}`
    });

    // search for qwoyn_smoke_joint from user on blockchain since genesis
    processor.on('smoke_kief_joint', function(json, from) {
        let edibles = json.edibles,
            ediblesName = '',
            friend1 = json.friend1,
            friend1Name = '',
            friend2 = json.friend2
        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'smoked_blunt']);
            ediblesName += `${edibles}`;
            friend1Name += `${friend1}`;
            friend2Name += `${friend2}`;

            state.users[from].xps += 50;
            state.users[friend1].xps += 25;
            state.users[friend2].xps += 25;

            var edible = ''

            try {
                for (var i = 0; i < state.users[from].blunts.length; i++) {
                    if (state.users[from].edibles[i].strain == json.edibles) { edible = state.users[from].edibles.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!edible) {
                try {
                    if (state.users[from].edibles.length) edible == state.users[from].edibles.splice(0, 1)[0]
                } catch (e) {}
            }
        }
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
        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'smoked_dipped_joint']);
            dippedJointName += `${dippedJoint}`;
            friend1Name += `${friend1}`;
            friend2Name += `${friend2}`;
            friend3Name += `${friend3}`;
            friend4Name += `${friend4}`;
            friend5Name += `${friend5}`;

            state.users[from].xps += 100;
            state.users[friend1].xps += 20;
            state.users[friend2].xps += 20;
            state.users[friend3].xps += 20;
            state.users[friend4].xps += 20;
            state.users[friend5].xps += 20;


            var dippedJoints = ''

            try {
                for (var i = 0; i < state.users[from].blunts.length; i++) {
                    if (state.users[from].dippedjoints[i].strain == json.dippedJoint) { dippedJoints = state.users[from].dippedJoints.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!dippedJoints) {
                try {
                    if (state.users[from].dippedjoints.length) dippedJoints == state.users[from].dippedjoints.splice(0, 1)[0]
                } catch (e) {}
            }
        }
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
        for (var i = 0; i < 1; i++) {
            state.users[from].stats.unshift([processor.getCurrentBlockNumber(), 'smoked_cannagar']);
            cannagarName += `${cannagar}`;
            friend1Name += `${friend1}`;
            friend2Name += `${friend2}`;
            friend3Name += `${friend3}`;
            friend4Name += `${friend4}`;
            friend5Name += `${friend5}`;

            state.users[from].xps += 200;
            state.users[friend1].xps += 40;
            state.users[friend2].xps += 40;
            state.users[friend3].xps += 40;
            state.users[friend4].xps += 40;
            state.users[friend5].xps += 40;


            var cannagars = ''

            try {
                for (var i = 0; i < state.users[from].cannagars.length; i++) {
                    if (state.users[from].cannagars[i].strain == json.cannagar) { cannagars = state.users[from].cannagars.splice(i, 1)[0]; break; }
                }
            } catch (e) {}
            if (!cannagars) {
                try {
                    if (state.users[from].cannagars.length) cannagars == state.users[from].cannagars.splice(0, 1)[0]
                } catch (e) {}
            }
        }
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

    // This checks for a json from hashkings and sends seeds, pollen and buds to users requested
    processor.on('patreon_tier3', function(json, from) {

        // if the user has not delegated then create user in state.users
        if (!state.users[json.delegator] && json.to == username) state.users[json.delegator] = {
            addrs: [],
            seeds: [],
            pollen: [],
            buds: [],
            breeder: '',
            farmer: 1,
            alliance: "",
            friends: [],
            inv: [],
            seeds: [],
            pollen: [],
            buds: [],
            kief: [],
            bubblehash: [],
            oil: [],
            edibles: [],
            joints: [],
            blunts: [],
            moonrocks: [],
            dippedjoints: [],
            cannagars: [],
            kiefbox: 0,
            vacoven: 0,
            bubblebags: 0,
            browniemix: 0,
            stats: [],
            traits: [],
            terps: [],
            v: 0
        }

        // randomize and send 5 buds to user
        function createBuds() {
            var buds = [];
            var packCount = 5;

            for (var i = 0; i < packCount; ++i) {
                buds[i] = {
                    strain: state.stats.supply.strains[Math.floor(Math.random() * state.stats.supply.strains.length)],
                    xp: 50,
                    traits: ['patreon genesis bud'],
                    terps: [],
                    pollinated: false,
                    father: 'sensimilla',
                    hybrid: false
                }
            }
            if (from == 'hashkings') { state.users[json.to].buds.push(buds) }
            return buds;
        }

        // randomize and send 5 pollen to user
        function createPollen() {
            var pollen = [];
            var packCount = 5;

            for (var i = 0; i < packCount; ++i) {
                pollen[i] = {
                    strain: state.stats.supply.strains[Math.floor(Math.random() * state.stats.supply.strains.length)],
                    xp: 50,
                    traits: ['patreon genesis pollen'],
                    terps: [],
                    pollinated: false,
                    father: 'sensimilla',
                    hybrid: false
                }
            }
            if (from == 'hashkings') { state.users[json.to].pollen.push(pollen) }
            return pollen;
        }

        // randomize and send 5 seeds to user
        function createSeeds() {
            var seeds = [];
            var packCount = 5;

            for (var i = 0; i < packCount; ++i) {
                seeds[i] = {
                    strain: state.stats.supply.strains[Math.floor(Math.random() * state.stats.supply.strains.length)],
                    xp: 50,
                    traits: ['patreon genesis seed'],
                    terps: [],
                    pollinated: false,
                    father: 'sensimilla',
                    hybrid: false
                }
            }
            if (from == 'hashkings') { state.users[json.to].seeds.push(seeds) }
            return seeds;
        }

        createSeeds();
        createPollen();
        createBuds();

        state.cs[`${json.block_num}:${json.to}`] = `received monthly patreon tier3 reward`
    });

    //checks for qwoyn_give_seed and allows users to send each other seeds
    processor.on('give_seed', function(json, from) {
        var seed = ''
        if (json.to && json.to.length > 2) {
            try {
                for (var i = 0; i < state.users[from].seeds.length; i++) {
                    if (json.qual) {
                        if (state.users[from].seeds[i].strain === json.seed && state.users[from].seeds[i].xp == json.qual) {
                            state.users[from].seeds[i].owner = json.to;
                            seed = state.users[from].seeds.splice(i, 1)[0]
                            break
                        }
                    } else if (state.users[from].seeds[i].strain === json.seed) {
                        state.users[from].seeds[i].owner = json.to;
                        seed = state.users[from].seeds.splice(i, 1)[0]
                        break
                    }
                }
            } catch (e) {}
            if (seed) {
                if (!state.users[json.to]) {
                    state.users[json.to] = {
                        addrs: [],
                        seeds: [seed],
                        buds: [],
                        pollen: [],
                        breeder: breeder,
                        farmer: farmer,
                        alliance: "",
                        friends: [],
                        inv: [],
                        seeds: [],
                        pollen: [],
                        buds: [],
                        kief: [],
                        bubblehash: [],
                        oil: [],
                        edibles: [],
                        joints: [],
                        blunts: [],
                        moonrocks: [],
                        dippedjoints: [],
                        cannagars: [],
                        kiefbox: 0,
                        vacoven: 0,
                        bubblebags: 0,
                        browniemix: 0,
                        stats: [],
                        traits: [],
                        terps: [],
                        v: 0
                    }
                } else {
                    state.users[json.to].seeds.push(seed)
                }
                state.cs[`${json.block_num}:${from}`] = `${from} sent a ${seed.xp} xp ${seed.strain} to ${json.to}`
            } else {
                state.cs[`${json.block_num}:${from}`] = `${from} doesn't own that seed`
            }
        }
    });

    // checks for qwoyn_plant and plants the seed
    processor.on('plant', function(json, from) {
        var index, seed = ''
        try {
            index = state.users[from].addrs.indexOf(json.addr)
            for (var i = 0; i < state.users[from].seeds.length; i++) {
                if (state.users[from].seeds[i].strain == json.seed) { seed = state.users[from].seeds.splice(i, 1)[0]; break; }
            }
        } catch (e) {}
        if (!seed) {
            try {
                if (state.users[from].seeds.length) seed == state.users[from].seeds.splice(0, 1)[0]
            } catch (e) {}
        }
        if (index >= 0 && seed) {
            if (!state.land[json.addr]) {
                state.cs[`${json.block_num}:${from}`] = `planted on empty plot ${json.addr}`
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
        var wrongTransaction = 'qwoyn'
        if (json.to == username && json.amount.split(' ')[1] == 'HIVE') {
            const amount = parseInt(parseFloat(json.amount) * 1000)
                        var want = json.memo.split(" ")[0].toLowerCase() || json.memo.toLowerCase(),
                            type = json.memo.split(" ")[1] || ''
                        if (want == 'rseed' && amount > (state.stats.prices.seedPacks.price * 1000) - 3000 &&  amount < (state.stats.prices.seedPacks.price * 1000) + 3000 || want == 'mseed' && amount == state.stats.prices.listed.seeds.mid || want == 'tseed' && amount == state.stats.prices.listed.seeds.top || want == 'spseed' && amount == state.stats.prices.listed.seeds.special || want == 'papers' && amount == state.stats.prices.listed.supplies.papers && state.users[from].xps > 100 || want == 'keifbox' && amount == state.stats.prices.listed.supplies.keifbox && state.users[from].xps > 100 || want == 'vacoven' && amount == state.stats.prices.listed.supplies.vacoven && state.users[from].xps > 1000 || want == 'bluntwraps' && amount == state.stats.prices.listed.supplies.bluntwraps && state.users[from].xps > 5000 || want == 'browniemix' && amount == state.stats.prices.listed.supplies.browniemix && state.users[from].xps > 10000 || want == 'hempwraps' && amount == state.stats.prices.listed.supplies.hempwraps && state.users[from].xps > 25000 || want== 'pollen' && amount > (state.stats.prices.listed.seeds.reg * 1000) - 3000 &&  amount < (state.stats.prices.listed.seeds.reg * 1000) + 3000) {
                            if (want == 'rseed' && amount > (state.stats.prices.listed.seeds.reg * 1000) - 3000 &&  amount < (state.stats.prices.listed.seeds.reg * 1000) + 3000) {
                                var seed = {
                                    strain: type,
                                    owner: json.from,
                                }
                                state.users[json.from].seeds.push(seed);

                                contract.createSeed(hivejs, type, username);  //needs finishing

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${seed.strain}`
                            } else if (want == 'asia' && amount > (state.stats.prices.land.asia * 1000) - 3000 &&  amount < (state.stats.prices.land.asia * 1000) + 3000 || want == 'africa' && amount > (state.stats.prices.land.africa * 1000) - 3000 &&  amount < (state.stats.prices.land.africa * 1000) + 3000 || want == 'afghanistan' && amount > (state.stats.prices.land.afghanistan * 1000) - 3000 &&  amount < (state.stats.prices.land.afghanistan * 1000) + 3000 || want == 'jamaica' && amount > (state.stats.prices.land.jamaica * 1000) - 3000 &&  amount < (state.stats.prices.land.jamaica * 1000) + 3000 || want == 'southAmerica' && amount > (state.stats.prices.land.southAmerica * 1000) - 3000 &&  amount < (state.stats.prices.land.southAmerica * 1000) + 3000 || want == 'mexico' && amount > (state.stats.prices.land.mexico * 1000) - 3000 &&  amount < (state.stats.prices.land.mexico * 1000) + 3000) {
                                var land = {
                                    property: want,
                                    owner: json.from
                                }
                                state.users[json.from].land.push(land);

                                contract.createPlot(hivejs,type, 1, username); //needs finishing

                                const c = parseInt(amount)
                                state.bal.c += c
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} purchased ${land.type}`
                            }
                            else {
                                state.refund.push(['xfer', wrongTransaction, amount, json.from + ' sent a weird transfer...refund?'])
                                state.cs[`${json.block_num}:${json.from}`] = `${json.from} sent a weird transfer trying to buy tools...please check wallet`
                            }
                        } else if (amount > 1000000000) {
                            state.bal.r += amount
                            state.refund.push(['xfer', wrongTransaction, amount, json.from + ' sent a weird transfer...refund?'])
                            state.cs[`${json.block_num}:${json.from}`] = `${json.from} sent a weird transfer trying to purchase seeds/tools or managing land...please check wallet`
                        }
        } else if (json.from == username) {
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
                state.stats.b = blocknum
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