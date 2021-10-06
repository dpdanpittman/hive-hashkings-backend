const contract = require("./contract.js");
var axios = require("axios");
const WeightedList = require("js-weighted-list");
const {
  saveLog,
  setTransaction,
  getAllTransaction,
  updateTransaction,
  updateorSetPendingTransaction,
  updateOrsetTransaction,
  storeUpdateXp,
  getactiveAvatar,
  sendNotificationToUser,
  addPendingRefundMota,
} = require("./database");

var jp = require("jsonpath");

var hivejs = require("@hiveio/hive-js");

hivejs.api.setOptions({ url: "https://api.deathwing.me" });
hivejs.config.set("alternative_api_endpoints", [
  "https://api.deathwing.me",
  "https://api.hivekings.com",
  "https://anyx.io",
]);

const tohkvault = async (json, from, state) => {
  //Water Plot
  //user sends HKWater to hk-vault with memo seedID
  if (json.contractPayload.symbol === "HKWATER" && json.contractPayload.memo) {
    console.log("watering", from, json);

    let seedID = json.contractPayload.memo;
    let whoFrom = "" + from;

    let amountWater = json.contractPayload.quantity;
    let amountWaterInt = parseInt(amountWater, 10);
    let amountString = "" + amountWater;

    var water = await contract.getAvatarOnBlockchain(axios, seedID);

    try {
      if (water.WATER != 0) {
        let waterRemains = water.WATER - amountWaterInt;
        let seedIdString = "" + seedID;
        // set water to new amount

        await contract
          .updateNft(hivejs, seedIdString, {
            WATER: waterRemains,
          })
          .then(async (response) => {
            await updateOrsetTransaction(
              json.transaction_id,
              "tohk-vault",
              json,
              from,
              "process complete"
            )
              .then(async (red) => {
                await sendNotificationToUser(
                  from,
                  "seed " + seedIdString + " successfully watered"
                );
              })
              .catch((e) => {
                console.log("ocurrio un error", e);
              });
          })
          .catch(async (e) => {
            await updateorSetPendingTransaction(
              json.transaction_id,
              "tohk-vault",
              json,
              from,
              "error on update nft seed to set water"
            ).then(async (r) => {
              await sendNotificationToUser(
                from,
                "seed ",
                seedID,
                " error watering, we will try again in a few minutes "
              );
            });
          });
      } else {
        await updateOrsetTransaction(
          json.transaction_id,
          "tohk-vault",
          json,
          from,
          "process complete"
        )
          .then(async (red) => {
            await contract
              .generateToken(hivejs, "HKWATER", "" + amountWaterInt, from)
              .then(async () => {
                // console.log("sending buds", budAmount, from);
                await sendNotificationToUser(
                  from,
                  "seed ",
                  seedID,
                  " error watering, You tried to water a seed that does not need more water, we will send you the water back "
                );
              })
              .catch(async (e) => {
                //no pude enviar buds, guardando en pendiente para enviar
                console.error(from + " it could not send buds", e);
              });
          })
          .catch((e) => {
            console.error("ocurrio un error", e);
          });
      }
    } catch (error) {
      console.error(
        from +
          " had an issue watering seedID" +
          json.contractPayload.memo +
          " refunding",
        error
      );

      await updateOrsetTransaction(
        json.transaction_id,
        "tohk-vault",
        json,
        from,
        "process complete"
      )
        .then(async (red) => {
          await contract
            .generateToken(hivejs, "HKWATER", "" + amountWaterInt, from)
            .then(async () => {
              // console.log("sending buds", budAmount, from);
              await sendNotificationToUser(
                from,
                "seed ",
                seedID,
                " error watering, unexpected error, try again, we will send you the water back "
              );
            })
            .catch(async (e) => {
              //no pude enviar buds, guardando en pendiente para enviar
              console.error(from + " it could not send buds", e);
            });
        })
        .catch((e) => {
          console.error("ocurrio un error", e);
        });
    }
  }

  //Craft Consumable joints and boosters
  //user sends BUDS to hk-vault with memo type (ex. joint, blunt etc..)
  if (json.contractPayload.symbol == "BUDS") {
    let type = json.contractPayload.memo.split(" ")[0];
    // console.log("procesing send buds", type);
    let amountBuds = json.contractPayload.quantity;
    let amountBudsInt = parseInt(amountBuds, 10);

    let consumable = null;

    console.log(from, "solicitando", type);

    if (state.users[from] && type == "pinner" && state.users[from].lvl >= 1) {
      // create pinner
      consumable = "Pinner";
    } else if (
      state.users[from] &&
      type == "hempWrappedJoint" &&
      state.users[from].lvl >= 15
    ) {
      // create hempwrappedjoint
      consumable = "Hemp Wrapped Joint";
    } else if (
      state.users[from] &&
      type == "crossJoint" &&
      state.users[from].lvl >= 30
    ) {
      consumable = "Cross Joint";
    } else if (
      state.users[from] &&
      type == "blunt" &&
      state.users[from].lvl >= 45
    ) {
      // create blunt
      consumable = "Blunt";
    } else if (
      state.users[from] &&
      type == "hempWrappedBlunt" &&
      state.users[from].lvl >= 60
    ) {
      // create hempwrappedblunt
      consumable = "Hemp Wrapped Blunt";
    } else if (
      state.users[from] &&
      type == "twaxJoint" &&
      state.users[from].lvl >= 75
    ) {
      // set plot to subdivided
      consumable = "Twax Joint";
    } else if (
      state.users[from] &&
      type == "tripleBraid" &&
      state.users[from].lvl >= 80
    ) {
      // set plot to subdivided
      consumable = "Triple Braid";
    } else if (
      state.users[from] &&
      type == "scorpionJoint" &&
      state.users[from].lvl >= 80
    ) {
      // set plot to subdivided
      consumable = "Scorpion Joint";
    }

    if (consumable) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      await contract
        .createConsumable(hivejs, consumable, type, from)
        .then(async (response) => {
          await updateOrsetTransaction(
            json.transaction_id,
            "tohk-vault",
            json,
            from,
            "process complete"
          )
            .then(async (red) => {
              // console.log("sending ", consumable, "to ", from);
              await sendNotificationToUser(from, "sending " + consumable);
            })
            .catch((e) => {
              console.error("ocurrio un error", e);
            });
        })
        .catch(async (e) => {
          console.error("error al enviar consumable", e);
          await updateorSetPendingTransaction(
            json.transaction_id,
            "tohk-vault",
            json,
            from,
            "error on sending " + consumable + " to " + from
          ).then(async (red) => {
            await sendNotificationToUser(
              from,
              "error on sending " + consumable,
              "we try send again soon"
            );
          });
        });
    } else {
      console.log("no consumable valido // refund despue");
    }
  }

  if (json.contractPayload.symbol == "MOTA" && json.contractPayload.memo) {
    const amount = parseFloat(json.contractPayload.quantity);
    var want =
        json.contractPayload.memo.split(" ")[0].toLowerCase() ||
        json.contractPayload.memo.toLowerCase(),
      type = json.contractPayload.memo.split(" ")[1] || "";

    await motaPriceConversion(state, amount)
      .then(async (price) => {
        let canBuy = price + 0.01 >= state.stats.prices.waterPlants.lvl2.price;

        console.log(
          "try upgrade water tower",
          price,
          state.stats.prices.waterPlants.lvl2.price
        );
        processWaterBuy(
          json,
          from,
          json.contractPayload.quantity,
          want,
          type,
          state,
          canBuy
        );
      })
      .catch(async (e) => {
        //regresa el dinero vale mia
      });
  }
};

