if ( typeof DevTools === 'undefined' ) DevTools = {};

if ( typeof DevTools.onResize === 'undefined' ) DevTools.onResize = function ( element, callback ) {
	var self = this;

	// http://stackoverflow.com/a/32709371/775286
	if ( !self.onResize.watchedElementData ) {
		// First time we are called, create a list of watched elements
		// and hook up the event listeners.
		self.onResize.watchedElementData = [];

		var checkForChanges = function () {
			self.onResize.watchedElementData.forEach( function ( data ) {
				if (
					element.offsetWidth !== data.offsetWidth ||
					element.offsetHeight !== data.offsetHeight
				) {
					data.offsetWidth = element.offsetWidth;
					data.offsetHeight = element.offsetHeight;
					data.callback();
				}
			});
		};

		// Listen to the window's size changes
		window.addEventListener( 'resize', checkForChanges );

		// Listen to changes on the elements in the page that affect layout
		var observer = new MutationObserver( checkForChanges );

		observer.observe( document.body, {
			attributes   : true,
			childList    : true,
			characterData: true,
			subtree      : true
		});
	}

	// Save the element we are watching
	self.onResize.watchedElementData.push({
		element     : element,
		offsetWidth : element.offsetWidth,
		offsetHeight: element.offsetHeight,
		callback    : callback
	});
};
