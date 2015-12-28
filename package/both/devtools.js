DevTools = {
	VERSION: '0.0.2',
	nativeTargets   : [
		'absoluteUrl',
		'debuggerUrl',
		'status',
		'release',
		'meteorSettings',
		'meteorEnvironment',
		'packages',
		'collections',
		'templates',
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