const nfttohkvaul = async (json, from, state) => {
  if (json.contractPayload.nfts[0].symbol === "HKFARM") {
    let nftComing = json.contractPayload.nfts[0];

    var nft = await contract.getNFT(axios, parseInt(nftComing.ids[0], 10));

    if (nft) {
      if (nft.properties.TYPE == "seed") {
        let sptStatus = nft.properties.SPT;
        let waterStatus = nft.properties.WATER;

        if (sptStatus < 1 && waterStatus < 1) {
          let plotIDString = "" + nft.properties.PLOTID;
          var budAmount = nft.properties.PR;
          //send harvested buds to user
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });

          await contract
            .updateNft(hivejs, plotIDString, { OCCUPIED: false, SEEDID: 0 })
            .then(async () => {
              await updateOrsetTransaction(
                json.transaction_id,
                "nfttohk-vault",
                json,
                from,
                "process complete"
              )
                .then(async (red) => {
                  /*  console.log(
                    "proceso completo, se actualizo el plot",
                    plotIDString
                  ); */
                })
                .catch((e) => {
                  // console.log("ocurrio un error", e);
                });

              await contract
                .generateToken(hivejs, "BUDS", budAmount, from)
                .then(async () => {
                  // console.log("sending buds", budAmount, from);
                  await sendNotificationToUser(
                    from,
                    "plot " + plotIDString + " successfully collected"
                  );

                  var data = [
                    ["0", 85.0],
                    ["1", 15.0],
                  ];

                  var data2 = [
                    ["0", 90.0],
                    ["1", 10.0],
                  ];

                  var wl = new WeightedList(data);
                  var wl2 = new WeightedList(data2);

                  if (parseInt(wl2.peek()[0]) == 1) {
                    await contract
                      .createSeedTT(hivejs, 1, "hashkings", nft.properties.NAME)
                      .then(async (r) => {});
                  }

                  if (parseInt(wl.peek()[0]) == 1) {
                    console.log(from, "gano random seed");

                    await contract
                      .createSeedTT(hivejs, 1, from, nft.properties.NAME)
                      .then(async (r) => {
                        await sendNotificationToUser(
                          from,
                          "you found a seed " + r
                        );
                      });
                  }
                })
                .catch(async (e) => {
                  //no pude enviar buds, guardando en pendiente para enviar
                  console.error(from + " it could not send buds", e);
                });
            })
            .catch(async (e) => {
              await updateorSetPendingTransaction(
                json.transaction_id,
                "nfttohk-vault",
                json,
                from,
                from + " it couldnt update plot " + plotIDString
              );
            });
        }
      }

      if (nft.properties.TYPE == "consumable") {
        //smoke joint
        //user sends comumable NFT to hk-vault with memo type (ex. smoke_joint, smoke_blunt etc..)
        try {
          let jointString = "" + nft.properties.CONSUMABLETYPE;

          //console.log("this user", from, "try smoke", jointString);

          let xptoUpdate = null;
          if (jointString == "pinner") {
            xptoUpdate = 15;
          } else if (jointString == "hempWrappedJoint") {
            xptoUpdate = 75;
          } else if (jointString == "crossJoint") {
            xptoUpdate = 400;
          } else if (jointString == "blunt") {
            xptoUpdate = 1100;
          } else if (jointString == "hempWrappedBlunt") {
            xptoUpdate = 2500;
          } else if (jointString == "twaxJoint") {
            xptoUpdate = 6000;
          } else if (jointString == "tripleBraid") {
            xptoUpdate = 15000;
          } else if (jointString == "scorpionJoint") {
            xptoUpdate = 35000;
          }

          if (xptoUpdate) {
            await updateXP(state, xptoUpdate, from, nft.id, json);
          }
        } catch (error) {
          console.error("error al fumar smoke", error);
        }
      }
    } else {
      await updateorSetPendingTransaction(
        json.transaction_id,
        "nfttohk-vault",
        json,
        from,
        from + " nft no exist check please "
      );
      return;
    }

    //Rent Subdivision <---- coming soon
    //user will send mota to hk-vault with memo plotOwner and amountRent
  }
};

