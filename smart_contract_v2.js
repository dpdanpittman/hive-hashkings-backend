/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* global actions, api */

const CONTRACT_NAME = 'Hashkings NFT';
const CONTRACT_CREATOR = 'hashkings';
const UTILITY_TOKEN_SYMBOL = "MOTA";

const SEEDS_PER_PACK = 3;

actions.createSSC = async () => {
    const tableExists = await api.db.tableExists('params');
    if (tableExists === false) {
        await api.db.createTable('params');
        let params = {};

        params.SEEDS = [
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
                    chace: 60
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
                    NAME: "Colombian Gold",
                    chance: 40
                }
            }
        ];
        await api.db.insert('params', params);
    }
};

const isTokenTransferVerified = (result, from, to, symbol, quantity, eventStr) => {
    if (result.errors === undefined
        && result.events && result.events.find(el => el.contract === 'tokens' && el.event === eventStr
            && el.data.from === from && el.data.to === to && el.data.quantity === quantity && el.data.symbol === symbol) !== undefined) {
        return true;
    }
    return false;
};

actions.updateParams = async (payload) => {
    if (api.sender !== CONTRACT_CREATOR) return;

    const {
        SEEDS
    } = payload;

    let params = await api.db.findOne('params', {});

    if (SEEDS && typeof SEEDS === "object") {
        params.SEEDS = SEEDS;
    }

    await api.db.update('params', params);
};

actions.createNft = async (payload) => {
    if (api.sender !== CONTRACT_CREATOR) return;

    // this action requires active key authorization
    const {
        isSignedWithActiveKey,
    } = payload;

    const nft = await api.db.findOneInTable('nft', 'nfts', { symbol: UTILITY_TOKEN_SYMBOL });
    if (api.assert(nft === null, 'MOTA already exists')
        && api.assert(isSignedWithActiveKey === true, 'you must use a custom_json signed with your active key')) {

        await api.executeSmartContract('nft', 'create', {
            name: 'Hashkings NFT',
            symbol: UTILITY_TOKEN_SYMBOL,
            authorizedIssuingAccounts: [],
            authorizedIssuingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
            orgName: "Hashkings Team",
            productName: "Hashkings Game",
            url: "https://www.hashkings.app/",
        });

        //ALL
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'NAME',
            type: 'string',
            isReadOnly: false,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });

        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'TYPE',
            type: 'string',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'STRAIN',
            type: 'number',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'SPT',
            type: 'number',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'WATER',
            type: 'number',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'PR', // attack points
            type: 'number',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'BST', // booster packs
            type: 'number',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'PLT', // plot number
            type: 'number',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'LVL', // experiencie points
            type: 'number',
            isReadOnly: false,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
        await api.executeSmartContract('nft', 'addProperty', {
            symbol: UTILITY_TOKEN_SYMBOL,
            name: 'CONSUMABLETYPE', // experiencie points
            type: 'string',
            isReadOnly: true,
            authorizedEditingAccounts: [],
            authorizedEditingContracts: [CONTRACT_NAME],
            isSignedWithActiveKey,
        });
    }
};

