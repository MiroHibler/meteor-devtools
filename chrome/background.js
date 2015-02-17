// This can access the inspected page via executeScript
//
// Can use:
// chrome.tabs.*
// chrome.runtime.*
// chrome.extension.*

var myTabId,
	isReloading = false,
	connections = {},
	openCount = 0,
	sendToDevTools = function ( message, sendResponse ) {

		console.info( ' >-> sendToDevTools: %o', message.data );

		connections[message.tabId].postMessage( message.data );
	},
	sendToMeteor = function ( message, sendResponse ) {

		console.info( ' <-< sendToMeteor: %o', message.data );

		chrome.tabs.sendMessage( message.tabId, message.data, function ( response ) {
			if ( response ) {

				console.info( '√<-< sentToMeteor: %o', response.sentToMeteor );

			} else {
				// We lost connection with content script,
				// so we'll try other ways
				console.info( 'X<-< sentToMeteor ERROR: %o', chrome.runtime.lastError );

				// For now, just reload the inspectedWindow
				if ( !isReloading ) {
					isReloading = true;

					sendToDevTools({
						// Actually, we're sending this only to content script
						data  : {
							action: 'reload'
						},
						tabId : message.tabId
					}, function () {

						console.info( 'Meteor App reloaded.' );

						isReloading = false;
					});
				}
			}
		});
	};

chrome.runtime.onConnect.addListener( function ( port ) {
	var devToolsListener = function ( message, sender, sendResponse ) {
			switch ( message.action ) {
				case 'init':
					// Initialize communication
					myTabId = message.tabId;
					connections[myTabId] = port;

					// Initialize connection
					window.postMessage({
						source: 'devtools-meteor',
						data  : {
							action: 'reconnect'
						}
					}, '*' );

					sendToMeteor({
						data: {
							action: 'get',
							target: [
								'isReady',
								'release'
							]
						},
						tabId : myTabId
					}, sendResponse );
					return;
				case 'send':
					// Send message to Meteor App
					sendToMeteor({
						data : message.data,
						tabId: myTabId
					}, sendResponse );
					break;
				default:
					// Accepts messages from the inspectedPage
					// and send them to the panel
					sendToDevTools( message, sendResponse );
			}
		};

	if ( port.name === 'meteor-devtools' ) {
		if ( openCount === 0 ) {
			console.info( 'Meteor DevTools started.' );
		}
		openCount++;

		// Listen to messages sent from the panel
		port.onMessage.addListener( devToolsListener );

		// Prepare clean up
		port.onDisconnect.addListener( function ( port ) {
			var tabs;

			openCount--;

			if ( openCount === 0 ) {
				sendToMeteor({
					action: 'send',
					data  : {
						action: 'stopTracking',
						target: '*'	// ANY running trackers!
					},
					tabId : myTabId
				});

				console.info( 'Meteor DevTools signed off. Bye.' );
			}

			port.onMessage.removeListener( devToolsListener );

			tabs = Object.keys( connections );
			for ( var i = 0, len = tabs.length; i < len; i++ ) {
				if ( connections[tabs[i]] == port ) {
					delete connections[tabs[i]];
					break;
				}
			}
		});
	}
});

// Receive message from content script and relay
// to the DevTools page for the current tab
chrome.runtime.onMessage.addListener( function ( request, sender, sendResponse ) {
	// Messages from content scripts should have sender.tab set
	if ( sender.tab ) {
		var tabId = sender.tab.id;

		if ( tabId in connections ) {
			connections[tabId].postMessage( request );
		} else {
			console.log( 'Tab not found in connection list.' );
		}
	} else {
		console.log( 'sender.tab not defined.' );
	}

	return true;
});
