const ENV = process.env;

const CONTRACT_CREATOR = 'hashkings';
const UTILITY_TOKEN_SYMBOL = "HKFARM";

const ACTIVEKEY = ENV.activekey;

const SEEDS_PER_PACK = 3;


//new api for get all nfts 
const URL = "https://api.hive-engine.com/rpc/contracts";
const CONTRACT = "nft"; // Should be nft
const TABLE_POSTFIX = "instances"; // Should be the same
const NFT_SYMBOL = "HKFARM"; // Your NFT Symbol
const EXPORT = true; // Export to file? true = Export, false = no

const SEEDS = [
    {
        0: {
            SPT: 1,//Sprouting time
            WATER: 235,
            PR: { min: 7550, max: 8000 },//Production range   
            NAME: "Aceh",
            chance: 90,
        },
        1: {
            SPT: 2,//Sprouting time
            WATER: 235,
            PR: { min: 7250, max: 7800 },//Production range   
            NAME: "Thai",
            chance: 60
        },
        2: {
            SPT: 2,//Sprouting time
            WATER: 230,
            PR: { min: 7000, max: 7300 },//Production range   
            NAME: "Thai Chocolate",
            chance: 50
        },
    },
    {
        0: {
            SPT: 2,//Sprouting time
            WATER: 215,
            PR: { min: 6000, max: 7000 },//Production range   
            NAME: "Lamb’s Bread",
            chance: 70
        },
        1: {
            SPT: 3,//Sprouting time
            WATER: 205,
            PR: { min: 5500, max: 6500 },//Production range   
            NAME: "King’s Bread",
            chance: 30
        },
    },
    {
        0: {
            SPT: 3,//Sprouting time
            WATER: 168,
            PR: { min: 4600, max: 4900 },//Production range   
            NAME: "Swazi Gold",
            chance: 90
        },
        1: {
            SPT: 3,//Sprouting time
            WATER: 137,
            PR: { min: 3500, max: 3900 },//Production range   
            NAME: "Kilimanjaro",
            chance: 80
        },
        2: {
            SPT: 4,//Sprouting time
            WATER: 104,
            PR: { min: 2575, max: 2925 },//Production range   
            NAME: "Durban Poison",
            chance: 75
        },
        3: {
            SPT: 4,//Sprouting time
            WATER: 93,
            PR: { min: 2175, max: 2525 },//Production range   
            NAME: "Malawi",
            chance: 55
        }
    },
    {
        0: {
            SPT: 4,//Sprouting time
            WATER: 82,
            PR: { min: 1825, max: 2175 },//Production range   
            NAME: "Hindu Kush",
            chance: 95
        },
        1: {
            SPT: 5,//Sprouting time
            WATER: 70,
            PR: { min: 1450, max: 1800 },//Production range   
            NAME: "Afghani",
            chance: 80
        },
        2: {
            SPT: 5,//Sprouting time
            WATER: 43,
            PR: { min: 850, max: 1100 },//Production range   
            NAME: "Lashkar Gah",
            chance: 75
        },
        3: {
            SPT: 6,//Sprouting time
            WATER: 33,
            PR: { min: 600, max: 850 },//Production range   
            NAME: "Mazar I Sharif",
            chance: 50
        }
    },
    {
        0: {
            SPT: 6,//Sprouting time
            WATER: 23,
            PR: { min: 350, max: 600 },//Production range   
            NAME: "Acapulco Gold",
            chance: 0
        },
    },
    {
        0: {
            SPT: 7,//Sprouting time
            WATER: 10,
            PR: { min: 50, max: 350 },//Production range   
            NAME: "Colombian Gold",
            chance: 60
        },
        1: {
            SPT: 7,//Sprouting time
            WATER: 9,
            PR: { min: 30, max: 325 },//Production range   
            NAME: "Panama Red",
            chance: 40
        }
    }
];


const getPlot = () => {

    let type = 6;
    let typeRoll = Math.floor(Math.random() * 100) + 1;

    if (typeRoll > 97) { //3
        type = 1;
    } else if (typeRoll > 94) { //6
        type = 2
    } else if (typeRoll > 89) { //11
        type = 3;
    } else if (typeRoll > 85) { //15
        type = 4;
    } else if (typeRoll > 75) { //25
        type = 5;
    } else if (typeRoll > 60) { //25
        type = 6;
    }

    return type;
}

