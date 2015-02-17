// This is included and executed in the inspected page

var myTabId,
	connect = function () {
		chrome.runtime.onMessage.addListener( receiveMessageFromDevTools );
	},
	sendMessageToDevTools = function ( messageForDevTools ) {

		console.info( ' ->| sendMessageToDevTools: %o', messageForDevTools );

		chrome.runtime.sendMessage({
			data : messageForDevTools.data,
			tabId: myTabId
		}, function ( response ) {
			// The callback here can be used to execute something on receipt
			// console.info( 'Response: ' + response );
		});
	},
	receiveMessageFromDevTools = function ( messageForMeteor, sender, sendResponse ) {

		console.log( ' <-| receiveMessageFromDevTools: %o', messageForMeteor );

		switch ( messageForMeteor.action ) {
			case 'init':
				myTabId = messageForMeteor.tabId;
				break;
			default:
				// Nothing for now...
		}

		sendMessageToMeteor( messageForMeteor, sendResponse );
	},
	sendMessageToMeteor = function ( message, sendResponse ) {

		console.info( ' |<- sendMessageToMeteor: %o', message );

		window.postMessage({
			source: 'devtools-meteor',
			data  : message
		}, '*' );

		sendResponse({ sentToMeteor: true });
	},
	receivePublicMessage = function ( publicMessage ) {
		if ( publicMessage.source !== window ) return;

		// publicMessage.data.source is 'meteor-devtools'
		// publicMessage.data.data is data to relay to Meteor app

		// publicMessage.data.source is 'devtools-meteor'
		// publicMessage.data.data is data to for Meteor app

		// Do we trust the sender of this message?  (might be
		// different from what we originally opened, for example).
		var publicMessageData = publicMessage.data;

		if ( publicMessageData ) {
			if ( !publicMessageData.data || typeof publicMessageData.data !== 'object' ) return;

			if ( publicMessageData.source === 'meteor-devtools' ) {

				console.info( ' ~~> receivePublicMessage: %o', publicMessage );

				sendMessageToDevTools( publicMessageData );

			} else if ( publicMessageData.source === 'devtools-meteor' ) {

				console.info( ' <~~ receivePublicMessage: %o', publicMessage );

				if ( publicMessageData.data.action === 'reconnect' ) connect();

			}
		}
	};

( function () {
	/*
	 | Set up DevTools panel
	 | This code gets executed every time inspectedWindow reloads
	 */

	/*
	 | Set up listeners
	 */
	chrome.runtime.onConnect.addListener( connect );

	connect();

	window.addEventListener( 'message', receivePublicMessage, false );

	/*
	 | Query Meteor App Status
	 */
	sendMessageToMeteor({
		action: 'get',
		target: [
			'isReady',
			'release'
		]
	}, function ( response ) {
		console.info( '√|<- receivedByMeteor: %o', response.sentToMeteor );
	});
})();
