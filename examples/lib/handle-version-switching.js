(function(){
	var IS_INTERNET_EXPLORER = /Trident\//i.test(window.navigator.userAgent);

	function getUrlParameter(name){
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function addVersionSwitcher(){
		var version = getUrlParameter('version');
		if( version === '' ){
			version = 'dist';
		}
		if( IS_INTERNET_EXPLORER ){
			version = 'es5';
		}
		console.info('Active Version: '+version);
		window.__ANNEX_VERSION__ = version;

		var nav = document.createElement('nav');
		nav.innerHTML =
			'<div class="nav-wrapper">'
				+'<ul>'
					+ (
						(window.location.pathname === '/' || window.location.pathname.indexOf('index.html') >= 0)
							? ''
							: '<li><a href="./index.html"><i class="material-icons">arrow_back</i></a></li>'
					)
					+'<li'+(version === 'dist' ? ' class="active"' : '')+'><a href="?version=dist">Use Dist</a></li>'
					+'<li'+(version === 'source' ? ' class="active"' : '')+'><a href="?version=source">Use Source</a></li>'
					+'<li'+(version === 'es5' ? ' class="active"' : '')+'><a href="?version=es5">Use ES5</a></li>'
				+'</ul>'
			+'</div>'
		;

		var header = document.querySelector('header');
		header.insertBefore(nav, header.firstChild);
	}

	addVersionSwitcher();
})();
