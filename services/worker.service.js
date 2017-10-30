"use strict";

const QueueService = require( "moleculer-bull" );

module.exports = {
	name: "task-worker",
	mixins: [ QueueService() ],

	queues: {
		"job.send"( job ) {
			this.logger.info( "New job received!", job.data );
			job.progress( 10 );

			return this.Promise.resolve( {
				done: true,
				id: job.data.id,
				worker: process.pid
			} );
		}
	}
};
