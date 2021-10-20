require("dotenv").config();
const WeightedList = require("js-weighted-list");
var jp = require("jsonpath");
const ENV = process.env;

const CONTRACT_CREATOR = "hashkings";
const UTILITY_TOKEN_SYMBOL = "HKFARM";

const ACTIVEKEY = ENV.activekey;

const SEEDS_PER_PACK = 3;

//new api for get all nfts
const URL = "https://rpc.hashkings.xyz/contracts";
const CONTRACT = "nft"; // Should be nft
const TABLE_POSTFIX = "instances"; // ShoAuld be the same
const NFT_SYMBOL = "HKFARM"; // Your NFT Symbol
const EXPORT = true; // Export to file? true = Export, false = no

const { addRefund, sendNotificationToUser } = require("./database");

const SEEDS = [
  {
    0: {
      SPT: 1, //Sprouting time
      WATER: 12406,
      PR: { min: 7550, max: 8000 }, //Production range
      NAME: "Aceh",
      chance: 33,
    },
    1: {
      SPT: 2, //Sprouting time
      WATER: 12096,
      PR: { min: 7250, max: 7800 }, //Production range
      NAME: "Thai",
      chance: 33,
    },
    2: {
      SPT: 2, //Sprouting time
      WATER: 11328,
      PR: { min: 7000, max: 7300 }, //Production range
      NAME: "Thai Chocolate",
      chance: 33,
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
      chance: 25,
    },
    1: {
      SPT: 3, //Sprouting time
      WATER: 6048,
      PR: { min: 3500, max: 3900 }, //Production range
      NAME: "Kilimanjaro",
      chance: 25,
    },
    2: {
      SPT: 4, //Sprouting time
      WATER: 4544,
      PR: { min: 2575, max: 2925 }, //Production range
      NAME: "Durban Poison",
      chance: 25,
    },
    3: {
      SPT: 4, //Sprouting time
      WATER: 3904,
      PR: { min: 2175, max: 2525 }, //Production range
      NAME: "Malawi",
      chance: 25,
    },
  },
  {
    0: {
      SPT: 4, //Sprouting time
      WATER: 3360,
      PR: { min: 1825, max: 2175 }, //Production range
      NAME: "Hindu Kush",
      chance: 25,
    },
    1: {
      SPT: 5, //Sprouting time
      WATER: 2800,
      PR: { min: 1450, max: 1800 }, //Production range
      NAME: "Afghani",
      chance: 25,
    },
    2: {
      SPT: 5, //Sprouting time
      WATER: 1680,
      PR: { min: 850, max: 1100 }, //Production range
      NAME: "Lashkar Gah",
      chance: 25,
    },
    3: {
      SPT: 6, //Sprouting time
      WATER: 1296,
      PR: { min: 600, max: 850 }, //Production range
      NAME: "Mazar I Sharif",
      chance: 25,
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
  var data = [
    ["1", 1.38],
    ["2", 3.99],
    ["3", 9.82],
    ["4", 17.06],
    ["5", 25.06],
    ["6", 42.56],
  ];

  var wl = new WeightedList(data);

  return wl.peek();
};

const generateRandomSeed = (to, SEEDS) => {
  const type = parseInt(getPlot()[0]);
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
    feeSymbol: "PAL",
    properties: propertys,
  };

  return instance;
};

const generateOneRandomSeed = (to, plot, SEEDS) => {
  const type = plot;
  let properties = {};
  if (type == 1) {
    let plot = SEEDS[0];
    let seed =
      plot[
        Math.floor(Math.random() * (Object.keys(plot).length - 1 - 0 + 1) + 0)
      ];
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
    let seed =
      plot[
        Math.floor(Math.random() * (Object.keys(plot).length - 1 - 0 + 1) + 0)
      ];
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
    let seed =
      plot[
        Math.floor(Math.random() * (Object.keys(plot).length - 1 - 0 + 1) + 0)
      ];
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
    let seed =
      plot[
        Math.floor(Math.random() * (Object.keys(plot).length - 1 - 0 + 1) + 0)
      ];

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
    let seed =
      plot[
        Math.floor(Math.random() * (Object.keys(plot).length - 1 - 0 + 1) + 0)
      ];

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
    let seed =
      plot[
        Math.floor(Math.random() * (Object.keys(plot).length - 1 - 0 + 1) + 0)
      ];

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
    feeSymbol: "PAL",
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
    feeSymbol: "PAL",
    properties,
  };

  return instance;
};

const CreateBundle = (to, plot, waterTower, name) => {
  const properties = {
    NAME: name,
    TYPE: "bundle",
    PLOTID: plot,
    WATER: waterTower,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "PAL",
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
    feeSymbol: "PAL",
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
    feeSymbol: "PAL",
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
    feeSymbol: "PAL",
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
    feeSymbol: "PAL",
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
    feeSymbol: "PAL",
    properties,
  };

  return instance;
};

const CreateAvatar = (name, to) => {
  const properties = {
    NAME: name,
    TYPE: "avatar",
    XP: 45,
  };

  const instance = {
    symbol: UTILITY_TOKEN_SYMBOL,
    to,
    feeSymbol: "PAL",
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
    feeSymbol: "PAL",
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

  console.log("creando avatar", name, " para ", userBuyer);
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

const createPlotT = async (hive, packs, userBuyer, name) => {
  let instances = [];
  for (let i = 0; i < packs; i++) {
    instances.push(CreatePlotSubdiv(name, userBuyer));
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
  let instances = [];
  for (let i = 0; i < packs; i++) {
    instances.push(
      generateOneRandomSeed(userBuyer, parseInt(getPlot()[0]), SEEDS)
    );
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

function getPlotbySeedName(seedName) {
  const SEEDS = {
    Aceh: 1,
    Thai: 1,
    "Thai Chocolate": 1,
    "Lamb’s Bread": 2,
    "King’s Bread": 2,
    "Swazi Gold": 3,
    Kilimanjaro: 3,
    "Durban Poison": 3,
    Malawi: 3,
    "Hindu Kush": 4,
    Afghani: 4,
    "Lashkar Gah": 4,
    "Mazar I Sharif": 4,
    "Acapulco Gold": 5,
    "Colombian Gold": 6,
    "Panama Red": 6,
  };

  return SEEDS[seedName];
}

const createSeedTT = async (hive, packs, userBuyer, seedName) => {
  let instances = [];
  for (let i = 0; i < packs; i++) {
    instances.push(
      generateOneRandomSeed(userBuyer, getPlotbySeedName(seedName), SEEDS)
    );
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
          resolve(instances[0].properties.NAME);
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

async function axiosRequest(axios, { contract, table, query, offset }, method) {
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
      method: method,
      jsonrpc: "2.0",
      params: {
        contract: contract,
        table: table,
        query: query,
        limit: 499,
        offset: offset,
        indexes: [],
      },
      id: 1,
    },
  ]);
  // Make request.
  return await axios.post(URL, body, config);
}

async function axiosRequestTest(
  axios,
  { contract, table, query, offset },
  method
) {
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
      method: method,
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
  offset = 0,
  method = "find"
) {
  // Request data
  let response = await axiosRequest(
    axios,
    { contract, table, query, offset },
    method
  )
    .then((r) => {
      return r;
    })
    .catch((e) => {});

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

async function queryContractTest(
  axios,
  { contract, table, query = {} },
  offset = 0,
  method = "find"
) {
  // Request data
  let response = await axiosRequestTest(
    axios,
    { contract, table, query, offset },
    method
  )
    .then((r) => {
      return r;
    })
    .catch((e) => {});

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

async function getAvatarOnBlockchain(axios, avatarID) {
  return new Promise(async (resolve, reject) => {
    let get_nfts = await queryContract(
      axios,
      {
        contract: CONTRACT,
        table: NFT_SYMBOL + TABLE_POSTFIX,
        query: { _id: avatarID },
      },
      0,
      "findOne"
    );

    if (get_nfts) {
      resolve(get_nfts.properties);
    } else {
      resolve(false);
    }
  });
}

async function getNFT(axios, nftID) {
  return new Promise(async (resolve, reject) => {
    let get_nfts = await queryContract(
      axios,
      {
        contract: CONTRACT,
        table: NFT_SYMBOL + TABLE_POSTFIX,
        query: { _id: nftID },
      },
      0,
      "findOne"
    );

    if (get_nfts) {
      resolve(get_nfts);
    } else {
      resolve(false);
    }
  });
}

async function getNFTbyName(axios, name) {
  return new Promise(async (resolve, reject) => {
    let complete = false;
    let nfts = [];
    let offset = 0;

    while (!complete) {
      let get_nfts = await queryContract(
        axios,
        {
          contract: CONTRACT,
          table: NFT_SYMBOL + TABLE_POSTFIX,
          query: { "properties.NAME": name },
        },
        offset
      );
      if (get_nfts !== false) {
        nfts = nfts.concat(get_nfts);
        offset += 499;

        if (get_nfts.length !== 499) {
          complete = true;
        }
      } else {
        complete = true;
      }
    }

    if (nfts) {
      resolve(nfts);
    } else {
      resolve(false);
    }
  });
}

async function getInBundle(axios, nftID, type) {
  return new Promise(async (resolve, reject) => {
    let query = {};

    if (type == "plot") {
      query = { "properties.PLOTID": nftID, "properties.TYPE": "bundle" };
    } else {
      query = { "properties.WATER": nftID, "properties.TYPE": "bundle" };
    }

    let get_nfts = await queryContract(
      axios,
      {
        contract: CONTRACT,
        table: NFT_SYMBOL + TABLE_POSTFIX,
        query: query,
      },
      0,
      "findOne"
    );

    if (get_nfts) {
      resolve(get_nfts);
    } else {
      resolve(false);
    }
  });
}

async function findBundleByPLOTANDWATER(axios, plotID, waterTowerID) {
  return new Promise(async (resolve, reject) => {
    let query = {
      "properties.PLOTID": plotID,
      "properties.WATER": waterTowerID,
    };

    let get_nfts = await queryContract(
      axios,
      {
        contract: CONTRACT,
        table: NFT_SYMBOL + TABLE_POSTFIX,
        query: query,
      },
      0,
      "findOne"
    );

    if (get_nfts) {
      resolve(get_nfts);
    } else {
      resolve(false);
    }
  });
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
          offset += 499;

          if (get_nfts.length !== 499) {
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

async function getOnlyUsers(axios, ssc) {
  return new Promise(async (resolve, reject) => {
    (async () => {
      let complete = false;
      let nfts = [];
      let offset = 0;

      while (!complete) {
        let get_nfts = await queryContractTest(
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

      let buds = await getAllUserHaveTokens(ssc, "BUDS");
      let mota = await getAllUserHaveTokens(ssc, "MOTA");

      let array3 = onlyAcconts.concat(buds).concat(mota);
      array3 = [...new Set([...buds, ...mota, ...onlyAcconts])];

      let report = array3;

      resolve(report);
    })();
  });
}

async function getAllUserHaveTokens(ssc, token) {
  return new Promise(async (resolve, reject) => {
    (async () => {
      let complete = false;
      let nfts = [];
      let offset = 0;

      while (!complete) {
        let get_nfts = await ssc.find(
          "tokens",
          "balances",
          { symbol: token },
          499,
          offset,
          [],
          (err, result) => {
            if (err) {
              return null;
            }
          }
        );
        if (get_nfts !== false) {
          nfts = nfts.concat(get_nfts);
          offset += 499;

          if (get_nfts.length !== 400) {
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
          offset += 499;

          if (get_nfts.length !== 499) {
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
        waterTowers: {},
        avatars: [],
        joints: [],
        rents: [],
        rented: [],
        bundles: [],
      };

      let tempWaterTowers = [];
      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        if (nfts[i].properties.TYPE == "seed") {
          onlyAcconts.seeds.push(nft);
        }

        if (nfts[i].properties.TYPE == "avatar") {
          onlyAcconts.avatars.push(nft);
        }

        if (nfts[i].properties.TYPE == "plot") {
          if (!nfts[i].properties.RENTED) {
            if (nfts[i].properties.RENTEDINFO != "available") {
              onlyAcconts.plots.push(nft);
            }
          } else {
            onlyAcconts.rented.push(nft);
          }
        }

        if (nfts[i].properties.TYPE == "water") {
          if (!nfts[i].properties.RENTED) {
            if (nfts[i].properties.RENTEDINFO != "available") {
              tempWaterTowers.push(nft);
            }
          } else {
            onlyAcconts.rented.push(nft);
          }
        }

        if (nfts[i].properties.TYPE == "consumable") {
          onlyAcconts.joints.push(nft);
        }

        if (nfts[i].properties.TYPE == "bundle") {
          onlyAcconts.bundles.push(nft);
        }
      }

      onlyAcconts.rents = await getRents(ssc, axios, user);

      onlyAcconts.tokens = await getTokens(ssc, user);

      onlyAcconts.waterTowers = (
        await formateWaterTowers(tempWaterTowers)
      ).waterTowers;
      onlyAcconts.waterPlants = (
        await formateWaterTowers(tempWaterTowers)
      ).waterPlants;

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getRents(ssc, axios, user) {
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
            query: { "properties.RENTEDINFO": "" + user },
          },
          offset
        );
        if (get_nfts !== false) {
          nfts = nfts.concat(get_nfts);
          offset += 499;

          if (get_nfts.length !== 499) {
            complete = true;
          }
        } else {
          complete = true;
        }
      }

      resolve(nfts);
    })();
  });
}

async function getHKVaultNFts(ssc, axios, user) {
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
          offset += 499;

          if (get_nfts.length !== 499) {
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
        waterTowers: {},
        avatars: [],
        joints: [],
      };

      let tempWaterTowers = [];
      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        if (nfts[i].properties.TYPE == "seed") {
          onlyAcconts.seeds.push(nft);
        } else if (nfts[i].properties.TYPE == "consumable") {
          onlyAcconts.joints.push(nft);
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function formateWaterTowers(watertowerArray) {
  let response = {};
  if (Array.isArray(watertowerArray)) {
    let reduceArray = watertowerArray.reduce((before, after) => {
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

    let lvl1 = reduceArray.hasOwnProperty("waterlvl1")
      ? reduceArray.waterlvl1.length
      : 0;
    let lvl2 = reduceArray.hasOwnProperty("waterlvl2")
      ? reduceArray.waterlvl2.length
      : 0;
    let lvl3 = reduceArray.hasOwnProperty("waterlvl3")
      ? reduceArray.waterlvl3.length
      : 0;
    let lvl4 = reduceArray.hasOwnProperty("waterlvl4")
      ? reduceArray.waterlvl4.length
      : 0;
    let lvl5 = reduceArray.hasOwnProperty("waterlvl5")
      ? reduceArray.waterlvl5.length
      : 0;
    let lvl6 = reduceArray.hasOwnProperty("waterlvl6")
      ? reduceArray.waterlvl6.length
      : 0;
    let lvl7 = reduceArray.hasOwnProperty("waterlvl7")
      ? reduceArray.waterlvl7.length
      : 0;
    let lvl8 = reduceArray.hasOwnProperty("waterlvl8")
      ? reduceArray.waterlvl8.length
      : 0;
    let lvl9 = reduceArray.hasOwnProperty("waterlvl9")
      ? reduceArray.waterlvl9.length
      : 0;
    let lvl10 = reduceArray.hasOwnProperty("waterlvl10")
      ? reduceArray.waterlvl10.length
      : 0;

    response.waterPlants = {
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

    response.waterTowers = reduceArray;

    return response;
  }
}

async function getAllNfts(axios) {
  return new Promise(async (resolve) => {
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
          offset += 499;

          if (get_nfts.length !== 499) {
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

        if (nfts[i].properties.TYPE == "plot") {
          onlyAcconts.plots.push(nft);
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getAllNftsAgua(axios) {
  return new Promise(async (resolve) => {
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
          offset += 499;

          if (get_nfts.length !== 499) {
            complete = true;
          }
        } else {
          complete = true;
        }
      }

      let onlyAcconts = [];

      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        if (nfts[i].properties.TYPE == "water") {
          onlyAcconts.push(nft);
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getAllPlotsAndSeeds(axios) {
  return new Promise(async (resolve) => {
    (async () => {
      let complete = false;
      let nfts = [];
      let offset = 0;

      while (!complete) {
        let get_nfts = await queryContractTest(
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

      let onlyAcconts = {
        plots: [],
        seeds: [],
      };

      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        if (nfts[i].properties.TYPE == "plot") {
          if (nft.properties.hasOwnProperty("SEEDID")) {
            if (nft.properties.SEEDID > 0) {
              if (nft.properties.OCCUPIED) {
                onlyAcconts.plots.push(nft);
              }
            }
          }
        } else if (nfts[i].properties.TYPE == "seed") {
          onlyAcconts.seeds.push(nft);
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getAllPlotsbyRegion(axios) {
  return new Promise(async (resolve) => {
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
          offset += 499;

          if (get_nfts.length !== 499) {
            complete = true;
          }
        } else {
          complete = true;
        }
      }

      let onlyAcconts = {
        plots: [],
        seeds: [],
      };

      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        if (nfts[i].properties.TYPE == "plot") {
          if (nfts[i].properties.NAME == "Asia") {
            let u = nfts[i].account;

            onlyAcconts.plots.push(nft);
          }
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getAllAvatar(axios) {
  return new Promise(async (resolve) => {
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
            query: { "properties.TYPE": "avatar" },
          },
          offset
        );
        if (get_nfts !== false) {
          nfts = nfts.concat(get_nfts);
          offset += 499;

          if (get_nfts.length !== 499) {
            complete = true;
          }
        } else {
          complete = true;
        }
      }

      let onlyAcconts = {
        plots: [],
        seeds: [],
      };

      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        if (nfts[i].properties.TYPE == "avatar") {
          if (
            nfts[i].properties.NAME == "Magical Male" ||
            nfts[i].properties.NAME == "Magical Female"
          ) {
            let u = nfts[i].account;

            onlyAcconts.plots.push(nft);
          }
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getAllByName(axios, name) {
  return new Promise(async (resolve) => {
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
            query: { "properties.NAME": name, "properties.TYPE": "avatar" },
          },
          offset
        );
        if (get_nfts !== false) {
          nfts = nfts.concat(get_nfts);
          offset += 499;

          if (get_nfts.length !== 499) {
            complete = true;
          }
        } else {
          complete = true;
        }
      }

      let onlyAcconts = {
        avatars: [],
      };

      for (let i = 0; i < nfts.length; i++) {
        let nft = {
          id: nfts[i]._id,
          properties: nfts[i].properties,
          owner: nfts[i].account,
        };

        onlyAcconts.avatars.push(nft);
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getAllPlantPlots(axios) {
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
          offset += 499;

          if (get_nfts.length !== 499) {
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

      let report = accounts;

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
          offset += 499;

          if (get_nfts.length !== 499) {
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
          onlyAcconts.push({
            user: nfts[i].account,
            stake: nfts[i].stake,
            delegationsIn: nfts[i].delegationsIn,
          });
        }
      }

      let report = onlyAcconts;

      resolve(report);
    })();
  });
}

async function getAllUsersHaveAPlot(axios) {
  return new Promise(async (resolve) => {
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
          offset += 499;

          if (get_nfts.length !== 499) {
            complete = true;
          }
        } else {
          complete = true;
        }
      }

      let onlyAcconts = [];

      for (let i = 0; i < nfts.length; i++) {
        if (nfts[i].properties.TYPE == "plot") {
          let acc = await onlyAcconts.find(function (element) {
            return element == nfts[i].account;
          });

          if (!acc) {
            onlyAcconts.push(nfts[i].account);
          }
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
    if (
      usersNames[i].user != "swashcoldsteel" &&
      usersNames[i].user != "vica1988"
    ) {
      if (usersNames[i].stake > 0) {
        userData.push(usersNames[i]);
      }
    }
  }

  for (let j = 0; j < userData.length; j++) {
    TOTALSTAKEDMOTAOFALLTHEPLAYERS =
      TOTALSTAKEDMOTAOFALLTHEPLAYERS +
      parseFloat(userData[j].stake) +
      parseFloat(userData[j].delegationsIn);
  }

  let ratio = TOTALSTAKEDMOTAOFALLTHEPLAYERS / preRatio;

  for (let i = 0; i < userData.length; i++) {
    let seedsToSend = Math.round(parseFloat(userData[i].stake) / ratio);
    if (userData[i].stake < ratio) {
      seedsToSend = 0;
    }
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
          try {
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 5000);
            });

            await createSeedT(hive, 4, userData[i].user);
          } catch (e) {
            console.log(
              "error sending seeds to user",
              seedsToSend,
              userData[i].user
            );
          }
        } else {
          try {
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 5000);
            });
            await createSeedT(hive, toSend, userData[i].user);
          } catch (e) {
            console.log(
              "error sending seeds to user",
              seedsToSend,
              userData[i].user
            );
          }
        }
        toSend = toSend - 4;
      }
    } else {
      try {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
        await createSeedT(hive, seedsToSend, userData[i].user);
      } catch (e) {
        console.log(
          "error sending seeds to user",
          seedsToSend,
          userData[i].user
        );
      }
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

    try {
      if (userGet < 0.001) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
        await generateToken(hive, "MOTA", 0.001, listOfUsers[i].user);
      } else {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
        await generateToken(hive, "MOTA", userGet, listOfUsers[i].user);
      }
    } catch (e) {
      console.log(
        "distribute fail for this user",
        listOfUsers[i].user,
        userGet
      );
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
      async function (err, result) {
        if (err) {
          await addRefund(user, "" + quantity, token, Date.now()).then(
            async (r) => {
              await sendNotificationToUser(
                user,
                "error on sending " + token + " we try again send soon"
              );
            }
          );
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
          offset += 499;
          if (get_nfts.length !== 499) {
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
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 5000);
            });

            let updatex = {
              id: "" + report[index]._id,
              properties: {
                SPT: report[index].properties.SPT - 1,
              },
            };

            update.push(updatex);

            try {
              await updateMultipleNfts(hive, update);
              console.log(update);
            } catch (e) {
              console.log("error on sending this group", update);
            }

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

async function distributeSubdividePlots(hive, user, cantidad, name) {
  let seedsToSend = cantidad;

  console.log("username : " + user, "cantidad " + cantidad);

  if (seedsToSend > 9) {
    let toSend = seedsToSend;
    while (toSend > 0) {
      if (toSend > 9) {
        seedsToSend = toSend;
      }
      if (toSend == seedsToSend) {
        try {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 5000);
          });

          await createPlotT(hive, 9, user, name);
        } catch (e) {
          console.log("error sending plot to user", seedsToSend, user);
        }
      } else {
        try {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 5000);
          });
          await createPlotT(hive, toSend, user, name);
        } catch (e) {
          console.log("error sending plots to user", seedsToSend, user);
        }
      }
      toSend = toSend - 9;
    }
  } else {
    try {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });
      await createPlotT(hive, seedsToSend, user, name);
    } catch (e) {
      console.log("error sending plots to user", seedsToSend, user);
    }
  }
}

async function distributeAvatar(hive, user) {
  let instances = [];

  instances.push(CreateAvatar("Farmer Shaggi", user));
  instances.push(CreateAvatar("Lucky Shaggi", user));
  instances.push(CreateAvatar("Water Baron Shaggi", user));
  instances.push(CreateAvatar("Scientist Shaggi", user));
  instances.push(CreateAvatar("Farmer Maggi", user));
  instances.push(CreateAvatar("Lucky Maggi", user));
  instances.push(CreateAvatar("Water Baroness Maggi", user));
  instances.push(CreateAvatar("Scientist Maggi", user));

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
}

function testseeds() {
  let instances = [];
  for (let i = 0; i < 10; i++) {
    instances.push(
      generateOneRandomSeed("chocolatoso", parseInt(getPlot()[0]), SEEDS)
    );
  }
  return instances;
}

async function test(axios, hive) {
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
            query: { "properties.CONSUMABLETYPE.status": "rented" },
          },
          offset
        );
        if (get_nfts !== false) {
          nfts = nfts.concat(get_nfts);
          offset += 499;
          if (get_nfts.length !== 499) {
            complete = true;
          }
        } else {
          complete = true;
        }
      }

      resolve(nfts);
    })();
  });
}

async function createBundle(hive, plot, waterTower, to, name) {
  plot = parseInt(plot, 10);
  waterTower = parseInt(waterTower, 10);

  let instances = [];

  instances.push(CreateBundle(to, plot, waterTower, name));

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
  updateMultipleNfts,
  getAllNfts,
  getAllNftsAgua,
  getAllPlantPlots,
  getAllPlotsAndSeeds,
  getAllPlotsbyRegion,
  distributeSubdividePlots,
  getAllUsersHaveAPlot,
  distributeAvatar,
  getAllAvatar,
  testseeds,
  getHKVaultNFts,
  getAvatarOnBlockchain,
  getNFT,
  test,
  createBundle,
  getInBundle,
  findBundleByPLOTANDWATER,
  getOnlyUsers,
  getAllByName,
  createSeedT,
  createSeedTT,
  getNFTbyName,
};
