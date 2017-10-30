"use strict";

const QueueService = require( "moleculer-bull" );

module.exports = {
	name: "activity",
	mixins: [ QueueService() ],

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
			this.testJob()
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
		testJob() {
			var id = Math.floor((Math.random() * 2000) + 1);
			this.createJob( "job.send", { id: i, pid: process.pid } );

			this.getQueue( "job.send" ).on( "global:progress", ( jobID, progress ) => {
				this.logger.info( `Job #${jobID} progress is ${progress}%` );
			} );

			this.getQueue( "job.send" ).on( "global:completed", ( job, res ) => {
				this.logger.info( `Job #${job.id} completed!. Result:`, res );
			} );
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
