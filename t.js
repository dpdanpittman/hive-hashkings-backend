const axios = require("axios");
const contract = require("./contract");
var hivejs = require("@hiveio/hive-js");
hivejs.api.setOptions({ url: "https://api.deathwing.me" });
hivejs.config.set("alternative_api_endpoints", [
  "https://api.hive.blog/",
  "https://anyx.io/",
]);
var jp = require("jsonpath");
require("dotenv").config();

const SSC = require("sscjs");
const ssc = new SSC("https://rpc.hashkings.xyz/");

function groupBy(miarray, prop) {
  return miarray.reduce(function (groups, item) {
    var val = item.owner;
    groups[val] = groups[val] || { cantidad: 0 };
    groups[val].cantidad = groups[val].cantidad + 1;
    return groups;
  }, {});
}

function sort(miarray) {
  return miarray.sort(function (a, b) {
    if (a.cantidad < b.cantidad) {
      return 1;
    }
    if (a.cantidad > b.cantidad) {
      return -1;
    }
    return 0;
  });
}
const WeightedList = require("js-weighted-list");
/*
let a = contract.testseeds();
let b = [];
for (let index = 0; index < a.length; index++) {
  if (
    b.find((e) => {
      if (e == a[index].properties.NAME) return e;
    })
  ) {
  } else {
    b.push(a[index].properties.NAME);
  }
}

console.log(b)  */

/*
(async () => {
  contract
    .getAllPlantPlots(axios)
    .then(async (response) => {
      for (const key of Object.keys(response)) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 7000);
        });

        let account = key;
        let lvl1 = response[key].waterPlants.lvl1;

        let userGet = (parseFloat(lvl1) * 30).toFixed(3);
        console.log("sending", "HKWATER", userGet, account);
        try {
          await contract.generateToken(hivejs, "HKWATER", userGet, account);
        } catch (e) {
          console.log("no se pudo enviar ", e, userGet, account);
        }
      }
    })
    .catch((e) => {
      console.log("error", e);
    });
})();
*/

/*  
contract
  .updateMultipleNfts(hivejs, [
    {
      id: "" + 119683,
      properties: { SPT: 0 },
    },
  ])
  .then((res) => {
    console.log(res);
  }); */

/* 77235 

contract.updateNft(hivejs, "" + 233361, {
    TYPE: "seed",
    NAME: "Lamb’s Bread",
    SPT: 2,
    WATER: 10864,
    PR: 7024
  })
  .then((r) => {
    console.log(r);
  });  */