const getPlot = () => {

    let type = 6;
    let typeRoll = Math.floor(api.random() * 100) + 1;

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
        let seed = plot[plot.length - 1];
        let typeRoll = Math.floor(api.random() * 100) + 1;

        plot.forEach(element => {
            if (typeRoll > element.chance) {
                seed = element;
            }
        });

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor(Math.random() * seed.PR.max) + demon.PR.min;

    } else if (type == 2) {
        let plot = SEEDS[1];

        let seed = plot[plot.length - 1];
        let typeRoll = Math.floor(api.random() * 100) + 1;

        plot.forEach(element => {
            if (typeRoll > element.chance) {
                seed = element;
            }
        });

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor(Math.random() * seed.PR.max) + demon.PR.min;
    } else if (type == 3) {
        let plot = SEEDS[2];

        let seed = plot[plot.length - 1];
        let typeRoll = Math.floor(api.random() * 100) + 1;

        plot.forEach(element => {
            if (typeRoll > element.chance) {
                seed = element;
            }
        });

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor(Math.random() * seed.PR.max) + demon.PR.min;
    } else if (type == 4) {
        let plot = SEEDS[3];

        let seed = plot[plot.length - 1];
        let typeRoll = Math.floor(api.random() * 100) + 1;

        plot.forEach(element => {
            if (typeRoll > element.chance) {
                seed = element;
            }
        });

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor(Math.random() * seed.PR.max) + demon.PR.min;
    } else if (type == 5) {
        let plot = SEEDS[4];

        let seed = plot[plot.length - 1];
        let typeRoll = Math.floor(api.random() * 100) + 1;

        plot.forEach(element => {
            if (typeRoll > element.chance) {
                seed = element;
            }
        });

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor(Math.random() * seed.PR.max) + demon.PR.min;

    } else if (type == 6) {
        let plot = SEEDS[5];

        let seed = plot[plot.length - 1];
        let typeRoll = Math.floor(api.random() * 100) + 1;

        plot.forEach(element => {
            if (typeRoll > element.chance) {
                seed = element;
            }
        });

        properties.NAME = seed.NAME;
        properties.SPT = seed.SPT;
        properties.WATER = seed.WATER;
        properties.PR = Math.floor(Math.random() * seed.PR.max) + demon.PR.min;
    }

    const properties = {
        edition: edition,
        type: "seed",
        NAME: properties.NAME,
        SPT: properties.SPT,
        WATER: properties.WATER,
        PR: properties.PR
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        fromType: 'contract',
        to,
        feeSymbol: UTILITY_TOKEN_SYMBOL,
        properties,
    };

    return instance;
};

const CreateBud = (strain, to) => {

    const properties = {
        NAME: strain,
        type: "bud",
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        fromType: 'contract',
        to,
        feeSymbol: UTILITY_TOKEN_SYMBOL,
        properties,
    };

    return instance;
}

const CreateWater = (volume, to) => {

    const properties = {
        NAME: volume,
        type: "water",
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        fromType: 'contract',
        to,
        feeSymbol: UTILITY_TOKEN_SYMBOL,
        properties,
    };

    return instance;
}

const CreatePlot = (location, to) => {

    const properties = {
        NAME: location,
        type: "plot",
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        fromType: 'contract',
        to,
        feeSymbol: UTILITY_TOKEN_SYMBOL,
        properties,
    };

    return instance;
}

const CreateBooster = (name, consumableType, to) => {

    const properties = {
        NAME: name,
        type: "booster",
        consumableType: consumableType,
        lvl: 0
    };

    const instance = {
        symbol: UTILITY_TOKEN_SYMBOL,
        fromType: 'contract',
        to,
        feeSymbol: UTILITY_TOKEN_SYMBOL,
        properties,
    };

    return instance;
}

actions.createBud = async (payload) => {
    if (api.sender !== CONTRACT_CREATOR) return;
    // this action requires active key authorization
    const {
        name, // name of booster
        isSignedWithActiveKey,
        userBuyer, //user what buy
    } = payload;

    if (api.assert(isSignedWithActiveKey === true, 'you must use a custom_json signed with your active key')
        && api.assert(packSymbol && typeof packSymbol === 'string', 'invalid pack symbol')
        && api.assert(packs && typeof packs === 'number' && Number.isInteger(packs), 'packs must be an integer')) {
        // verify user has enough balance to pay for all the packs
        // verify this contract has enough balance to pay the NFT issuance fees
        const seedsToSprout = 1;
        const nftParams = await api.db.findOneInTable('nft', 'params', {});
        const { nftIssuanceFee } = nftParams;
        const oneTokenIssuanceFee = api.BigNumber(nftIssuanceFee[UTILITY_TOKEN_SYMBOL]).multipliedBy(2); // base fee + 3 data properties
        const totalIssuanceFee = oneTokenIssuanceFee.multipliedBy(seedsToSprout);
        const utilityTokenBalance = await api.db.findOneInTable('tokens', 'contractsBalances', { account: CONTRACT_NAME, symbol: UTILITY_TOKEN_SYMBOL });
        const canAffordIssuance = utilityTokenBalance && api.BigNumber(utilityTokenBalance.balance).gte(totalIssuanceFee);
        if (api.assert(canAffordIssuance, 'contract cannot afford issuance')) {

            let instances = [];

            instances.push(CreateBud(name, userBuyer));

            await api.executeSmartContract('nft', 'issueMultiple', {
                instances,
                isSignedWithActiveKey,
            });
            return true;
        }
    }
    return false;
};

