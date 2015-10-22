var colors = {
	log    : '',
	info   : '',
	success: 'color: rgb(114, 157, 52); font-weight: bold;',
	warn   : '',
	error  : ''
};

if ( typeof DevTools == 'undefined' ) DevTools = {};

if ( typeof DevTools.settings == 'undefined' ) DevTools.settings = {
	_settings: ( DevTools.storage ) ? DevTools.storage.get( 'settings' ) : {
		logging: {
			console: true,
			DDP    : false
		}
	}
}

if ( typeof DevTools.console == 'undefined' ) DevTools.console = {
	prefix: '[MDT] ',

	isLoggingEnabled: function () {
		var settings = DevTools.settings.get();

		return (
			settings &&
			settings.logging && (
				settings.logging.console ||
				settings.logging.DDP
			)
		)
	},

	addPrefix: function () {
		arguments[ 0 ][ 0 ] = this.prefix + arguments[ 0 ][ 0 ];

		return arguments[ 0 ];
	},

	log: function () {
		if ( this.isLoggingEnabled() ) console.log.apply( console, this.addPrefix( arguments ) );
	},

	info: function () {
		if ( this.isLoggingEnabled() ) console.info.apply( console, this.addPrefix( arguments ) );
	},

	success: function () {
		var self = this;

		if ( self.isLoggingEnabled() ) {
			var thisArguments = Array.prototype.slice.call( arguments );

			thisArguments[ 0 ] = '%c' + self.prefix + thisArguments[ 0 ];
			thisArguments.splice( 1, 0, colors.success );

			console.log.apply( console, thisArguments );
		}
	},

	warn: function () {
		if ( this.isLoggingEnabled() ) console.warn.apply( console, this.addPrefix( arguments ) );
	},

	error: function () {
		if ( this.isLoggingEnabled() ) console.error.apply( console, this.addPrefix( arguments ) );
	}
}
