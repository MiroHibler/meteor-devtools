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

	isCollectionsViewActive: function () {
		return ( DevTools.activeView.get() == 'collections' );
	},

	isUsersViewActive: function () {
		return ( DevTools.activeView.get() == 'users' );
	},

	isPackagesViewActive: function () {
		return ( DevTools.activeView.get() == 'packages' );
	},

	isMeteorSettingsViewActive: function () {
		return ( DevTools.activeView.get() == 'meteorSettings' );
	},

	isMeteorEnvironmentViewActive: function () {
		return ( DevTools.activeView.get() == 'meteorEnvironment' );
	},

	isShellViewActive: function () {
		return ( DevTools.activeView.get() == 'shell' );
	},

	isDebuggerViewActive: function () {
		return ( DevTools.activeView.get() == 'debugger' );
	}
});

Template.sidebarMenu.onCreated( function () {});
Template.sidebarMenu.onRendered( function () {});
Template.sidebarMenu.onDestroyed( function () {});
