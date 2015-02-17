DevTools = _.extend( DevTools, {
	getValue: function ( forVar ) {
		var self = DevTools;

		switch ( forVar ) {
			case 'release':
				self.send({
					release: Meteor.release
				});
				break;
			case 'isReady':
				self.send({
					isReady: self.ready.get()
				});
				break;
			default:
				// ...
		}
	},
	setValue: function ( forVar, data ) {
		var self = DevTools;

		switch ( forVar ) {
			case 'currentUser':
				// Not so fast grasshopper!
				break;
			case 'users':
				// Not so fast grasshopper!
				break;
			case 'session':
				for ( var key in data ) {
					if ( _.isObject( data[key] ) ) {
						Session.set( key, _.extend( Session.get( key ), data[key] ) );
					} else {
						Session.set( key, data[key] );
					}
				}
				break;
			default:
				// ...
		}
	},
	// Tracker Control
	startTracker: function ( target ) {
		var self = DevTools;

		if ( !self.targets[target] ) {
			switch ( target ) {
				case 'status':
					// Start tracking
					self.targets[target] = self.statusTracker();
					break;
				case 'currentUser':
					// Start tracking
					self.targets[target] = self.currentUserTracker();
					break;
				case 'users':
					// Start tracking
					self.targets[target] = self.usersTracker();
					break;
				case 'loggingIn':
					// Start tracking
					self.targets[target] = self.loggingInTracker();
					break;
				case 'session':
					// Start tracking
					self.targets[target] = self.sessionTracker();
					break;
			}
		}
	},
	stopTracker: function ( target ) {
		var self = DevTools;

		if ( self.targets.target ) {
			// Stop tracking
			self.targets.target.stop();
			delete self.targets.target;
		}
	},
	// Trackers
	statusTracker: function () {
		var self = DevTools;

		return Tracker.autorun( function () {
			self.send({
				status: Meteor.status()
			});
		});
	},
	currentUserTracker: function () {
		var self = DevTools;

		return Tracker.autorun( function () {
			self.send({
				currentUser: Meteor.user()
			});
		});
	},
	usersTracker: function () {
		var self = DevTools;

		return Tracker.autorun( function () {
			self.send({
				users: Meteor.users.find().fetch()
			});
		});
	},
	loggingInTracker: function () {
		var self = DevTools;

		return Tracker.autorun( function () {
			self.send({
				loggingIn: Meteor.loggingIn()
			});
		});
	},
	sessionTracker: function () {
		var self = DevTools;

		return Tracker.autorun( function () {
			var session = {};

			for ( var key in Session.keys ) {
				session[key] = Session.get( key );
			}

			self.send({
				session: session
			});
		});
	},

	receive: function ( message ) {
		var self = DevTools,
			data = message.data;

		if ( data && data.source !== 'devtools-meteor' ) return;

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
		 |	target: ['session']...
		 | }
		 */
		if ( data.action ) {

			console.info( '√|<~ meteor-devtools received: %o', data );

			var targets, target;

			if ( data.target && typeof data.target === 'string' ) {
				if ( data.target === '*' ) {
					targets = self.nativeTargets;
				} else {
					targets = ( data.target === '' ) ? [] : [data.target];
				}
			} else {
				targets = data.target || [data.action];
			}

			if ( targets.length ) {
				switch ( data.action ) {
					case 'startTracking':
						for ( target in targets ) {
							if (
								(
									targets[target] !== 'loggingIn' &&
									targets[target] !== 'currentUser' &&
									targets[target] !== 'users'
								) || Package['accounts-core']
							) {
								self.startTracker( targets[target] );
							}
						}
						break;
					case 'stopTracking':
						for ( target in targets ) {
							self.stopTracker( targets[target] );
						}
						break;
					case 'get':
						for ( target in targets ) {
							self.getValue( targets[target] );
						}
						break;
					case 'set':
						for ( target in targets ) {
							// data can contain multiple key/value pairs
							self.setValue( targets[target], data.data );
						}
						break;
					case 'logout':
						Meteor.logout();
						break;
					default:
						// ...
				}
			}
		}
	},

	send: function ( message ) {
		console.info( ' |~> meteor-devtools sending: %o', message );
		// The callback here can be used to execute something on receipt
		window.postMessage({
			source : 'meteor-devtools',
			data   : message
		}, '*' );
	}
});
/*
 | Set up event handler(s)
 */
window.onbeforeunload = function () {
	DevTools.ready.set( false );
};
/*
 | Set up listener
 */
window.addEventListener( 'message', DevTools.receive, false );
/*
 | Start Reactive Tracker for our status
 */
DevTools.readyTracker();
/*
 | Tell Chrome Extension we're ready
 */
DevTools.ready.set( true );
