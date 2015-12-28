Meteor.methods({
	'DevTools.meteorSettings.set': function ( newMeteorSettings ) {
		DevTools.meteorSettings.set( newMeteorSettings );
	},

	'DevTools.meteorSettings.get': function () {
		return DevTools.meteorSettings.get();
	}
});
