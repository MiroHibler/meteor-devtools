var meteorSettingsEditor;

Template.meteorSettings.events({});
Template.meteorSettings.helpers({});

Template.meteorSettings.onCreated( function () {});

Template.meteorSettings.onRendered( function () {
	meteorSettingsEditor = new Editor( $( '#meteorSettingsEditor' )[ 0 ], {
		modes : [],
		search: false
	});

	meteorSettingsEditor.init( 'Meteor Settings', {}, function ( newData ) {
		DevTools.sendMessage({
			action: 'set',
			target: 'meteorSettings',
			data  : newData
		});

		DevTools.inspectedApp.settings.set( meteorSettingsEditor._editor.get() );
	});

	Tracker.autorun( function () {
		meteorSettingsEditor.set( DevTools.inspectedApp.settings.get() );
	});
});

Template.meteorSettings.onDestroyed( function () {});
