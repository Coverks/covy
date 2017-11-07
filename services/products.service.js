"use strict";

const QueueService = require("moleculer-bull");

module.exports = {
	name: "products",
	mixins: [QueueService()],

	/**
	 * Default settings
	 */
	settings: {},

	/**
	 * Actions
	 */
	actions: {

		pause() {
			this.pauseQueue();
			return "Pausing";
		},

		resume() {
			this.resumeQueue();
			return "Resuming";
		},

		update: {
			handler(ctx) {
				const productData  = ctx.params;
				this.broker.call("productmaker.update", productData );
			}
		},

		db() {
			this.broker.call("mongodb.create", {
    				title: "My first post",
    				content: "Lorem ipsum...",
    				votes: 0
			});
		},

		list() {
			this.broker.call("mongodb.find").then(console.log);
		}

	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {

		pauseQueue() {
			this.getQueue("products.task").pause();
		},

		resumeQueue() {
			this.getQueue("products.task").resume();
		}
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};
