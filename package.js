Package.describe( {
	name   : 'miro:devtools',
	version: '0.0.1',
	summary: 'Meteor debugging with Chrome DevTools',
	git    : 'https://github.com/MiroHibler/meteor-devtools',
});

Package.onUse( function ( api ) {
	api.versionsFrom( '1.0.3.1' );

	// Prerequisite packages
	api.use([
		'templating',
		'session'
	], 'client' );

	api.use([
		'tracker',
		'reactive-var',
		'underscore',
	], ['client', 'server'] );

	api.addFiles( 'lib/both/devtools.js', ['server', 'client'] );
	api.addFiles( 'lib/server/devtools.js', 'server' );
	api.addFiles( 'lib/client/devtools.js', 'client' );

	api.export( 'DevTools', ['server', 'client'] );
});

Package.onTest( function ( api ) {
	api.use( 'tinytest' );
	api.use( 'miro:devtools' );
	api.addFiles( 'devtools-tests.js' );
});

