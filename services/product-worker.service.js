"use strict";

const QueueService = require("moleculer-bull");
const sleep = require('sleep');

module.exports = {

	name: "productworker",

	mixins: [QueueService()],

	queues: {
		"products.task"(job) {

			this.logger.info("New job received!");
			const products = job.data;
			const productsLength = Object.keys(products).length;

			let i = 1;

			Object.keys(products).forEach(function( key ) {
				job.progress( Math.round( ( i /productsLength ) * 100 ) );
				i++;
			} );

			return new this.Promise(resolve => {
				setTimeout(() => resolve({
					done: true,
					id: job.data.id,
					worker: process.pid
				}), 3000);
			});
		}
	}
};
