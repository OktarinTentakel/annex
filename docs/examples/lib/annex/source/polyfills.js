/*!
 * Module Polyfills
 */

/**
 * @namespace Polyfills
 */

const MODULE_NAME = 'Polyfills';



//###[ IMPORTS ]########################################################################################################

import {assert, hasValue, isA} from './basic.js';



//###[ EXPORTS ]########################################################################################################

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
	const methodName = polyfillElementMatches.name;

	if( !Element.prototype.matches ){
		Element.prototype.matches = Element.prototype.msMatchesSelector
			?? Element.prototype.webkitMatchesSelector
			?? null
		;
	}

	assert(hasValue(Element.prototype.matches), `${MODULE_NAME}:${methodName} | browser does not support Element.matches`);
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
 * => makes "windom.CustomEvent" and "new CustomEvent()" available, if not already present
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
