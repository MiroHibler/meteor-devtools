Template.content.events({});

Template.content.helpers({
	isReady: function () {
		return DevTools.isReady.get();
	},

	showDashboard: function () {
		return ( DevTools.activeView.get() == 'dashboard' );
	},

	showSession: function () {
		return ( DevTools.activeView.get() == 'session' );
	},

	showUsers: function () {
		return ( DevTools.activeView.get() == 'users' );
	}
});

Template.content.onCreated( function () {});

Template.content.onRendered( function () {});

Template.content.onDestroyed( function () {});
