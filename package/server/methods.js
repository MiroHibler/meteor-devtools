Meteor.methods({
	'DevTools.setMeteorSettings': function ( newMeteorSettings ) {
		var key;

		for ( key in newMeteorSettings ) {
			if ( _.isObject( newMeteorSettings[ key ] ) ) {
				Meteor.settings[ key ] = _.extend( Meteor.settings[ key ], newMeteorSettings[ key ] );
			} else {
				Meteor.settings[ key ] = newMeteorSettings[ key ];
			}
		}
	},

	'DevTools.getMeteorSettings': function () {
		return Meteor.settings;
	}
});
