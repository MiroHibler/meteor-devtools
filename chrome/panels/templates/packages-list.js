// Template.packagesList.events({});

Template.packagesList.helpers({
	packagesList: function () {
		return DevTools.inspectedApp.packages.get();
	},

	totalPackagesNumber: function () {
		return DevTools.inspectedApp.packages.get().length;
	}
});

// Template.packagesList.onCreated( function () {});
// Template.packagesList.onRendered( function () {});
// Template.packagesList.onDestroyed( function () {});
