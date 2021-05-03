const ENV = process.env;

const CONTRACT_CREATOR = "hashkings";
const UTILITY_TOKEN_SYMBOL = "HKFARM";

const ACTIVEKEY = ENV.activekey ;

const SEEDS_PER_PACK = 3;

//new api for get all nfts
const URL = "https://api.hive-engine.com/rpc/contracts";
const CONTRACT = "nft"; // Should be nft
const TABLE_POSTFIX = "instances"; // ShoAuld be the same
const NFT_SYMBOL = "HKFARM"; // Your NFT Symbol
const EXPORT = true; // Export to file? true = Export, false = no

const SEEDS = [
  {
    0: {
      SPT: 1, //Sprouting time
      WATER: 12406,
      PR: { min: 7550, max: 8000 }, //Production range
      NAME: "Aceh",
      chance: 66,
    },
    1: {
      SPT: 2, //Sprouting time
      WATER: 12096,
      PR: { min: 7250, max: 7800 }, //Production range
      NAME: "Thai",
      chance: 67,
    },
    2: {
      SPT: 2, //Sprouting time
      WATER: 11328,
      PR: { min: 7000, max: 7300 }, //Production range
      NAME: "Thai Chocolate",
      chance: 67,
    },
  },
  {
    0: {
      SPT: 2, //Sprouting time
      WATER: 10864,
      PR: { min: 6000, max: 7000 }, //Production range
      NAME: "Lamb’s Bread",
      chance: 50,
    },
    1: {
      SPT: 3, //Sprouting time
      WATER: 10080,
      PR: { min: 5500, max: 6500 }, //Production range
      NAME: "King’s Bread",
      chance: 50,
    },
  },
  {
    0: {
      SPT: 3, //Sprouting time
      WATER: 7608,
      PR: { min: 4600, max: 4900 }, //Production range
      NAME: "Swazi Gold",
      chance: 75,
    },
    1: {
      SPT: 3, //Sprouting time
      WATER: 6048,
      PR: { min: 3500, max: 3900 }, //Production range
      NAME: "Kilimanjaro",
      chance: 75,
    },
    2: {
      SPT: 4, //Sprouting time
      WATER: 4544,
      PR: { min: 2575, max: 2925 }, //Production range
      NAME: "Durban Poison",
      chance: 75,
    },
    3: {
      SPT: 4, //Sprouting time
      WATER: 3904,
      PR: { min: 2175, max: 2525 }, //Production range
      NAME: "Malawi",
      chance: 75,
    },
  },
  {
    0: {
      SPT: 4, //Sprouting time
      WATER: 3360,
      PR: { min: 1825, max: 2175 }, //Production range
      NAME: "Hindu Kush",
      chance: 75,
    },
    1: {
      SPT: 5, //Sprouting time
      WATER: 2800,
      PR: { min: 1450, max: 1800 }, //Production range
      NAME: "Afghani",
      chance: 75,
    },
    2: {
      SPT: 5, //Sprouting time
      WATER: 1680,
      PR: { min: 850, max: 1100 }, //Production range
      NAME: "Lashkar Gah",
      chance: 75,
    },
    3: {
      SPT: 6, //Sprouting time
      WATER: 1296,
      PR: { min: 600, max: 850 }, //Production range
      NAME: "Mazar I Sharif",
      chance: 75,
    },
  },
  {
    0: {
      SPT: 6, //Sprouting time
      WATER: 912,
      PR: { min: 460, max: 600 }, //Production range
      NAME: "Acapulco Gold",
      chance: 0,
    },
  },
  {
    0: {
      SPT: 7, //Sprouting time
      WATER: 560,
      PR: { min: 270, max: 350 }, //Production range
      NAME: "Colombian Gold",
      chance: 50,
    },
    1: {
      SPT: 7, //Sprouting time
      WATER: 504,
      PR: { min: 250, max: 325 }, //Production range
      NAME: "Panama Red",
      chance: 50,
    },
  },
];

