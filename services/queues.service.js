"use strict";

var Queue = require( 'bull' )

module.exports = {
	name: "queues",

	/**
	 * Default settings
	 */
	settings: {},

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Log activity
		 *
		 * @returns
		 */
		log() {

			var queue = new Queue( "test concurrent queue" );
			console.log( queue.getJobCounts() );

			return "Log";
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
