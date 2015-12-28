var Editor = function ( container, options, json ) {
		var self = this,
			DEFAULTS = {
				// modes: ['tree', 'view', 'form',/* 'code', */'text'],
				mode    : 'tree',

				editable: function ( node ) {
					return ( node.field !== '_id' );
				},

				change  : function () {
					// TODO: Find a more efficient way to check for modifications
					modification = self.modificationType();

					// DevTools.console.warn( '[DT] >>>>>> Modification: %s', modification );

					if ( !self._isEditing || (
						( modification !== 'added' ) &&
						( modification !== 'modified' ) )
					) {
						if ( self.deltaEdit() ) {

							// self.handleChange();

							// self.activateFields();
						}
					}
				},

				error   : function ( error ) {
					DevTools.console.error( '[JS] !!!!!! ' + error );
				},

				history : false,
				search  : true
			};

		self._isEditing = false;
		self._oldJSON = json || {};

		self._editor = new JSONEditor( container, _.extend( {}, DEFAULTS, options ), json );
	};

Editor.prototype.init = function ( name, data, changeHandler ) {
	var self = this;

	if ( name ) self._editor.setName( name );
	if ( data ) self.set( data );
	if ( changeHandler ) self._onChange = changeHandler;
};

Editor.prototype.set = function ( data ) {
	var self = this;

	self.deactivateFields();

	// self._oldJSON = data || {};
	self._editor.set( data || {} );

	self.setEditingFlag( data && !_.isEmpty( data ) );
};

Editor.prototype.deltaEdit = function () {
	var self = this;

	return jsondiffpatch.diff( self._oldJSON, self._editor.get() );
};

Editor.prototype.modificationType = function () {
	var self = this,
		delta = self.deltaEdit();

	if ( delta ) {
		var flatten = JSON.flatten( delta ),
			params = Object.keys( flatten );

		// DevTools.console.warn( '\n[JS] >>>>>> Delta JSON:\n', flatten );

		switch ( params.length ) {
			case 1:
				return 'added';

			case 3:		// Deleted or Inserted
				if (
					!flatten[ params[ 0 ] ].length &&
					flatten[ params[ 1 ] ] === 0 &&
					flatten[ params[ 2 ] ] === 0
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
};

Editor.prototype.setEditingFlag = function ( flag ) {
	var self = this;

	self._isEditing = flag;

	if ( self._isEditing ) {
		self.activateFields();
	} else {
		self.deactivateFields();
	}
};

Editor.prototype.activateFields = function () {
	var self = this,
		$fieldInputs,
		$valueInputs;

	self.deactivateFields();

	$fieldInputs = $( '#' + $( self._editor.container ).attr( 'id' ) + ' div[contenteditable="true"].field' ),
	$valueInputs = $( '#' + $( self._editor.container ).attr( 'id' ) + ' div[contenteditable="true"].value' );

	if ( $fieldInputs.length ) {
		$fieldInputs.focusin( function ( eventObject ) {
			self._oldJSON = self._editor.get();
		}).focusout( self.handleChange.bind( self ) );
	}

	if ( $valueInputs.length ) {
		$valueInputs.focusin( function ( eventObject ) {
			self._oldJSON = self._editor.get();
		}).keypress( function ( eventObject ) {
			if ( eventObject.which == 13 ) {
				eventObject.preventDefault();

				self.handleChange( eventObject );

				return false;
			}
		}).focusout( self.handleChange.bind( self ) );
	}
};

Editor.prototype.deactivateFields = function () {
	var self = this;

	self._editor.expandAll();

	$( '#' + $( self._editor.container ).attr( 'id' ) + ' div[contenteditable="true"].field' ).off();
	$( '#' + $( self._editor.container ).attr( 'id' ) + ' div[contenteditable="true"].value' ).off();
};

Editor.prototype.handleChange = function () {
	// TODO: Find a better way to handle deleting nodes
	var self = this,
		delta = jsondiffpatch.diff( self._oldJSON, self._editor.get() ),
		newData,

		recurse = function ( delta ) {
			var data = {},
				root;

			if ( delta ) {
				// There should only be a single key/value pair
				var newData = {},
					flatten, newKey;

				root = Object.keys( delta )[ 0 ];

				if ( _.isArray( delta[ root ] ) ) {

					switch ( delta[ root ].length ) {

						case 1:
							// Added
							// =====
							// delta[root] = [ newValue ]
							if ( delta[ root ][ 0 ].length ) {
								data[ root ] = delta[ root ][ 0 ];
							}

							break;

						case 2:
							// Modified
							// ========
							// delta[root] = [ oldValue, newValue ]
							flatten = JSON.flatten( delta[ root ] );

							for ( var key in flatten ) {
								if ( key.indexOf( '[1]' ) > -1 ) {
									newKey = key.replace( '[1]', '' );

									if ( newKey === '' ) {
										data[ root ] = JSON.unflatten( flatten[ key ] );
									} else {
										data[ root ] = {};
										data[ root ][ newKey ] = JSON.unflatten( flatten[ key ] );
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
								delta[ root ][ 0 ] !== '' /* && // Ignore the rest for now
								delta[root][1] === 0 &&
								delta[root][2] === 0 */
							) {
								// Deleted
								// =======
								// Process the inserted field/value pair
								// as modification of existing data
								root = Object.keys( delta )[ 0 ];
								newData[ root ] = [
									delta[ root ][ 0 ],
									null
								];
							} else {
								// Inserted
								// ========
								// Process the inserted field/value pair
								// as modification of existing data
								root = Object.keys( delta )[ 1 ];
								newData[ root ] = [
									null,
									delta[ root ][ 0 ]
								];
								// Continue to treat it as modification
							}

							data = recurse( newData );

							break;

						default:
						// Do nothing... (duh! ;)
					}
				} else if ( _.isObject( delta[ root ] ) ) {
					// Object with inner changes
					// TODO: Iterate on each property...
					data[ root ] = recurse( delta[ root ] );
				}
			}

			return data;
		};

	if ( delta ) {
		newData = recurse( delta );

		if ( !_.isEmpty( newData ) && self._onChange ) self._onChange( newData );
	}

	self._oldJSON = self._editor.get();
};