const getPlot = () => {
  let type = 6;
  let typeRoll = Math.floor(Math.random() * 100) + 1;

  if (typeRoll > 97) {
    //3
    type = 1;
  } else if (typeRoll > 94) {
    //6
    type = 2;
  } else if (typeRoll > 89) {
    //11
    type = 3;
  } else if (typeRoll > 85) {
    //15
    type = 4;
  } else if (typeRoll > 75) {
    //25
    type = 5;
  } else if (typeRoll > 60) {
    //25
    type = 6;
  }

  return type;
};

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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
    }
  }

  const propertys = {
    TYPE: "seed",
    NAME: properties.NAME,
    SPT: properties.SPT,
    WATER: properties.WATER,
    PR: properties.PR,
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
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
    properties.PR = Math.floor(
      Math.random() * (seed.PR.max - seed.PR.min) + seed.PR.min
    );

    if (properties.PR > seed.PR.max) {
      properties.PR = seed.PR.max;
    }

    if (properties.PR < seed.PR.min) {
      properties.PR = seed.PR.min;
    }
  }

  const propertys = {
    TYPE: "seed",
    NAME: properties.NAME,
    SPT: properties.SPT,
    WATER: properties.WATER,
    PR: properties.PR,
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
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
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
};

const CreateWater = (nameWaterNFT, quantity, to) => {
  const properties = {
    NAME: nameWaterNFT,
    TYPE: "water",
    WATER: quantity,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "BEE",
    properties,
  };

  return instance;
};

const CreatePlot = (location, to) => {
  const properties = {
    NAME: location,
    TYPE: "plot",
    SUBDIVIDED: false,
    OCCUPIED: false,
    SEEDID: 0,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "BEE",
    properties,
  };

  return instance;
};

const CreatePlotSubdiv = (location, to) => {
  const properties = {
    NAME: location,
    TYPE: "plot",
    SUBDIVIDED: true,
    OCCUPIED: false,
    SEEDID: 0,
    RENTED: false,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "BEE",
    properties,
  };

  return instance;
};

const CreateBooster = (name, consumableType, to) => {
  const properties = {
    NAME: name,
    TYPE: "booster",
    CONSUMABLETYPE: consumableType,
    LVL: 0,
    USED: false,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "BEE",
    properties,
  };

  return instance;
};

const CreateConsumable = (name, consumableType, to) => {
  const properties = {
    NAME: name,
    TYPE: "consumable",
    CONSUMABLETYPE: consumableType,
    LVL: 0,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "BEE",
    properties,
  };

  return instance;
};

const CreateAvatar = (name, to) => {
  const properties = {
    NAME: name,
    TYPE: "avatar",
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "BEE",
    properties,
  };

  return instance;
};

const CreateWaterTower = (name, to, water) => {
  const properties = {
    NAME: name,
    TYPE: "water",
    LVL: 1,
    WATER: water,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "BEE",
    properties,
  };

  return instance;
};

