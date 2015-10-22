Template.contentHeader.events({});

Template.contentHeader.helpers({
	activeView: function () {
		switch ( DevTools.activeView.get() ) {
			case 'dashboard':
				return {
					name   : 'Dashboard',
					section: 'DevTools',
					icon   : 'dashboard'
				};

			case 'session':
				return {
					name   : 'Session Variables',
					section: 'DevTools',
					icon   : 'gears'
				};

			case 'users':
				return {
					name   : 'Users',
					section: 'Inspected App',
					icon   : 'users'
				};

			default:
				return {
					name   : 'Undefined',
					section: 'Undefined',
					icon   : 'home'
				};
		}
	}
});

Template.contentHeader.onCreated( function () {});
Template.contentHeader.onRendered( function () {});
Template.contentHeader.onDestroyed( function () {});