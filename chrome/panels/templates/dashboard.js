Template.dashboard.events({
	'click [data-view]': function ( event /*, ractiveEvent */ ) {
		DevTools.changeView( $( this ).data( 'view' ) );
	}
});

Template.dashboard.helpers({
	packagesCount: function () {
		return DevTools.inspectedApp.packages.get().length || 0;
	},

	collectionsCount: function () {
		return DevTools.inspectedApp.collections.get().length || 0;
	},

	templatesCount: function () {
		return DevTools.inspectedApp.templates.get().length || 0;
	},

	usersCount: function () {
		return DevTools.inspectedApp.users.get().length || 0;
	},

	sessionVariablesCount: function () {
		var session = DevTools.inspectedApp.session.get();

		return ( session ) ? Object.keys( session ).length : 0;
	},

	meteorSettingsCount: function () {
		var meteorSettings = DevTools.inspectedApp.settings.get();

		return ( meteorSettings ) ? Object.keys( meteorSettings ).length : 0;
	}
});

Template.dashboard.onCreated( function () {});

Template.dashboard.onRendered( function () {});

Template.dashboard.onDestroyed( function () {});
