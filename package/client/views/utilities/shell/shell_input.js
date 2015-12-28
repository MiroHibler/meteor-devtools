var $command;

Template.shellInput.events({
	'keypress input#command': function ( event ) {
		if ( event.which === 13 ) {	// enter key
			var self = DevTools.utilities.shell,
				command = $command.val();

			if ( command.length == 0 ) return;

			self.output.set( '...' );
			self.status.set( '<i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;Running command \'' + command + '\'...' );

			self.ready.set( false );

			Meteor.call( 'DevTools.utilities.shell', command, function ( error, result )  {
				if ( error ) {
					self.output.set( error );
				} else {
					self.output.set( '$ ' + command + '\n\n' + result );
				}

				self.status.set( self.readyString );

				self.ready.set( true );
			});
		}
	}
});

Template.shellInput.helpers({});

Template.shellInput.onCreated( function () {});

Template.shellInput.onRendered( function () {
	$command = $( '#command' ).focus().val( '' );
});

Template.shellInput.onDestroyed( function () {});
