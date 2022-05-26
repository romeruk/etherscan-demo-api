"use strict";

const fastify = require("fastify");
const mongoosePlugin = require("./plugins/mongooseConnection");
const etherscanInit = require("./plugins/etherscanInit");
const services = require("./plugins/services");

function build(options = {}) {
  const application = fastify(options);

	application.register(require('@fastify/cors'), {
		origin: process.env.NODE_ENV === "development" ? "*" : process.env.CLIENT_DOMAIN
	});

  application.register(services);
  application.register(mongoosePlugin);
  application.register(etherscanInit);

  application.register(require("./routes/transactions"), {
    prefix: "/v1/transactions",
  });

  return application;
}

module.exports = build;
