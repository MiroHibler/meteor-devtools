var template = function template ( importedTemplate ) {
		var self = this,
			regExPattern = /<\/?template(.|\n)*?>\n?/g,
			altDOM;

		if ( importedTemplate ) self._template = importedTemplate.replace( regExPattern, '' );

		if ( self._template ) {
			self.name = $( '<div/>' ).html( importedTemplate ).children().first().attr( 'name' );

			// Alternative HTML parser
			altDOM = HTMLtoDOM( '<div id="MDTtemplate">' + self._template + '</div>' );
			self.document = $( altDOM.getElementsByTagName( 'body' ) );
			self.document.append( $( self.document.children()[ 0 ] ).contents() );
			self.document.find( '#MDTtemplate' ).remove();
		}

		self.data = {};
	};

template.prototype.compile = function () {
	var self = this;

	if ( self.document ) {
		if ( self._onRendered ) {
			var onRenderedHandlerId = '_' + _.uniqueId( Date.now() ) + '_',
				onRenderedHandler = function ( transition ) {
					var self = this;

					self._onRendered();

					transition.complete();
				};

			self.document.children().first().attr( 'intro', onRenderedHandlerId );

			Template._transitions[ onRenderedHandlerId ] = onRenderedHandler.bind( self );
		}

		// Remove already loaded scripts
		self.document.find( 'script' ).remove();

		self.initEvents();

		self.innerHTML = _.unescape( self.document.html() );

		self.collectPartials();

		return self;
	}
},

template.prototype.collectPartials = function () {
	var self = this,
		regEx = /\{+\s*>\s*(\w+)\s*\}+/g,
		regExResult;

	self._partialsList = {};

	while ( ( regExResult = regEx.exec( self.innerHTML ) ) != null ) {
		self._partialsList[ regExResult[ 1 ] ] = regExResult[ 0 ];
	}

	return self;
},

template.prototype.initEvents = function () {
	var self = this,
		proxyEventHandler = function ( eventHandler ) {
			var self = this;

			// Convert Ractive event to Meteor compatible event
			self.fire = function ( ractiveEvent ) {
				eventHandler.call( ractiveEvent.node, ractiveEvent.original, ractiveEvent );
			}
		},
		triggers,
		eventHandler,
		eventHandlerId,
		eventSelectorPair;

	if ( typeof self._events == 'object' && Object.keys( self._events ).length > 0 ) {
		_.each( self._events, function ( _eventHandler, _eventType ) {
			triggers = ( _eventType ) ? _eventType.split( ',' ) : [];
			eventHandlerId = '_' + _.uniqueId( Date.now() ) + '_';
			eventHandler = new proxyEventHandler( _eventHandler );

			_.each( triggers, function ( trigger ) {
				eventSelectorPair = trigger.split( ' ' );

				self.document.find( eventSelectorPair[ 1 ].trim() ).attr( 'on-' + eventSelectorPair[ 0 ].trim(), eventHandlerId );
			});

			Template._events[ eventHandlerId ] = eventHandler.fire;
		});
	}

	return self;
},

template.prototype.render = function () {
	return this.innerHTML;
},

template.prototype.events = function ( templateEvents ) {
	this._events = templateEvents || {};
},

