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

			let productID = 0;

			if ( product.hasOwnProperty('sku') ) {

				// console.log( product.sku );

				WooCommerce.getAsync(`products?sku=${product.sku}`).then(function(result) {

					let productResult = JSON.parse(result.toJSON().body);

					console.log( productResult );

					if ( Object.keys(productResult).length !== 0 ) {

						productID = productResult[0].id;

						// console.log( productID );

						delete product.sku;

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
					} else {

						let data = {};
						let i = 1;

						Object.keys(product).forEach(function( k ) {
							// job.progress( Math.round( ( i /productLength ) * 100 ) );
							data[k]  = String(product[k]);
							i++;
						} );

						let endpoint = 'products';

						WooCommerce.post(endpoint, data, function(err, data, rest) {
						});
					}
				});
			}

			return this.Promise.resolve({
				done: true,
				id: job.data.id,
				worker: process.pid
			});
		}
	}
};
