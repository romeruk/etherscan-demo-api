const fp = require("fastify-plugin");
const mongoose = require("mongoose");

const mongoosePlugin = fp(async (fastify) => {
	const { MONGO_URI } = process.env;

	mongoose.connection.on("connected", () => {
    fastify.log.info({ actor: "MongoDB" }, "connected");
  })

	mongoose.connection.on("disconnected", () => {
    fastify.log.error({ actor: "MongoDB" }, "disconnected");
  });

	await mongoose.connect(MONGO_URI);

  fastify.addHook("onClose", async () => await mongoose.connection.close());
});

module.exports = mongoosePlugin;
