var template = function template ( importedTemplate ) {
		var self = this;

		self._template = importedTemplate;
		if ( self._template ) self.document = document.importNode( self._template.content, true );

		self._data = {};
	},

	notCompiled = 0;

// template.prototype.init = function () {
// 	var self = this;

// 	if ( self._template ) self.document = document.importNode( self._template.content, true );

// 	return self;
// },

template.prototype.compile = function () {
	var self = this;

	if ( self.document ) {
		self.innerHTML = $( '<div/>' ).append( self.document );

		if ( self._onRendered ) {
			var onRenderedHandlerId = '_' + _.uniqueId( Date.now() ) + '_',
				onRenderedHandler = function ( transition ) {
					self._onRendered();

					transition.complete();
				};

			$( self.innerHTML ).children().first().attr( 'intro', onRenderedHandlerId );

			Template._transitions[ onRenderedHandlerId ] = onRenderedHandler;
		}

		// Remove already loaded scripts
		self.innerHTML.find( 'script' ).remove();

		self.initEvents();

		self.innerHTML = _.unescape( self.innerHTML.html() );

		self.collectPartials();

		// return self.innerHTML;
		return self;
	}
},

template.prototype.collectPartials = function () {
	var self = this,
		regEx = /\{+\s*>\s*(\w+)\s*\}+/g,
		regExResult;

	self._partials = [];

	while ( ( regExResult = regEx.exec( self.innerHTML ) ) != null ) {
		self._partials.push( regExResult[ 1 ] );
	}
},

template.prototype.initEvents = function () {
	var self = this,
		proxyEventHandler = function ( eventHandler ) {
			var self = this;

			// Convert Ractive event to normal (Meteor compatible) event
			self.fire = function ( ractiveEvent ) {
				eventHandler.call( ractiveEvent.node, ractiveEvent.original, ractiveEvent );
			}
		};

	if ( typeof self._events == 'object' && Object.keys( self._events ).length > 0 ) {
		_.each( self._events, function ( _eventHandler, _eventType ) {
			var triggers = ( _eventType ) ? _eventType.split( ',' ) : [],
				eventHandlerId = '_' + _.uniqueId( Date.now() ) + '_',
				eventHandler = new proxyEventHandler( _eventHandler );

			_.each( triggers, function ( trigger ) {
				var eventSelectorPair = trigger.split( ' ' );

				$( self.innerHTML ).find( eventSelectorPair[ 1 ].trim() ).attr( 'on-' + eventSelectorPair[ 0 ].trim(), eventHandlerId );
			});

			Template._events[ eventHandlerId ] = eventHandler.fire;
		});
	}

	return self;
},

template.prototype.render = function ( ractiveTemplate ) {
	return this.innerHTML;
},

template.prototype.events = function ( templateEvents ) {
	this._events = templateEvents || {};
},

template.prototype.helpers = function ( templateHelpers ) {
	var self = this;

	self._helpers = templateHelpers || {};

	if ( typeof self._helpers == 'object' && Object.keys( self._helpers ).length > 0 ) {
		_.each( self._helpers, function ( helperHandler, helperName ) {
			self._data[ helperName ] = null;
		});
	}
},

template.prototype.onCreated = function ( handler ) {
	if ( handler ) this._onCreated = handler.bind( this );
},

template.prototype.onRendered = function ( handler ) {
	if ( handler ) this._onRendered = handler.bind( this );
},

template.prototype.onDestroyed = function ( handler ) {
	if ( handler ) this._onDestroyed = handler.bind( this );
};


