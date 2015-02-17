// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

var activeEditor,
	isEditing = false,
	deltaEdit = function () {
		if ( activeEditor ) {
			return jsondiffpatch.diff(
				editors[activeEditor].oldJSON,
				editors[activeEditor].editor.get()
			);
		}
	},

	modificationType = function () {
		var delta = deltaEdit();

		if ( delta ) {
			var flatten = JSON.flatten( delta ),
				params = Object.keys( flatten );

			// console.warn( '\nDelta JSON:\n', flatten );

			switch ( params.length ) {
				case 1:
					return 'added';
				case 3:		// Deleted or Inserted
					if (
						!flatten[params[0]].length &&
						flatten[params[1]] === 0 &&
						flatten[params[2]] === 0
					) {
						return 'inserted';
					} else {
						return 'deleted';
					}
					break;
				case 2:
					// Falling thru... yeah, Douglas, bite me :P
				default:
					return 'modified';
			}
		}
	},

	setEditingFlag = function ( flag, editorName ) {
		isEditing = flag;

		if ( isEditing ) {
			activateEditor( editorName );
		}
	},

	setupEditor = function ( name, data ) {
		var editorName = name + 'Editor';

		editors[editorName].editor.set( data );

		if ( !_.isEmpty( data ) ) {
			activateEditorFields( editorName );
		}
	},

	activateEditor = function ( editorName ) {
		if ( activeEditor && activeEditor !== editorName ) {
			deactivateEditor( activeEditor );
		}

		activeEditor = editorName;

		editors[activeEditor].oldJSON = editors[activeEditor].editor.get();
	},

	deactivateEditor = function ( editorName ) {
		deactivateEditorFields( editorName );
	},

	activateEditorFields = function ( editorName ) {
		editors[editorName].editor.expandAll();

		var fieldInputs = $( '#' + editorName + ' div[contenteditable="true"].field' ),
			valueInputs = $( '#' + editorName + ' div[contenteditable="true"].value' );

		deactivateEditorFields( editorName );

		if ( fieldInputs.length ) {
			fieldInputs.focusin( function ( eventObject ) {
				setEditingFlag( true, editorName );

				$( eventObject.currentTarget ).focusout( function ( eventObject ) {
					setEditingFlag( false );
				});
			});
		}

		if ( valueInputs.length ) {
			valueInputs.focusin( function ( eventObject ) {
				setEditingFlag( true, editorName );

				$( eventObject.currentTarget ).focusout( handleChange );
				$( eventObject.currentTarget ).keypress( function ( eventObject ) {
					if ( eventObject.which == 13 ) {
						eventObject.preventDefault();

						handleChange( eventObject );
					}
				});
			});
		}

		editors[editorName].editor.colapseAll();
	},

	deactivateEditorFields = function ( editorName ) {
		$( '#' + editorName + ' div[contenteditable="true"].field' ).off();
		$( '#' + editorName + ' div[contenteditable="true"].value' ).off();

		setEditingFlag( false );
	},

	onChange = function () {
		// TODO: Find a more efficient way to check for modifications
		var modification = modificationType();

		// console.warn( 'Modification: %s', modification );

		if ( !isEditing || (
			( modification !== 'added' ) &&
			( modification !== 'modified' )
		)) {
			if ( deltaEdit() ) {

				handleChange();

				activateEditorFields( activeEditor );
			}
		}
	},

	handleChange = function () {
		// TODO: Find a better way to handle deleting nodes
		var newJSON = editors[activeEditor].editor.get(),
			delta = jsondiffpatch.diff( editors[activeEditor].oldJSON, newJSON ),
			newData,

			recurse = function ( delta ) {
				var data = {},
					root;

				if ( delta ) {
					// There should only be a single key/value pair
					var newData = {},
						flatten, newKey;

					root = Object.keys( delta )[0];

					if ( _.isArray( delta[root] ) ) {

						switch ( delta[root].length ) {

							case 1:
								// Added
								// =====
								// delta[root] = [ newValue ]
								if ( delta[root][0].length ) {
									data[root] = delta[root][0];
								}
								break;

							case 2:
								// Modified
								// ========
								// delta[root] = [ oldValue, newValue ]
								flatten = JSON.flatten( delta[root] );

								for ( var key in flatten ) {
									if ( key.indexOf( '[1]' ) > -1 ) {
										newKey = key.replace( '[1]', '' );
										if ( newKey === '' ) {
											data[root] = JSON.unflatten( flatten[key] );
										} else {
											data[root] = {};
											data[root][newKey] = JSON.unflatten( flatten[key] );
										}
										break;
									}
								}
								break;

							case 3:
								// Deleted or Inserted?
								// ====================
								// delta[root] = [ oldValue, 0, 0 ] -> Deleted,
								// if oldValue === '' then it's Inserted

								if (
									delta[root][0] !== '' /* && // Ignore the rest for now
									delta[root][1] === 0 &&
									delta[root][2] === 0 */
								) {
									// Deleted
									// =======
									// Process the inserted field/value pair
									// as modification of existing data
									root = Object.keys( delta )[0];
									newData[root] = [
										delta[root][0],
										null
									];
								} else {
									// Inserted
									// ========
									// Process the inserted field/value pair
									// as modification of existing data
									root = Object.keys( delta )[1];
									newData[root] = [
										null,
										delta[root][0]
									];
									// Continue to treat it as modification
								}

								data = recurse( newData );
								break;

							default:
								// Do nothing... (duh! ;)
						}
					} else if ( _.isObject( delta[root] ) ) {
						// Object with inner changes
						// TODO: Iterate on each property...
						data[root] = recurse( delta[root] );
					}
				}

				return data;
			};

		if ( delta ) {
			newData = recurse( delta );

			if ( newData ) {
				MeteorDevTools.sendMessage({
					action: 'set',
					target: activeEditor.replace( 'Editor', '' ),
					data  : newData
				});

			}
		}
	},

	editorOptions = {
		mode: 'tree',
		// modes: ['tree', 'view', 'form',/* 'code', */'text'],
		editable: function ( node ) {
			return ( node.field !== '_id' );
		},
		change: onChange,
		error: function ( error ) {
			console.error( error );
		},
		history: false,
		search: true
	},

	editors = {
		currentUserEditor: {
			editor: new JSONEditor( $( '#currentUserEditor' )[0],
				_.extend( editorOptions, { name: 'Current user data' } )
			),
			oldJSON: {}
		},
		usersEditor: {
			editor: new JSONEditor( $( '#usersEditor' )[0],
				_.extend( editorOptions, { name: 'Users available on the client' } )
			),
			oldJSON: {}
		},
		sessionEditor: {
			editor: new JSONEditor( $( '#sessionEditor' )[0],
				_.extend( editorOptions, { name: 'Session variables' } )
			),
			oldJSON: {}
		}
	},

	toggleView = function ( shown ) {
		if ( !shown ) {
			$( '#notice' ).hide();
			$( '#panel' ).show();
		} else {
			$( '#notice' ).show();
			$( '#panel' ).hide();
		}
	},

	logout = function ( event ) {
		event.preventDefault();

		MeteorDevTools.sendMessage({
			action: 'logout'
		});
	};

