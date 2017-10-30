"use strict";

const QueueService = require("moleculer-bull");

module.exports = {

	name: "worker",

	mixins: [QueueService()],

	queues: {
		"sample.task"(job) {
			this.logger.info("New job received!", job.data);
			job.progress(10);

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
