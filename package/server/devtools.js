BrowserPolicy.framing.allowAll();
BrowserPolicy.content.allowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowInlineScripts();
BrowserPolicy.content.allowDataUrlForAll();
BrowserPolicy.content.allowSameOriginForAll();
BrowserPolicy.content.allowOriginForAll( Meteor.absoluteUrl() );
BrowserPolicy.content.allowOriginForAll( '*.gstatic.com' );
BrowserPolicy.content.allowOriginForAll( '*.googleapis.com' );
BrowserPolicy.content.allowOriginForAll( '*.bootstrapcdn.com' );
BrowserPolicy.content.allowOriginForAll( '*.ionicframework.com' );

DevTools = _.extend( DevTools, {
	send: function () {
		DevTools.console.warn( DevTools.consolePrefix + '[MS] Sorry, server-side DevTools.send() is not yet implemented.' );
	}
});
