var styleFiles = [
		// Bootstrap
		'/packages/miro_devtools/chrome/assets/lib/css/bootstrap.min.css',
		// Font Awesome Icons
		'/packages/miro_devtools/chrome/assets/lib/FontAwesome/4.5.0/css/font-awesome.min.css',
		// Ionicons
		'/packages/miro_devtools/chrome/assets/lib/Ionicons/2.0.1/css/ionicons.min.css',
		// Theme style
		'/packages/miro_devtools/chrome/assets/lib/AdminLTE/css/AdminLTE.min.css',
		// AdminLTE Skins. Choose a skin from the css/skins folder instead of downloading all of them to reduce the load.
		'/packages/miro_devtools/chrome/assets/lib/AdminLTE/css/skins/_all-skins.min.css',
		// JSON Editor
		'/packages/miro_devtools/chrome/assets/lib/css/jsoneditor-4.2.1.css',
		// Auxiliary styles
		'/packages/miro_devtools/chrome/assets/css/devtools.css',
		// Meteor logo
		'/packages/miro_devtools/chrome/assets/css/meteor-logo-icon.css'
	],
	scriptFiles = [
		'/packages/miro_devtools/chrome/assets/lib/js/bootstrap-3.3.5.min.js',

		'/packages/miro_devtools/chrome/assets/lib/iFrameResizer/iFrameResizer.contentWindow.js',

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

Template.DevToolsLayout.onCreated( function () {
	DevTools.gui.isReady.set( false );
});

Template.DevToolsLayout.onRendered( function () {
	$( 'body' ).addClass( 'skin-red' );

	if ( DevTools.isFramed ) {
		$( 'body' ).addClass( 'framed' );

		importStyles();
		importScripts();
	}

	jQuery( document ).ready( function () {
		AdminLTE.run();

		DevTools.gui.isReady.set( true );
	});
});
