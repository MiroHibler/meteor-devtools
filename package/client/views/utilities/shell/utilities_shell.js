var $content;

Template.DevToolsShell.helpers({
	isReady: function () {
		return DevTools.ready.get();
	}
});

Template.DevToolsShell.onRendered( function () {
	$content = $( '.content' );

	DevTools.gui.initResize( $content );
});

Template.DevToolsShell.onDestroyed( function () {
	DevTools.gui.stopResize( $content );
});
