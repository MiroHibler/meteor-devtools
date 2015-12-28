Template.user.events({
	'click [data-id]': function ( event, templateInstance ) {
		event.preventDefault();

		templateInstance.isEditing.set( !Template.instance().isEditing.get() );
	}
});

Template.user.helpers({
	isEditing: function () {
		return Template.instance().isEditing.get();
	},

	userName: function () {
		return ( this.username ) ? this.username : '(unavailable)';
	},

	email: function () {
		return ( this.emails && this.emails.length ) ? this.emails[ 0 ].address : '(unavailable)';
	},

	statusLabel: function () {
		return ( this.emails && this.emails.length ) ? ( ( this.emails[ 0 ].verified ) ? 'success' : 'danger' ) : '';
	},

	status: function () {
		return ( this.emails && this.emails.length ) ? ( ( this.emails[ 0 ].verified ) ? 'Verified' : 'Not verified' ) : '(unavailable)';
	}
});

Template.user.onCreated( function () {
	this.isEditing = new ReactiveVar( false );
});