template.prototype.helpers = function ( templateHelpers ) {
	var self = this;

	self.context = undefined;

	self._helpers = templateHelpers || {};

	if ( typeof self._helpers == 'object' && Object.keys( self._helpers ).length > 0 ) {
		_.each( self._helpers, function ( helperHandler, helperName ) {
			Tracker.autorun( function ( computation ) {
				self.data[ helperName ] = helperHandler.apply( self.context || self.data );
			});
		});

		Template._data[ self.name ] = self.data;
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
	_templates: {},

	_partialsList: {},

	_partials: {},

	_data: {},

	_events: {},

	_helpers: {},

	_transitions: {},

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

	_compileTemplate: function ( template, callback ) {
		var self = this;

		template.compile();

		self._partialsList = _.extend( self._partialsList, template._partialsList );

		if ( template._onCreated ) template._onCreated();

		if ( callback ) callback( template );
	},

	_initHelpers: function ( template ) {
		var self = this;

		self.context = undefined;

		if ( typeof template._helpers == 'object' && Object.keys( template._helpers ).length > 0 ) {
			_.each( template._helpers, function ( helperHandler, helperName ) {
				Tracker.autorun( function ( computation ) {
					self._data[ helperName ] = helperHandler.apply( self.context || self._data );
				});
			});
		}
	},

	_updateHelpers: function ( template ) {
		if ( template.context && typeof template._helpers == 'object' && Object.keys( template._helpers ).length > 0 ) {
			_.each( template._helpers, function ( helperHandler, helperName ) {
				template.data[ helperName ] = helperHandler.apply( template.context );
			});
		}
	},

	_renderBody: function () {
		var self = this;

		self.body = new template();
		self.body.name = 'body';
		self.body.document = $( 'body' );

		self._getScript( window.location.href.replace( '.html', '.js' ), function ( error, script ) {
			if ( error ) {
				// TODO: Handle errors...
			} else {
				var currentContext = '';

				self._compileTemplate( self.body );

				_.each( self._partialsList, function ( partialToken, partialName ) {
					// Init partial parents
					_.find( self._templates, function ( template ) {
						if ( template._partialsList[ partialName ] ) {
							self._templates[ partialName ]._parent = template;
							// Break the loop
							return true;
						}
					});

					self._partials[ partialName ] = self._templates[ partialName ].render.bind( self._templates[ partialName ] );
				});

				// Init template helpers
				_.each( self._templates, function ( template ) {
					_.each( template._partialsList, function ( partial, partialName ) {
						currentContext = ( _.isEmpty( self._templates[ partialName ].data ) ) ? '' : ' ~/' + partialName;
						template.innerHTML = template.innerHTML.replace( partial, '{{>_getPartial(\'' + partialName + '\',.,@keypath,@index,@key)' + currentContext + '}}' );
					});
				});

				self._data._getPartial = function ( partialName, partialContext, keyPath, index, key ) {
					// Save current context
					var currentContext = self._templates[ partialName ]._parent.context;

					if ( currentContext ) {
						if ( typeof index != 'undefined' ) {
							currentContext = currentContext[ index ];
						} else if ( typeof key != 'undefined' ) {
							currentContext = currentContext[ key ];
						}
					} else if ( partialContext ) {
						currentContext = partialContext[ partialName ];
					}

					self._templates[ partialName ].context = currentContext;

					self._updateHelpers( self._templates[ partialName ] );

					// Continue normally
					return partialName;
				};

				// Init BODY helpers
				self._initHelpers( self.body );

				// Init global helpers
				self._initHelpers( self );

				// Render the page
				self._ractive = new Ractive({
					el                : 'body',
					template          : self.body.innerHTML,
					partials          : self._partials,
					data              : self._data,
					magic             : true,
					oninit            : function () {
						if ( self.body._onCreated ) self.body._onCreated.call( self.body );
					},
					oncomplete        : function () {
						if ( self.body._onRendered ) self.body._onRendered.call( self.body );
					},
					onchange          : function () {
						// A trick to re-render reactively updated templates/partials
						self._ractive.set( self._ractive.get() );
					},
					onteardown        : function () {
						// if ( self.body._onDestroyed ) $( 'body' ).off().on( 'destroyed', self.body._onDestroyed );
						if ( self.body._onDestroyed ) self.body._onDestroyed.call( self.body );
					},
					// Hack the onRendered event handler
					transitionsEnabled: true,
					transitions       : self._transitions
				});

				// Init global events
				self._ractive.on( self._events );
			}
		});
	},

	_init: function () {
		var self = this,
			notCompiled = $( 'link[rel="import"]' ).length;

		$.event.special.destroyed = {
			remove: function ( o ) {
				if ( o.handler ) o.handler()
			}
		}

		// Import templates
		_.each( $( 'link[rel="import"]' ), function ( link ) {
			self._importTemplate( link, function ( newTemplate ) {
				self._templates[ newTemplate.name ] = newTemplate;
				self[ newTemplate.name ] = newTemplate;

				link.remove();

				self._getScript( newTemplate.link.href.replace( '.html', '.js' ), function ( error, script ) {
					if ( error ) {
						// TODO: Handle errors...
					} else {
						self._compileTemplate( newTemplate, function ( compiledTemplate ) {
							notCompiled--;

							if ( notCompiled == 0 ) self._renderBody();
						});
					}
				});
			});
		});
	},

	// Global template helpers
	registerHelper: function ( helper, handler ) {
		var self = this;

		self._helpers[ helper ] = handler.bind( self );
	}
};

Template._init();