const generateRandomSeed = (to, SEEDS) => {

    const type = getPlot();
    let properties = {};
    if (type == 1) {
        let plot = SEEDS[0];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;

        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }

    } else if (type == 2) {
        let plot = SEEDS[1];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    } else if (type == 3) {
        let plot = SEEDS[2];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    } else if (type == 4) {
        let plot = SEEDS[3];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    } else if (type == 5) {
        let plot = SEEDS[4];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }

    } else if (type == 6) {
        let plot = SEEDS[5];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    }

    const propertys = {
        TYPE: "seed",
        NAME: properties.NAME,
        SPT: properties.SPT,
        WATER: properties.WATER,
        PR: properties.PR
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        to,
        feeSymbol: "BEE",
        properties: propertys,
    };

    return instance;
};

const generateOneRandomSeed = (to, plot, SEEDS) => {

    const type = plot;
    let properties = {};
    if (type == 1) {
        let plot = SEEDS[0];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;

        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }

    } else if (type == 2) {
        let plot = SEEDS[1];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    } else if (type == 3) {
        let plot = SEEDS[2];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    } else if (type == 4) {
        let plot = SEEDS[3];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    } else if (type == 5) {
        let plot = SEEDS[4];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }

    } else if (type == 6) {
        let plot = SEEDS[5];
        let seed = plot[Object.keys(plot).length - 1];
        let typeRoll = Math.floor(Math.random() * 100) + 1;


        let found = false;
        for (let index = 0; index < Object.keys(plot).length; index++) {
            const element = plot[index];
            if (!found && typeRoll > element.chance) {
                seed = element;
                found = true;
            }
        }


        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor((Math.random() * (seed.PR.max - seed.PR.min)) + seed.PR.min);

        if (properties.PR > seed.PR.max) {
            properties.PR = seed.PR.max
        }

        if (properties.PR < seed.PR.min) {
            properties.PR = seed.PR.min
        }
    }

    const propertys = {
        TYPE: "seed",
        NAME: properties.NAME,
        SPT: properties.SPT,
        WATER: properties.WATER,
        PR: properties.PR
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        to,
        feeSymbol: "BEE",
        properties: propertys,
    };

    return instance;
};

/**
 * 
 * @param {*} hive  hive js
 * @param {*} plot  number of plot , exa : 1 ASIA etc..
 * @param {*} userBuyer user to issue
 */

const createOneSeed = async (hive, plot, userBuyer) => {

    let instances = [];
    instances.push(generateOneRandomSeed(userBuyer, plot, SEEDS));


    let json = {
        contractName: "nft",
        contractAction: "issueMultiple",
        contractPayload: {
            instances: instances
        }
    }

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })
};


const CreateBud = (nameBudNFT, to) => {

    const properties = {
        NAME: nameBudNFT,
        TYPE: "bud",
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        to,
        feeSymbol: "BEE",
        properties,
    };

    return instance;
}

const CreateWater = (nameWaterNFT, quantity, to) => {

    const properties = {
        NAME: nameWaterNFT,
        TYPE: "water",
        WATER: quantity

    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        to,
        feeSymbol: "BEE",
        properties,
    };

    return instance;
}

const CreatePlot = (location, to) => {

    const properties = {
        NAME: location,
        TYPE: "plot",
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        to,
        feeSymbol: "BEE",
        properties,
    };

    return instance;
}

const CreateBooster = (name, consumableType, to) => {

    const properties = {
        NAME: name,
        TYPE: "booster",
        CONSUMABLETYPE: consumableType,
        LVL: 0
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        to,
        feeSymbol: "BEE",
        properties,
    };

    return instance;
}

const createBud = async (hive, name, quantity, userBuyer) => {


    let instances = [];

    for (let index = 0; index < quantity; index++) {
        instances.push(CreateBud(name, userBuyer));
    }


    let json = {
        contractName: "nft",
        contractAction: "issueMultiple",
        contractPayload: {
            instances: instances
        }
    }

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })

};

