const contract = require("./contract.js");
const {
  saveLog,
  setTransaction,
  getAllTransaction,
  updateTransaction,
  updateorSetPendingTransaction,
  updateOrsetTransaction,
} = require("./database");

var jp = require("jsonpath");

var hivejs = require("@hiveio/hive-js");

const tohkvault = async (json, from, state) => {
  //Water Plot
  //user sends HKWater to hk-vault with memo seedID
  if (json.contractPayload.symbol === "HKWATER" && json.contractPayload.memo) {
    console.log("watering");
    let seedID = json.contractPayload.memo;
    let whoFrom = "" + from;

    let amountWater = json.contractPayload.quantity;
    let amountWaterInt = parseInt(amountWater, 10);
    let amountString = "" + amountWater;

    console.log(
      "seedID= " +
        seedID +
        "; amountWater= " +
        amountWater +
        "; amountWaterInt= " +
        amountWaterInt
    );

    var water = jp.query(
      state.users[from],
      `$.seeds[?(@.id==${seedID})].properties.WATER`
    );

    try {
      if (state.users[from] && water != 0) {
        let waterRemains = water - amountWaterInt;
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
              .then(async (red) => {})
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
            );
          });
      } else {
        state.refund.push([
          "customJson",
          "ssc-mainnet-hive",
          {
            contractName: "tokens",
            contractAction: "transfer",
            contractPayload: {
              symbol: "HKWATER",
              to: whoFrom,
              quantity: amountWater,
              memo: "plot has already been watered",
            },
          },
        ]);
      }
    } catch (error) {
      console.log(
        from +
          " had an issue watering seedID" +
          json.contractPayload.memo +
          " refunding",
        error
      );

      state.refund.push([
        "customJson",
        "ssc-mainnet-hive",
        {
          contractName: "tokens",
          contractAction: "transfer",
          contractPayload: {
            symbol: "HKWATER",
            to: whoFrom,
            quantity: amountString,
            memo: "we discovered an issue watering, please try again.",
          },
        },
      ]);
    }
  }

  //Craft Consumable joints and boosters
  //user sends BUDS to hk-vault with memo type (ex. joint, blunt etc..)
  if (json.contractPayload.symbol == "BUDS") {
    let type = json.contractPayload.memo.split(" ")[0];
    console.log("procesing send buds", type);
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
              console.log("sending ", consumable, "to ", from);
            })
            .catch((e) => {
              console.log("ocurrio un error", e);
            });
        })
        .catch(async (e) => {
          console.log("error al enviar consumable", e);
          await updateorSetPendingTransaction(
            json.transaction_id,
            "tohk-vault",
            json,
            from,
            "error on sending " + consumable + " to " + from
          );
        });
    }

    /*
    
    else if (
      state.users[from] &&
      json.contractPayload.memo == "lvl1_booster" &&
      amountBudsInt === 10
    ) {
      // set plot to subdivided
      let log = await contract.createConsumable(
        hivejs,
        "Level 1 Booster",
        type,
        from
      );
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } else if (
      state.users[from] &&
      json.contractPayload.memo == "lvl2_booster" &&
      amountBudsInt === 50
    ) {
      // set plot to subdivided
      let log = await contract.createConsumable(
        hivejs,
        "Level 2 Booster",
        type,
        from
      );
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } else if (
      state.users[from] &&
      json.contractPayload.memo == "lvl3_booster" &&
      amountBudsInt === 210
    ) {
      // set plot to subdivided
      let log = await contract.createConsumable(
        hivejs,
        "Level 3 Booster",
        type,
        from
      );
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } else if (
      state.users[from] &&
      json.contractPayload.memo == "lvl4_booster" &&
      amountBudsInt === 2000
    ) {
      // set plot to subdivided
      let log = await contract.createConsumable(
        hivejs,
        "Level 4 Booster",
        type,
        from
      );
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } else if (
      state.users[from] &&
      json.contractPayload.memo == "lvl5_booster" &&
      amountBudsInt === 2500
    ) {
      // set plot to subdivided
      let log = await contract.createConsumable(
        hivejs,
        "Level 5 Booster",
        type,
        from
      );
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } else if (
      state.users[from] &&
      json.contractPayload.memo == "lvl6_booster" &&
      amountBudsInt === 50
    ) {
      // set plot to subdivided
      let log = await contract.createConsumable(
        hivejs,
        "Level 6 Booster",
        type,
        from
      );
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } */
  }
};