actions.createWater = async (payload) => {
    if (api.sender !== CONTRACT_CREATOR) return;
    // this action requires active key authorization
    const {
        name, // name of booster
        isSignedWithActiveKey,
        userBuyer, //user what buy
    } = payload;

    if (api.assert(isSignedWithActiveKey === true, 'you must use a custom_json signed with your active key')
        && api.assert(packSymbol && typeof packSymbol === 'string', 'invalid pack symbol')
        && api.assert(packs && typeof packs === 'number' && Number.isInteger(packs), 'packs must be an integer')) {
        // verify user has enough balance to pay for all the packs
        // verify this contract has enough balance to pay the NFT issuance fees
        const seedsToSprout = 1;
        const nftParams = await api.db.findOneInTable('nft', 'params', {});
        const { nftIssuanceFee } = nftParams;
        const oneTokenIssuanceFee = api.BigNumber(nftIssuanceFee[UTILITY_TOKEN_SYMBOL]).multipliedBy(2); // base fee + 3 data properties
        const totalIssuanceFee = oneTokenIssuanceFee.multipliedBy(seedsToSprout);
        const utilityTokenBalance = await api.db.findOneInTable('tokens', 'contractsBalances', { account: CONTRACT_NAME, symbol: UTILITY_TOKEN_SYMBOL });
        const canAffordIssuance = utilityTokenBalance && api.BigNumber(utilityTokenBalance.balance).gte(totalIssuanceFee);
        if (api.assert(canAffordIssuance, 'contract cannot afford issuance')) {

            let instances = [];

            instances.push(CreateWater(name, userBuyer));

            await api.executeSmartContract('nft', 'issueMultiple', {
                instances,
                isSignedWithActiveKey,
            });
            return true;
        }
    }
    return false;
};

actions.createPlot = async (payload) => {
    if (api.sender !== CONTRACT_CREATOR) return;
    // this action requires active key authorization
    const {
        name, // name of booster
        isSignedWithActiveKey,
        userBuyer, //user what buy
    } = payload;

    if (api.assert(isSignedWithActiveKey === true, 'you must use a custom_json signed with your active key')
        && api.assert(packSymbol && typeof packSymbol === 'string', 'invalid pack symbol')
        && api.assert(packs && typeof packs === 'number' && Number.isInteger(packs), 'packs must be an integer')) {
        // verify user has enough balance to pay for all the packs
        // verify this contract has enough balance to pay the NFT issuance fees
        const seedsToSprout = 1;
        const nftParams = await api.db.findOneInTable('nft', 'params', {});
        const { nftIssuanceFee } = nftParams;
        const oneTokenIssuanceFee = api.BigNumber(nftIssuanceFee[UTILITY_TOKEN_SYMBOL]).multipliedBy(2); // base fee + 3 data properties
        const totalIssuanceFee = oneTokenIssuanceFee.multipliedBy(seedsToSprout);
        const utilityTokenBalance = await api.db.findOneInTable('tokens', 'contractsBalances', { account: CONTRACT_NAME, symbol: UTILITY_TOKEN_SYMBOL });
        const canAffordIssuance = utilityTokenBalance && api.BigNumber(utilityTokenBalance.balance).gte(totalIssuanceFee);
        if (api.assert(canAffordIssuance, 'contract cannot afford issuance')) {

            let instances = [];

            instances.push(CreatePlot(name, userBuyer));

            await api.executeSmartContract('nft', 'issueMultiple', {
                instances,
                isSignedWithActiveKey,
            });
            return true;
        }
    }
    return false;
};