Template = {
	_cache: {},

	_templates: {},

	_partials: [],

	_data: {},

	_events: {},

	_helpers: {},

	_transitions: {},

	_importTemplate: function ( link ) {
		var self = this,
			importedTemplate = link.import.querySelector( 'template' );

		if ( importedTemplate ) {
			var newTemplate = new template( importedTemplate );

			newTemplate.link = link;
			newTemplate.name = $( importedTemplate ).attr( 'name' );
		}

		// return newTemplate.init();
		return newTemplate;
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

	_compileTemplate: function ( template ) {
		var self = this;

		template.compile();

		self._cache[ template.name ] = template.innerHTML;

		self._partials = _.uniq( _.union( self._partials, template._partials ) );

		// if ( template._onCreated ) Tracker.autorun( template._onCreated );
		if ( template._onCreated ) template._onCreated();

		template.isCompiled = true;

		notCompiled--;
	},

	_initHelpers: function ( template ) {
		var self = this;

		if ( typeof template._helpers == 'object' && Object.keys( template._helpers ).length > 0 ) {
			_.each( template._helpers, function ( helperHandler, helperName ) {
				Tracker.autorun( function ( computation ) {
					self._data[ helperName ] = helperHandler();
				});
			});
		}
	},

	_renderBody: function () {
		var self = this,
			ractivePartials = {};

		self.body = new template();
		self.body.name = 'body';
		self.body.document = $( 'body' ).contents();
		// self.body.init();

		self._getScript( window.location.href.replace( '.html', '.js' ), function ( error, script ) {
			if ( error ) {
				// TODO: Handle errors...
			} else {
				self._compileTemplate( self.body );

				_.each( self._partials, function ( templateName ) {
					// ractivePartials[ templateName ] = self._cache[ templateName ];
					ractivePartials[ templateName ] = self._templates[ templateName ].render.bind( self._templates[ templateName ] );
				});

				_.each( self._templates, function ( template ) {
					self._data = _.extend( self._data, template._data );
				});

				// Render the page
				self._ractive = new Ractive({
					el                : 'body',
					template          : self.body.innerHTML,
					partials          : ractivePartials,
					data              : self._data,
					// computed: self._helpers,
					magic             : true,
					// oncomplete        : function () {
					// 	if ( self.body._onRendered ) Tracker.autorun( self.body._onRendered );
					// },
					onteardown        : function () {
						if ( self.body._onDestroyed ) $( 'body' ).off().on( 'destroyed', self.body._onDestroyed );
					},
					// Hack the onRendered event handler
					transitionsEnabled: true,
					transitions       : self._transitions
				});


				// Init global events
				self._ractive.on( self._events );

				// Init global helpers
				self._initHelpers( self );

				// if ( self.body._events ) self.body.initEvents();
				if ( self.body._helpers ) self._initHelpers( self.body );
				// if ( self.body._onRendered ) Tracker.autorun( self.body._onRendered );
				// if ( self.body._onDestroyed ) $( 'body' ).off().on( 'destroyed', self.body._onDestroyed );

				_.each( self._templates, function ( templateInstance, templateName ) {
					// if ( templateInstance._events ) templateInstance.initEvents();
					if ( templateInstance._helpers ) self._initHelpers( templateInstance );
					// if ( templateInstance._onRendered ) Tracker.autorun( templateInstance._onRendered );
					// if ( self[ templateName ]._onDestroyed ) this.off().on( 'destroyed', self[ templateName ]._onDestroyed.call( self[ templateName ] ) );
				});
			}
		});
	},

	init: function () {
		var self = this;

		$.event.special.destroyed = {
			remove: function ( o ) {
				if ( o.handler ) o.handler()
			}
		}

		// Import templates
		_.each( $( 'link[rel="import"]' ), function ( link ) {
			var newTemplate = self._importTemplate( link );

			self._templates[ newTemplate.name ] = newTemplate;
			self[ newTemplate.name ] = newTemplate;

			link.remove();
		});

		notCompiled = Object.keys( self._templates ).length;

		if ( notCompiled > 0 ) {
			_.each( self._templates, function ( template ) {
				if ( !template.isCompiled ) {
					self._getScript( template.link.href.replace( '.html', '.js' ), function ( error, script ) {
						if ( error ) {
							// TODO: Handle errors...
						} else {
							self._compileTemplate( template );

							if ( notCompiled == 0 ) self._renderBody();
						}
					});
				}
			});
		}
	},

	registerHelper: function ( helper, handler ) {
		this._helpers[ helper ] = handler;
	}
};

Template.init();