async function updateXP(state, xp, from, joinID, json) {
  //validar aquiii

  let activeAvatarID = await getactiveAvatar(from);

  let avatar = null;

  if (activeAvatarID) {
    avatar = await contract.getAvatarOnBlockchain(
      axios,
      parseInt(activeAvatarID, 10)
    );
  }

  if (!avatar) {
    console.error(
      "no pude traer al avatar de la blockchain, regresando a pendiente"
    );

    await updateorSetPendingTransaction(
      json.transaction_id,
      "nfttohk-vault",
      json,
      from,
      "error on update xp"
    ).then(async (red) => {
      await sendNotificationToUser(
        from,
        "error on update xp, we try again soon"
      );
    });
    return;
  }

  //validar aqui
  await contract
    .updateNft(hivejs, "" + activeAvatarID, {
      XP: avatar.XP + xp,
    })
    .then(async () => {
      // console.log("smoke update xp success");

      await updateOrsetTransaction(
        json.transaction_id,
        "nfttohk-vault",
        json,
        from,
        "process update xp complete"
      )
        .then(async (red) => {
          await sendNotificationToUser(from, "update xp successfully");

          storeUpdateXp(from, xp)
            .then((response) => {
              //  console.log("store xp to new report done", from, xp);
            })
            .catch((e) => {
              console.error("error al guardar new report", e);
            });
        })
        .catch((e) => {
          console.error("ocurrio un error", e);
        });
    })
    .catch(async (e) => {
      console.error(
        "no se pudo actualizar el nft para subir la xp",
        xp,
        from,
        "regresando operacion a pediente",
        e
      );

      await updateorSetPendingTransaction(
        json.transaction_id,
        "nfttohk-vault",
        json,
        from,
        "error on update xp"
      );
    });
}

const plant_plot = async (json, from, state) => {
  let seedID = json.seedID;
  let plotID = json.plotID;

  let plotIDString = "" + plotID;
  let seedIDString = "" + seedID;
  //vamos a verificar tanto la seed como la plot

  let plot = await contract.getNFT(axios, parseInt(plotID));
  let seed = await contract.getNFT(axios, parseInt(seedID));

  //console.log("verify seed and plot ", seedID, plotID, from);

  //make seed used and designate plot

  if (!(await validatePlotAndSeed(plot, seed, from))) {
    return;
  }

  await contract
    .updateMultipleNfts(hivejs, [
      {
        id: plotIDString,
        properties: { OCCUPIED: true, SEEDID: parseInt(seedID) },
      },
      {
        id: seedIDString,
        properties: { PLANTED: true, PLOTID: parseInt(plotID) },
      },
    ])
    .then(async (res) => {
      // console.log("update plot and seed successfully", from);
      await sendNotificationToUser(from, plotID + " planted successfully");
    })
    .catch((e) => {
      console.error("error on update plot and seed", e);
    });
};

