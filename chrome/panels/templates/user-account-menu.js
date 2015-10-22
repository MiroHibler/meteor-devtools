Template.userAccountMenu.events({
	'click #signout': function ( event ) {
		DevTools.logout( event );
	}
});

Template.userAccountMenu.helpers({
	user: function () {
		return DevTools.inspectedApp.currentUser.get();
	},

	userName: function () {
		var user = DevTools.inspectedApp.currentUser.get();

		return ( user ) ? ( user.username || ( user.emails && user.emails.length ) ? user.emails[ 0 ].address : user._id ) : '';
	},

	userStatus: function () {
		return ( DevTools.inspectedApp.loggingIn.get() ) ? 'Logging in...' : 'No user logged in.';
	}
});

Template.userAccountMenu.onCreated( function () {});

Template.userAccountMenu.onRendered( function () {});

Template.userAccountMenu.onDestroyed( function () {});
