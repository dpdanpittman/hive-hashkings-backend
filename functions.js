const contract = require("./contract.js");
const {
  saveLog,
  setTransaction,
  getAllTransaction,
  updateTransaction,
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

        let log = await contract.updateNft(hivejs, seedIdString, {
          WATER: waterRemains,
        });

        console.log("update water nft", seedIdString);
        let x = Object.assign({}, { r: log });
        await saveLog("tohk-vault", json, from, JSON.stringify(x));
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
      await saveLog(
        "tohk-vault",
        json,
        from,
        from +
          " had an issue watering seedID" +
          json.contractPayload.memo +
          " refunding " +
          error
      );

      console.log(
        from +
          " had an issue watering seedID" +
          json.contractPayload.memo +
          " refunding"
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
    let type = json.contractPayload.memo;
    let amountBuds = json.contractPayload.quantity;
    let amountBudsInt = parseInt(amountBuds, 10);
    if (state.users[from] /*&& json.contractPayload.memo == "deposit"*/) {
      state.users[from].dailyBudDeposit += amountBudsInt;
    }

    if (
      state.users[from] &&
      json.contractPayload.memo == "pinner" &&
      amountBudsInt === 50
    ) {
      // create pinner
      let log = await contract.createConsumable(hivejs, "Pinner", type, from);
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } else if (
      state.users[from] &&
      json.contractPayload.memo == "hempWrappedJoint" &&
      amountBudsInt === 200
    ) {
      // create hempwrappedjoint
      let log = await contract.createConsumable(
        hivejs,
        "Hemp Wrapped Joint",
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
      json.contractPayload.memo == "crossJoint" &&
      amountBudsInt === 1000
    ) {
      // create crossjoint
      let log = await contract.createConsumable(
        hivejs,
        "Cross Joint",
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
      json.contractPayload.memo == "blunt" &&
      amountBudsInt === 2500
    ) {
      // create blunt
      let log = await contract.createConsumable(hivejs, "Blunt", type, from);
      let x = Object.assign({}, { r: log });
      await saveLog(
        "tohk-vault",
        JSON.stringify(json),
        from,
        JSON.stringify(x)
      );
    } else if (
      state.users[from] &&
      json.contractPayload.memo == "hempWrappedBlunt" &&
      amountBudsInt === 5000
    ) {
      // create hempwrappedblunt
      let log = await contract.createConsumable(
        hivejs,
        "Hemp Wrapped Blunt",
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
      json.contractPayload.memo == "twaxJoint" &&
      amountBudsInt === 10000
    ) {
      // set plot to subdivided
      let log = await contract.createConsumable(
        hivejs,
        "Twax Joint",
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
      let log = awaitcontract.createConsumable(
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
      let log = awaitcontract.createConsumable(
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
      let log = awaitcontract.createConsumable(
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
    }
  }
};

const nfttohkvaul = async (json, from, state) => {
  if (json.contractPayload.nfts[0].symbol === "HKFARM") {
    let seed = json.contractPayload.nfts[0];
    let nft = json.contractPayload.nfts[0];
    let booster = json.contractPayload.nfts[0];

    let seedID = seed.ids[0];
    let jointID = nft.ids[0];
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

    let boosterType = jp.query(
      state.users[from],
      `$.boosters[?(@.id==${boosterID})].properties.NAME`
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

      if (budAmount) {
        //send harvested buds to user
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 7000);
        });

        contract
          .updateNft(hivejs, plotIDString, { OCCUPIED: false, SEEDID: 0 })
          .then(() => {
            contract
              .generateToken(hivejs, "BUDS", budAmount, from)
              .then(() => {
                console.log("sending buds by budAmount", budAmount, from);
              })
              .catch(async (e) => {
                await saveLog(
                  "nfttohkvaul",
                  json,
                  from,
                  from + " it could not send buds"
                );
                console.log(from + " it could not send buds", e);
              });
          })
          .catch(async (e) => {
            await saveLog(
              "nfttohkvaul",
              json,
              from,
              from + "it couldnt update plot " + plotIDString
            );
            console.log("it couldnt update plot " + plotIDString, e);
          });
      } else if (budAmountVault) {
        plotID = jp.query(
          state.users["hk-vault"],
          `$.seeds[?(@.id==${seedID})].properties.PLOTID`
        );

        plotIDString = "" + plotID;

        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 7000);
        });

        contract
          .updateNft(hivejs, plotIDString, { OCCUPIED: false, SEEDID: 0 })
          .then(() => {
            contract
              .generateToken(hivejs, "BUDS", budAmountVault, from)
              .then(() => {
                console.log(
                  "enviando buds desde budAmountVault",
                  budAmountVault,
                  from
                );
              })
              .catch(async (e) => {
                await saveLog(
                  "nfttohkvaul",
                  json,
                  from,
                  from + " it could not send buds"
                );
                console.log(from + " it could not send buds", e);
              });
          })
          .catch(async (e) => {
            await saveLog(
              "nfttohkvaul",
              json,
              from,
              from + "it couldnt update plot " + plotIDString
            );
            console.log("it couldnt update plot " + plotIDString, e);
          });
      }
    }

    //Rent Subdivision <---- coming soon
    //user will send mota to hk-vault with memo plotOwner and amountRent

    //smoke joint
    //user sends comumable NFT to hk-vault with memo type (ex. smoke_joint, smoke_blunt etc..)
    try {
      let jointString = "" + jointTypes;
      if (jointString === "pinner") {
        // give xp
        state.users[from].xp += state.stats.joints.pinner;
      } else if (jointTypes === "hempWrappedJoint") {
        // give xp
        state.users[from].xp += state.stats.joints.hempWrappedJoint;
      } else if (jointTypes === "crossJoint") {
        // give xp
        state.users[from].xp += state.stats.joints.crossJoint;
      } else if (jointTypes === "blunt") {
        // give xp
        state.users[from].xp += state.stats.joints.blunt;
      } else if (jointTypes === "hempWrappedBlunt") {
        // give xp
        state.users[from].xp += state.stats.joints.hempWrappedBlunt;
      } else if (jointTypes === "twaxJoint") {
        // give xp
        state.users[from].xp += state.stats.joints.twaxJoint;
      }
    } catch (error) {}

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

  let regionString = region;
  let plotIDString = "" + plotID;

  let plot = jp.query(state.users[from], `$.plots[?(@.id==${plotID})]`);

  var dividedStatus = false;
  if (!plot[0]) {
    console.log("plot no found");
    return;
  }
  if (plot[0].properties.hasOwnProperty("SUBDIVIDED")) {
    dividedStatus = plot[0].properties.SUBDIVIDED;
  }

  console.log(userName, plot , regionString, plotIDString, dividedStatus);

  try {
    if (regionString == "asia") {
      if (state.users[from] && dividedStatus == "false") {
        //createsubdivisions
        contract
          .subdividePlot(hivejs, "Asia", 1, userName)
          .then((r) => {
            contract
              .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
              .then((r) => {})
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
          .subdividePlot(hivejs, "Africa", 3, userName)
          .then((r) => {
            contract
              .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
              .then((r) => {})
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
        contract
          .subdividePlot(hivejs, "Mexico", 6, userName)
          .then((r) => {
            contract
              .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
              .then((r) => {})
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
          .subdividePlot(hivejs, "Jamaica", 2, userName)
          .then((r) => {
            contract
              .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
              .then((r) => {})
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
          .subdividePlot(hivejs, "South America", 7, userName)
          .then((r) => {
            contract
              .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
              .then((r) => {})
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
          .subdividePlot(hivejs, "Afghanistan", 5, userName)
          .then((r) => {
            contract
              .updateNft(hivejs, plotIDString, { SUBDIVIDED: true })
              .then((r) => {})
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
    await saveLog("subdivide_plot", json, from, from + " plot doesnt exist");
  }
};

module.exports = {
  tohkvault,
  nfttohkvaul,
  plant_plot,
  subdivide_plot,
};
