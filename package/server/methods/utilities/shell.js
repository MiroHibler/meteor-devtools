Meteor.methods({
	'DevTools.utilities.shell': function ( command ) {
		var pwd = process.env.PWD;

		return DevTools.utilities.shell( command );
	}
});
