/*!
 * Module Polyfills
 */

/**
 * @namespace Polyfills
 */

const MODULE_NAME = 'Polyfills';



//###[ IMPORTS ]########################################################################################################

import {assert, hasValue, isFunction, orDefault} from './basic.js';
import {createFetchRequest} from './requests.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Polyfills:polyfillFetch
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
 * @memberof Polyfills:polyfillFetch
 * @alias polyfillFetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://github.com/developit/unfetch
 * @example
 * polyfillFetch(true);
 */
export function polyfillFetch(force=false){
	force = orDefault(force, false, 'bool');

	if( force || !isFunction(window.fetch) ){
		window.fetch = function(url, options=null){
			return createFetchRequest(url, options).execute();
		};
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
	const __methodName__ = 'polyfillElementMatches';

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
	if( isFunction(window.CustomEvent) ) return false;

	const CustomEvent = function(event, params){
		params = params ?? {bubbles : false, cancelable : false, detail : undefined};
		const e = document.createEvent('CustomEvent');
		e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return e;
	};
	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
}



/**
 * @namespace Polyfills:polyfillArrayAt
 */

/**
 * Adds support for Array.prototype.at, which is a fairly recent feature, compared to most other basic array
 * operations, resulting in even modern Chrome, Firefox and Safari versions not having implemented this.
 * But adding this is quite forward, it just being general array index access with possible negative index.
 *
 * @memberof Polyfills:polyfillArrayAt
 * @alias polyfillArrayAt
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
 * @example
 * polyfillArrayAt()
 * => adds Array.prototype.at if not already defined
 */
export function polyfillArrayAt(){
	if( isFunction(Array.prototype.at) ) return false;

	Object.defineProperty(Array.prototype, 'at', {
		value : function(n){
			n = Math.trunc(n) || 0;
			if( n < 0 ) n += this.length;
			if( (n < 0) || (n >= this.length) ) return undefined;
			return this[n];
		},
		writable : true,
		enumerable : false,
		configurable : true
	});
}