/*
contract.createPlot(hivejs,"South America",1,"elfran919").then(r=>{
  console.log(r);
})


/* 
contract
  .updateMultipleNfts(hivejs, [
    {
      id: "" + 2479,
      properties: { LVL: 4, WATER: 234 },
    },
  ])
  .then((res) => {
    console.log(res);
  });  
*/
/*
contract
  .updateMultipleNfts(hivejs, [
    {
      id: "" + 107561,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107565,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107582,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107587,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107597,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107617,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107620,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107635,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107637,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107652,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107662,
      properties: { PLANTED: false },
    },
    {
      id: "" + 107681,
      properties: { PLANTED: false },
    },
    {
      id: "" + 108493,
      properties: { PLANTED: false },
    },
    {
      id: "" + 109220,
      properties: { PLANTED: false },
    },
    {
      id: "" + 109308,
      properties: { PLANTED: false },
    },
    {
      id: "" + 109905,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110379,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110482,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110487,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110555,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110560,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110572,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110689,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110806,
      properties: { PLANTED: false },
    },
    {
      id: "" + 110885,
      properties: { PLANTED: false },
    },
    {
      id: "" + 112123,
      properties: { PLANTED: false },
    },
    {
      id: "" + 112124,
      properties: { PLANTED: false },
    },
    {
      id: "" + 112387,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113815,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113906,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113915,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113931,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113934,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113941,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113943,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113954,
      properties: { PLANTED: false },
    },
    {
      id: "" + 113957,
      properties: { PLANTED: false },
    },
    {
      id: "" + 114072,
      properties: { PLANTED: false },
    },
    {
      id: "" + 115073,
      properties: { PLANTED: false },
    },
    {
      id: "" + 115086,
      properties: { PLANTED: false },
    },
    {
      id: "" + 115092,
      properties: { PLANTED: false },
    },
    {
      id: "" + 115673,
      properties: { PLANTED: false },
    },
    {
      id: "" + 115784,
      properties: { PLANTED: false },
    },
  ])
  .then((res) => {
    console.log(res);
  });
*/
/*
function groupBy(miarray, prop) {
  return miarray.reduce(function (groups, item) {
    var val = item[prop];
    groups[val] = groups[val] || { user: item.user, depositedBuds: 0 };
    groups[val].depositedBuds =
      parseFloat(groups[val].depositedBuds) + parseFloat(item.depositedBuds);
    return groups;
  }, {});
}

(async () => {
  let transactions = [];
  let complete = false;
  let offset = 0;
  while (!complete) {
    let get_transactions = await axios({
      url: "https://accounts.hive-engine.com/accountHistory",
      method: "GET",
      params: {
        account: "hk-vault",
        limit: "1000",
        offset: offset,
        type: "user",
        symbol: "BUDS",
      },
    })
      .then((response) => {
        
        return response.data;
      })
      .catch((err) => {
        return false;
      });
    if (get_transactions !== false) {
      transactions = transactions.concat(get_transactions);
      offset += 1000;
      if (get_transactions.length !== 1000) {
        complete = true;
      }
    } else {
      complete = true;
    }
  }

  let transactionsx = transactions.filter((t) => {
    if (t.timestamp > 1619654340 && t.timestamp < 1619739000) {
      return t;
    }
  });

  console.log(transactionsx[0])
  let filter = [];

  for (let i = 0; i < transactionsx.length; i++) {
    filter.push({
      user: transactionsx[i].from,
      depositedBuds: transactionsx[i].quantity,
    });
  }

  let response = groupBy(filter, "user");


  let fin = [];
  
  for (const key in response) {
    console.log(response[key]);
    fin.push(response[key]);
  }
 // console.log(fin[5], fin.length);
})();

*/

/*
contract.getAllNfts(axios).then((r) => {

  r.forEach(element => {
    let seedID  = element.properties.SEEDID
    let seedExists = jp.query(state.users[from], `$.seeds[?(@.id==${seedID})]`);
    
  });
});
*/

/*
(async () => {
  contract.getAllNftsAgua(axios).then(async (response) => {
    for (let index = 0; index < response.length; index++) {
      let e = response[index];
      try {
        if (!e.properties.hasOwnProperty("LVL")) {
          console.log(
            "update lvl of nft water",
            e,
            index + "/" + response.length
          );

          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 2000);
          });
          await contract
            .updateMultipleNfts(hivejs, [
              {
                id: "" + e.id,
                properties: { LVL: 1 },
              },
            ])
            .then((res) => {
              console.log(res);
            });
        }
      } catch (e) {
        console.log("error mientras se actualizaba propiedad", e);
      }
    }
  });
})();  */

/* vamo por aquiiii 
(async () => {
  contract.getAllPlotsAndSeeds(axios).then(async (response) => {
    let rx = response.plots.length;
    console.log("updating", rx);
    for (let index = 0; index < rx; index++) {
      const element = response.plots[index];

      if (element.properties.hasOwnProperty("SEEDID")) {
        if (element.properties.SEEDID > 0) {
          if (element.properties.OCCUPIED) {
            let seed = jp.query(
              response,
              `$.seeds[?(@.id==${element.properties.SEEDID})]`
            );

            if (seed) {
              if (seed.length > 0) {
                //console.log("encontre semilla", seed[0].owner, element.owner );
                if (seed[0].owner != element.owner) {
                  if (seed[0].owner === "hk-vault") {
                    
                    console.log(
                      "actualizando nft porque",
                      seed[0].owner + " " + seed[0].id,
                      element.owner
                    );
                    await new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                      }, 1000);
                    });

                    await contract
                      .updateMultipleNfts(hivejs, [
                        {
                          id: "" + element.id,
                          properties: { OCCUPIED: false, SEEDID: 0 },
                        },
                      ])
                      .then((res) => {});

                    await new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                      }, 1000);
                    });

                    await contract
                      .generateToken(
                        hivejs,
                        "BUDS",
                        seed[0].properties.PR.toFixed(3),
                        element.owner
                      )
                      .then((e) => {});
                  }
                }
              }
            }
          }
        }
      }
    }
  });
})();*/
/*
contract.SendSeedPoolManual(hivejs, 4, "chocolatoso").then((r) => {
  console.log(r);
}); */

