const getTransactionsSchema = {
  querystring: {
    type: "object",
    properties: {
      page: { type: "number", minimum: 1 },
      searchBy: { type: "string", enum: ["0", "1", "2", "3"] },
      searchText: { type: "string" },
    },
  },
};

module.exports = {
  getTransactionsSchema,
};
