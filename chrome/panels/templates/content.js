Template.content.events({});

Template.content.helpers({
	isReady: function () {
		return ( DevTools.activeView.get() == 'debugger' ) ? true : DevTools.isReady.get();
	},

	showDashboard: function () {
		return ( DevTools.activeView.get() == 'dashboard' );
	},

	showCollections: function () {
		return ( DevTools.activeView.get() == 'collections' );
	},

	showSession: function () {
		return ( DevTools.activeView.get() == 'session' );
	},

	showUsers: function () {
		return ( DevTools.activeView.get() == 'users' );
	},

	showPackages: function () {
		return ( DevTools.activeView.get() == 'packages' );
	},

	showMeteorSettings: function () {
		return ( DevTools.activeView.get() == 'meteorSettings' );
	},

	showMeteorEnvironment: function () {
		return ( DevTools.activeView.get() == 'meteorEnvironment' );
	},

	showShell: function () {
		return ( DevTools.activeView.get() == 'shell' );
	},

	showDebugger: function () {
		return ( DevTools.activeView.get() == 'debugger' );
	}
});

Template.content.onCreated( function () {});
Template.content.onRendered( function () {});
Template.content.onDestroyed( function () {});
