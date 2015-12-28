var throwError = function ( routerName ) {
		throw new Meteor.Error( -1, routerName + ' not supported', routerName + ' is not supported' );
	},
	renderFlowRouter = function ( routeName ) {
		if ( Package[ 'kadira:blaze-layout' ] ) {
			Package[ 'kadira:blaze-layout' ].BlazeLayout.render( routeName );
		} else if ( Package[ 'kadira:react-layout' ] ) {
			throwError( 'ReactLayout' );
		} else {
			self.router.render( routeName );
		}
	};


DevTools = _.extend( DevTools, {
	routerName: 'DevTools',

	router: {
		render: function ( templateName ) {
			if (
				templateName &&
				templateName !== '' &&
				Blaze.isTemplate( Template[ templateName ] )
			) {
				var self = this,
					templateBody = Template.body;

				if ( templateBody ) {
					// TODO: Implement proper raw rendering

					Blaze.remove( templateBody );
					Blaze.render( Template[ templateName ], $( 'body' ) );
				}
			}
		}
	},

	checkForRouter: function () {
		var self = this;

		if ( self.isFramed ) {
			if ( Package[ 'iron:router' ] ) {
				self.routerName = 'Iron.Router';
				self.router = Package[ 'iron:router' ].Router;
			} else if ( Package[ 'kadira:flow-router' ] ) {
				self.routerName = 'FlowRouter';
				self.router = Package[ 'kadira:flow-router' ].FlowRouter;
			} else {
				self.routerName = '';
			}

			self.initRouter( self.routerName );
		}
	},

	initRouter: function ( routerName ) {
		var self = this;

		switch ( routerName ) {
			case 'Iron.Router':
				self.router.route( '/devtools', {
					layoutTemplate: 'DevToolsLayout',
					name          : 'DevTools',
					template      : 'DevTools'
				});

				self.router.route( '/devtools/collections', {
					layoutTemplate: 'DevToolsLayout',
					name          : 'DevToolsCollections',
					template      : 'DevToolsCollections'
				});

				self.router.route( '/devtools/users', {
					layoutTemplate: 'DevToolsLayout',
					name          : 'DevToolsUsers',
					template      : 'DevToolsUsers'
				});

				self.router.route( '/devtools/shell', {
					layoutTemplate: 'DevToolsLayout',
					name          : 'DevToolsShell',
					template      : 'DevToolsShell'
				});

				// Ensure we bypass any checks
				self.router.onBeforeAction( function () {
					if ( this.url.indexOf( '/devtools' ) == -1 ) {
						this.next();
					} else if ( !this._rendered ) {
						this.render( self.router.current().route.getName() );
					}
				});

				break;

			case 'FlowRouter':
				// TODO: Implement proper FlowRouter functionality
				self.router.route( '/devtools', {
					name: 'DevTools',
					// TODO: Find out how to replace top layout

					action: function () {
						renderFlowRouter( 'DevTools' );
					}
				});

				self.router.route( '/devtools/collections', {
					name: 'DevToolsCollections',
					// TODO: Find out how to replace top layout

					action: function () {
						renderFlowRouter( 'DevToolsCollections' );
					}
				});

				self.router.route( '/devtools/users', {
					name: 'DevToolsUsers',
					// TODO: Find out how to replace top layout

					action: function () {
						renderFlowRouter( 'DevToolsUsers' );
					}
				});

				self.router.route( '/devtools/shell', {
					name: 'DevToolsShell',
					// TODO: Find out how to replace top layout

					action: function () {
						renderFlowRouter( 'DevToolsShell' );
					}
				});

				break;

			case '':	// No router at all
				if ( window.location.pathname.split( '/' )[ 0 ] == 'devtools' ) {
					self.router.render( 'DevTools' );
				}

				break;

			default:	// Unsupported router
				throwError( routerName );
		}
	}
});
