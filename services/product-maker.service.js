"use strict";

const QueueService = require("moleculer-bull");

module.exports = {

	name: "productmaker",

	mixins: [QueueService()],

	actions: {

		update(ctx) {
			const productData = ctx.params;
			this.createProduct(productData);
		}
	},

	methods: {
		createProduct(prodData) {
			this.logger.info("Product added.");
			this.createJob("products.task", prodData);
		}
	},

	started() {

		this.getQueue("products.task").on("global:progress", (jobID, progress) => {
			this.logger.info(`Job #${jobID} progress is ${progress}%`);
		});

		this.getQueue("products.task").on("global:completed", (job, res) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, res);
		});

		this.getQueue("products.task").on("global:paused", () => {
			this.logger.info('Queue has been paused');
                });

		this.getQueue("products.task").on("global:resumed", () => {
			this.logger.info('Queue has been resumed');
		});
	}
};