actions.createBooster = async (payload) => {
    if (api.sender !== CONTRACT_CREATOR) return;
    // this action requires active key authorization
    const {
        name, // name of booster
        consumableType, //type of consumable example : Time  / Recolector
        isSignedWithActiveKey,
        userBuyer, //user what buy
    } = payload;

    if (api.assert(isSignedWithActiveKey === true, 'you must use a custom_json signed with your active key')
        && api.assert(packs && typeof packs === 'number' && Number.isInteger(packs), 'packs must be an integer')) {
        // verify user has enough balance to pay for all the packs
        // verify this contract has enough balance to pay the NFT issuance fees
        const seedsToSprout = 1;
        const nftParams = await api.db.findOneInTable('nft', 'params', {});
        const { nftIssuanceFee } = nftParams;
        const oneTokenIssuanceFee = api.BigNumber(nftIssuanceFee[UTILITY_TOKEN_SYMBOL]).multipliedBy(4); // base fee + 3 data properties
        const totalIssuanceFee = oneTokenIssuanceFee.multipliedBy(seedsToSprout);
        const utilityTokenBalance = await api.db.findOneInTable('tokens', 'contractsBalances', { account: CONTRACT_NAME, symbol: UTILITY_TOKEN_SYMBOL });
        const canAffordIssuance = utilityTokenBalance && api.BigNumber(utilityTokenBalance.balance).gte(totalIssuanceFee);
        if (api.assert(canAffordIssuance, 'contract cannot afford issuance')) {

            let instances = [];

            instances.push(CreateBooster(name, consumableType, userBuyer));

            await api.executeSmartContract('nft', 'issueMultiple', {
                instances,
                isSignedWithActiveKey,
            });
            return true;
        }
    }
    return false;
};

// issue some random SEEDS!
actions.createSeed = async (payload) => {
    if (api.sender !== CONTRACT_CREATOR) return;
    // this action requires active key authorization
    const {
        packs, // how many SEEDS to sprout (1  = 3 SEEDS )
        isSignedWithActiveKey,
        userBuyer, //user who bought seed pack
    } = payload;

    // get contract params
    const params = await api.db.findOne('params', {});
    const { SEEDS } = params;

    if (api.assert(isSignedWithActiveKey === true, 'you must use a custom_json signed with your active key')
        && api.assert(packs && typeof packs === 'number' && Number.isInteger(packs), 'packs must be an integer')) {
        // verify user has enough balance to pay for all the packs
        // verify this contract has enough balance to pay the NFT issuance fees
        const seedsToSprout = packs * SEEDS_PER_PACK;
        const nftParams = await api.db.findOneInTable('nft', 'params', {});
        const { nftIssuanceFee } = nftParams;
        const oneTokenIssuanceFee = api.BigNumber(nftIssuanceFee[UTILITY_TOKEN_SYMBOL]).multipliedBy(5); // base fee + 7 data properties
        const totalIssuanceFee = oneTokenIssuanceFee.multipliedBy(seedsToSprout);
        const utilityTokenBalance = await api.db.findOneInTable('tokens', 'contractsBalances', { account: CONTRACT_NAME, symbol: UTILITY_TOKEN_SYMBOL });
        const canAffordIssuance = utilityTokenBalance && api.BigNumber(utilityTokenBalance.balance).gte(totalIssuanceFee);
        if (api.assert(canAffordIssuance, 'contract cannot afford issuance')) {

            let instances = [];
            for (let i = 0; i < packs; i += 1) {
                for (let index = 0; index < SEEDS_PER_PACK; index++) {
                    instances.push(generateRandomSeed(userBuyer, SEEDS));
                }
            }
            await api.executeSmartContract('nft', 'issueMultiple', {
                instances,
                isSignedWithActiveKey,
            });
            return true;
        }
    }
    return false;
};