var resizeIFrame = function () {
		var minHeight = $( '.content-wrapper' ).css( 'height' ).replace( 'px', '' ) -
						$( '.content-header' ).css( 'height' ).replace( 'px', '' ) -
						$( '.content' ).css( 'padding-top' ).replace( 'px', '' ) -
						$( '.content' ).css( 'padding-bottom' ).replace( 'px', '' );

		// NOTE: Not sure why it requires 5 pixels less
		// but it removes unnecessary vertical scroll bar
		$( '#meteorDevTools' ).css( 'min-height', minHeight - 5 );
	};

Template.meteorDevTools.events({
	'load #meteorDevTools': function () {
		resizeIFrame();
	}
});

Template.meteorDevTools.helpers({
	url: function () {
		var absoluteUrl = DevTools.inspectedApp.absoluteUrl.get();

		if ( absoluteUrl && absoluteUrl != '' ) return absoluteUrl + 'devtools';
	}
});

Template.meteorDevTools.onCreated( function () {});

Template.meteorDevTools.onRendered( function () {
	$( window ).resize( function () {
		resizeIFrame();
	});
});

Template.meteorDevTools.onDestroyed( function () {});
