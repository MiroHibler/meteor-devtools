DevTools = {
	nativeTargets   : [
		'status',
		'insecure',
		'autopublish',
		'loggingIn',
		'currentUser',
		'users',
		'session'
	],
	targets         : {},
	ready           : new ReactiveVar( false ),

	readyTracker    : function () {
		var self = this;

		return Tracker.autorun( function () {
			if ( self.send ) {
				self.send({
					isReady: self.ready.get()
				});
			}
		});
	}
};
