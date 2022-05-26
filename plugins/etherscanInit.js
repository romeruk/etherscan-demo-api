const fp = require("fastify-plugin");
const initEtherscan = require("../services/internal/initEtherscan");
const transactionRepository = require("../repositories/transaction");
const EtherScan = require("../services/external/etherscan");

const etherscanInit = fp((fastify, options, done) => {
  const { ETHERSCAN_API_KEY } = process.env;
  const etherScanService = new EtherScan(ETHERSCAN_API_KEY);

  fastify.decorate(
    "initEtherscan",
    initEtherscan.bind(null, etherScanService, transactionRepository)
  );

  done();
});

module.exports = etherscanInit;
