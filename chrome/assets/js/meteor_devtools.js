// This one acts in the context of the panel in the Dev Tools
//
// It creates and maintains the communication channel between
// the inspectedPage and the dev tools panel.
//
// TODO: Edit following...
// In this example, messages are JSON objects
// {
//   action: ['code'|'script'|'message'], // What action to perform on the inspected page
//   content: [String|Path to script|Object], // data to be passed through
//   tabId: [Automatically added]
// }
//
// Can use(?)
// chrome.devtools.*
// chrome.extension.*

MeteorDevTools = {
	version: '0.0.1',

	// Meteor app's readiness for debugging
	// If a package miro:meteor-devtools has been installed, this
	// gets initialized by the package to enable communication
	ready: false,

	trackingTargets: [
		'status',
		'loggingIn',
		'currentUser',
		'users',
		'session'
	],

	visible       : false,
	trackingActive: false,

	init: function () {
		this.sendMessage({
			action: 'init'
		});
	},

	show: function () {
		this.visible = true;

		if ( !this.trackingActive ) {
			this.startTracking();
		}
	},

	hide: function () {
		this.visible = false;

		if ( this.trackingActive ) {
			this.stopTracking();
		}
	},

	// Create a connection to the background page
	backgroundPageConnection: chrome.runtime.connect({
		name: 'meteor-devtools'
	}),

	sendMessage: function ( message ) {
		message.tabId = chrome.devtools.inspectedWindow.tabId;

		this.backgroundPageConnection.postMessage(
			( message.action === 'init' ) ?
				message
			:
				{
					action: 'send',
					data  : message
				}
		);
	},

	startTracking: function () {
		if ( this.visible ) {
			this.trackingActive = true;

			this.sendMessage({
				action: 'startTracking',
				target: this.trackingTargets
			});

			this.sendMessage({
				action: 'get',
				target: 'release'
			});
		}
	},

	stopTracking: function () {
		this.trackingActive = false;

		this.sendMessage({
			action: 'stopTracking',
			target: this.trackingTargets
		});
	},

	reload: function () {
		chrome.devtools.inspectedWindow.reload();
	}
};
