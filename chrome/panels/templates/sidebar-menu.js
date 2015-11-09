Template.sidebarMenu.events({
	'click [data-view]': function ( event /*, ractiveEvent */ ) {
		DevTools.changeView( $( this ).data( 'view' ) );
	}
});

Template.sidebarMenu.helpers({
	isDashboardViewActive: function () {
		return ( DevTools.activeView.get() == 'dashboard' );
	},

	isSessionViewActive: function () {
		return ( DevTools.activeView.get() == 'session' );
	},

	isUsersViewActive: function () {
		return ( DevTools.activeView.get() == 'users' );
	},

	isMPackagesViewActive: function () {
		return ( DevTools.activeView.get() == 'packages' );
	},

	isMeteorSettingsViewActive: function () {
		return ( DevTools.activeView.get() == 'meteorSettings' );
	}
});

Template.sidebarMenu.onCreated( function () {});
Template.sidebarMenu.onRendered( function () {});
Template.sidebarMenu.onDestroyed( function () {});
