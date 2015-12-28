var $content;

Template.DevToolsCollections.helpers({
	isReady: function () {
		return DevTools.ready.get();
	}
});

Template.DevToolsCollections.onRendered( function () {
	$content = $( '.content' );

	DevTools.gui.initResize( $content );
});

Template.DevToolsCollections.onDestroyed( function () {
	DevTools.gui.stopResize( $content );
});
