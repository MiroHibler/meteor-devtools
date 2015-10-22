if ( typeof DevTools === 'undefined' ) DevTools = {};

DevTools.settings = {
	_defaults: {
		skin: 'skin-red',
		sidebar: {
			left: {
				expandOnHover: false
			},
			right: {
				skin: 'control-sidebar-dark'
			}
		},
		logging: {
			console: false,
			DDP    : false
		}
	},

	_settings: {},

	set: function ( newSettings ) {
		var self = this,
			oldSettings = JSON.parse( JSON.stringify( ( self._settings ) ? self._settings : self._defaults ) );

		self._settings = JSON.parse( JSON.stringify( newSettings ) );

		DevTools.storage.store( 'settings', self._settings );

		if ( oldSettings.logging.console != self._settings.logging.console ) console.info( DevTools.console.prefix + '[SY] ###### Logging is ' + ( ( self._settings.logging.console ) ? 'on' : 'off' ) + '.' );
		if ( oldSettings.logging.DDP != self._settings.logging.DDP ) console.info( DevTools.console.prefix + '[SY] DDP ###### Logging is ' + ( ( self._settings.logging.DDP ) ? 'on' : 'off' ) + '.' );
	},

	get: function () {
		var self = this;

		return self._settings;
	},

	init: function ( newSettings ) {
		var self = this;

		self._settings = newSettings || DevTools.storage.get( 'settings' );

		if ( !self._settings || Object.keys( self._settings ).length == 0 ) self.set( self._defaults );
	}
};

DevTools.settings.init(/*{
	skin: 'skin-red',
	sidebar: {
		left: {
			expandOnHover: false
		},
		right: {
			skin: 'control-sidebar-dark'
		}
	},
	logging: {
		console: false,
		DDP    : false
	}
}*/);
