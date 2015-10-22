if ( typeof DevTools === 'undefined' ) DevTools = {};

if ( typeof DevTools.storage === 'undefined' ) DevTools.storage = {
	/**
	* Store a new settings in the browser
	*
	* @param String name Name of the setting
	* @param String val Value of the setting
	* @returns void
	*/
	store: function ( name, setting ) {
		if ( typeof ( Storage ) !== 'undefined' ) {
			var object = JSON.stringify( setting );

			localStorage.setItem( 'DevTools.' + name, object );

			if ( DevTools.sendMessage ) {
				DevTools.sendMessage({
					action: 'settings',
					data  : setting
				});
			}
		}
	},

	/**
	* Get a prestored setting
	*
	* @param String name Name of of the setting
	* @returns String The value of the setting | null
	*/
	get: function ( name ) {
		if ( typeof ( Storage ) !== 'undefined' ) return JSON.parse( localStorage.getItem( 'DevTools.' + name ) );
	}
};
