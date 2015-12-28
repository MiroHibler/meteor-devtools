var $targetFrame,
	iFrameResizer;

Template.meteorDevTools.events({
	'load #meteorDevTools': function () {
		if ( $targetFrame ) DevTools.resizeIFrame( $targetFrame );
	}
});

Template.meteorDevTools.helpers({
	url: function () {
		var absoluteUrl = DevTools.inspectedApp.absoluteUrl.get();

		if ( absoluteUrl && absoluteUrl != '' ) return absoluteUrl + 'devtools' + '/' + DevTools.activeView.get();
	}
});

Template.meteorDevTools.onCreated( function () {});

Template.meteorDevTools.onRendered( function () {
	$targetFrame = $( '#meteorDevTools' );

	DevTools.fixIFrame( $targetFrame );

	iFrameResizer = iFrameResize({
		resizeFrom : 'child',
		log        : false,
		checkOrigin: false
	});
});

Template.meteorDevTools.onDestroyed( function () {
	// iFrameResizer.close();
});
