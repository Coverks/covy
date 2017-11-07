"use strict";

const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");

module.exports = {
	name: "mongodb",
	mixins: [DbService],
	adapter: new MongoDBAdapter("mongodb://localhost/moleculer-demo"),
	collection: "posts",
};