const createBud = async (hive, name, quantity, userBuyer) => {
  let instances = [];

  for (let index = 0; index < quantity; index++) {
    instances.push(CreateBud(name, userBuyer));
  }

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const createWater = async (hive, name, quantity, userBuyer) => {
  let instances = [];

  instances.push(CreateWater(name, quantity, userBuyer));

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  console.log(instances);

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        console.log("err is ");
        console.log(err);
        console.log("res is");
        console.log(result);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
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
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const createBooster = async (hive, name, consumableType, userBuyer) => {
  let instances = [];

  instances.push(CreateBooster(name, consumableType, userBuyer));

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const createConsumable = async (hive, name, consumableType, userBuyer) => {
  let instances = [];

  instances.push(CreateConsumable(name, consumableType, userBuyer));

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const createAvatar = async (hive, name, userBuyer) => {
  let instances = [];

  instances.push(CreateAvatar(name, userBuyer));

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const createWaterTower = async (hive, name, userBuyer, waterQuantity) => {
  let instances = [];

  instances.push(CreateWaterTower(name, userBuyer, waterQuantity));

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
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
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const createSeedT = async (hive, packs, userBuyer) => {
  if (packs < 1) {
    console.log("Seed was not sent to because stake was too low ", userBuyer);
    return;
  }
  let instances = [];
  for (let i = 0; i < packs; i++) {
    instances.push(generateOneRandomSeed(userBuyer, getPlot(), SEEDS));
  }

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const SendSeedPoolManual = async (hive, seedsToSend, user) => {
  if (seedsToSend > 4) {
    let toSend = seedsToSend;
    while (toSend > 0) {
      if (toSend > 4) {
        seedsToSend = toSend;
      }
      if (toSend == seedsToSend) {
        await createSeedT(hive, 4, user);
      } else {
        await createSeedT(hive, toSend, user);
      }
      toSend = toSend - 4;
    }
  } else {
    await createSeedT(hive, seedsToSend, userData[i].user);
  }
};

const generateBundle = async (
  hive,
  plotid,
  plotName,
  quantityWater,
  userBuyer
) => {
  let instances = [];
  instances.push(generateOneRandomSeed(userBuyer, plotid, SEEDS));
  instances.push(CreatePlot(plotName, userBuyer));
  instances.push(CreateWater("Water", quantityWater, userBuyer));

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const subdividePlot = async (
  hive,
  plotName,
  quantitySubdivisions,
  userBuyer
) => {
  console.log("subdivide plot on ", plotName, quantitySubdivisions);
  let instances = [];

  for (let i = 0; i < quantitySubdivisions; i++) {
    instances.push(CreatePlotSubdiv(plotName, userBuyer));
  }

  let json = {
    contractName: "nft",
    contractAction: "issueMultiple",
    contractPayload: {
      instances: instances,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
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
  let config = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
  // Request POST body data
  let body = JSON.stringify([
    {
      method: "find",
      jsonrpc: "2.0",
      params: {
        contract: contract,
        table: table,
        query: query,
        limit: 1000,
        offset: offset,
        indexes: [],
      },
      id: 1,
    },
  ]);
  // Make request.
  return await axios.post(URL, body, config);
}

function isNullOrEmpty(variable) {
  return variable === null || variable === undefined;
}

async function queryContract(
  axios,
  { contract, table, query = {} },
  offset = 0
) {
  // Request data
  let response = await axiosRequest(axios, { contract, table, query, offset });

  // Return result
  if (
    response &&
    response.data !== undefined &&
    response.data !== null &&
    !isNullOrEmpty(response.data[0].result)
  )
    return response.data[0].result;

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
        let get_nfts = await queryContract(
          axios,
          { contract: CONTRACT, table: NFT_SYMBOL + TABLE_POSTFIX },
          offset
        );
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
        totalAllWater: 0,
        totalAllConsumable: 0,
        totalAllBooster: 0,
        totalAllAvatar: 0,
        totalAllWaterTemp: 0,
      };

      let accounts = {};

      let onlyAcconts = [];

      //console.log("cheking nft" , nfts[0]);

      for (let i = 0; i < nfts.length; i++) {
        let acc = await onlyAcconts.find(function (element) {
          return element == nfts[i].account;
        });
        if (!acc) {
          onlyAcconts.push(nfts[i].account);
        }

        if (limiter("plot", nfts[i])) {
          if (!accounts.hasOwnProperty(nfts[i].account)) {
            accounts[nfts[i].account] = {
              seeds: [],
              plots: [],
              consumable: [],
              booster: [],
              avatar: [],
              water: [],
              waterTemp: [],
            };
            accounts[nfts[i].account].plots.push({
              id: nfts[i]._id,
              properties: nfts[i].properties,
              owner: nfts[i].account,
            });
          } else {
            accounts[nfts[i].account].plots.push({
              id: nfts[i]._id,
              properties: nfts[i].properties,
              owner: nfts[i].account,
            });
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
            owners[nfts[i].account] = {
              totalAllConsumable: 0,
              totalPlot: 1,
              totalSeed: 0,
              totalWater: 0,
            };
          }
        }
      }

      for (let j = 0; j < nfts.length; j++) {
        if (limiter("seed", nfts[j])) {
          if (!accounts.hasOwnProperty(nfts[j].account)) {
            accounts[nfts[j].account] = {
              seeds: [],
              plots: [],
              consumable: [],
              booster: [],
              avatar: [],
              water: [],
              waterTemp: [],
            };
            accounts[nfts[j].account].seeds.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          } else {
            accounts[nfts[j].account].seeds.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          }

          try {
            totalPlot.totalAllSeeds += 1;
            owners[nfts[j].account].totalSeed += 1;
          } catch (e) {
            totalPlot.totalAllSeeds += 1;
            owners[nfts[j].account] = {
              totalAllConsumable: 0,
              totalPlot: 0,
              totalSeed: 1,
              totalWater: 0,
            };
          }
        }
      }

      for (let j = 0; j < nfts.length; j++) {
        if (limiter("consumable", nfts[j])) {
          if (!accounts.hasOwnProperty(nfts[j].account)) {
            accounts[nfts[j].account] = {
              seeds: [],
              plots: [],
              consumable: [],
              booster: [],
              avatar: [],
              water: [],
              waterTemp: [],
            };
            accounts[nfts[j].account].consumable.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          } else {
            accounts[nfts[j].account].consumable.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          }

          try {
            totalPlot.totalAllConsumable += 1;
            owners[nfts[j].account].totalConsumable += 1;
          } catch (e) {
            totalPlot.totalAllConsumable += 1;
            owners[nfts[j].account] = {
              totalAllConsumable: 1,
              totalPlot: 0,
              totalSeed: 1,
              totalWater: 0,
            };
          }
        }
      }

      for (let j = 0; j < nfts.length; j++) {
        if (limiter("booster", nfts[j])) {
          if (!accounts.hasOwnProperty(nfts[j].account)) {
            accounts[nfts[j].account] = {
              seeds: [],
              plots: [],
              consumable: [],
              booster: [],
              avatar: [],
              water: [],
              waterTemp: [],
            };
            accounts[nfts[j].account].booster.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          } else {
            accounts[nfts[j].account].booster.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          }

          try {
            totalPlot.totalAllBooster += 1;
            owners[nfts[j].account].totalBooster += 1;
          } catch (e) {
            totalPlot.totalAllConsumable += 1;
            owners[nfts[j].account] = {
              totalAllAvatar: 0,
              totalAllBooster: 1,
              totalAllConsumable: 0,
              totalPlot: 0,
              totalSeed: 0,
              totalWater: 0,
            };
          }
        }
      }

      for (let j = 0; j < nfts.length; j++) {
        if (limiter("avatar", nfts[j])) {
          if (!accounts.hasOwnProperty(nfts[j].account)) {
            accounts[nfts[j].account] = {
              seeds: [],
              plots: [],
              consumable: [],
              booster: [],
              avatar: [],
              water: [],
              waterTemp: [],
            };
            accounts[nfts[j].account].avatar.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          } else {
            accounts[nfts[j].account].avatar.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          }

          try {
            totalPlot.totalAllAvatar += 1;
            owners[nfts[j].account].totalAvatar += 1;
          } catch (e) {
            totalPlot.totalAllAvatar += 1;
            owners[nfts[j].account] = {
              totalAllAvatar: 1,
              totalAllBooster: 0,
              totalAllConsumable: 0,
              totalPlot: 0,
              totalSeed: 0,
              totalWater: 0,
            };
          }
        }
      }

      for (let j = 0; j < nfts.length; j++) {
        if (limiter("water", nfts[j])) {
          if (!accounts.hasOwnProperty(nfts[j].account)) {
            accounts[nfts[j].account] = {
              seeds: [],
              plots: [],
              consumable: [],
              booster: [],
              avatar: [],
              water: [],
              waterTemp: [],
            };
            accounts[nfts[j].account].water.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          } else {
            accounts[nfts[j].account].water.push({
              id: nfts[j]._id,
              properties: nfts[j].properties,
              owner: nfts[j].account,
            });
          }

          try {
            owners[nfts[j].account].totalWater += 1;
          } catch (e) {
            owners[nfts[j].account] = {
              totalAllAvatar: 0,
              totalAllBooster: 0,
              totalAllConsumable: 0,
              totalPlot: 0,
              totalSeed: 0,
              totalWater: 1,
            };
          }
        }
      }

      for (const key of Object.keys(accounts)) {
        let water = accounts[key].water;

        if (Array.isArray(water)) {
          totalPlot.totalAllWater = totalPlot.totalAllWater + water.length;
          accounts[key].water = accounts[key].water.reduce((before, after) => {
            let waterlvl1 = "waterlvl1";
            let waterlvl2 = "waterlvl2";
            let waterlvl3 = "waterlvl3";
            let waterlvl4 = "waterlvl4";
            let waterlvl5 = "waterlvl5";
            let waterlvl6 = "waterlvl6";
            let waterlvl7 = "waterlvl7";
            let waterlvl8 = "waterlvl8";
            let waterlvl9 = "waterlvl9";
            let waterlvl10 = "waterlvl10";

            if (before[waterlvl1]) {
              if (after.properties.LVL == 1) {
                before[waterlvl1] = [...before[waterlvl1], after];
              }
            } else {
              if (after.properties.LVL == 1) {
                before[waterlvl1] = [after];
              }
            }
            if (before[waterlvl2]) {
              if (after.properties.LVL == 2) {
                before[waterlvl2] = [...before[waterlvl2], after];
              }
            } else {
              if (after.properties.LVL == 2) {
                before[waterlvl2] = [after];
              }
            }
            if (before[waterlvl3]) {
              if (after.properties.LVL == 3) {
                before[waterlvl3] = [...before[waterlvl3], after];
              }
            } else {
              if (after.properties.LVL == 3) {
                before[waterlvl3] = [after];
              }
            }
            if (before[waterlvl4]) {
              if (after.properties.LVL == 4) {
                before[waterlvl4] = [...before[waterlvl4], after];
              }
            } else {
              if (after.properties.LVL == 4) {
                before[waterlvl4] = [after];
              }
            }
            if (before[waterlvl5]) {
              if (after.properties.LVL == 5) {
                before[waterlvl5] = [...before[waterlvl5], after];
              }
            } else {
              if (after.properties.LVL == 5) {
                before[waterlvl5] = [after];
              }
            }
            if (before[waterlvl6]) {
              if (after.properties.LVL == 6) {
                before[waterlvl6] = [...before[waterlvl6], after];
              }
            } else {
              if (after.properties.LVL == 6) {
                before[waterlvl6] = [after];
              }
            }
            if (before[waterlvl7]) {
              if (after.properties.LVL == 7) {
                before[waterlvl7] = [...before[waterlvl7], after];
              }
            } else {
              if (after.properties.LVL == 7) {
                before[waterlvl7] = [after];
              }
            }
            if (before[waterlvl8]) {
              if (after.properties.LVL == 8) {
                before[waterlvl8] = [...before[waterlvl8], after];
              }
            } else {
              if (after.properties.LVL == 8) {
                before[waterlvl8] = [after];
              }
            }
            if (before[waterlvl9]) {
              if (after.properties.LVL == 9) {
                before[waterlvl9] = [...before[waterlvl9], after];
              }
            } else {
              if (after.properties.LVL == 9) {
                before[waterlvl9] = [after];
              }
            }
            if (before[waterlvl10]) {
              if (after.properties.LVL == 10) {
                before[waterlvl10] = [...before[waterlvl10], after];
              }
            } else {
              if (after.properties.LVL == 10) {
                before[waterlvl10] = [after];
              }
            }

            return before;
          }, {});

          let lvl1 = accounts[key].water.hasOwnProperty("waterlvl1")
            ? accounts[key].water.waterlvl1.length
            : 0;
          let lvl2 = accounts[key].water.hasOwnProperty("waterlvl2")
            ? accounts[key].water.waterlvl2.length
            : 0;
          let lvl3 = accounts[key].water.hasOwnProperty("waterlvl3")
            ? accounts[key].water.waterlvl3.length
            : 0;
          let lvl4 = accounts[key].water.hasOwnProperty("waterlvl4")
            ? accounts[key].water.waterlvl4.length
            : 0;
          let lvl5 = accounts[key].water.hasOwnProperty("waterlvl5")
            ? accounts[key].water.waterlvl5.length
            : 0;
          let lvl6 = accounts[key].water.hasOwnProperty("waterlvl6")
            ? accounts[key].water.waterlvl6.length
            : 0;
          let lvl7 = accounts[key].water.hasOwnProperty("waterlvl7")
            ? accounts[key].water.waterlvl7.length
            : 0;
          let lvl8 = accounts[key].water.hasOwnProperty("waterlvl8")
            ? accounts[key].water.waterlvl8.length
            : 0;
          let lvl9 = accounts[key].water.hasOwnProperty("waterlvl9")
            ? accounts[key].water.waterlvl9.length
            : 0;
          let lvl10 = accounts[key].water.hasOwnProperty("waterlvl10")
            ? accounts[key].water.waterlvl10.length
            : 0;
          accounts[key].waterPlants = {
            lvl1,
            lvl2,
            lvl3,
            lvl4,
            lvl5,
            lvl6,
            lvl7,
            lvl8,
            lvl9,
            lvl10,
          };
        }
      }

      let report = [owners, plot, totalPlot, onlyAcconts, accounts];

      resolve(report);
    })();
  });
}

async function getOnlyUsers(axios) {
  return new Promise(async (resolve, reject) => {
    (async () => {
      let complete = false;
      let nfts = [];
      let offset = 0;

      while (!complete) {
        let get_nfts = await queryContract(
          axios,
          { contract: CONTRACT, table: NFT_SYMBOL + TABLE_POSTFIX },
          offset
        );
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

      let onlyAcconts = [];

      for (let i = 0; i < nfts.length; i++) {
        let acc = await onlyAcconts.find(function (element) {
          return element == nfts[i].account;
        });
        if (!acc) {
          onlyAcconts.push(nfts[i].account);
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getUserNft(ssc, axios, user) {
  return new Promise(async (resolve, reject) => {
    (async () => {
      let complete = false;
      let nfts = [];
      let offset = 0;

      while (!complete) {
        let get_nfts = await queryContract(
          axios,
          {
            contract: CONTRACT,
            table: NFT_SYMBOL + TABLE_POSTFIX,
            query: { account: user },
          },
          offset
        );
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

      let onlyAcconts = {
        seeds: [],
        plots: [],
        tokens: {},
      };

      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        if (nfts[i].properties.TYPE == "seed") {
          onlyAcconts.seeds.push(nft);
        }

        if (nfts[i].properties.TYPE == "plot") {
          onlyAcconts.plots.push(nft);
        }
      }

      onlyAcconts.tokens = await getTokens(ssc, user);

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getOnlyUsersHaveMota(axios) {
  return new Promise(async (resolve, reject) => {
    (async () => {
      let complete = false;
      let nfts = [];
      let offset = 0;

      while (!complete) {
        let get_nfts = await queryContract(
          axios,
          { contract: "tokens", table: "balances", query: { symbol: "MOTA" } },
          offset
        );
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

      let onlyAcconts = [];

      for (let i = 0; i < nfts.length; i++) {
        let acc = await onlyAcconts.find(function (element) {
          return element == nfts[i].account;
        });

        if (!acc) {
          onlyAcconts.push({ user: nfts[i].account, stake: nfts[i].stake });
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getTokens(ssc, user) {
  return new Promise(async (resolve, reject) => {
    let data = {
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
    };
    let result = await ssc.find(
      "tokens",
      "balances",
      { account: user },
      1000,
      0,
      [],
      (err, result) => {
        if (err) {
          return null;
        }
      }
    );

    if (!result) {
      reject([]);
    }

    for (let index = 0; index < result.length; index++) {
      const token = result[index];
      if (token.symbol == "BUDS") {
        data.buds.balance = token.balance;
        data.buds.stake = token.stake;
      }

      if (token.symbol == "HKWATER") {
        data.hkwater.balance = token.balance;
        data.hkwater.stake = token.stake;
      }

      if (token.symbol == "MOTA") {
        data.mota.balance = token.balance;
        data.mota.stake = token.stake;
      }
    }

    resolve(data);
  });
}

async function distributeSeeds(axios, seedsUsedLastDay, hive) {
  if (seedsUsedLastDay < 1) {
    seedsUsedLastDay = 1;
  }
  let preRatio = seedsUsedLastDay * 1.1;
  let usersNames = await getOnlyUsersHaveMota(axios);
  let userData = [];
  let TOTALSTAKEDMOTAOFALLTHEPLAYERS = 0;

  for (let i = 0; i < usersNames.length; i++) {
    if (usersNames[i].stake > 0) {
      userData.push(usersNames[i]);
    }
  }

  for (let j = 0; j < userData.length; j++) {
    TOTALSTAKEDMOTAOFALLTHEPLAYERS =
      TOTALSTAKEDMOTAOFALLTHEPLAYERS + parseFloat(userData[j].stake);
  }

  let ratio = TOTALSTAKEDMOTAOFALLTHEPLAYERS / preRatio;

  for (let i = 0; i < userData.length; i++) {
    let seedsToSend = Math.ceil(parseFloat(userData[i].stake) / ratio);
    console.log(
      "username : " +
        userData[i].user +
        " have MOTA " +
        userData[i].stake +
        " STAKED ratio is " +
        ratio +
        " and user send " +
        seedsToSend
    );

    if (seedsToSend > 4) {
      let toSend = seedsToSend;
      while (toSend > 0) {
        if (toSend > 4) {
          seedsToSend = toSend;
        }
        if (toSend == seedsToSend) {
          await createSeedT(hive, 4, userData[i].user);
        } else {
          await createSeedT(hive, toSend, userData[i].user);
        }

        toSend = toSend - 4;
      }
    } else {
      await createSeedT(hive, seedsToSend, userData[i].user);
    }
  }
}

async function distributeMota(amountToDistribute, listOfUsers, hive) {
  let userQuantity = 0;
  for (let i = 0; i < listOfUsers.length; i++) {
    userQuantity += listOfUsers[i].depositedBuds;
  }
  let ratio = amountToDistribute / userQuantity;

  for (let i = 0; i < listOfUsers.length; i++) {
    let userGet = (ratio * listOfUsers[i].depositedBuds).toFixed(4);
    console.log(
      "username " +
        listOfUsers[i].user +
        " staked buds " +
        listOfUsers[i].depositedBuds +
        " and we distribute " +
        amountToDistribute +
        " this user get " +
        userGet
    );

    if(userGet < 0.001){
      await generateToken(hive, "MOTA", 0.001, listOfUsers[i].user);
    }else{
      await generateToken(hive, "MOTA", userGet, listOfUsers[i].user);
    } 
  }
}

async function distributeWater(listOfUsers, hive) {
  for (let i = 0; i < listOfUsers.length; i++) {
    let userGet = listOfUsers[i].quantity.toFixed(3);
    console.log("username " + listOfUsers[i].user + "Quantity", userGet);
    await generateToken(hive, "HKWATER", userGet, listOfUsers[i].user);
  }
}

const generateToken = async (hive, token, quantity, user) => {
  let json = {
    contractName: "tokens",
    contractAction: "issue",
    contractPayload: {
      symbol: token,
      to: user,
      quantity: "" + quantity,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const updateNft = async (hive, idnft, properties) => {
  let json = {
    contractName: "nft",
    contractAction: "setProperties",
    contractPayload: {
      symbol: UTILITY_TOKEN_SYMBOL,
      nfts: [
        {
          id: idnft,
          properties: properties,
        },
      ],
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const updateMultipleNfts = async (hive, nfts) => {
  let json = {
    contractName: "nft",
    contractAction: "setProperties",
    contractPayload: {
      symbol: UTILITY_TOKEN_SYMBOL,
      nfts: nfts,
    },
  };

  return new Promise((resolve, reject) => {
    hive.broadcast.customJson(
      ACTIVEKEY,
      [CONTRACT_CREATOR],
      [],
      "ssc-mainnet-hive",
      JSON.stringify(json),
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

async function updateSptSeeds(axios, hive) {
  return new Promise(async (resolve, reject) => {
    (async () => {
      let complete = false;
      let nfts = [];
      let offset = 0;

      while (!complete) {
        let get_nfts = await queryContract(
          axios,
          {
            contract: CONTRACT,
            table: NFT_SYMBOL + TABLE_POSTFIX,
            query: {},
          },
          offset
        );
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

      let report = [];

      for (const nftx in nfts) {
        let nft = nfts[nftx];
        if (nft.properties.hasOwnProperty("PLANTED")) {
          if (nft.properties.TYPE == "seed") {
            if (
              nft.properties.PLANTED &&
              nft.properties.SPT > 0 &&
              nft.properties.PLOTID
            ) {
              report.push(nft);
            }
          }
        }
      }

      console.log(report.length);
      let update = [];

      update.push({
        id: "" + report[0]._id,
        properties: {
          SPT: report[0].properties.SPT - 1,
        },
      });
      for (let index = 1; index <= report.length; index++) {
        if (report[index]) {
          if (index % 5 == 0) {
            await updateMultipleNfts(hive, update);
            console.log(update);
            update = [];
          } else {
            let updatex = {
              id: "" + report[index]._id,
              properties: {
                SPT: report[index].properties.SPT - 1,
              },
            };
            update.push(updatex);
          }
        }
      }

      resolve(update);
    })();
  });
}

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
  updateNft,
  createConsumable,
  createAvatar,
  createWaterTower,
  distributeMota,
  distributeSeeds,
  subdividePlot,
  distributeWater,
  getUserNft,
  updateSptSeeds,
  SendSeedPoolManual,
  updateMultipleNfts
};
