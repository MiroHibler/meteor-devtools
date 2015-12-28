var meteorEnvironmentEditor;

Template.meteorEnvironment.events({});
Template.meteorEnvironment.helpers({});

Template.meteorEnvironment.onCreated( function () {});

Template.meteorEnvironment.onRendered( function () {
	meteorEnvironmentEditor = new Editor( $( '#meteorEnvironmentEditor' )[ 0 ], {
		mode: 'view',
		modes : [],
		search: false
	});

	meteorEnvironmentEditor.init( 'Meteor Environment', {} );

	Tracker.autorun( function () {
		meteorEnvironmentEditor.set( DevTools.inspectedApp.environment.get() );
	});
});

Template.meteorEnvironment.onDestroyed( function () {});
