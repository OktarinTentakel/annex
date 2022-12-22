/*!
 * Module Polyfills
 */

/**
 * @namespace Polyfills
 */

const MODULE_NAME = 'Polyfills';



//###[ IMPORTS ]########################################################################################################

import {assert, hasValue, isA, orDefault} from './basic.js';
import {createFetchRequest} from './dynamic-loading.js';



//###[ HELPERS ]########################################################################################################

/*
 * Helper function to provide createFetchRequest with the same call signature as fetch, to make implementation
 * easily replaceable in the future.
 *
 * @private
 * @returns {Function} a fetch implementation
 */
function fetch(url, options=null){
	return createFetchRequest(url, options).execute();
}



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace DynamicLoading:polyfillFetch
 */

/**
 * Polyfills window.fetch with a simple XMLHttpRequest-based implementation adapted from "unfetch", to provide
 * basic functionality with a compatible signature while keeping the source as small as possible.
 *
 * This polyfill should cover most basic use cases, but for complex cases you might need to polyfill something more
 * complete (for example Github's implementation: https://github.com/github/fetch).
 *
 * @param {?Boolean} [force=false] - if true, replaces a possibly present native implementation with the polyfill as well
 *
 * @memberof DynamicLoading:polyfillFetch
 * @alias polyfillFetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://github.com/developit/unfetch
 * @example
 * polyfillFetch(true);
 */
export function polyfillFetch(force=false){
	force = orDefault(force, false, 'bool');

	if( force || !isA(window.fetch, 'function') ){
		window.fetch = fetch;
	}
}



/**
 * @namespace Polyfills:polyfillElementMatches
 */

/**
 * Adds Element.matches support, if not already present in browser. Falls back to ms or mozilla implementations
 * if necessary.
 *
 * @throws error if Element.matches is not supported
 *
 * @memberof Polyfills:polyfillElementMatches
 * @alias polyfillElementMatches
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
 * @example
 * polyfillElementMatches()
 * => makes Element.prototype.matches available, if not already present
 */
export function polyfillElementMatches(){
	const __methodName__ = polyfillElementMatches.name;

	if( !Element.prototype.matches ){
		Element.prototype.matches = Element.prototype.msMatchesSelector
			?? Element.prototype.webkitMatchesSelector
			?? null
		;
	}

	assert(hasValue(Element.prototype.matches), `${MODULE_NAME}:${__methodName__} | browser does not support Element.matches`);
}



/**
 * @namespace Polyfills:polyfillCustomEvent
 */

/**
 * Adds CustomEvent support, if not already present in browser. Falls back to manual implementation via
 * document.createEvent and event.initCustomEvent, if necessary.
 *
 * @memberof Polyfills:polyfillCustomEvent
 * @alias polyfillCustomEvent
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 * @example
 * polyfillCustomEvent()
 * => makes "window.CustomEvent" and "new CustomEvent()" available, if not already present
 */
export function polyfillCustomEvent(){
	if( isA(window.CustomEvent, 'function') ) return false;

	const CustomEvent = function(event, params){
		params = params ?? {bubbles : false, cancelable : false, detail : undefined};
		const e = document.createEvent('CustomEvent');
		e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return e;
	};
	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
}
