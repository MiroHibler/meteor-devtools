var collections = new ReactiveVar({}),
	collectionsEditor;

Template.collectionsEditor.events({});
Template.collectionsEditor.helpers({});

Template.collectionsEditor.onCreated( function () {
	Tracker.autorun( function () {
		var mongoCollections = ( typeof Mongo != 'undefined' && Mongo.Collection.getAll ) ? Mongo.Collection.getAll() : [],
			editableCollections = {},
			collection;

		_.each( mongoCollections, function ( collection ) {
			if ( collection.name ) {
				editableCollections[ collection.name ] = Meteor.Collection.get( collection.name ).find().fetch();
			} else {
				return {};
			}
		});

		collections.set( editableCollections );
	});
});

Template.collectionsEditor.onRendered( function () {
	if ( typeof Editor != 'undefined' ) {
		collectionsEditor = new Editor( $( '#collectionsEditor' )[ 0 ], {
			modes : [],
			search: false
		});

		collectionsEditor.init( '', {}, function ( newData ) {
			console.info( 'Edited Collections data: %o', newData );
		});

		collectionsEditor.set( collections.get() );
	}
});

Template.collectionsEditor.onDestroyed( function () {});
