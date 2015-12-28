var resizeBody = function ( element ) {
		if ( element ) $( 'body' ).css( 'height', element.css( 'height' ) );
	};

DevTools = _.extend( DevTools, {
	gui: {
		isReady: new ReactiveVar( false ),

		initResize: function ( element ) {
			$( document ).ready( function () {
				DevTools.onResize( element[ 0 ], resizeBody );
			});
		},

		stopResize: function ( element ) {
			element.off();
		}
	}
});
