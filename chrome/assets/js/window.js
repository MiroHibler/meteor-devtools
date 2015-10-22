if ( typeof DevTools === 'undefined' ) DevTools = {};
if ( typeof DevTools.isFramed === 'undefined' ) DevTools.isFramed = ( window.location !== window.parent.location );
if ( typeof DevTools.iFramed === 'undefined' ) DevTools.iFramed = function () {
	return ( ( DevTools.isFramed ) ? '-framed' : '' );
};
