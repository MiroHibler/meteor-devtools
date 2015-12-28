var cliExec = Npm.require( 'child_process' ).exec;

BrowserPolicy.framing.allowAll();
BrowserPolicy.content.allowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowInlineScripts();
BrowserPolicy.content.allowDataUrlForAll();
BrowserPolicy.content.allowSameOriginForAll();
BrowserPolicy.content.allowOriginForAll( Meteor.absoluteUrl() );
// BrowserPolicy.content.allowOriginForAll( '*.gstatic.com' );
// BrowserPolicy.content.allowOriginForAll( '*.googleapis.com' );

DevTools = _.extend( DevTools, {
	meteorSettings: {
		get: function () {
			return Meteor.settings;
		},

		set: function ( newMeteorSettings ) {
			var key;

			for ( key in newMeteorSettings ) {
				if ( _.isObject( newMeteorSettings[ key ] ) ) {
					Meteor.settings[ key ] = _.extend( Meteor.settings[ key ], newMeteorSettings[ key ] );
				} else {
					Meteor.settings[ key ] = newMeteorSettings[ key ];
				}
			}
		}
	},

	utilities: {
		shell: Meteor.wrapAsync( cliExec )
	},

	packages: {
		getList: function () {
			var versions = DevTools.utilities.shell( 'cat ../../../../versions' ),
				packages = [],
				packageInfo;

			if ( versions && versions.length ) {
				packages = _.map( versions.split( '\n' ), function ( package ) {
					if ( package.length > 0 ) {
						packageInfo = package.split( '@' );

						return {
							name   : packageInfo[ 0 ],
							version: packageInfo[ 1 ]
						}
					}
				});

				packages = _.compact( packages );
			}

			return packages;
		},

		getInfo: function ( packageName ) {
			check( packageName, String );

			var packageInfo = {
					name: packageName,
				}/*,
				regExpPattern = new RegExp( packageName + '@([0-9_\.]*)' ),
				regExpResult*/;

			packageInfo.details = DevTools.utilities.shell( 'meteor show ' + packageName );

			// regExpResult = regExpPattern.exec( packageInfo.details );

			// if ( regExpResult ) packageInfo.version = regExpResult[ 1 ];

			return packageInfo;
		}
	},

	meteorEnvironment: {
		get: function () {
			return process.env;
		}
	},

	send: function () {
		DevTools.console.warn( DevTools.consolePrefix + '[MS] Sorry, server-side DevTools.send() is not yet implemented.' );
	}
});
