const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    from: String,
    to: String,
    hash: String,
    blockNumberNormalized: Number,
    timeStampNormalized: Date,
		totalTransactionFee: Number,
		valueNormalized: Number
  },
  {
    strict: false,
  }
);

transactionSchema.index({
	from: 1
});

transactionSchema.index({
	to: 1
});

transactionSchema.index({
	hash: 1
});

transactionSchema.index({
	blockNumberNormalized: 1
});

module.exports = mongoose.model("Transaction", transactionSchema);