const nfttohkvaul = async (json, from, state) => {
  if (json.contractPayload.nfts[0].symbol === "HKFARM") {
    let seed = json.contractPayload.nfts[0];
    let nft = json.contractPayload.nfts[0];
    let booster = json.contractPayload.nfts[0];

    let seedID = seed.ids[0];
    let jointID = parseInt(nft.ids[0], 10);
    let boosterID = booster.ids[0];

    let plotID = jp.query(
      state.users[from],
      `$.seeds[?(@.id==${seedID})].properties.PLOTID`
    );
    let sptStatus = jp.query(
      state.users[from],
      `$.seeds[?(@.id==${seedID})].properties.SPT`
    );
    let waterStatus = jp.query(
      state.users[from],
      `$.seeds[?(@.id==${seedID})].properties.WATER`
    );
    let seedExists = jp.query(state.users[from], `$.seeds[?(@.id==${seedID})]`);

    let seedSent = jp.query(
      state.users["hk-vault"],
      `$.seeds[?(@.id==${seedID})]`
    );

    let jointTypes = jp.query(
      state.users[from],
      `$.joints[?(@.id==${jointID})].properties.CONSUMABLETYPE`
    );

    let jointTypesHKVAULT = jp.query(
      state.users["hk-vault"],
      `$.joints[?(@.id==${jointID})].properties.CONSUMABLETYPE`
    );

    if (
      state.users[from] ||
      (state.users["hk-vault"] && seedExists) ||
      (seedSent && sptStatus < 1 && waterStatus < 1)
    ) {
      var budAmount =
        "" +
        jp.query(
          state.users[from],
          `$.seeds[?(@.id==${seedID})].properties.PR`
        );

      var budAmountVault =
        "" +
        jp.query(
          state.users["hk-vault"],
          `$.seeds[?(@.id==${seedID})].properties.PR`
        );

      let plotIDString = "" + plotID;

      console.log("cheking", budAmount, budAmountVault);

      if (budAmountVault) {
        plotID = jp.query(
          state.users["hk-vault"],
          `$.seeds[?(@.id==${seedID})].properties.PLOTID`
        );

        plotIDString = "" + plotID;

        budAmount = budAmountVault;
      }

      if (!budAmount) {
        console.log("seed no esta en ninguna parte");
      }

      //send harvested buds to user
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      if (plotIDString) {
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
              .then(async (red) => {})
              .catch((e) => {
                console.log("ocurrio un error", e);
              });

            if (!budAmount) {
              await contract
                .generateToken(hivejs, "BUDS", budAmount, from)
                .then(() => {
                  console.log("sending buds", budAmount, from);
                })
                .catch(async (e) => {
                  //no pude enviar buds, guardando en pendiente para enviar
                  console.log(from + " it could not send buds", e);

                  state.refund.push([
                    "customJson",
                    "ssc-mainnet-hive",
                    {
                      contractName: "tokens",
                      contractAction: "issue",
                      contractPayload: {
                        to: from,
                        symbol: "BUDS",
                        quantity: budAmount,
                      },
                    },
                  ]);
                });
            } else {
              ("reparando plot pero no envio buds porque ya seguro envie");
            }
          })
          .catch(async (e) => {
            await updateorSetPendingTransaction(
              json.transaction_id,
              "nfttohk-vault",
              json,
              from,
              from + "it couldnt update plot " + plotIDString
            );

            console.log(
              from +
                "it couldnt update plot " +
                plotIDString +
                "setting on pending",
              e
            );
          });
      }
    }

    //Rent Subdivision <---- coming soon
    //user will send mota to hk-vault with memo plotOwner and amountRent

    //smoke joint
    //user sends comumable NFT to hk-vault with memo type (ex. smoke_joint, smoke_blunt etc..)
    try {
      let jointString =
        "" + (jointTypes[0] ? jointTypes[0] : jointTypesHKVAULT[0]);

      console.log(
        "this user",
        from,
        "try smoke",
        jointString,
        jointTypes,
        jointTypesHKVAULT
      );

      let xptoUpdate = null;
      if (jointString == "pinner") {
        // give xp
        xptoUpdate = state.stats.joints.pinner;
      } else if (jointTypes == "hempWrappedJoint") {
        // give xp
        xptoUpdate = state.stats.joints.hempWrappedJoint;
      } else if (jointTypes == "crossJoint") {
        // give xp

        xptoUpdate = state.stats.joints.crossJoint;
      } else if (jointTypes == "blunt") {
        // give xp
        xptoUpdate = state.stats.joints.blunt;
      } else if (jointTypes == "hempWrappedBlunt") {
        // give xp
        xptoUpdate = state.stats.joints.hempWrappedBlunt;
      } else if (jointTypes == "twaxJoint") {
        // give xp
        xptoUpdate = state.stats.joints.twaxJoint;
      }

      if (xptoUpdate) {
        await updateXP(state, xptoUpdate, from, jointID, json);
      } else {
        console.log(
          "intente actualizar xp pero no pude ",
          jointString,
          "tal vez no estoy intentando fumar"
        );
      }
    } catch (error) {
      console.log("error al fumar smoke", error);
    }

    /*let boosterString = "" + boosterType 
                    if(boosterString === "Level 1 Booster"){

                        //claim booster
                        state.users[from].timeBoosters.lvl1 += 1
                    }

                    if(boosterString === "Level 2 Booster"){

                        //claim booster
                        state.users[from].timeBoosters.lvl2 += 1
                    }

                    if(boosterString === "Level 3 Booster"){

                        //claim booster
                        state.users[from].timeBoosters.lvl3 += 1
                    }

                    if(boosterString === "Level 4 Booster"){

                        //claim booster
                        state.users[from].timeBoosters.lvl4 += 1
                    }

                    if(boosterString === "Level 5 Booster"){

                        //claim booster
                        state.users[from].timeBoosters.lvl5 += 1
                    }

                    if(boosterString === "Level 6 Booster"){

                        //claim booster
                        state.users[from].timeBoosters.lvl6 += 1
                    }*/

    //claim Booster
    //user sends booster NFT to hk-vault with memo type (ex. use_booster_lvl1, use_booster_lvl2 etc..)
    /*if(json.contractPayload.symbol === "HKFARM" && json.contractPayload.memo) {
                        let seedID = json.contractPayload.id
                        let plotID = json.contractPayload.memo

                        let sptStatus = jp.query(state.users[from], `$.seeds[?(@.id==${seedID})].properties.SPT`);  
                        let waterStatus = jp.query(state.users[from], `$.seeds[?(@.id==${seedID})].properties.WATER`);
                        

                        if(state.users[from] && sptStatus < 1 && waterStatus < 1){

                            var budAmount = "" + jp.query(state.users[from], `$.seeds[?(@.id==${seedID})].properties.PR`);  
                        
                            //send harvested buds to user
                            contract.generateToken(hivejs, "BUDS", budAmount, from)

                            //make plot occupied and designate seed
                            contract.updateNft(hivejs, plotID, { "OCCUPIED": false })
                            contract.updateNft(hivejs, plotID, { "SEEDID": 0 })
                            }
                        }*/
  }
};

