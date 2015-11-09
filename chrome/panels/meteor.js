// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

var rendered = false,
	updateNotifications = function ( packageName, active ) {
		var notifications = DevTools.inspectedApp.notifications.get() || [];

		if ( packageName ) {
			if ( notifications.indexOf( packageName ) < 0 && active ) {
				notifications.push( packageName );
			} else if ( notifications.indexOf( packageName ) > -1 && !active ) {
				_.pull( notifications, packageName );
			}

			DevTools.inspectedApp.notifications.set( notifications );
		}
	},

	initGUI = function () {
		AdminLTE.run();
	};

Template.body.onCreated( function () {});

Template.body.onRendered( function () {
	if ( !rendered ) {
		initGUI();

		// Initialize Controller
		DevTools.backgroundPageConnection.onMessage.addListener( function ( message ) {

			DevTools.console.success( '[DT]   ->|√ Received: ', message );

			// Handle responses from the background page
			switch ( message.action ) {
				case 'update':
					if ( message.data.status == 'complete' && !DevTools.isReady.get() ) DevTools.init();

					break;

				case 'reload':
					DevTools.reload();

					break;

				default:
					var data = message.data;

					if ( data ) {
						for ( var attribute in data ) {
							// We want 'null' values as well!
							switch ( attribute ) {
								case 'isReady':
									DevTools.isReady.set( data[ attribute ] );

									break;

								case 'absoluteUrl':
									DevTools.inspectedApp.absoluteUrl.set( data[ attribute ] );

									break;

								case 'release':
									DevTools.inspectedApp.release.set( data[ attribute ] );

									break;

								case 'status':
									DevTools.inspectedApp.status.set( data[ attribute ] );

									break;

								case 'meteorSettings':
									DevTools.inspectedApp.settings.set( data[ attribute ] );

									break;

								case 'packages':
									DevTools.inspectedApp.packages.set( data[ attribute ] );

									break;

								case 'collections':
									DevTools.inspectedApp.collections.set( data[ attribute ] );

									break;

								case 'templates':
									DevTools.inspectedApp.templates.set( data[ attribute ] );

									break;

								case 'insecure':
									updateNotifications( attribute, data[ attribute ] );

									break;

								case 'autopublish':
									updateNotifications( attribute, data[ attribute ] );

									break;

								case 'loggingIn':
									DevTools.inspectedApp.loggingIn.set( data[ attribute ] );

									break;

								case 'currentUser':
									DevTools.inspectedApp.currentUser.set( data[ attribute ] );

									break;

								case 'users':
									DevTools.inspectedApp.users.set( ( data[ attribute ] ) ? data[ attribute ] : {} );

									break;

								case 'session':
									DevTools.inspectedApp.session.set( data[ attribute ] ) ? data[ attribute ] : {};

									break;

								default:
								// ..
							}
						}
					}
			}
		});

		// Initialize communication
		DevTools.init();

		rendered = true;
	}
});
