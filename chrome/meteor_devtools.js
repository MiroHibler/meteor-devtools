// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area
chrome.devtools.panels.create(
	'Meteor',
	'img/meteor.png',
	'panels/meteor.html',
	function ( panel ) {
		panel.onShown.addListener( function () {
			// Start tracking
			MeteorDevTools.show();
		});

		panel.onHidden.addListener( function () {
			// Stop tracking
			MeteorDevTools.hide();
		});
	}
);