/* 
contract
  .updateMultipleNfts(hivejs, [
    { id: '146545', properties: { SPT: 3 } },
    { id: '146567', properties: { SPT: 0 } },
    { id: '146575', properties: { SPT: 2 } },
    { id: '146623', properties: { SPT: 2 } },
    { id: '146636', properties: { SPT: 3 } },
    { id: '146653', properties: { SPT: 2 } },
    { id: '146669', properties: { SPT: 1 } },
    { id: '146684', properties: { SPT: 3 } },
    { id: '146704', properties: { SPT: 6 } },
    { id: '146706', properties: { SPT: 6 } },
    { id: '146712', properties: { SPT: 6 } },
    { id: '146895', properties: { SPT: 0 } },
    { id: '146897', properties: { SPT: 1 } },
    { id: '146898', properties: { SPT: 1 } },
    { id: '146900', properties: { SPT: 1 } },
    { id: '146902', properties: { SPT: 1 } },
    { id: '146904', properties: { SPT: 1 } },
    { id: '146907', properties: { SPT: 1 } },
    { id: '146914', properties: { SPT: 1 } },
    { id: '146916', properties: { SPT: 1 } },
    { id: '146917', properties: { SPT: 1 } },
    { id: '146922', properties: { SPT: 1 } },
    { id: '146927', properties: { SPT: 1 } },
    { id: '146928', properties: { SPT: 1 } },
    { id: '146931', properties: { SPT: 1 } },
    { id: '146932', properties: { SPT: 1 } },
    { id: '146934', properties: { SPT: 2 } },
    { id: '146941', properties: { SPT: 2 } },
    { id: '146943', properties: { SPT: 2 } },
    { id: '146945', properties: { SPT: 2 } },
    { id: '146948', properties: { SPT: 0 } },
    { id: '146949', properties: { SPT: 2 } },
    { id: '146960', properties: { SPT: 2 } },
    { id: '146964', properties: { SPT: 2 } },
    { id: '146965', properties: { SPT: 2 } },
    { id: '146968', properties: { SPT: 2 } },
    { id: '146979', properties: { SPT: 2 } },
    { id: '146983', properties: { SPT: 2 } }
  ])
  .then((res) => {
    console.log(res);
  }); */

/* reparar despues
(async () => {
  contract.getAllPlotsAndSeeds(axios).then(async (response) => {
    for (let index = 0; index < response.plots.length; index++) {
      const element = response.plots[index];

      if (
        !element.properties.hasOwnProperty("SEEDID") ||
        !element.properties.hasOwnProperty("OCCUPIED")
      ) {
        console.log("este plot esta muerto", element)
      }
    }
  });
})(); */

/*
(async () => {
  contract.getAllPlotsAndSeeds(axios).then(async (response) => {
    for (let index = 0; index < response.plots.length; index++) {
      const element = response.plots[index];

      if (
        !element.properties.hasOwnProperty("SEEDID") &&
        element.properties.hasOwnProperty("OCCUPIED")
      ) {
          console.log("este plot esta muerto", element);
        
      }
    }
  });
})(); 
*/

/*
(async () => {
  contract.getAllUsersHaveAPlot(axios).then(async (r) => {
    for (const key in r) {
      console.log("enviando", r[key]);

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });
      await contract.distributeAvatar(hivejs, r[key]);
    }
  });
})();*/