const createWater = async (hive, name, quantity, userBuyer) => {

    let instances = [];

    instances.push(CreateWater(name, quantity, userBuyer));


    let json = {
        contractName: "nft",
        contractAction: "issueMultiple",
        contractPayload: {
            instances: instances
        }
    }

    console.log(instances);

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            console.log("err is ")
            console.log(err)
            console.log("res is")
            console.log(result)
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })

};

const createPlot = async (hive, name, quantity, userBuyer) => {

    let instances = [];
    for (let index = 0; index < quantity; index++) {
        instances.push(CreatePlot(name, userBuyer));
    }

    let json = {
        contractName: "nft",
        contractAction: "issueMultiple",
        contractPayload: {
            instances: instances
        }
    }

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })

};

const createBooster = async (hive, name, consumableType, userBuyer) => {

    let instances = [];

    instances.push(CreateBooster(name, consumableType, userBuyer));

    let json = {
        contractName: "nft",
        contractAction: "issueMultiple",
        contractPayload: {
            instances: instances
        }
    }


    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })


};

const createSeed = async (hive, packs, userBuyer) => {

    let instances = [];
    for (let i = 0; i < packs; i += 1) {
        for (let index = 0; index < SEEDS_PER_PACK; index++) {
            instances.push(generateRandomSeed(userBuyer, SEEDS));
        }
    }

    let json = {
        contractName: "nft",
        contractAction: "issueMultiple",
        contractPayload: {
            instances: instances
        }
    }

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })

};


const generateBundle = async (hive, plotid, plotName, quantityWater, userBuyer) => {

    let instances = [];
    instances.push(generateOneRandomSeed(userBuyer, plotid, SEEDS));
    instances.push(CreatePlot(plotName, userBuyer));
    instances.push(CreateWater("Water", quantityWater, userBuyer));

    let json = {
        contractName: "nft",
        contractAction: "issueMultiple",
        contractPayload: {
            instances: instances
        }
    }

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })

};



// Return true to count, false to ignore
function limiter(t, nft) {
    return nft.properties.TYPE.toLowerCase() === t;
}

// Change grouping
function grouper(nft) {
    return nft.properties.NAME;
}

async function axiosRequest(axios, { contract, table, query, offset }) {
    // Headers
    let config = { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } };
    // Request POST body data
    let body = JSON.stringify([{ "method": "find", "jsonrpc": "2.0", "params": { "contract": contract, "table": table, "query": query, "limit": 1000, "offset": offset, "indexes": [] }, "id": 1 }]);
    // Make request.
    return await axios.post(URL, body, config);
}

function isNullOrEmpty(variable) {
    return (variable === null || variable === undefined);
}

async function queryContract(axios, { contract, table, query = {} }, offset = 0) {
    // Request data
    let response = await axiosRequest(axios, { contract, table, query, offset });

    // Return result
    if (response && response.data !== undefined && response.data !== null && !isNullOrEmpty(response.data[0].result)) return response.data[0].result;

    // Else return false
    return false;
}



