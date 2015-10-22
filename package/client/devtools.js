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

DevTools = _.extend( DevTools, {
	isGUIReady: new ReactiveVar( false ),

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

	getValues: function ( targets ) {
		var self = this,
			target;

		for ( target in targets ) {
			self.getValue( targets[ target ] );
		}
	},

	getValue: function ( forVar ) {
		var self = this;

		switch ( forVar ) {
			case 'absoluteUrl':
				self.send({
					absoluteUrl: Meteor.absoluteUrl()
				});

				break;

			case 'release':
				self.send({
					release: Meteor.release
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
				// Not so fast grasshopper!
				break;

			case 'users':
				// Not so fast grasshopper!
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
				case 'status':
					// Start tracking
					self.targets[ target ] = self.statusTracker();

					break;

				case 'currentUser':
					// Start tracking
					self.targets[ target ] = self.currentUserTracker();

					break;

				case 'users':
					// Start tracking
					self.targets[ target ] = self.usersTracker();

					break;

				case 'loggingIn':
					// Start tracking
					self.targets[ target ] = self.loggingInTracker();

					break;

				case 'session':
					// Start tracking
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
	statusTracker: function () {
		var self = this;

		return Tracker.autorun( function () {
			self.send({
				status: Meteor.status()
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
						self.getValues( targets );

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
	},

	routerName: 'DevTools',

	router: {
		render: function ( templateName ) {
			if (
				templateName &&
				templateName !== '' &&
				Blaze.isTemplate( Template[ templateName ] )
			) {
				var self = this,
					templateBody = Template.body;

				if ( templateBody ) {
					// TODO: Implement raw rendering

					// Blaze.remove( templateBody );
					// Blaze.render( Template[ templateName ], $( 'body' ) );
				}
			}
		}
	},

	checkForRouter: function () {
		var self = this;

		if ( self.isFramed ) {
			if ( Package[ 'iron:router' ] ) {
				self.routerName = 'Iron.Router';
				self.router = Package[ 'iron:router' ].Router;
			} else if ( Package[ 'kadira:flow-router' ] ) {
				self.routerName = 'FlowRouter';
				self.router = Package[ 'kadira:flow-router' ].FlowRouter;
			}

			self.initRouter( self.routerName );
		}
	},

	initRouter: function ( routerName ) {
		var self = this;

		switch ( routerName ) {
			case 'Iron.Router':
				self.router.route( '/devtools', {
					name          : 'DevTools',
					template      : 'DevTools',
					layoutTemplate: 'DevToolsLayout'
				});

				// Ensure we bypass any checks
				self.router.onBeforeAction( function () {
					// DevTools.console.warn( '[MC] ###### onBeforeAction: ' + this.url );

					if ( this.url.indexOf( '/devtools' ) < 0 ) {
						this.next();
					} else if ( !this._rendered ) {
						this.render( 'DevTools' );
					}
				});

				break;

			case 'FlowRouter':
				self.router.route( '/devtools', {
					name: 'DevTools',
					// TODO: Find out how to replace top layout

					action: function () {
						if ( Package[ 'kadira:blaze-layout' ] ) {
							Package[ 'kadira:blaze-layout' ].BlazeLayout.render( 'DevTools' );
						} else if ( Package[ 'kadira:react-layout' ] ) {
							throw new Meteor.Error( -1, 'ReactLayout not supported', 'ReactLayout is not supported yet' );
						} else {
							self.router.render( 'DevTools' );
						}
					}
				});

				break;

			default:	// 'DevTools'
				if ( window.location.pathname.split( '/' )[ 0 ] == 'devtools' ) {
					self.router.render( 'DevTools' );
				}
		}

		// DevTools.console.info( '[MC] ###### Route set for ' + self.routerName + '!' );
	}
});

/*
 | Initialize DevTools
 */
DevTools.init();