const subdivide_plot = async (json, from, state) => {};

const Seeds = {
  Aceh: "Asia",
  Thai: "Asia",
  "Thai Chocolate": "Asia",
  "Lamb’s Bread": "Jamaica",
  "King’s Bread": "Jamaica",
  "Swazi Gold": "Africa",
  Kilimanjaro: "Africa",
  "Durban Poison": "Africa",
  Malawi: "Africa",
  "Hindu Kush": "Afghanistan",
  Afghani: "Afghanistan",
  "Lashkar Gah": "Afghanistan",
  "Mazar I Sharif": "Afghanistan",
  "Acapulco Gold": "Mexico",
  "Colombian Gold": "South America",
  "Panama Red": "South America",
};

const validatePlotAndSeed = async (plot, seed, from) => {
  let plotOrSeedNoExist = false;
  let plotOrSeedOcupped = false;

  if (plot && seed) {
    if (plot.properties.OCCUPIED || seed.properties.PLANTED) {
      console.error("plot or seed ocupped", from);
      plotOrSeedOcupped = true;
    }
  } else {
    console.error("no seed or no plot ", plot, seed, from);
    plotOrSeedNoExist = true;
  }

  let seedPerteneceAPlot = true;
  if (Seeds[seed.properties.NAME] == plot.properties.NAME) {
    seedPerteneceAPlot = false;
  } else {
    console.log("semilla no pertenece a esta tierra", from);
  }

  let seedYplotPertenecenAUsuario = true;

  if (plot.properties.RENTED) {
    if (plot.properties.RENTEDINFO == from && seed.account == from) {
      seedYplotPertenecenAUsuario = false;
    } else {
      console.error(
        "la semilla o la tierra no pertenece al usuario que renta",
        from
      );
    }
  } else {
    if (plot.account == from && seed.account == from) {
      seedYplotPertenecenAUsuario = false;
    } else {
      console.error("la semilla o la tierra no pertenece al usuario", from);
    }
  }

  return (
    !plotOrSeedNoExist &&
    !plotOrSeedOcupped &&
    !seedPerteneceAPlot &&
    !seedYplotPertenecenAUsuario
  );
};

async function processWaterBuy(json, from, amount, want, type, state, canBuy) {
  let waterTower = await contract.getNFT(axios, parseInt(type, 10));
  console.log("procesando compra con mota", from, amount, want, type, canBuy);

  if (!canBuy) {
    await addPendingRefundMota(
      from,
      amount,
      "Refund for " + want + " " + type + " error amount, try again"
    );

    return;
  }

  if (!waterTower) {
    addPendingRefundMota(
      from,
      amount,
      "Refund for " + want + " " + type + " error no found this nft, try again."
    );
    return;
  }

  if ("water" + waterTower.properties.LVL == want) {
    addPendingRefundMota(
      from,
      amount,
      "Refund for " +
        want +
        " " +
        type +
        " error this water tower has already been raised to this level."
    );

    return;
  }

  if (want === "water2" && canBuy && state.users[from].lvl >= 10) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 2, WATER: 96 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water3" && canBuy && state.users[from].lvl >= 20) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 3, WATER: 166 });
    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water4" && canBuy && state.users[from].lvl >= 30) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 4, WATER: 234 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water5" && canBuy && state.users[from].lvl >= 40) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 5, WATER: 302 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water6" && canBuy && state.users[from].lvl >= 50) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 6, WATER: 370 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water7" && canBuy && state.users[from].lvl >= 60) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 7, WATER: 438 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water8" && canBuy && state.users[from].lvl >= 70) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 8, WATER: 506 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water9" && canBuy && state.users[from].lvl >= 80) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 9, WATER: 574 });

    const c = parseInt(amount);
    state.bal.c += c;
  } else if (want === "water10" && canBuy && state.users[from].lvl >= 90) {
    // create nft
    await contract.updateNft(hivejs, type, { LVL: 10, WATER: 642 });

    const c = parseInt(amount);
    state.bal.c += c;
  }
}

function motaPriceConversion(state, amount) {
  return new Promise((resolve, reject) => {
    axios
      .post("https://us.engine.ryamer.com/contracts", {
        jsonrpc: "2.0",
        id: 12,
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
      .then((result) => {
        const lasPrice = result.data.result[0].lastPrice;
        const valueInHive = amount / lasPrice;

        resolve(valueInHive);
      })
      .catch(async (err) => {
        reject(false);
      });
  });
}

module.exports = {
  tohkvault,
  nfttohkvaul,
  plant_plot,
  subdivide_plot,
};
