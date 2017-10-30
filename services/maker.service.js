"use strict";

const QueueService = require("moleculer-bull");

module.exports = {

	name: "maker",

	mixins: [QueueService()],

	started() {

		let id = 1;
		setInterval(() => {
			this.logger.info("Add a new job. ID:", id);
			this.createJob("sample.task", { id: id++, pid: process.pid });
		}, 1000);

		this.getQueue("sample.task").on("global:progress", (jobID, progress) => {
			this.logger.info(`Job #${jobID} progress is ${progress}%`);
		});

		this.getQueue("sample.task").on("global:completed", (job, res) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, res);
		});

	}
};
