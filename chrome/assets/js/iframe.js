if ( typeof DevTools === 'undefined' ) DevTools = {};

if ( typeof DevTools.resizeIFrame === 'undefined' ) DevTools.resizeIFrame = function ( target ) {
	var minHeight = $( '.content-wrapper' ).css( 'height' ).replace( 'px', '' ) -
					$( '.content' ).css( 'padding-top' ).replace( 'px', '' ) -
					$( '.content' ).css( 'padding-bottom' ).replace( 'px', '' );

	if ( $( '.content-header' ).css( 'height' ) ) minHeight -= $( '.content-header' ).css( 'height' ).replace( 'px', '' );

	// NOTE: Not sure why it requires 5 pixels less
	// but it removes unnecessary vertical scroll bar
	target
		.css( 'min-height', minHeight - 5 )
		.css( 'min-width', '100%' );
};

if ( typeof DevTools.fixIFrame === 'undefined' ) DevTools.fixIFrame = function ( target ) {
	$( window ).resize( function () {
		if ( target ) DevTools.resizeIFrame( target );
	});
};