async function getReport(axios) {

    return new Promise(async (resolve, reject) => {

        (async () => {
            let complete = false;
            let nfts = [];
            let offset = 0;

            while (!complete) {
                let get_nfts = await queryContract(axios, { contract: CONTRACT, table: NFT_SYMBOL + TABLE_POSTFIX }, offset);
                if (get_nfts !== false) {
                    nfts = nfts.concat(get_nfts);
                    offset += 1000;

                    if (get_nfts.length !== 1000) {
                        complete = true;
                    }
                } else {
                    complete = true;
                }
            }

            let owners = {};

            let plot = {};

            let totalPlot = {
                totalAllPlots: 0,
                totalAllSeeds: 0,
                totalAllWater: 0
            }

            let accounts = {};

            let onlyAcconts = [];


            for (let i = 0; i < nfts.length; i++) {

                if (!(onlyAcconts.find(nfts[i].account))) {
                    onlyAcconts.push(nfts[i].account);

                } 
                if (limiter("plot", nfts[i])) {

                    if (!accounts.hasOwnProperty(nfts[i].account)) {
                        accounts[nfts[i].account] = {
                            seeds: [],
                            plots: []
                        };
                        accounts[nfts[i].account].plots.push({
                            id: nfts[i].id,
                            properties: nfts[i].properties
                        })

                    } else {
                        accounts[nfts[i].account].plots.push({
                            id: nfts[i].id,
                            properties: nfts[i].properties
                        })
                    }



                    if (plot.hasOwnProperty(grouper(nfts[i]))) {
                        plot[grouper(nfts[i])] += 1;
                    } else {
                        plot[grouper(nfts[i])] = 1;
                    }

                    if (owners.hasOwnProperty(nfts[i].account)) {
                        owners[nfts[i].account].totalPlot += 1;
                        totalPlot.totalAllPlots += 1;

                    } else {

                        totalPlot.totalAllPlots += 1;
                        owners[nfts[i].account] = { "totalPlot": 1, "totalSeed": 0, "totalWater": 0 };
                    }
                }

            }

            for (let j = 0; j < nfts.length; j++) {
                if (limiter("seed", nfts[j])) {

                    if (!accounts.hasOwnProperty(nfts[j].account)) {
                        accounts[nfts[j].account] = {
                            seeds: [],
                            plots: []
                        };
                        accounts[nfts[j].account].seeds.push({
                            id: nfts[j].id,
                            properties: nfts[j].properties
                        })

                    } else {
                        accounts[nfts[j].account].seeds.push({
                            id: nfts[j].id,
                            properties: nfts[j].properties
                        })
                    }



                    try {
                        totalPlot.totalAllSeeds += 1;
                        owners[nfts[j].account].totalSeed += 1;
                    } catch (e) {
                        totalPlot.totalAllSeeds += 1;
                        owners[nfts[j].account] = { "totalPlot": 0, "totalSeed": 1, "totalWater": 0 };
                    }

                }
            }

            for (let k = 0; k < nfts.length; k++) {
                if (limiter("water", nfts[k])) {

                    try {
                        totalPlot.totalAllWater += 1;
                        owners[nfts[k].account].totalWater += 1;
                    } catch (e) {
                        totalPlot.totalAllWater += 1;
                        owners[nfts[k].account] = { "totalPlot": 0, "totalSeed": 0, "totalWater": 1 };
                    }



                }
            }

            let report = [owners,
                plot,
                totalPlot,
                onlyAcconts,
                accounts
            ]

            resolve(report);

        })()

    })


}


async function getTokens(ssc, user) {


    return new Promise(async (resolve, reject) => {
        let data = {
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
        }
        ssc.find('tokens', 'balances', { account: user }, 1000, 0, [], (err, result) => {


            if (err) {
                reject(err);
            }

            for (let index = 0; index < result.length; index++) {
                const token = result[index];
                if (token.symbol == 'BUDS') {
                    data.buds.balance = token.balance
                    data.buds.stake = token.stake
                }

                if (token.symbol == 'HKWATER') {
                    data.hkwater.balance = token.balance
                    data.hkwater.stake = token.stake
                }

                if (token.symbol == 'MOTA') {
                    data.mota.balance = token.balance
                    data.mota.stake = token.stake
                }
            }

            resolve(data)


        })

    })

}


const generateToken = async (hive, token, quantity, user) => {



    let json = {
        contractName: "tokens",
        contractAction: "issue",
        contractPayload: {
            "symbol": token,
            "to": user,
            "quantity": quantity
        }
    }

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })

};


const updateNft = async (hive, idnft, properties) => {



    let json = {
        contractName: "nft",
        contractAction: "setProperties",
        contractPayload: {
            "symbol": UTILITY_TOKEN_SYMBOL,
            "nfts": [
                {
                    "id": idnft, "properties": properties
                }
            ]
        }
    }

    return new Promise((resolve, reject) => {
        hive.broadcast.customJson(ACTIVEKEY, [CONTRACT_CREATOR], [], "ssc-mainnet-hive", JSON.stringify(json), function (err, result) {
            if (err) {
                reject(err)

            } else {
                resolve(result)
            }
        });
    })

};

module.exports = contract = {
    createSeed,
    createOneSeed,
    createBooster,
    createPlot,
    createWater,
    createBud,
    generateBundle,
    getReport,
    getTokens,
    generateToken,
    updateNft
}