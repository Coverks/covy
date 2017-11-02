"use strict";

let config = require('../config');
const QueueService = require("moleculer-bull");
const sleep = require('sleep');
const WooCommerceAPI = require('woocommerce-api');

let WooCommerce = new WooCommerceAPI({
	url: config.sites.test.url,
	consumerKey: config.sites.test.key,
	consumerSecret: config.sites.test.secret,
	wpAPI: true,
	version: 'wc/v1'
});

module.exports = {

	name: "productworker",

	mixins: [QueueService()],

	queues: {
		"products.task"(job) {

			this.logger.info("New job received!");

			const product = job.data;
			const productLength = Object.keys(product).length;

			let productID = 8;

			/*
			if ( product.hasOwnProperty('sku') ) {

				console.log( product.sku );

				WooCommerce.get(`products/?filter[sku]=${product.sku}`, function(err, data, res) {
					let productResult = res;
					productResult = JSON.parse( productResult );
					productID = productResult[0].id;
				});

				delete product.sku;

			} else {
				// @TODO: Create product here.
			}
			*/

			let data = {};
			let i = 1;

			Object.keys(product).forEach(function( k ) {
				// job.progress( Math.round( ( i /productLength ) * 100 ) );
				data[k]  = String(product[k]);
				i++;
			} );

			// console.log( productID );
			// console.log( data );

			let endpoint = `products/${productID}`;
			// console.log( endpoint );

			WooCommerce.put(endpoint, data, function(err, data, res) {
				// console.log(res);
			});

			return this.Promise.resolve({
				done: true,
				id: job.data.id,
				worker: process.pid
			});
		}
	}
};
