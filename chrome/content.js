// This is included and executed in the inspected page

var myTabId,
	sendMessageToDevTools = function ( messageForDevTools ) {

		DevTools.console.log( '[IS]   ->|  sendMessageToDevTools: ', messageForDevTools );

		chrome.runtime.sendMessage({
			data : messageForDevTools.data,
			tabId: myTabId
		}, function ( response ) {
			// The callback here can be used to execute something on receipt
			// DevTools.console.log( '[IS]  <-|  Response: ' + response );
		});
	},

	receiveMessageFromDevTools = function ( messageForMeteor, sender, sendResponse ) {

		DevTools.console.log( '[IS]   <-|  receiveMessageFromDevTools: ', messageForMeteor );

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

		DevTools.console.log( '[IS]  |<-   sendMessageToMeteor: ', message );

		window.postMessage({
			source: 'devtools-meteor' + DevTools.iFramed(),
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

			if ( publicMessageData.source === ( 'meteor' + DevTools.iFramed() + '-devtools' ) ) {

				DevTools.console.log( '[IS]   ~>   receivePublicMessage: ', publicMessage );

				sendMessageToDevTools( publicMessageData );

			} else if ( publicMessageData.source === ( 'devtools-meteor' + DevTools.iFramed() ) ) {

				DevTools.console.log( '[IS]   <~   receivePublicMessage: ', publicMessage );

				if ( publicMessageData.data.action === 'reconnect' ) connect();

			}
		}
	},

	connect = function () {
		chrome.runtime.onMessage.addListener( receiveMessageFromDevTools );
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
	// sendMessageToMeteor({
	// 	action: 'get',
	// 	target: [
	// 		'absoluteUrl',
	// 		'release',
	// 		'insecure',
	// 		'autopublish',
	// 		'isReady'
	// 	]
	// }, function ( response ) {
	// 	DevTools.console.success( '[IS] √|<-  receivedByMeteor: ', response.sentToMeteor );
	// });
})();