/*
(async () => {
  contract.getAllAvatar(axios).then(async (r) => {
    for (const key in r.plots) {
      console.log("cambiando", r.plots[key]);

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      await contract
        .updateMultipleNfts(hivejs, [
          {
            id: "" + r.plots[key].id,
            properties: {
              XP: 45,
              NAME:
                r.plots[key].properties.NAME == "Magical Male"
                  ? "Magical Shaggi"
                  : "Magical Maggi",
            },
          },
        ])
        .then((res) => {
          console.log(res);
        });
     
    }
  });
})();


*/

/*

(async () => {
  contract.getAllPlotsbyRegion(axios).then(async (response) => {
    let update = [];

    console.log(response.plots.length);

    let test = groupBy(response.plots);

    let n = [];
    for (const key of Object.keys(test)) {
      n.push({ usuario: key, cantidad: test[key].cantidad });
    }
    
    let enviar = sort(n);

    for (let index = 0; index < enviar.length; index++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });
      console.log(
        enviar[index].usuario,
        enviar[index].cantidad,
        enviar[index].cantidad * 1
      );

      await contract.distributeSubdividePlots(
        hivejs,
        enviar[index].usuario,
        enviar[index].cantidad * 1,
        "Asia"
      );
    } 

    /*
    for (let i = 0; i < response.plots.length; i++) {
      if (response.plots[i]) {
        if (i % 45 == 0) {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 2000);
          });
          console.log("cambiando a subdividir true", update);
          await contract.updateMultipleNfts(hivejs, update).then((res) => {
            console.log("actualizado", res);
          });
          update = [];
        } else {
          update.push({
            id: "" + response.plots[i].id,
            properties: { SUBDIVIDED: true },
          });
        }
      }
    } 

  });
})();
*/

/*
const SSC = require("sscjs");
const ssc = new SSC("herpc.dtools.devrpc");


const processxor = require("./hiveEngineProcessor");
processxor(
  ssc,
  7525370,
  (payload) => {
    console.log("payload on token send", payload);
  },
  (nft) => {
    console.log("payload nft send", nft)
  }
);
 */

/* 
contract.createAvatar(hivejs,"Lucky Shaggi","dota2hive").then(e => {
  console.log(e)
}).catch(err => {
  console.log(err)
}) 
*/

/* */
contract.getNFT(axios, 233042).then(async (e) => {
  let {
    plots,
    seeds,
    tokens,
    waterTowers,
    waterPlants,
    avatars,
    joints,
    rents,
    rented,
    bundles,
  } = await contract.getUserNft(ssc, axios, "chocolatoso");

  console.log(
    tokens,
  );
});

/*
contract.createAvatar(hivejs,"Lucky Shaggi","nelsonagg").then(e => {
  console.log(e)
}).catch(err => {
  console.log(err)
}) */

/*
[

]


  
contract.generateToken(hivejs, "MOTA", "22.8618", "ooakosimo").then((e) => {
  console.log(e);
});*/

/*
contract.getOnlyUsers(axios, ssc).then((e) => {
  console.log(e);
});
*/

/*
contract.getAllByName(axios, "Magical Shaggi").then(async (e) => {
  let avatars = e.avatars;
  let arrays = divideArrayByArrays(avatars, 40);
  for (var i = 0; i < arrays.length; i++) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
    
    await contract
      .updateMultipleNfts(hivejs, formatearArrayAdecuado(arrays[i]))
      .then((res) => {
        console.log(res);
      });
  }
});
*/
//get number aleatory 10-16
/*
function aleatoryNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function divideArrayByArrays(arr, arrays) {
  let result = [];
  for (let i = 0; i < arr.length; i += arrays) {
    result.push(arr.slice(i, i + arrays));
  }
  return result;
}

function formatearArrayAdecuado(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push({
      id: "" + arr[i].id,
      properties: { POWER: aleatoryNumber(45, 72), USAGE: 4 },
    });
  }
  return result;
} */
