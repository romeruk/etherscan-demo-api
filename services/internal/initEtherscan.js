"use strict";

const delay = require("../../utils/delay");

const BLOCKS_TO_GET = 100;
const MAX_REQUESTS_IN_TIME = 3;
const DELAY_MS = 1100;

const weiToGwei = (wei) => {
  return wei / 1000000000;
};

const gweiToEtherium = (gwei) => {
  return gwei / 1000000000;
};

const TRANSACTION_TYPES = {
  LEGACY: 0,
  EIP1559: 2,
};

const populateTransactions = async (
  etherScanService,
  transactionRepository
) => {
  try {
    const transactionsCount = await transactionRepository.countTotalDocuments();
    if (transactionsCount > 0) return;

    const { result: blockHash } = await etherScanService.getRecentBlock();
    await delay(DELAY_MS);

    console.log(blockHash);

    const recentBlock = parseInt(blockHash, 16);
    let lastBlockToRequest = recentBlock - BLOCKS_TO_GET;
    let requestsCount = 0;
    let remaining = 0;

    if (BLOCKS_TO_GET <= MAX_REQUESTS_IN_TIME) {
      requestsCount = BLOCKS_TO_GET;
    }

    if (BLOCKS_TO_GET > MAX_REQUESTS_IN_TIME) {
      requestsCount = MAX_REQUESTS_IN_TIME;
      remaining = BLOCKS_TO_GET - MAX_REQUESTS_IN_TIME;
    }

    const getBlocksResults = [];

    while (lastBlockToRequest < recentBlock) {
      let requests = [];
      let startTime = Date.now();

      for (let i = 0; i < requestsCount; i++) {
        const block = lastBlockToRequest + i;
        requests.push(etherScanService.getBlockByNumber(block.toString(16)));
      }

      console.log("requestsCount", requestsCount);
      console.log("remaining", remaining);

      lastBlockToRequest += requestsCount;

      const response = await Promise.allSettled(requests);

      for (const promise of response) {
        if (promise.status === "fulfilled") {
          const block = promise.value;
          getBlocksResults.push(block.result);
        }
      }

      let endTime = Date.now();
      let requestTime = endTime - startTime;
      let delayTime = DELAY_MS - requestTime;

      if (remaining < MAX_REQUESTS_IN_TIME) {
        requestsCount = remaining;
        remaining = 0;
      }

      if (remaining >= MAX_REQUESTS_IN_TIME) {
        requestsCount = MAX_REQUESTS_IN_TIME;
        remaining -= MAX_REQUESTS_IN_TIME;
      }

      if (delayTime > 0) {
        await delay(delayTime);
      }
    }

    const blockTransactions = [];

    let confirmations = getBlocksResults.length;

    for (const block of getBlocksResults) {
      const blockTimeStamp = block.timestamp;
      const blockTimeStampNormalized = parseInt(block.timestamp, 16) * 1000;
      const blockNumberNormalized = parseInt(block.number, 16);

      const baseFeePerGas = weiToGwei(parseInt(block.baseFeePerGas, 16));

      if (block?.transactions?.length) {
        let indexTransaction = 0;
        for (const transaction of block.transactions) {
          console.log("--------------------------------------");
          console.log("HASH", transaction.hash);

          const valueNormalized = gweiToEtherium(
            weiToGwei(parseInt(transaction.value, 16))
          );

          const type = parseInt(transaction.type, 16);
          console.log("TYPE", type);
          console.log("block.baseFeePerGas", parseInt(block.baseFeePerGas, 16));
          console.log("baseFeePerGas parsed", baseFeePerGas);
          let totalTransactionFee = 0;

          const gasLimit = parseInt(transaction.gas, 16);

          console.log("gasLimit", gasLimit);

          if (type === TRANSACTION_TYPES.EIP1559) {
            const maxPriorityFeePerGas = weiToGwei(
              parseInt(transaction.maxPriorityFeePerGas, 16)
            );
            const maxFeePerGas = weiToGwei(
              parseInt(transaction.maxFeePerGas, 16)
            );

            console.log("maxFeePerGas", parseInt(transaction.maxFeePerGas, 16));
            console.log("maxFeePerGas parsed", maxFeePerGas);

            console.log(
              "maxPriorityFeePerGas",
              parseInt(transaction.maxPriorityFeePerGas, 16)
            );
            console.log("maxPriorityFeePerGas parsed", maxPriorityFeePerGas);

            console.log(
              "maxPriorityFeePerGas and maxFeePerGas same ?",
              maxPriorityFeePerGas === maxFeePerGas
            );

            if (maxPriorityFeePerGas === maxFeePerGas) {
              totalTransactionFee = gweiToEtherium(maxFeePerGas * gasLimit);
            } else {
              totalTransactionFee = gweiToEtherium(
                gasLimit * (baseFeePerGas + maxPriorityFeePerGas)
              );
            }
          }

          if (type === TRANSACTION_TYPES.LEGACY) {
            console.log("LEGACY");
            const gasPrice = weiToGwei(parseInt(transaction.gasPrice, 16));
            console.log("gasPrice", gasPrice);
            totalTransactionFee = gweiToEtherium(gasPrice * gasLimit);
          }

          console.log("totalTransactionFee", totalTransactionFee);
          console.log("--------------------------------------");

          block.transactions[indexTransaction] = {
            ...transaction,
            timeStamp: blockTimeStamp,
            timeStampNormalized: blockTimeStampNormalized,
            blockNumberNormalized,
            confirmations,
            totalTransactionFee,
            valueNormalized,
          };

          indexTransaction++;
        }

        blockTransactions.push(...block.transactions);
      }

      confirmations--;
    }

    await transactionRepository.insertMany(blockTransactions);
  } catch (error) {
    console.log(error);
  }
};

module.exports = populateTransactions;
