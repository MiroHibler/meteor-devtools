// This can access the inspected page via executeScript
//
// Can use:
// chrome.tabs.*
// chrome.runtime.*
// chrome.extension.*
var isActive = true,
	cspFilter = {
		urls: [
			'*://*/*'
		],
		types: [
			'main_frame',
			'sub_frame'/*,
			'stylesheet',
			'script',
			'image',
			'object',
			'xmlhttprequest',
			'other'*/
		]
	},
	myTabId,
	isReloading = false,
	connections = {},
	openCount = 0,

	cspCallback = function ( details ) {
		if ( !isActive ) return;

		for ( var i = 0; i < details.responseHeaders.length; i++ ) {
			if ( 'content-security-policy' === details.responseHeaders[ i ].name.toLowerCase() ) {
				// console.info( 'Clearing response header [%s]', details.responseHeaders[ i ].value );
				details.responseHeaders[ i ].value = '';
			}
		}

		return {
			responseHeaders: details.responseHeaders
		};
	},

	sendToDevTools = function ( message, sendResponse ) {

		DevTools.console.log( '[BG]  >-->  sendToDevTools: ', message.data );

		connections[ message.tabId ].postMessage( message.data );
	},

	sendToMeteor = function ( message, sendResponse ) {

		DevTools.console.log( '[BG]  <--<  sendToMeteor: ', message.data );

		if ( message.tabId ) {
			chrome.tabs.sendMessage( message.tabId, message.data, function ( response ) {
				if ( response ) {

					DevTools.console.success( '[BG] √<--<  receivedByMeteor: ', response.sentToMeteor );

				} else {
					// We lost connection with content script,
					// so we'll try other ways
					DevTools.console.error( '[BG] X<--<  sendToMeteor ERROR: ', chrome.runtime.lastError );

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

							DevTools.console.info( '[BG] @@@@@@ Meteor App reloaded.' );

							isReloading = false;
						});
					}
				}
			});
		}
	};

// https://github.com/PhilGrayson/chrome-csp-disable
chrome.webRequest.onHeadersReceived.addListener( cspCallback, cspFilter, [ 'blocking', 'responseHeaders' ] );

chrome.runtime.onConnect.addListener( function ( port ) {
	var devToolsListener = function ( message, sender, sendResponse ) {
			switch ( message.action ) {
				case 'init':
					// Initialize communication
					myTabId = message.tabId;
					connections[ myTabId ] = port;

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
								// 'absoluteUrl',
								// 'debuggerUrl',
								// 'release',
								// 'meteorSettings',
								// 'meteorEnvironment',
								// 'collections',
								// 'templates',
								// 'insecure',
								// 'autopublish',
								// 'packages',
								'isReady'
							]
						},
						tabId : myTabId
					}, sendResponse );

					return;

				case 'send':
					// Check if there are local actions
					switch ( message.data.action ) {
						case 'settings':
							DevTools.settings.set( message.data.data );

							break;

						case 'console.clear':
							console.clear();

							break;

						default:
							// Nothing yet...
					}

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
			DevTools.console.info( '[BG] >>>>>> Signed in. Hello!' );
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

				DevTools.console.info( '[BG] <<<<<< Signed off. Bye!' );
			}

			port.onMessage.removeListener( devToolsListener );

			tabs = Object.keys( connections );

			for ( var i = 0, len = tabs.length; i < len; i++ ) {
				if ( connections[ tabs[ i ] ] == port ) {
					delete connections[ tabs[ i ] ];

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
			connections[ tabId ].postMessage( request );
		// } else {
		// 	DevTools.console.error( '[BG] !!!!! Error: Tab not found in connection list.' );
		}
	// } else {
	// 	DevTools.console.error( '[BG] !!!!! Error: "sender.tab" not defined.' );
	}

	return true;
});

chrome.tabs.onUpdated.addListener( function ( tabId, changeInfo, tab ) {
	DevTools.console.info( '[BG] ====== Tab "%s" updated: %o, %o', tabId, changeInfo, tab );

	if ( tabId in connections ) {
		sendToDevTools({
			data  : {
				action: 'update',
				data  : tab
			},
			tabId : tabId
		}, function () {
			DevTools.console.info( '[BG] ------ Meteor App status: %s', changeInfo.status );
		});
	}
});
