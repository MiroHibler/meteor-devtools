Template.packagesListItem.events({
	'click [data-name]': function ( event, template ) {
		event.preventDefault();

		template.isShowingInfo.set( !template.isShowingInfo.get() );
	}
});

Template.packagesListItem.helpers({
	showInfo: function () {
		var self = Template.instance();

		return ( self && self.isShowingInfo ) ? self.isShowingInfo.get() : false;
	},

	packageInfo: function () {
		var self = Template.instance();

		return ( self && self.packageInfo ) ? self.packageInfo.get() : null;
	},

	packageName: function () {
		return this.name;
	},

	isCorePackage: function () {
		return ( this.name && this.name.indexOf( ':' ) == -1 );
	},

	packageVersion: function () {
		return this.version;
	}
});

Template.packagesListItem.onCreated( function () {
	var self = this;

	self.packageInfo = new ReactiveVar( null );

	self.isShowingInfo = new ReactiveVar( false, function ( oldValue, newValue ) {
		if ( oldValue == newValue ) return true;

		if ( newValue && !self.packageInfo.get() ) {
			DevTools.sendMessage({
				action: 'get',
				target: 'packageInfo',
				data  : self.get( 'name' )
			});
		}
	});
});

Template.packagesListItem.onRendered( function () {
	var self = this,
		packageInfo;

	Tracker.autorun( function () {
		packageInfo = DevTools.inspectedApp.packageInfo.get();

		if ( packageInfo && packageInfo.name == self.get( 'name' ) ) {
			self.packageInfo.set( packageInfo.details );
		}
	});
});
