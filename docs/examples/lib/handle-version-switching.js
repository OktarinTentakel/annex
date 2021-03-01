(function(){
	function getUrlParameter(name){
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function supportsDynamicImport(){
		try {
			new Function('import("")');
			return true;
		} catch (err) {
			return false;
		}
	}

	var	IS_SERVED_WITH_FILE_PROTOCOL = location.protocol.indexOf('file') === 0,
		SUPPORTS_ES6_MODULES = supportsDynamicImport();

	function addVersionSwitcher(){
		var version = getUrlParameter('version');
		if( version === '' ){
			version = 'dist';
		}
		if( IS_SERVED_WITH_FILE_PROTOCOL || !SUPPORTS_ES6_MODULES ){
			version = 'es5';
		}

		console.info('Active Version: '+version);
		window.__ANNEX_VERSION__ = version;

		var nav = document.createElement('nav');
		nav.innerHTML =
			'<div class="nav-wrapper light-blue">'
				+'<ul>'
					+ (
						(window.location.pathname === '/' || window.location.pathname.indexOf('index.html') >= 0)
							? ''
							: '<li><a href="./index.html"><i class="material-icons">arrow_back</i></a></li>'
					)
					+'<li'+(version === 'dist' ? ' class="active"' : '')+'><a class="dist" href="?version=dist">Use Dist</a></li>'
					+'<li'+(version === 'source' ? ' class="active"' : '')+'><a class="source" href="?version=source">Use Source</a></li>'
					+'<li'+(version === 'es5' ? ' class="active"' : '')+'><a class="es5" href="?version=es5">Use ES5</a></li>'
				+'</ul>'
			+'</div>'
		;

		var header = document.querySelector('header');
		header.insertBefore(nav, header.firstChild);

		if( IS_SERVED_WITH_FILE_PROTOCOL || !SUPPORTS_ES6_MODULES ){
			var navLinks = nav.querySelectorAll('a');
			for (var i = 0; i < navLinks.length; i++){
				if( navLinks[i].classList.contains('dist') || navLinks[i].classList.contains('source') ){
					navLinks[i].addEventListener('click', function(e){
						e.preventDefault();

						if( IS_SERVED_WITH_FILE_PROTOCOL ){
							alert('this page is served from file system, which does not support ES6 modules');
						} else if( !SUPPORTS_ES6_MODULES ){
							alert('this browser does not seem to support ES6 modules');
						}

						return false;
					});
				}
			}
		}
	}

	addVersionSwitcher();
})();
