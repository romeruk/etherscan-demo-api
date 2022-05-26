"use strict";
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app")({
  logger: {
    prettyPrint: true,
  },
});

const start = async () => {
  try {
    await app.ready();
    await app.listen(process.env.PORT || 3000, process.env.HOST || "0.0.0.0");
    await app.initEtherscan();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
