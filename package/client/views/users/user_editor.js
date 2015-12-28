Template.userEditor.helpers({
	userId: function () {
		return Template.instance().data._id;
	}
});

Template.userEditor.onRendered( function () {
	var self = Template.instance(),
		userEditor = new Editor( $( '#userEditor_' + self.data._id )[ 0 ], {
			modes : [],
			search: false
		});

	userEditor.init(
		self.data._id,
		self.data,
		function ( newData ) {
			Meteor.call( 'DevTools.users.update', self.data._id, JSON.flatten( newData )/*, function ( error, result ) {
				if ( error ) {
					console.error( error.message );
				} else {
					console.info( 'User data successfully updated.' );
				}
			}*/);
		}
	);
});
