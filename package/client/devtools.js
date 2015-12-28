var meteorConnectionSend,

	ddpSender = function ( object ) {
		var settings = DevTools.settings.get();

		if ( settings && settings.logging && settings.logging.DDP ) DevTools.console.log( '[MC] DDP |----> ', object );

		meteorConnectionSend.call( this, object );
	},

	ddpReceiver = function ( message ) {
		var settings = DevTools.settings.get();

		if ( settings && settings.logging && settings.logging.DDP ) DevTools.console.log( '[MC] DDP <----| ', JSON.parse( message ) );
	};

Template.forEach = function ( callback ) {
	// For some reason we get the "body" template twice when looping, so
	// we track that and only call the callback once.
	var alreadyDidBody = false,
		template,
		tempTemplate;

	for ( template in Template ) {
		if ( Template.hasOwnProperty( template ) ) {
			tempTemplate = Template[ template ];

			if ( Blaze.isTemplate( tempTemplate ) ) {
				if ( tempTemplate.viewName === 'body' ) {
					if ( !alreadyDidBody ) {
						alreadyDidBody = true;

						callback( tempTemplate );
					}
				} else {
					callback( tempTemplate );
				}
			}
		}
	}
};


DevTools = _.extend( DevTools, {
	init: function () {
		var self = this;

		/*
		 | Setup DDP logger
		 |
		 | http://stackoverflow.com/a/25373867/775286
		 */
		if ( !self.isFramed ) {
		// 	DevTools.console.info( '[MC] ###### We\'re *NOT* iFramed! %o %o', window.parent.location, window.location );

			// Log sent DDP messages
			meteorConnectionSend = Meteor.connection._send;
			Meteor.connection._send = ddpSender;

			// Log received DDP messages
			Meteor.connection._stream.on( 'message', ddpReceiver );
		// } else {
		// 	DevTools.console.info( '[MC] ###### We\'re iFramed! %o / %o', window.parent.location, window.location );
		}

		/*
		 | Set up event handler(s)
		 */
		window.onbeforeunload = function () {
			self.ready.set( false );
		};

		/*
		 | Set up listener
		 */
		window.addEventListener( 'message', self.receive.bind( self ), false );

		/*
		 | Start Reactive Tracker for our status
		 */
		self.readyTracker();

		/*
		 | Check for router and tell Chrome Extension we're ready
		 */
		self.checkForRouter();

		self.ready.set( true );
	},

	// Getters & setters
	getValues: function ( targets, data ) {
		var self = this,
			target;

		for ( target in targets ) {
			self.getValue( targets[ target ], data );
		}
	},

	getValue: function ( forVar, data ) {
		var self = this;

		switch ( forVar ) {
			case 'absoluteUrl':
				self.send({
					absoluteUrl: Meteor.absoluteUrl()
				});

				break;

			case 'debuggerUrl':
				self.send({
					debuggerUrl: 'http://localhost:8080/debug?port=5858'
				});

				break;

			case 'release':
				self.send({
					release: Meteor.release
				});

				break;

			case 'meteorSettings':
				Meteor.call( 'DevTools.meteorSettings.get', function ( error, meteorSettings ) {
					if ( error ) {
						// Handle Errors...
					} else {
						self.send({
							meteorSettings: meteorSettings
						});
					}
				});

				break;

			case 'meteorEnvironment':
				Meteor.call( 'DevTools.meteorEnvironment.get', function ( error, meteorEnvironment ) {
					if ( error ) {
						// Handle Errors...
					} else {
						self.send({
							meteorEnvironment: meteorEnvironment
						});
					}
				});

				break;

			case 'packages':
				Meteor.call( 'DevTools.packages.getList', function ( error, packageList ) {
					self.send({
						packages: packageList
					});
				});

				break;

			case 'packageInfo':
				Meteor.call( 'DevTools.packages.getInfo', data, function ( error, packageInfo ) {
					self.send({
						packageInfo: packageInfo
					});
				});

				break;

			case 'collections':
				var self = this,
					mongoCollections = ( typeof Mongo != 'undefined' && Mongo.Collection.getAll ) ? Mongo.Collection.getAll() : [],
					collections = _.map( mongoCollections, function ( mongoCollection ) {
						if ( mongoCollection.name ) return mongoCollection.name;
					});

				self.send({
					collections: collections
				});

				break;

			case 'templates':
				var self = this,
					listOfTemplates = [];

				Template.forEach( function ( template ) {
					listOfTemplates.push( template.viewName );
				});

				self.send({
					templates: listOfTemplates
				});

				break;

			case 'insecure':
				self.send({
					insecure: ( typeof Package.insecure != 'undefined' )
				});

				break;

			case 'autopublish':
				self.send({
					autopublish: ( typeof Package.autopublish != 'undefined' )
				});

				break;

			case 'isReady':
			case 'isRemoteReady':
				self.send({
					isReady: self.ready.get()
				});

				break;

			default:
				// ...
		}
	},

	setValues: function ( targets, data ) {
		var self = this,
			target;

		for ( target in targets ) {
			// data can contain multiple key/value pairs
			self.setValue( targets[ target ], data );
		}
	},

	setValue: function ( forVar, data ) {
		var self = this,
			key;

		switch ( forVar ) {
			case 'currentUser':
				// Handled directly!
				break;

			case 'users':
				// Handled directly!
				break;

			case 'meteorSettings':
				Meteor.call( 'DevTools.settings.set', data );

				break;

			case 'session':
				for ( key in data ) {
					if ( _.isObject( data[ key ] ) ) {
						Session.set( key, _.extend( Session.get( key ), data[ key ] ) );
					} else {
						Session.set( key, data[ key ] );
					}
				}

				break;

			default:
				// ...
		}
	},

	// Tracker Control
	startTrackers: function ( targets ) {
		var self = this,
			target;

		self.stopTrackers( targets );

		for ( target in targets ) {
			self.startTracker( targets[ target ] );
		}
	},

	startTracker: function ( target ) {
		var self = this;

		if ( !self.targets[ target ] ) {
			switch ( target ) {
				case 'absoluteUrl':
					self.targets[ target ] = self.absoluteUrlTracker();

					break;

				case 'debuggerUrl':
					self.targets[ target ] = self.debuggerUrlTracker();

					break;

				case 'status':
					self.targets[ target ] = self.statusTracker();

					break;

				case 'release':
					self.targets[ target ] = self.releaseTracker();

					break;

				case 'meteorSettings':
					self.targets[ target ] = self.meteorSettingsTracker();

					break;

				case 'meteorEnvironment':
					self.targets[ target ] = self.meteorEnvironmentTracker();

					break;

				case 'packages':
					self.targets[ target ] = self.packagesTracker();

					break;

				case 'collections':
					self.targets[ target ] = self.collectionsTracker();

					break;

				case 'templates':
					self.targets[ target ] = self.templatesTracker();

					break;

				case 'insecure':
					self.targets[ target ] = self.insecureTracker();

					break;

				case 'autopublish':
					self.targets[ target ] = self.autopublishTracker();

					break;

				case 'currentUser':
					self.targets[ target ] = self.currentUserTracker();

					break;

				case 'users':
					self.targets[ target ] = self.usersTracker();

					break;

				case 'loggingIn':
					self.targets[ target ] = self.loggingInTracker();

					break;

				case 'session':
					self.targets[ target ] = self.sessionTracker();

					break;
			}
		}
	},

	stopTrackers: function ( targets ) {
		var self = this,
			target;

		for ( target in targets ) {
			self.stopTracker( targets[ target ] );
		}
	},

	stopTracker: function ( target ) {
		var self = this;

		if ( self.targets[ target ] ) {
			// Stop tracking
			self.targets[ target ].stop();
			delete self.targets[ target ];
		}
	},

	// Trackers
	absoluteUrlTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				absoluteUrl: Meteor.absoluteUrl()
			});
		});
	},

	debuggerUrlTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				debuggerUrl: 'http://localhost:8080/debug?port=5858'
			});
		});
	},

	statusTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				status: Meteor.status()
			});
		});
	},

	releaseTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				release: Meteor.release
			});
		});
	},

	meteorSettingsTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			Meteor.call( 'DevTools.meteorSettings.get', function ( error, meteorSettings ) {
				if ( error ) {
					// Handle Errors...
				} else {
					self.send({
						meteorSettings: meteorSettings
					});
				}
			});
		});
	},

	meteorEnvironmentTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			Meteor.call( 'DevTools.meteorEnvironment.get', function ( error, meteorEnvironment ) {
				if ( error ) {
					// Handle Errors...
				} else {
					self.send({
						meteorEnvironment: meteorEnvironment
					});
				}
			});
		});
	},

	packagesTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			Meteor.call( 'DevTools.packages.getList', function ( error, packageList ) {
				self.send({
					packages: packageList
				});
			});
		});
	},

	collectionsTracker: function () {
		var self = this,
			mongoCollections,
			collections;

		return Tracker.autorun( function () {
			mongoCollections = ( typeof Mongo != 'undefined' && Mongo.Collection.getAll ) ? Mongo.Collection.getAll() : [];
			collections = _.map( mongoCollections, function ( mongoCollection ) {
				if ( mongoCollection.name ) return mongoCollection.name;
			});

			self.send({
				collections: collections
			});
		});
	},

	templatesTracker: function () {
		var self = this,
			listOfTemplates = [];

		return Tracker.autorun( function () {
			Template.forEach( function ( template ) {
				listOfTemplates.push( template.viewName );
			});

			self.send({
				templates: listOfTemplates
			});
		});
	},

	insecureTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				insecure: ( typeof Package.insecure != 'undefined' )
			});
		});
	},

	autopublishTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				autopublish: ( typeof Package.autopublish != 'undefined' )
			});
		});
	},

	currentUserTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				currentUser: Meteor.user()
			});
		});
	},

	usersTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				users: Meteor.users.find().fetch()
			});
		});
	},

	loggingInTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				loggingIn: Meteor.loggingIn()
			});
		});
	},

	sessionTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			var session = {},
				key;

			for ( key in Session.keys ) {
				session[ key ] = Session.get( key );
			}

			self.send({
				session: session
			});
		});
	},

	// Communication
	receive: function ( message ) {
		var self = this,
			data = message.data,
			targets, target;

		if ( data && data.source !== ( 'devtools-meteor' + self.iFramed() ) ) return;

		// message.data is object
		// message.data.type is 'meteor-devtools'
		// message.data.content is data to relay

		data = data.data;

		// Do we trust the sender of this message?  (might be
		// different from what we originally opened, for example).
		if ( typeof data !== 'object' || data === null ) return;

		/*
		 | message = {
		 |	action: 'startTracking|stopTracking|get',
		 |	target: [ 'session' ]...
		 | }
		 */
		if ( data.action ) {

			DevTools.console.success( '[MC] √|<~   meteor' + self.iFramed() + '-devtools received: ', data );

			if ( data.target && typeof data.target === 'string' ) {
				if ( data.target === '*' ) {
					targets = self.nativeTargets;
				} else {
					targets = ( data.target === '' ) ? [] : [ data.target ];
				}
			} else {
				targets = data.target || [ data.action ];
			}

			if ( targets.length ) {
				switch ( data.action ) {
					case 'settings':
						DevTools.settings.set( data.data );

						break;

					case 'startTracking':
						self.startTrackers( targets );

						break;

					case 'stopTracking':
						self.stopTrackers( targets );

						break;

					case 'get':
						self.getValues( targets, data.data );

						break;

					case 'set':
						self.setValues( targets, data.data );

						break;

					case 'logout':
						Meteor.logout();

						break;

					case 'console.clear':
						console.clear();

						break;

					default:
						// ...
				}
			}
		}
	},

	send: function ( message ) {
		var self = this;

		DevTools.console.log( '[MC]  |~>   meteor' + self.iFramed() + '-devtools sending: ', message );

		// The callback here can be used to execute something on receipt
		window.postMessage({
			source: 'meteor' + self.iFramed() + '-devtools',
			data  : message
		}, '*' );
	}
});

/*
 | Initialize DevTools
 */
DevTools.init();
