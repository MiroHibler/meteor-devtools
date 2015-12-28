var views = {
		dashboard: {
			header: {
				name   : 'Dashboard',
				section: 'DevTools',
				icon   : 'dashboard'
			},
			dropdownItems: ''
		},

		collections: {
			header: {
				name   : 'Collections',
				section: 'DevTools',
				icon   : 'folder'
			},
			dropdownItems: ''
		},

		session: {
			header: {
				name   : 'Session Variables',
				section: 'DevTools',
				icon   : 'gears'
			},
			dropdownItems: ''
		},

		users: {
			header: {
				name   : 'Users',
				section: 'Inspected App',
				icon   : 'users'
			},
			dropdownItems: ''
		},

		packages: {
			header: {
				name   : 'Packages',
				section: 'DevTools',
				icon   : 'cubes'
			},
			dropdownItems: ''
		},

		meteorSettings: {
			header: {
				name   : 'Meteor Settings',
				section: 'DevTools',
				icon   : 'sliders'
			},
			dropdownItems: ''
		},

		meteorEnvironment: {
			header: {
				name   : 'Meteor Environment',
				section: 'DevTools',
				icon   : 'cogs'
			},
			dropdownItems: ''
		},

		shell: {
			header: {
				name   : 'Server Shell',
				section: 'Inspected App',
				icon   : 'terminal'
			},
			dropdownItems: ''
		},

		debugger: {
			header: {
				name   : 'Server Debugger',
				section: 'Inspected App',
				icon   : 'bug'
			},
			dropdownItems: '' //+
				// '<li><a href="#">Open in new tab</a></li>' +
				// '<li><a href="#">Open in new window</a></li>' +
				// '<li class="divider"></li>' +
				// '<li><a href="#" data-dropdown="reload">Reload</a></li>'
		},

		default: {
			header: {
				name   : 'Undefined',
				section: 'Undefined',
				icon   : 'home'
			},
			dropdownItems: ''
		}
	},

	viewExists = function ( viewName ) {
		return _.has( views, viewName );
	};

Template.contentHeader.events({
	'click [data-dropdown]': function ( event ) {
		switch ( $( this ).data( 'dropdown' ) ) {
			case 'reload':
				$( '#meteorDebugger' ).contentDocument.location.reload();

				break;

			default:
				// just ignore...
		}
	}
});

Template.contentHeader.helpers({
	activeView: function () {
		var activeView = DevTools.activeView.get();

		return ( viewExists( activeView ) ) ? views[ activeView ].header : views.default.header;
	},

	dropdownItems: function () {
		var activeView = DevTools.activeView.get();

		return ( viewExists( activeView ) ) ? views[ activeView ].dropdownItems : '';
	}
});

Template.contentHeader.onCreated( function () {});
Template.contentHeader.onRendered( function () {});
Template.contentHeader.onDestroyed( function () {});
