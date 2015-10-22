var sessionEditor;

Template.sessionVariables.events({});
Template.sessionVariables.helpers({});

Template.sessionVariables.onCreated( function () {});

Template.sessionVariables.onRendered( function () {
	sessionEditor = new Editor( $( '#sessionEditor' )[ 0 ], {
		modes : [],
		search: false
	});

	sessionEditor.init( 'Session Variables', {}, function ( newData ) {
		DevTools.sendMessage({
			action: 'set',
			target: 'session',
			data  : newData
		});
	});

	Tracker.autorun( function () {
		sessionEditor.set( DevTools.inspectedApp.session.get() );
	});
});

Template.sessionVariables.onDestroyed( function () {});
