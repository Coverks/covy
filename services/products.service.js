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
