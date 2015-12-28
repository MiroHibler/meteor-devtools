Template.packagesListItem.events({
	'click [data-name]': function ( event ) {
		event.preventDefault();

		Template.instance().isShowingInfo.set( !Template.instance().isShowingInfo.get() );
	}
});

Template.packagesListItem.helpers({
	showInfo: function () {
		return ( Template.instance() && Template.instance().isShowingInfo ) ? Template.instance().isShowingInfo.get() : false;
	},

	packageInfo: function () {
		return ( Template.instance() && Template.instance().packageInfo ) ? Template.instance().packageInfo.get() : null;
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

	self.currentData = Template.currentData();

	self.packageInfo = new ReactiveVar( null );

	self.isShowingInfo = new ReactiveVar( false, function ( oldValue, newValue ) {
		if ( oldValue == newValue ) return true;

		if ( newValue && !self.packageInfo.get() ) {
			console.log( 'Fetching package info for \'%s\'...', self.currentData.name );
			// DevTools.sendMessage({
			// 	action: 'get',
			// 	target: 'packageInfo',
			// 	data  : $( packageLink ).data( 'name' )
			// });
		}
	});

	// self.autorun( function () {
	// // 	packageInfo = DevTools.inspectedApp.packageInfo.get();
	// // console.info( 'Package %s - show info? %s', self.packageName, self.isShowingInfo.get() );
	// // 	if ( packageInfo && packageInfo.name == self.name ) self.packageInfo = packageInfo.packageInfo;
	// });
});
