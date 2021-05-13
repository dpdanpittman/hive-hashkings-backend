const axios = require("axios");
const contract = require("./contract");
var hivejs = require("@hiveio/hive-js");
hivejs.api.setOptions({ url: "https://anyx.io/" });
hivejs.config.set("alternative_api_endpoints", [
  "https://api.hive.blog/",
  "https://anyx.io/",
]);
var jp = require("jsonpath");

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
contract.generateToken(hivejs, "BUDS", "7724", "dominic23").then(e=>{
  console.log(e);
})
*/

/*
contract.createPlot(hivejs,"South America",1,"elfran919").then(r=>{
  console.log(r);
})
*/
/*
contract
  .updateMultipleNfts(hivejs, [
    {
      id: "" + 7758,
      properties: { SPT:0 },
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
            }, 7000);
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

/*
(async () => {
  contract.getAllPlotsAndSeeds(axios).then(async (response) => {
    for (let index = 0; index < response.plots.length; index++) {
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
                  console.log("actualizando nft porque", seed[0].owner, element.owner);
                  await new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                    }, 7000);
                  });
                  contract
                    .updateMultipleNfts(hivejs, [
                      {
                        id: "" + element.id,
                        properties: { OCCUPIED: false, SEEDID: 0 },
                      },
                    ])
                    .then((res) => {
                      console.log("actualizado", res);
                    });
                }
              }
            }
          }
        }
      }
    }
  });
})(); */

/*
contract.SendSeedPoolManual(hivejs, 4, "chocolatoso").then((r) => {
  console.log(r);
}); */

/*
contract
  .updateMultipleNfts(hivejs, [
    {
      id: "" + 6703,
      properties: { OCCUPIED: false },
    },
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
 contract.generateToken(hivejs, "HKWATER", (120).toFixed(3),"udabeu"  ).then(e => {
   console.log(e)
 }) */


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
      console.log(enviar[index].usuario,enviar[index].cantidad ,enviar[index].cantidad * 5)
      
      
      await contract.distributeSubdividePlots(
        hivejs,
        enviar[index].usuario,
        enviar[index].cantidad * 5,
        "Afghanistan"
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
    } */

    
  });
  
})();
