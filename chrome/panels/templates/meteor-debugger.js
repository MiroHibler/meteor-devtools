var $targetFrame,
	iFrameResizer;

Template.meteorDebugger.events({
	'load #meteorDebugger': function () {
		if ( $targetFrame ) DevTools.resizeIFrame( $targetFrame );
	}
});

Template.meteorDebugger.helpers({
	debuggerUrl: function () {
		return DevTools.inspectedApp.debuggerUrl.get() || 'http://localhost:8080/debug?port=5858';
	}
});

Template.meteorDebugger.onCreated( function () {});

Template.meteorDebugger.onRendered( function () {
	$targetFrame = $( '#meteorDebugger' );

	DevTools.fixIFrame( $targetFrame );

	iFrameResizer = iFrameResize({
		log        : false,
		checkOrigin: false
	});
});

Template.meteorDebugger.onDestroyed( function () {
	// iFrameResizer.close();
});
