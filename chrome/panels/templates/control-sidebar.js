var settings,
	sidebar = {
		$element: null,
		styles: {
			dark: 'control-sidebar-dark',
			light: 'control-sidebar-light'
		}
	},
	/**
	* List of all the available skins
	*
	* @type Array
	*/
	availableSkins = [
		'skin-blue',
		'skin-black',
		'skin-red',
		'skin-yellow',
		'skin-purple',
		'skin-green',
		'skin-blue-light',
		'skin-black-light',
		'skin-red-light',
		'skin-yellow-light',
		'skin-purple-light',
		'skin-green-light'
	],

	/**
	* Toggles layout classes
	*
	* @param String newLayoutClass the layout class to toggle
	* @returns void
	*/
	changeLayout = function ( newLayoutClass ) {
		var self = this;

		$( 'body' ).toggleClass( newLayoutClass );

		AdminLTE.layout.fixSidebar();
		// Fix the problem with right sidebar and layout boxed
		if ( newLayoutClass == 'layout-boxed' ) AdminLTE.controlSidebar._fix( $( '.control-sidebar-bg' ) );

		if ( $( 'body' ).hasClass( 'fixed' ) && newLayoutClass == 'fixed' ) {
			AdminLTE.pushMenu.expandOnHover();
			AdminLTE.layout.activate();
		}

		AdminLTE.controlSidebar._fix( $( '.control-sidebar-bg' ) );
		AdminLTE.controlSidebar._fix( $( '.control-sidebar' ) );

		if ( settings.layout != newLayoutClass ) {
			settings.layout = newLayoutClass;

			DevTools.storage.store( 'settings', settings );
		}
	},

	/**
	   * Replaces the old skin with the new skin
	   * @param String newSkinClass the new skin class
	   * @returns Boolean false to prevent link's default action
	   */
	changeSkin = function ( newSkinClass ) {
		var self = this;

		if ( newSkinClass && $.inArray( newSkinClass, availableSkins ) > -1 ) {
			$.each( availableSkins, function ( i ) {
				$( 'body' ).removeClass( availableSkins[ i ] );
			});

			$( 'body' ).addClass( newSkinClass );

			if ( settings.skin != newSkinClass ) {
				settings.skin = newSkinClass;

				DevTools.storage.store( 'settings', settings );
			}
		}

		return false;
	},

	changeSidebarSkin = function ( newSidebarSkinClass ) {
		var self = this,
			$sidebarSkinToggle = $( '[data-sidebarskin="toggle"]' ),
			currentSidebarSkinClass = ( sidebar.$element.hasClass( sidebar.styles.dark ) ) ? sidebar.styles.dark : sidebar.styles.light;

		if ( currentSidebarSkinClass != newSidebarSkinClass ) {
			sidebar.$element.removeClass( currentSidebarSkinClass ).addClass( newSidebarSkinClass )

			settings.sidebar.right.skin = newSidebarSkinClass;

			DevTools.storage.store( 'settings', settings );
		}

		if ( sidebar.$element.hasClass( sidebar.styles.light ) ) {
			$sidebarSkinToggle.prop( 'checked', true );
		} else {
			$sidebarSkinToggle.prop( 'checked', false );
		}
	},

	setLogging = function ( loggingType, isloggingEnabled ) {
		var self = this;

		if ( settings.logging[ loggingType ] != isloggingEnabled ) {
			settings.logging[ loggingType ] = isloggingEnabled;

			DevTools.storage.store( 'settings', settings );
		}

		$( '[data-logging="console"]' ).prop( 'checked', settings.logging.console );
		$( '[data-logging="DDP"]' ).prop( 'checked', settings.logging.DDP );

		console.info( DevTools.console.prefix + '[SY] ###### ' + ( ( loggingType === 'DDP' ) ? loggingType + ' ' : '' ) + 'Logging is ' + ( ( isloggingEnabled ) ? 'on' : 'off' ) + '.' );
	};

Template.controlSidebar.events({/*
	'click [data-layout]': function () {
		changeLayout( $( this ).data( 'layout' ) );
	},*/

	'click [data-skin]': function ( event ) {
		changeSkin( $( this ).data( 'skin' ) );
	},
	/*
	'click [data-controlsidebar]': function ( event ) {
		changeLayout( $( this ).data( 'controlsidebar' ) );

		var slide = !AdminLTE.options.controlSidebarOptions.slide;

		AdminLTE.options.controlSidebarOptions.slide = slide;

		if ( !slide ) $( '.control-sidebar' ).removeClass( 'control-sidebar-open' );
	}
	*/
	'click [data-sidebarskin="toggle"]': function ( event ) {
		if ( sidebar.$element.hasClass( sidebar.styles.dark ) ) {
			changeSidebarSkin( sidebar.styles.light );
		} else {
			changeSidebarSkin( sidebar.styles.dark );
		}
	},
	/*
	'click [data-enable="expandOnHover"]': function ( event ) {
		// TODO: Implement re-enabling
		$( this ).prop( 'disabled', true );

		AdminLTE.pushMenu.expandOnHover();

		if ( !$( 'body' ).hasClass( 'sidebar-collapse' ) ) $( '[data-layout="sidebar-collapse"]' ).click();

		settings.sidebar.left.expandOnHover = true;

		DevTools.storage.store( 'settings', settings );
	},
	*/
	'click [data-logging="console"]': function ( event ) {
		setLogging( 'console', $( this ).prop( 'checked' ) );
	},

	'click [data-logging="DDP"]': function ( event ) {
		setLogging( 'DDP', $( this ).prop( 'checked' ) );
	},

	'click [data-logging="clear"]': function ( event ) {
		console.clear();

		if ( DevTools.sendMessage ) {
			DevTools.sendMessage({
				action: 'console.clear'
			});
		}
	}
});

// Template.controlSidebar.helpers({
// 	meteorDevToolsVersion: function () {
// 		return DevTools.VERSION;
// 	}
// });

Template.controlSidebar.onCreated( function () {
	settings = DevTools.settings.get();
});

Template.controlSidebar.onRendered( function () {
	var self = this;

	sidebar.$element = $( '.control-sidebar' );

	// Add the change skin listener
	changeSkin( settings.skin );

	changeSidebarSkin( settings.sidebar.right.skin );

	setLogging( 'console', settings.logging.console );

	setLogging( 'DDP', settings.logging.DDP );

	// Reset options
	// if ( $( 'body' ).hasClass( 'fixed' ) ) $( '[data-layout="fixed"]' ).prop( 'checked', true );

	// if ( $( 'body' ).hasClass( 'layout-boxed' ) ) $( '[data-layout="layout-boxed"]' ).prop( 'checked', true );

	// if ( $( 'body' ).hasClass( 'sidebar-collapse' ) ) $( '[data-layout="sidebar-collapse"]' ).prop( 'checked', true );

	// $( '[data-logging="console"]' ).prop( 'checked', settings.logging.console );

	// $( '[data-logging="DDP"]' ).prop( 'checked', settings.logging.DDP );
});

Template.controlSidebar.onDestroyed( function () {});
