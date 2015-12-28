Meteor.methods({
	'DevTools.users.update': function ( userId, newData ) {
		check( userId, String );
		check( newData, Object );

		Meteor.users.update({
				_id: userId
			}, {
				$set: newData
			}
		);
	}
});
