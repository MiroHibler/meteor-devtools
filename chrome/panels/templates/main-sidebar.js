Template.mainSidebar.events({});

Template.mainSidebar.helpers({
	statusLight: function () {
		var status = DevTools.inspectedApp.status.get();

		return ( status ) ? ( status.connected ? 'success' : 'warning' ) : 'danger';
	},

	status: function () {
		var status = DevTools.inspectedApp.status.get();

		return ( status ) ? status.status + ( status.connected ? '' : '...' ) : 'disconnected';
	},

	release: function () {
		return DevTools.inspectedApp.release.get();
	}
});

Template.mainSidebar.onCreated( function () {
});
Template.mainSidebar.onRendered( function () {});
Template.mainSidebar.onDestroyed( function () {});
