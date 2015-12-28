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
		'package/server/methods/packages.js',
		'package/server/methods/settings.js',
		'package/server/methods/system.js',
		'package/server/methods/utilities/shell.js',
		'package/server/methods/users/users.js',
		'package/server/devtools.js'
	], 'server' );

	api.addFiles([
		'package/client/views/head.html',

		'chrome/panels/templates/loading.html',

		'chrome/assets/css/devtools.css',

		'chrome/assets/js/storage.js',
		'chrome/assets/js/console.js',
		'chrome/assets/js/settings.js',
		'chrome/assets/js/window.js',
		'chrome/assets/js/resize.js',
		'chrome/assets/js/admin_lte.js',

		'package/client/router.js',
		'package/client/devtools.js',
		'package/client/gui.js',

		'package/client/views/devtools_layout.html',
		'package/client/views/devtools_layout.js',

		'package/client/views/devtools.html',
		'package/client/views/devtools.js',

		'package/client/views/collections/collections.html',
		'package/client/views/collections/collections.js',

		'package/client/views/collections/collections_editor.html',
		'package/client/views/collections/collections_editor.js',

		'package/client/views/users/users.html',
		'package/client/views/users/users.js',

		'package/client/views/users/user_list.html',
		'package/client/views/users/user_list.js',

		'package/client/views/users/user.html',
		'package/client/views/users/user.js',

		'package/client/views/users/user_editor.html',
		'package/client/views/users/user_editor.js',

		'package/client/views/utilities/shell/utilities_shell.html',
		'package/client/views/utilities/shell/utilities_shell.js',

		'package/client/views/utilities/shell/shell.html',
		'package/client/stylesheets/utilities/shell.css',
		'package/client/views/utilities/shell/shell.js',

		'package/client/views/utilities/shell/shell_input.html',
		'package/client/views/utilities/shell/shell_input.js'
	], 'client' );

	api.addAssets([
		'chrome/assets/lib/css/bootstrap.min.css',

		'chrome/assets/lib/FontAwesome/4.5.0/css/font-awesome.min.css',
		'chrome/assets/lib/Ionicons/2.0.1/css/ionicons.min.css',

		'chrome/assets/lib/AdminLTE/css/AdminLTE.min.css',
		'chrome/assets/lib/AdminLTE/css/skins/_all-skins.min.css',

		'chrome/assets/lib/css/img/jsoneditor-icons.png',
		'chrome/assets/lib/css/jsoneditor-4.2.1.css',

		'chrome/assets/css/devtools.css',
		'chrome/assets/css/meteor-logo-icon.css',

		'chrome/assets/lib/js/bootstrap-3.3.5.min.js',

		'chrome/assets/lib/iFrameResizer/iFrameResizer.contentWindow.js',

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
