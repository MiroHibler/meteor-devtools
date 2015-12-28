var $content;

Template.DevToolsUsers.helpers({
	isReady: function () {
		return DevTools.ready.get();
	}
});

Template.DevToolsUsers.onRendered( function () {
	$content = $( '.content' );

	DevTools.gui.initResize( $content );
});

Template.DevToolsUsers.onDestroyed( function () {
	DevTools.gui.stopResize( $content );
});