// Initialize View
$( '#meteorDevToolsVersion' ).html( MeteorDevTools.version );

// Initialize Controller
MeteorDevTools.backgroundPageConnection.onMessage.addListener( function ( message ) {

	// console.info( '√-->| DevTools received: %o', message );

	// Handle responses from the background page
	switch ( message.action ) {
		case 'start':
			$( 'a.navbar-brand' ).html( 'Connecting...' );
			MeteorDevTools.startTracking();
			break;

		case 'stop':
			MeteorDevTools.stopTracking();
			break;

		case 'reload':
			$( '.no-app' ).toggle();
			MeteorDevTools.reload();
			break;

		default:
			var data = message.data;

			if ( data ) {
				toggleView( false );
				MeteorDevTools.show();

				for ( var attribute in data ) {
					// We want 'null' values as well!
					switch ( attribute ) {
						case 'isReady':
							MeteorDevTools.ready = data[attribute];
							toggleView( data[attribute] );
							break;

						case 'release':
							$( '#release' ).html( data[attribute] );
							break;

						case 'status':
							if ( data[attribute] ) {
								$( 'a.navbar-brand' ).html(
									data[attribute].status + ( data[attribute].connected ? '' : '...' )
								);
							}
							toggleView( data[attribute].connected );
							break;

						case 'loggingIn':
							if ( data[attribute] ) $( '#userName' ).html( 'Logging in...' );
							break;

						case 'currentUser':
							if ( data[attribute] ) {
								$( '#userName' ).html( data[attribute].username );
								$( '.current-user' ).show();
								setupEditor( attribute, data[attribute] );
								$( 'ul.current-user > li > a' ).on( 'click', logout );
							} else {
								$( '#userName' ).html( 'No user' );
								$( '.current-user' ).hide();
								setupEditor( attribute, {} )
								$( 'ul.current-user > li > a' ).off();
							}
							break;

						case 'users':
							setupEditor( attribute, ( data[attribute] ) ? data[attribute] : {} );
							break;

						case 'session':
							setupEditor( attribute, ( data[attribute] ) ? data[attribute] : {} );
							break;

						default:
							// ..
					}
				}
			}
	}
});

// Initialize communication
MeteorDevTools.init();

// Some UI helpers
jQuery( function ( $ ) {
	$( '.panel-heading span.clickable' ).on( 'click', function ( e ) {
		if ( $( this ).hasClass( 'panel-collapsed' ) ) {
			// expand the panel
			$( this ).parents( '.panel' ).find( '.panel-body' ).slideDown();
			$( this ).removeClass( 'panel-collapsed' );
			$( this ).find( 'i' ).removeClass( 'glyphicon-chevron-down' ).addClass( 'glyphicon-chevron-up' );
		} else {
			// collapse the panel
			$( this ).parents( '.panel' ).find( '.panel-body' ).slideUp();
			$( this ).addClass( 'panel-collapsed' );
			$( this ).find( 'i' ).removeClass( 'glyphicon-chevron-up' ).addClass( 'glyphicon-chevron-down' );
		}
	});
});
