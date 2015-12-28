if ( typeof DevTools.utilities == 'undefined' ) DevTools.utilities = {};

DevTools.utilities.shell = {
	intro      : 'Meteor DevTools Server Shell\n\n' +
		'This is a very basic terminal which will run Linux/Unix commands on the server and will print the output here.\n\n' +
		'No fancy stuff though, but it may grow up soon ;)\n\n',
	readyString: 'Ready.',
	ready      : new ReactiveVar(),
	output     : new ReactiveVar(),
	status     : new ReactiveVar()
}

Template.shell.events({});

Template.shell.helpers({
	ready: function () {
		return DevTools.utilities.shell.ready.get();
	},

	output: function () {
		return DevTools.utilities.shell.output.get();
	},

	status: function () {
		return DevTools.utilities.shell.status.get();
	}
});

Template.shell.onCreated( function () {
	DevTools.utilities.shell.ready.set( true );
});

Template.shell.onRendered( function () {
	DevTools.utilities.shell.output.set( DevTools.utilities.shell.intro );
	DevTools.utilities.shell.status.set( DevTools.utilities.shell.readyString );
});

Template.shell.onDestroyed( function () {});
