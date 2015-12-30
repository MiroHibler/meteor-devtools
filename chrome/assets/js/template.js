RactiveTemplate = Ractive.extend({
	// // Lifecycle Events:
	// // construct	...as soon as new Ractive(...) happens, before any setup work takes place
	onconstruct: function ( options ) {
		this._constructor = Template._templates[ this.component.name ];
	},
	// // config	...once all configuration options have been processed
	// onconfig: function () {},
	// // init	...when the instance is ready to be rendered
	oninit: function () {
		var self = this,
			template = self._constructor,
			index = getIndex( self ) || 0;

		template.instances[ ( index ) ? index : 0 ] = self;

		if ( template._onCreated ) {
			Template._currentInstance = template.instances[ index ];

			template._onCreated.call( template.instances[ index ] );
		}

		if ( typeof template._helpers == 'object' && Object.keys( template._helpers ).length > 0 ) {
			_.each( template._helpers, function ( helperHandler, helperName ) {
				var _helperHandler = function () {
					Template._currentInstance = template.instances[ index ];

					return helperHandler.call( template.instances[ index ].get( 'this' ) );
				};

				template.autorun( function ( computation ) {
					self.set( '_' + helperName, _helperHandler() );
				});
			});
		}

		if ( template._eventHandlers ) self.on( template._eventHandlers );
	},
	// // render	...each time the instance is rendered (normally only once)
	onrender: function () {
		var self = this,
			template = self._constructor,
			index = getIndex( self ) || 0;

		if ( template._onRendered ) {
			Template._currentInstance = template.instances[ index ];

			template._onRendered.call( template.instances[ index ] );
		}
	},
	// // complete	...after render, once any intro transitions have completed
	// oncomplete: function () {},
	// // change	...when data changes
	// onchange: function ( changedData ) {},
	// // update	...after ractive.update() is called
	// onupdate: function () {},
	// // unrender	...each time the instance is unrendered
	// onunrender: function () {},
	// // teardown	...each time the instance is destroyed (after unrender, if the teardown is responsible for triggering the unrender)
	onteardown: function () {
		var self = this,
			template = self._constructor,
			index = getIndex( self ) || 0;

		if ( template._onDestroyed ) {
			Template._currentInstance = template.instances[ index ];

			template._onDestroyed.call( template.instances[ index ] );
		}

		if ( template._trackers ) destroyTrackers( template );
	},
	// // insert	...each time ractive.insert() is called
	// oninsert: function () {},
	// // detach	...each time ractive.detach() is called (note: ractive.insert() calls ractive.detach())
	// ondetach: function () {}

	// isolated ...Isolated is defaulted to false. This applies to your template scope being
	// isolated to only the data that is passed in. For example if you wanted to access a
	// particular variable on your parent data as if it existed on your component then
	// setting isolated false would allow this. However if you wanted your template scoped to
	// only data you give it so that everything was very module then set isolated to true.
	// isolated: true
});

var template = function template ( importedTemplate ) {
		var self = this,
			regExPattern = /<\/?template(.|\n)*?>\n?/g,
			template = ( importedTemplate ) ? importedTemplate.replace( regExPattern, '' ) : '',
			altDOM;

		if ( template ) {
			self.name = $( '<div/>' ).html( importedTemplate ).children().first().attr( 'name' ) || 'body';

			// Alternative HTML parser
			altDOM = HTMLtoDOM( '<div id="MDTtemplate">' + template + '</div>' );
			self.document = $( altDOM.getElementsByTagName( 'body' ) );

			if ( self.document ) {
				self.document.append( $( self.document.children()[ 0 ] ).contents() );

				self.document.find( '#MDTtemplate' ).remove();
				self.document.find( 'script' ).remove();
			}

			self.instances = {};
		}
	}

	getIndex = function ( instance ) {
		var parentFragment = instance.component.parentFragment,
			key = ( parentFragment ) ? parentFragment.key : null;

		return ( parentFragment && parentFragment.index != null ) ? parentFragment.index : key;
	},

	isIteratee = function ( instance ) {
		return ( getIndex( instance ) != null );
	},

	itShouldBecomeComponent = function ( template ) {
		return (
			!!template._events ||
			!!template._helpers ||
			!!template._onCreated ||
			!!template._onRendered ||
			!!template._onDestroyed
		);
	},

	destroyTrackers = function ( template ) {
		_.each( template._trackers, function ( tracker ) {
			if ( tracker.active ) tracker.currentComputation.stop();
		});

		template._trackers = null;
	};

template.prototype.events = function ( eventMap ) {
	this._events = eventMap || {};
};

