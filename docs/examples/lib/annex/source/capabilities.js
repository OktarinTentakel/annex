/*!
 * Module Capabilities
 */

/**
 * @namespace Capabilities
 */

const MODULE_NAME = 'Capabilities';



import {hasValue, isA} from './basic.js';



/**
 * @namespace Capabilities:browserSupportsHistoryManipulation
 */

/**
 * Detects if the browser supports history manipulation, by checking the most common
 * methods for presence in the history-object.
 *
 * @returns {Boolean} true if browser seems to support history manipulation
 *
 * @memberof Capabilities:browserSupportsHistoryManipulation
 * @alias browserSupportsHistoryManipulation
 * @example
 * if( browserSupportsHistoryManipulation() ){
 *   window.history.replaceState(null, 'test', '/test');
 * }
 */
export function browserSupportsHistoryManipulation(){
	return hasValue(window.history)
		&& isA(window.history.pushState, 'function')
		&& isA(window.history.replaceState, 'function')
	;
}
