const MAP_FIELDS = {
  0: ["from", "to", "hash", "blockNumberNormalized"],
  1: ["from", "to"],
  2: "hash",
  3: "blockNumberNormalized",
};

class Transactions {
  constructor({ transactionRepository }) {
    this.transactionRepository = transactionRepository;
  }

  async getTransactions(queryString) {
    const perPage = 10;

    const { page = 1, searchBy, searchText } = queryString;

    const skip = perPage * (page - 1);
    const limit = perPage;

    const filter = {};

    let searchField;

    if (searchBy) {
      searchField = MAP_FIELDS[searchBy];

      if (Array.isArray(searchField)) {
        filter["$or"] = searchField.map((field) => ({
          [field]: searchText,
        }));
      } else {
        filter["$or"] = [{ [searchField]: searchText }];
      }
    }

    const { totalDocuments, transactions } =
      await this.transactionRepository.getTransactions({
        filter,
        skip,
        limit,
      });

    return {
      statusCode: 200,
      body: {
        transactions,
        pagination: {
          totalDocuments,
          totalPages: Math.ceil(totalDocuments / perPage),
          currentPage: page,
          perPage: perPage,
        },
      },
    };
  }
}

module.exports = Transactions;
