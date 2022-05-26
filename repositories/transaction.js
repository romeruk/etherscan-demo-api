const Transaction = require("../models/transaction");

class TransactionRepository {
  async countTotalDocuments(filter = {}) {
    return await Transaction.countDocuments(filter);
  }

  async insertMany(documents) {
    const result = await Transaction.insertMany(documents);
    return result;
  }

  async getTransactions({ filter, skip, limit }) {
    const totalDocuments = await this.countTotalDocuments(filter);
    const transactions = await Transaction.find(filter, null, {
      skip,
      limit,
    }).select(
      "hash to from confirmations timeStampNormalized valueNormalized totalTransactionFee blockNumberNormalized"
    );

    return {
      totalDocuments,
      transactions,
    };
  }
}

module.exports = new TransactionRepository();
