var both = [ 'server', 'client' ];

Package.describe({
	name     : 'miro:devtools',
	version  : '0.0.2',
	summary  : 'Meteor debugging with Chrome DevTools',
	git      : 'https://github.com/MiroHibler/meteor-devtools',
	debugOnly: true
});

Package.onUse( function ( api ) {
	api.versionsFrom( 'METEOR@1.0' );

	// Prerequisite packages
	api.use([
		'browser-policy',
	], 'server' );

	api.use([
		'underscore',
		'reactive-var',
		'reactive-dict',
		'tracker',
		'dburles:mongo-collection-instances'
	], both );

	api.use([
		'iron:router'
	], both, {
		weak: true
	});

	api.use([
		'kadira:flow-router',
		'kadira:blaze-layout',
		'kadira:react-layout'
	], 'client', {
		weak: true
	});

	api.use([
		'templating',
		'session',
		'jquery',
		'aldeed:template-extension'
	], 'client' );

	api.addFiles([
		'package/both/devtools.js'
	], both );

	api.addFiles([
		'chrome/assets/js/console.js',
		'package/server/methods.js',
		'package/server/devtools.js'
	], 'server' );

	api.addFiles([
		'package/client/views/devtools_layout.html',
		'package/client/views/devtools.html',

		'chrome/panels/templates/loading.html',

		'chrome/assets/css/devtools.css',

		'chrome/assets/js/storage.js',
		'chrome/assets/js/console.js',
		'chrome/assets/js/settings.js',
		'chrome/assets/js/window.js',
		'chrome/assets/js/admin_lte.js',

		'package/client/devtools.html',
		'package/client/devtools.js',

		'package/client/views/devtools_layout.js',
		'package/client/views/devtools.js'
	], 'client' );

	api.addAssets([
		'chrome/assets/lib/css/bootstrap.min.css',

		'chrome/assets/lib/AdminLTE/css/AdminLTE.min.css',
		'chrome/assets/lib/AdminLTE/css/skins/_all-skins.min.css',

		'chrome/assets/lib/css/jsoneditor-4.2.1.css',

		'chrome/assets/lib/js/bootstrap-3.3.5.min.js',

		'chrome/assets/lib/js/jsondiffpatch-0.1.37.js',
		'chrome/assets/lib/js/jsondiffpatch-formatters-0.1.37.js',
		'chrome/assets/lib/js/jsonutils.js',
		'chrome/assets/lib/js/jsoneditor-4.2.1.js',

		'chrome/assets/js/editor.js',
		'chrome/assets/js/admin_lte.js'
	], 'client' );

	api.export( 'DevTools', both );
});

Package.onTest( function ( api ) {
	api.use( 'tinytest' );
	api.use( 'miro:devtools' );
	api.addFiles( 'devtools-tests.js' );
});

