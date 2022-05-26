const dotenv = require("dotenv");
const fp = require("fastify-plugin");
const TransactionService = require("../services/internal/transactions");
const TransactionRepository = require("../repositories/transaction");

const transactionService = new TransactionService({
  transactionRepository: TransactionRepository,
});

const dotEnv = fp((fastify, options, done) => {
  fastify.decorate("applicationServices", {
		transactionService
	});

  done();
});

module.exports = dotEnv;
