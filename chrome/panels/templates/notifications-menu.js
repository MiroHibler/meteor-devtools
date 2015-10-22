Template.notificationsMenu.events({});

Template.notificationsMenu.helpers({
	notificationsCount: function () {
		return DevTools.inspectedApp.notifications.get().length;
	},

	notifications: function () {
		return DevTools.inspectedApp.notifications.get();
	},

	showNotifications: function () {
		return ( DevTools.inspectedApp.notifications.get().length > 0 );
	}
});

Template.notificationsMenu.onCreated( function () {});
Template.notificationsMenu.onRendered( function () {});
Template.notificationsMenu.onDestroyed( function () {});
