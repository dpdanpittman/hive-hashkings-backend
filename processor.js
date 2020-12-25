/*
  args:
    client: A dhive client to use to get blocks, etc. [REQUIRED]
    hive: A dhive instance. [REQIURED]
    currentBlockNumber: The last block that has been processed by this client; should be
      loaded from some sort of storage file. Default is block 1.
    blockComputeSpeed: The amount of milliseconds to wait before processing
      another block (not used when streaming)
    prefix: The prefix to use for each transaction id, to identify the DApp which
      is using these transactions (interfering transaction with other Dappsids could cause
      errors)
    mode: Whether to stream blocks as `latest` or `irreversible`.
    unexpectedStopCallback: A function to call when hive-state stops unexpectedly
      due to an error.
*/
module.exports = function(client, dhive, currentBlockNumber=1, blockComputeSpeed=100, prefix='qwoyn_', mode='latest', unexpectedStopCallback=function(){}) {
  var onCustomJsonOperation = {};  // Stores the function to be run for each operation id.
  var onOperation = {};

  var onNewBlock = function() {};
  var onStreamingStart = function() {};

  var isStreaming;

  var stream;

  var stopping = false;
  var headRetryAttempt = 0;
  var computeRetryAttempt = 0;
  var stopCallback;

  // Returns the block number of the last block on the chain or the last irreversible block depending on mode.
  function getHeadOrIrreversibleBlockNumber(callback) {
    client.database.getDynamicGlobalProperties().then(function(result) {
      headRetryAttempt = 0;
      if(mode === 'latest') {
        callback(result.head_block_number);
      } else {
        callback(result.last_irreversible_block_num);
      }
    }).catch(function (err) {
      headRetryAttempt++;
      console.warn(`[Warning] Failed to get Head Block. Retrying. Attempt number ${headRetryAttempt}`)
      console.warn(err)
      //unexpectedStopCallback(err)
      getHeadOrIrreversibleBlockNumber(callback)
    })
  }

  function isAtRealTime(callback) {
    getHeadOrIrreversibleBlockNumber(function(result) {
      if(currentBlockNumber >= result) {
        callback(true);
      } else {
        callback(false);
      }
    })
  }

  function beginBlockComputing() {
    function computeBlock() {
      var blockNum = currentBlockNumber;// Helper variable to prevent race condition
                                        // in getBlock()
      client.database.getBlock(blockNum)
        .then((result) => {
          processBlock(result, blockNum);
          computeRetryAttempt = 0;
          currentBlockNumber++;
          if(!stopping) {
            isAtRealTime(function(result) {
              if(!result) {
                setTimeout(computeBlock, blockComputeSpeed);
              } else {
                beginBlockStreaming();
              }
            })
          } else {
            setTimeout(stopCallback, 1000);
          }
        })
        .catch((err) => {
          computeRetryAttempt++;
          console.warn(`[Warning] Failed to compute block. Retrying. Attempt number ${computeRetryAttempt}`)
          console.warn(err)
          computeBlock();
        })
    }

    computeBlock();
  }

  function beginBlockStreaming() {
    isStreaming = true;

    onStreamingStart();

    if(mode === 'latest') {
      stream = client.blockchain.getBlockStream({mode: dhive.BlockchainMode.Latest});
    } else {
      stream = client.blockchain.getBlockStream();
    }

    stream.on('data', function(block) {
      var blockNum = parseInt(block.block_id.slice(0,8), 16);
      if(blockNum >= currentBlockNumber) {
        processBlock(block, blockNum);
        currentBlockNumber = blockNum+1;
      }
    })

    stream.on('end', function() {
      console.error("Block stream ended unexpectedly. Restarting block computing.")
      beginBlockComputing();
    })

    stream.on('error', function(err) {
      console.error("[Error] Whoops! We got an error! We may have missed a block!")
      console.error(err)
    })
  }

  function transactional(ops, i, pc, num, block) {
    if (ops.length) {
        doOp(ops[i], [ops, i, pc, num, block])
            .then(v => {
                if (ops.length > i + 1) {
                    transactional(v[0], v[1] + 1, v[2], v[3], v[4])
                } else {
                    onNewBlock(num, v)
                        .then(r => {
                            //console.log(num)
                            pc[0]()
                        })
                        .catch(e => { console.log(e) })
                }
            })
            .catch(e => {
                console.log(e);
                pc[1](e)
            })
    } else {
        onNewBlock(num, pc)
            .then(r => {
                //console.log(num)
                r[0]()
            })
            .catch(e => { pc[1](e) })
    }


    function doOp(op, pc) {
        return new Promise((resolve, reject) => {
            if (op.length == 4) {
                onCustomJsonOperation[op[0]](op[1], op[2], op[3], [resolve, reject, pc])
                    //console.log(op[0])
            } else if (op.length == 2) {
                onOperation[op[0]](op[1], [resolve, reject, pc]);
                //console.log(op[0])
            }
        })
    }
  }

  function processBlock(block, num) {
    onNewBlock(num, block);
    var transactions = block.transactions;

    for(var i = 0; i < transactions.length; i++) {
      for(var j = 0; j < transactions[i].operations.length; j++) {

        var op = transactions[i].operations[j];
        if(op[0] === 'custom_json') {
          if(typeof onCustomJsonOperation[op[1].id] === 'function') {
            var ip = JSON.parse(op[1].json);
            var from = op[1].required_posting_auths[0];
            var active = false;
            ip.transaction_id = transactions[i].transaction_id
            ip.block_num = transactions[i].block_num
            if(!from){from = op[1].required_auths[0];active=true}
            onCustomJsonOperation[op[1].id](ip, from, active);
          }
        } else if(onOperation[op[0]] !== undefined) {
          op[1].transaction_id = transactions[i].transaction_id
          op[1].block_num = transactions[i].block_num
          onOperation[op[0]](op[1]);
        }
      }
    }
    transactional(ops, 0, [resolve, reject], num, block)
  }

  return {
    /*
      Determines a state update to be called when a new operation of the id
        operationId (with added prefix) is computed.
    */
    on: function(operationId, callback) {
      onCustomJsonOperation[prefix + operationId] = callback;
    },

    onOperation: function(type, callback) {
      onOperation[type] = callback;
    },

    onNoPrefix: function(operationId, callback) {
      onCustomJsonOperation[operationId] = callback;
    },

    /*
      Determines a state update to be called when a new block is computed.
    */
    onBlock: function(callback) {
      onNewBlock = callback;
    },

    start: function() {
      beginBlockComputing();
      isStreaming = false;
    },

    getCurrentBlockNumber: function() {
      return currentBlockNumber;
    },

    isStreaming: function() {
      return isStreaming;
    },

    onStreamingStart: function(callback) {
      onStreamingStart = callback;
    },

    stop: function(callback) {
      if(isStreaming){
        stopping = true;
        stream.pause();
        setTimeout(callback,1000);
      } else {
        stopping = true;
        stopCallback = callback;
      }
    }
  }
}