async function updateXP(state, xp, from, joinID, json) {
  state.users[from].joints = state.users[from].joints.filter(function (ele) {
    return ele.id != joinID;
  });

  state.users[from].xp += xp;

  state.users[from].activeAvatar.properties.XP += xp;

  //validar aqui
  await contract
    .updateNft(hivejs, "" + state.users[from].activeAvatar.id, {
      XP: state.users[from].activeAvatar.properties.XP,
    })
    .then(() => {
      console.log("smoke update xp success");

      await updateOrsetTransaction(
        json.transaction_id,
        "nfttohk-vault",
        json,
        from,
        "process update xp complete"
      )
        .then(async (red) => {})
        .catch((e) => {
          console.log("ocurrio un error", e);
        });
    })
    .catch(async (e) => {
      console.log(
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

  try {
    var plotStatus = jp.query(
      state.users[from],
      `$.seeds[?(@.id==${seedID})].properties.OCCUPIED`
    );
    var seedStatus = jp.query(
      state.users[from],
      `$.seeds[?(@.id==${seedID})].properties.PLANTED`
    );
    var rentStatus = jp.query(
      state.users[from],
      `$.plots[?(@.id==${plotID})].properties.RENTED`
    );
    var listStatus = jp.query(
      state.users[from],
      `$.plots[?(@.id==${plotID})].properties.LISTED`
    );
  } catch (error) {
    console.log(
      "an error when planting a seed occured " + from + " sent the request"
    );
    await saveLog(
      "plant_plot",
      json,
      from,
      "an error when planting a seed occured " +
        from +
        " sent the request " +
        error
    );

    console.log(error);
  }

  if (state.users[from]) {
    //make seed used and designate plot
    contract
      .updateNft(hivejs, plotIDString, { OCCUPIED: true, SEEDID: seedID })
      .then((r) => {
        contract
          .updateNft(hivejs, seedIDString, {
            PLANTED: true,
            PLOTID: plotID,
          })
          .then((r) => {})
          .catch(async (e) => {
            console.log("error no update plot", e);

            await saveLog(
              "plant_plot",
              json,
              from,
              from + " it could not send buds "
            );
          });
      })
      .catch(async (e) => {
        console.log("error no update seed", e);
        await saveLog(
          "plant_plot",
          json,
          from,
          from + " it could not send buds"
        );
      });

    state.stats.seedsUsedLastDay += 1;
  } else {
    await saveLog(
      "plant_plot",
      json,
      from,
      from + " state dont contain this user"
    );
  }
};

const subdivide_plot = async (json, from, state) => {
  let plotID = json.plotID;
  let region = json.region;

  let userName = "" + from;
  let regionString = region;
  let plotIDString = "" + plotID;

  let plot = jp.query(state.users[from], `$.plots[?(@.id==${plotID})]`);

  var dividedStatus = "false";
  if (!plot[0]) {
    console.log("plot no found");
    return;
  }
  if (plot[0].properties.hasOwnProperty("SUBDIVIDED")) {
    dividedStatus = "" + plot[0].properties.SUBDIVIDED;
  }

  console.log(userName, plot, regionString, plotIDString, dividedStatus);

  try {
    if (regionString == "asia") {
      if (state.users[from] && dividedStatus == "false") {
        //createsubdivisions

        contract
          .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
          .then((r) => {
            contract
              .subdividePlot(hivejs, "Asia", 1, userName)
              .then((r) => {
                console.log("subdivide asia");
              })
              .catch(async (e) => {
                console.log("error no update plot", e);
                await saveLog(
                  "subdivide_plot",
                  json,
                  from,
                  from + " it could not send buds"
                );
              });
          })
          .catch(async (e) => {
            console.log("error no update plot", e);
            await saveLog(
              "subdivide_plot",
              json,
              from,
              from + " it could not send buds"
            );
          });
      }
    } else if (regionString == "africa") {
      if (state.users[from] && dividedStatus == "false") {
        //createsubdivisions

        contract
          .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
          .then((r) => {
            contract
              .subdividePlot(hivejs, "Africa", 2, userName)
              .then((r) => {
                console.log("subdivide africa");
              })
              .catch(async (e) => {
                console.log("error no update plot", e);
                await saveLog(
                  "subdivide_plot",
                  json,
                  from,
                  from + " it could not send buds"
                );
              });
          })
          .catch(async (e) => {
            console.log("error no update plot", e);
            await saveLog(
              "subdivide_plot",
              json,
              from,
              from + " it could not send buds"
            );
          });
      }
    } else if (regionString == "mexico") {
      if (state.users[from] && dividedStatus == "false") {
        //createsubdivisions
        console.log("subdivide mexico");

        contract
          .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
          .then((r) => {
            console.log("updating nft ", plotIDString);

            contract
              .subdividePlot(hivejs, "Mexico", 5, userName)
              .then((r) => {
                console.log("mexico subdivided");
              })
              .catch(async (e) => {
                console.log("error no update plot", e);
                await saveLog(
                  "subdivide_plot",
                  json,
                  from,
                  from + " it could not send buds"
                );
              });
          })
          .catch(async (e) => {
            console.log("error no update plot", e);
            await saveLog(
              "subdivide_plot",
              json,
              from,
              from + " it could not send buds"
            );
          });
      }
    } else if (regionString == "jamaica") {
      if (state.users[from] && dividedStatus == "false") {
        //createsubdivisions

        contract
          .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
          .then((r) => {
            contract
              .subdividePlot(hivejs, "Jamaica", 1, userName)
              .then((r) => {
                console.log("subdivide jamaica complete");
              })
              .catch(async (e) => {
                console.log("error no update plot", e);
                await saveLog(
                  "subdivide_plot",
                  json,
                  from,
                  from + " it could not send buds"
                );
              });
          })
          .catch(async (e) => {
            console.log("error no update plot", e);
            await saveLog(
              "subdivide_plot",
              json,
              from,
              from + " it could not send buds"
            );
          });
      }
    } else if (regionString == "southAmerica") {
      if (state.users[from] && dividedStatus == "false") {
        contract
          .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
          .then((r) => {
            contract
              .subdividePlot(hivejs, "South America", 6, userName)
              .then((r) => {
                console.log("subdivide complete soutAmerica");
              })
              .catch(async (e) => {
                console.log("error no update plot", e);
                await saveLog(
                  "subdivide_plot",
                  json,
                  from,
                  from + " it could not send buds"
                );
              });
          })
          .catch(async (e) => {
            console.log("error no update plot", e);
            await saveLog(
              "subdivide_plot",
              json,
              from,
              from + " it could not send buds"
            );
          });
      }
    } else if (regionString == "afghanistan") {
      if (state.users[from] && dividedStatus == "false") {
        //createsubdivisions

        contract
          .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
          .then((r) => {
            contract
              .subdividePlot(hivejs, "Afghanistan", 4, userName)
              .then((r) => {
                console.log("subvivide afgahnistan");
              })
              .catch(async (e) => {
                console.log("error no update plot", e);
                await saveLog(
                  "subdivide_plot",
                  json,
                  from,
                  from + " it could not send buds"
                );
              });
          })
          .catch(async (e) => {
            console.log("error no update plot", e);
            await saveLog(
              "subdivide_plot",
              json,
              from,
              from + " it could not send buds"
            );
          });
      }
    }
  } catch (error) {
    console.log("se produjo un error al intentar subdividir plot", error);
    await saveLog("subdivide_plot", json, from, from + " plot error");
  }
};

module.exports = {
  tohkvault,
  nfttohkvaul,
  plant_plot,
  subdivide_plot,
};
