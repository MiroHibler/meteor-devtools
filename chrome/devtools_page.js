// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area
chrome.devtools.panels.create(
	'Meteor',
	'img/meteor.png',
	// 'panels/meteor.html',
	'panels/meteor.html',
	function ( panel ) {
		// Start tracking
		panel.onShown.addListener( DevTools.show );

		// Stop tracking
		panel.onHidden.addListener( DevTools.hide );
	}
);
