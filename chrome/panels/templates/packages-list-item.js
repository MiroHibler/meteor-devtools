Template.packagesListItem.events({});
Template.packagesListItem.helpers({
	packageName: function () {
		return this.name;
	},

	isCorePackage: function () {
		return ( this.name && this.name.indexOf( ':' ) == -1 );
	},

	packageVersion: function () {
		return this.version;		// No package version available yet
	},

	releaseColor: function () {
		return 'orange';
	},

	packageRelease: function () {
		return this.release;		// No package release available yet
	}
});

Template.packagesListItem.onCreated( function () {});
Template.packagesListItem.onRendered( function () {});
Template.packagesListItem.onDestroyed( function () {});
