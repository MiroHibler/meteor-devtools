var styleFiles = [
		// Bootstrap
		'/packages/miro_devtools/chrome/assets/lib/css/bootstrap.min.css',
		// Font Awesome Icons
		'https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
		// Ionicons
		'https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css',
		// Theme style
		'/packages/miro_devtools/chrome/assets/lib/AdminLTE/css/AdminLTE.min.css',
		// AdminLTE Skins. Choose a skin from the css/skins folder instead of downloading all of them to reduce the load.
		'/packages/miro_devtools/chrome/assets/lib/AdminLTE/css/skins/_all-skins.min.css'
	],
	scriptFiles = [
		// '/packages/miro_devtools/chrome/assets/lib/js/jquery-ui-1.11.4.min.js',
		'/packages/miro_devtools/chrome/assets/lib/js/bootstrap-3.3.5.min.js',

		'/packages/miro_devtools/chrome/assets/lib/js/jsondiffpatch-0.1.37.js',
		'/packages/miro_devtools/chrome/assets/lib/js/jsondiffpatch-formatters-0.1.37.js',
		'/packages/miro_devtools/chrome/assets/lib/js/jsonutils.js',
		'/packages/miro_devtools/chrome/assets/lib/js/jsoneditor-4.2.1.js',
		'/packages/miro_devtools/chrome/assets/js/editor.js',

		'/packages/miro_devtools/chrome/assets/js/admin_lte.js'
	],

	importStyles = function () {
		_.map( styleFiles, function ( styleFile ) {
			$( 'head' ).append( '<link rel="stylesheet" type="text/css" href="' + styleFile + '"/>' );
		});
	},

	importScripts = function () {
		_.map( scriptFiles, function ( scriptFile ) {
			$( 'head' ).append( '<script type="text/javascript" src="' + scriptFile + '"></script>' );
		});
	};

Template.DevToolsLayout.onRendered( function () {
	DevTools.isGUIReady.set( false );

	$( 'body' ).addClass( 'skin-red' );

	if ( DevTools.isFramed ) {
		$( 'body' ).addClass( 'framed' );

		importStyles();
		importScripts();
	}

	jQuery( document ).ready( function () {
		AdminLTE.run();

		DevTools.isGUIReady.set( true );
	});
});
