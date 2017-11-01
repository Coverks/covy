"use strict";

const QueueService = require("moleculer-bull");

module.exports = {
	name: "queues",
	mixins: [QueueService()],

	/**
	 * Default settings
	 */
	settings: {},

	/**
	 * Actions
	 */
	actions: {
		log() {
			return "Log";
		},
		test() {
			this.broker.call("maker.test");
			return "Testing";
		},
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
				const dataToBeHandled  = ctx.params;
				this.broker.call("maker.product", dataToBeHandled );
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
			this.getQueue("sample.task").pause();
		},

		resumeQueue() {
			this.getQueue("sample.task").resume();
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
