"use strict";

const QueueService = require("moleculer-bull");

module.exports = {

	name: "maker",

	mixins: [QueueService()],

	actions: {

		test() {
			this.create();
		},

		product(ctx) {
			console.log( ctx.params );
			this.createProduct(ctx.params);
		}

	},

	methods: {

		create() {
			var id = Math.floor((Math.random() * 5000) + 1);
			this.logger.info("Add a new job. ID:", id);
                        this.createJob("sample.task", { id: id, pid: process.pid });
		},

		createProduct(prodData) {
			this.logger.info("Product added.");
			this.createJob("sample.task", prodData);
		}
	},

	started() {

		this.getQueue("sample.task").on("global:progress", (jobID, progress) => {
			this.logger.info(`Job #${jobID} progress is ${progress}%`);
		});

		this.getQueue("sample.task").on("global:completed", (job, res) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, res);
		});

		this.getQueue("sample.task").on("global:paused", () => {
			this.logger.info('Queue has been paused');
                });

		this.getQueue("sample.task").on("global:resumed", () => {
			this.logger.info('Queue has been resumed');
		});
	}
};
