var
	Queue = require( 'bull' ),
	cluster = require( 'cluster' );

var numWorkers = 8;
var queue = new Queue( "test concurrent queue" );

if ( cluster.isMaster ) {
	for ( var i = 0; i < numWorkers; i ++ ) {
		cluster.fork();
	}

	cluster.on( 'online', function ( worker ) {
		// Lets create a few jobs for the queue workers
		for ( var i = 0; i < 500; i ++ ) {
			queue.add( { foo: 'bar' } );
			console.log( "Job added " + i );
		}
		;
	} );

	cluster.on( 'exit', function ( worker, code, signal ) {
		console.log( 'worker ' + worker.process.pid + ' died' );
	} );
} else {
	queue.process( function ( job, jobDone ) {
		console.log( "Job done by worker", cluster.worker.id, job.id );
		jobDone();
	} );
}
