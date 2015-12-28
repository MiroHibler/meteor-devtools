Meteor.methods({
	'DevTools.packages.getList': function () {
		return DevTools.packages.getList();
	},

	'DevTools.packages.getInfo': function ( packageName ) {
		return DevTools.packages.getInfo( packageName );
	}
});
