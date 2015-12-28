Meteor.methods({
	'DevTools.meteorEnvironment.get': function ( packageName ) {
		return DevTools.meteorEnvironment.get();
	}
});