template.prototype.helpers = function ( helpers ) {
	var self = this,
		helperGetter,
		helperSetter;

	self._helpers = helpers || {};

	if ( typeof self._helpers == 'object' && Object.keys( self._helpers ).length > 0 ) {

		self.computed = {};

		_.each( self._helpers, function ( helperHandler, helperName ) {
			helperGetter = function () {
				return this.get( '_' + helperName );
			};

			helperSetter = function ( newData ) {
				this.set( '_' + helperName, newData );
			};

			self.computed[ helperName ] = {
				get: helperGetter,
				set: helperSetter
			}
		});
	}
};

template.prototype.onCreated = function ( handler ) {
	if ( handler ) this._onCreated = handler;
};

template.prototype.onRendered = function ( handler ) {
	if ( handler ) this._onRendered = handler;
};

template.prototype.onDestroyed = function ( handler ) {
	if ( handler ) this._onDestroyed = handler;
};

template.prototype.autorun = function ( runFunc, options ) {
	return Template._autorun.call( this, runFunc, options );
};


Template = {
	_templates: {},

	_components: {},

	_partials: {},

	_helpers: {},

	_autorun: function ( runFunc, options ) {
		var self = this,
			newTracker;

		if ( runFunc ) {
			if ( !self._trackers ) self._trackers = [];

			newTracker = Tracker.autorun( runFunc, options );

			self._trackers.push( newTracker );

			return newTracker;
		}
	},

	_importTemplate: function ( link, callback ) {
		$.get( link.href, function ( importedTemplate ) {
			var newTemplate = new template( importedTemplate );

			newTemplate.link = link;

			callback( newTemplate );
		});
	},

	_getScript: function ( url, callback ) {
		$.ajaxSetup({
			// cache  : true,
			isLocal: true
		});
		$.getScript( url )
			.done( function ( script, textStatus ) {
				if ( callback ) callback( null, script );
			})
			.fail( function ( jqxhr, textStatus, exception ) {
				// We're perfectly okay of there is no template controller script,
				// but we'll report parsing errors to help debugging
				if ( textStatus == 'parsererror' ) DevTools.console.error(
					'[TL] !!!!!! Loading \'' + url + '\' ERROR - ' + jqxhr.status + ' (\'' + textStatus + '\'): \'' + exception.message + '\''
				);

				if ( callback ) callback();
			});
	},

	_initEvents: function ( template ) {
		// Convert Ractive event to Meteor compatible event
		var self = this,
			proxyEventHandler = function ( eventHandler ) {
				this.fire = function ( ractiveEvent ) {
					Template._currentInstance = this;

					eventHandler.call( ractiveEvent.node, ractiveEvent.original, this, ractiveEvent );
				}
			},
			triggers,
			eventHandler,
			eventHandlerId,
			eventSelectorPair;

		if ( typeof template._events == 'object' && Object.keys( template._events ).length > 0 ) {
			template._eventHandlers = {};

			_.each( template._events, function ( _eventHandler, _eventType ) {
				triggers = ( _eventType ) ? _eventType.split( ',' ) : [];
				eventHandlerId = '_' + _.uniqueId( Date.now() ) + '_';
				eventHandler = new proxyEventHandler( _eventHandler );

				_.each( triggers, function ( trigger ) {
					eventSelectorPair = trigger.split( ' ' );

					template.document.find( eventSelectorPair[ 1 ].trim() ).attr( 'on-' + eventSelectorPair[ 0 ].trim(), eventHandlerId );
				});

				template._eventHandlers[ eventHandlerId ] = eventHandler.fire;
			});
		}
	},

	_compileTemplate: function ( template ) {
		var self = this;

		if ( template.document ) {
			// Remove already loaded scripts
			template.document.find( 'script' ).remove();

			self._initEvents( template );

			template.ractiveTemplate = _.unescape( template.document.html() );
		}
	},

	_checkComponents: function ( template ) {
		var self = this,
			regExPattern = /\{+\s*>\s*(\w+)\s*\}+/g,
			partialName,
			component,
			regExResult,
			regExMatch;

		while ( ( regExResult = regExPattern.exec( template.ractiveTemplate ) ) != null ) {
			regExMatch = regExResult[ 0 ];
			partialName = regExResult[ 1 ];

			if ( itShouldBecomeComponent( Template._templates[ partialName ] ) ) {
				if ( !template._components ) template._components = {};

				template.ractiveTemplate = template.ractiveTemplate.replace( regExMatch, '<' + partialName + '/>' );

				template._components[ partialName ] = null;
			} else {
				if ( !template._partials ) template._partials = {};

				template._partials[ partialName ] = '';
			}
		};
	},

	_collectComponents: function () {
		var self = this,
			component;

		_.each( self._templates, function ( template ) {
			if ( template._components ) {
				_.each( Object.keys( template._components ), function ( componentName ) {
					component = self._templates[ componentName ];

					if ( !component.ractive ) {
						component.ractive = RactiveTemplate.extend({
							template: component.ractiveTemplate,
							// data    : function () {
							// 	return component.data;
							// },
							computed: component.computed
						});
					}

					template._components[ componentName ] = component.ractive;
					self._components[ componentName ] = component.ractive;
				});
			}
		});
	},

	_collectPartials: function () {
		var self = this;

		_.each( self._templates, function ( template ) {
			if ( template._partials ) {
				_.each( Object.keys( template._partials ), function ( partialName ) {
					template._partials[ partialName ] = self._templates[ partialName ].ractiveTemplate;
					self._partials[ partialName ] = self._templates[ partialName ].ractiveTemplate;
				});
			}
		});
	},

	_initGlobalHelpers: function () {
		var self = this;

		if ( typeof self._helpers == 'object' && Object.keys( self._helpers ).length > 0 ) {
			self._autorun( function ( computation ) {
				_.each( self._helpers, function ( helperHandler, helperName ) {
					self.body.data[ helperName ] = function () {
						Template._currentInstance = self.body.instances[ 0 ];	// ???

						return helperHandler.call( self.ractive.get() );
					}
				});
			});
		}
	},

	_render: function () {
		var self = this;

		self.body = new template( _.unescape( $( 'body' ).html() ) );

		self._getScript( window.location.href.replace( '.html', '.js' ), function ( error, script ) {
			if ( error ) {
				// TODO: Handle errors...
			} else {
				self._templates.body = self.body;
				self._compileTemplate( self.body );

				_.each( self._templates, function ( template ) {
					self._checkComponents( template );
				});

				self._collectComponents();
				self._collectPartials();

				self._initGlobalHelpers();

				// Render the page
				self.ractive = new Ractive({
					el        : self.body.name,
					template  : self.body.ractiveTemplate,
					partials  : self._partials,
					components: self._components,
					data      : self.body.data,
					computed  : self.body.computed,
					magic     : true,

					// Lifecycle Events:
					// // init	...when the instance is ready to be rendered
					oninit: function () {
						if ( self.body._eventHandlers ) self.ractive.on( self.body._eventHandlers );

						if ( self.body._onCreated ) self.body._onCreated( self.body.instances[ 0 ] );
					},
					// render	...each time the instance is rendered (normally only once)
					onrender: function () {
						if ( self.body._onRendered ) self.body._onRendered( self.body.instances[ 0 ] );
					},
					// teardown	...each time the instance is destroyed (after unrender, if the teardown is responsible for triggering the unrender)
					onteardown: function () {
						if ( self.body._onDestroyed ) self.body._onDestroyed( self.body.instances[ 0 ] );

						if ( self._trackers ) destroyTrackers( self );
					},
				});
			}
		});
	},

	_init: function () {
		var self = this,
			$imports = $( 'link[rel="import"]' ),
			notCompiled = $imports.length;

		// Import templates
		_.each( $imports, function ( link ) {
			self._importTemplate( link, function ( newTemplate ) {
				self._templates[ newTemplate.name ] = newTemplate;
				self[ newTemplate.name ] = newTemplate;

				link.remove();

				self._getScript( newTemplate.link.href.replace( '.html', '.js' ), function ( error, script ) {
					if ( error ) {
						// TODO: Handle errors...
					} else {
						self._compileTemplate( newTemplate );
						notCompiled--;

						if ( notCompiled == 0 ) self._render();
					}
				});
			});
		});
	},

	// Global template helpers
	registerHelper: function ( helper, handler ) {
		var self = this;

		self._helpers[ helper ] = handler.bind( self );
	},

	instance: function () {
		return this._currentInstance;
	},

	currentData: function () {
		// [X] Inside an onCreated, onRendered, or onDestroyed callback, returns the data context of the template.
		// [X] Inside an event handler, returns the data context of the template on which this event handler was defined.
		// [ ] Inside a helper, returns the data context of the DOM node where the helper was used.
		// [ ] Establishes a reactive dependency on the result.

		return ( this._currentInstance ) ? this._currentInstance.get( 'this' ) : null;
	},

	parentData: function () {
		return this._parentData;
	}
};

Template._init();
