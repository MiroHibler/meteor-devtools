// Can use(?)
// chrome.devtools.*
// chrome.extension.*

DevTools = {
	VERSION: '0.0.2',

	// Meteor app's readiness for debugging
	// If a package miro:meteor-devtools has been installed, this
	// gets initialized by the package to enable communication
	isReady: new ReactiveVar( false ),

	activeView: new ReactiveVar( 'dashboard' ),

	inspectedApp: {
		notifications: new ReactiveVar([]),
		release      : new ReactiveVar(),

		status       : new ReactiveVar(),

		absoluteUrl  : new ReactiveVar(''),
		settings     : new ReactiveVar(),
		packages     : new ReactiveVar([]),
		collections  : new ReactiveVar([]),
		templates    : new ReactiveVar([]),

		loggingIn    : new ReactiveVar(),
		currentUser  : new ReactiveVar(),
		users        : new ReactiveVar([]),
		session      : new ReactiveVar()
	},

	trackingTargets: [
		'status',

		// 'meteorSettings',
		// 'packages',
		// 'collections',
		// 'templates',

		'loggingIn',
		'currentUser',
		'users',
		'session'
	],

	isVisible: new ReactiveVar( false ),

	init: function () {
		DevTools.sendMessage({
			action: 'init'
		});
	},

	show: function () {
		DevTools.isVisible.set( true );
	},

	hide: function () {
		DevTools.isVisible.set( false );
	},

	changeView: function ( newView ) {
		DevTools.activeView.set( newView );
	},

	// Create a connection to the background page
	backgroundPageConnection: chrome.runtime.connect({
		name: 'meteor-devtools'
	}),

	sendMessage: function ( message ) {
		message.tabId = chrome.devtools.inspectedWindow.tabId;

		DevTools.backgroundPageConnection.postMessage(
			( message.action === 'init' ) ?
				message
			:
				{
					action: 'send',
					data  : message
				}
		);
	},

	reload: function () {
		chrome.devtools.inspectedWindow.reload();
	},

	logout: function ( event ) {
		var self = this;

		self.sendMessage({
			action: 'logout'
		});
	}
};

Tracker.autorun( function () {
	if ( DevTools.isReady.get() ) {
		DevTools.sendMessage({
			action: 'startTracking',
			target: DevTools.trackingTargets
		});
	} else {
		DevTools.sendMessage({
			action: 'stopTracking',
			target: DevTools.trackingTargets
		});
	}
});
