const { getTransactionsSchema } = require("./vaditation");

module.exports = function (fastify, opts, done) {
  const { transactionService } = fastify.applicationServices;

  fastify.get(
    "/",
    { schema: getTransactionsSchema },
    async (request, reply) => {
      const { statusCode, body } = await transactionService.getTransactions(
        request.query
      );

      reply.code(statusCode).send(body);
    }
  );

  done();
};
