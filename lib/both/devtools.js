DevTools = {
	nativeTargets: [
		'status',
		'currentUser',
		'loggingIn',
		'users',
		'session'
	],
	targets      : {},
	ready        : new ReactiveVar( false ),
	readyTracker : function () {
		var self = this;
		// NOTE: Don't forget to define 'send' method!
		return Tracker.autorun( function () {
			self.send({
				isReady: self.ready.get()
			});
		});
	}
};
