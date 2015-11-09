Template.packagesList.events({});
Template.packagesList.helpers({
	packagesList: function () {
		return DevTools.inspectedApp.packages.get();
	}
});

Template.packagesList.onCreated( function () {});
Template.packagesList.onRendered( function () {});
Template.packagesList.onDestroyed( function () {});
