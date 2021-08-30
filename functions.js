const contract = require("./contract.js");
var axios = require("axios");
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
} = require("./database");

var jp = require("jsonpath");

var hivejs = require("@hiveio/hive-js");

hivejs.api.setOptions({ url: "https://anyx.io" });
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
                  "seed ",
                  seedID,
                  " successfully watered"
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

    if (
      state.users[from] &&
      type == "pinner" &&
      amountBudsInt === 50 &&
      state.users[from].lvl >= 1
    ) {
      // create pinner
      consumable = "Pinner";
    } else if (
      state.users[from] &&
      type == "hempWrappedJoint" &&
      amountBudsInt === 200 &&
      state.users[from].lvl >= 15
    ) {
      // create hempwrappedjoint
      consumable = "Hemp Wrapped Joint";
    } else if (
      state.users[from] &&
      type == "crossJoint" &&
      amountBudsInt === 1000 &&
      state.users[from].lvl >= 30
    ) {
      consumable = "Cross Joint";
    } else if (
      state.users[from] &&
      type == "blunt" &&
      amountBudsInt === 2500 &&
      state.users[from].lvl >= 45
    ) {
      // create blunt
      consumable = "Blunt";
    } else if (
      state.users[from] &&
      type == "hempWrappedBlunt" &&
      amountBudsInt === 5000 &&
      state.users[from].lvl >= 60
    ) {
      // create hempwrappedblunt
      consumable = "Hemp Wrapped Blunt";
    } else if (
      state.users[from] &&
      type == "twaxJoint" &&
      amountBudsInt === 10000 &&
      state.users[from].lvl >= 75
    ) {
      // set plot to subdivided
      consumable = "Twax Joint";
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
    }
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
            xptoUpdate = state.stats.joints.pinner;
          } else if (jointString == "hempWrappedJoint") {
            xptoUpdate = state.stats.joints.hempWrappedJoint;
          } else if (jointString == "crossJoint") {
            xptoUpdate = state.stats.joints.crossJoint;
          } else if (jointString == "blunt") {
            xptoUpdate = state.stats.joints.blunt;
          } else if (jointString == "hempWrappedBlunt") {
            xptoUpdate = state.stats.joints.hempWrappedBlunt;
          } else if (jointString == "twaxJoint") {
            xptoUpdate = state.stats.joints.twaxJoint;
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
      await sendNotificationToUser(from, PLOTID + " planted successfully");
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

module.exports = {
  tohkvault,
  nfttohkvaul,
  plant_plot,
  subdivide_plot,
};
