Template.userList.helpers({
	users: function () {
		return Meteor.users.find();
	},

	usersCount: function () {
		return Meteor.users.find().count();
	}
});
