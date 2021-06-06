function processor(ssc, lastBlock, onToken, onNft, BlockNumber) {
  ssc
    .streamFromTo(lastBlock, null, (err, result) => {
      if (!err) {
        let blockNumber = result.blockNumber;

        console.log("hive engine block number", blockNumber)

        if (blockNumber % 11 == 0) {
          BlockNumber(blockNumber);
        }

        result.transactions.forEach((elementPricipal) => {
          let logs = JSON.parse(elementPricipal.logs);
          let payload = JSON.parse(elementPricipal.payload);

          if (
            elementPricipal.contract == "tokens" &&
            elementPricipal.action == "transfer"
          ) {
            if (!logs.hasOwnProperty("errors")) {
              if (logs.hasOwnProperty("events")) {
                logs.events.forEach((element) => {
                  if (
                    element.data.to == "hk-vault" ||
                    element.data.to == "hk-buds"
                  ) {
                    if (elementPricipal.sender == element.data.from) {
                      let payloadSend = {
                        from: element.data.from,
                        json: {
                          contractPayload: {
                            quantity: payload.quantity,
                            memo: payload.memo,
                            symbol: payload.symbol,
                          },
                        },
                        transaction_id: elementPricipal.transactionId,
                      };
                      onToken(payloadSend);
                    }
                  }
                });
              }
            }
          }

          if (
            elementPricipal.contract == "nft" &&
            elementPricipal.action == "transfer"
          ) {
            if (!logs.hasOwnProperty("errors")) {
              if (logs.hasOwnProperty("events")) {
                logs.events.forEach((element) => {
                  if (element.data.to == "hk-vault") {
                    if (elementPricipal.sender == element.data.from) {
                      let payloadSend = {
                        from: element.data.from,
                        json: {
                          contractPayload: {
                            nfts: payload.nfts,
                            symbol: payload.nfts[0].symbol,
                          },
                        },
                        transaction_id: elementPricipal.transactionId,
                      };

                      onNft(payloadSend);
                    }
                  }
                });
              }
            }
          }
        });
      }
    })
    .then((e) => {
      console.log("inicio ejecucion", e);
    })
    .catch((e) => {
      console.log("error", e);
    });
}

module.exports = processor;
