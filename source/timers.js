/*!
 * Module Timers
 */

/**
 * @namespace Timers
 */

const MODULE_NAME = 'Timers';



import {orDefault, isA, assert, hasValue, hasMembers} from './basic.js';



/**
 * @namespace Timers:schedule
 */

/**
 * Setup a timer for one-time execution of a callback, kills old timer if given
 * to prevent overlapping timers.
 *
 * @param {Number} ms - time in milliseconds until execution
 * @param {Function} callback - callback function to execute after ms
 * @param {?(Object|Number)} [oldTimer] - if set, kills the timer before setting up new one
 * @throws error if callback is not a function
 * @returns {Object} new timer
 *
 * @memberof Timers:schedule
 * @alias schedule
 * @see pschedule
 * @see countermand
 * @example
 * const timer = schedule(1000, function(){ alert('time for tea'); });
 * const timer = schedule(2000, function(){ alert('traffic jam, tea has to wait'); }, timer);
 **/
export function schedule(ms, callback, oldTimer){
	ms = orDefault(ms, 1, 'integer');

	assert(isA(callback, 'function'), `${MODULE_NAME}:schedule | callback must be a function`);

	if( hasValue(oldTimer) ){
		countermand(oldTimer);
	}

	return {id : window.setTimeout(callback, ms), type : 'timeout'};
}



/**
 * @namespace Timers:pschedule
 */

/**
 * Setup a timer for one-time execution of a callback, kills old timer if given
 * to prevent overlapping timers.
 * This implementation uses Date.getTime() to improve on timer precision for long
 * running timers. The timers of this method can also be used in countermand().
 *
 * Warning: these timers are more precise than normal timer for _long_ time spans and less precise for short ones,
 * if you are dealing with times at least above 30s (or minutes and hours) this the right choice, if you look to
 * use precise timers in the second and millisecond range, definitely use schedule/loop instead!
 *
 * @param {Number} ms - time in milliseconds until execution
 * @param {Function} callback - callback function to execute after ms
 * @param {?(Object|Number)} [oldTimer] - if set, kills the timer before setting up new one
 * @throws error if callback is not a function
 * @returns {Object} timer (does not create new timer object if oldTimer given, but returns old one)
 *
 * @memberof Timers:pschedule
 * @alias pschedule
 * @see schedule
 * @see countermand
 * @example
 * const timer = pschedule(1000, function(){ alert('time for tea'); });
 * const timer = pschedule(2000, function(){ alert('traffic jam, tea has to wait'); }, timer);
 */
export function pschedule(ms, callback, oldTimer){
	ms = orDefault(ms, 1, 'integer');

	assert(isA(callback, 'function'), `${MODULE_NAME}:pschedule | callback must be a function`);

	if(
		hasValue(oldTimer)
		&& hasMembers(oldTimer, ['id', 'type'])
	){
		countermand(oldTimer);
		oldTimer.precise = true;
	} else {
		oldTimer = {id : -1, type : 'timeout', precise : true};
	}

	const waitStart = new Date().getTime();
	let waitMilliSecs = ms;

	const fAdjustWait = function(){
		if( waitMilliSecs > 0 ){
			waitMilliSecs -= (new Date().getTime() - waitStart);
			oldTimer.id = window.setTimeout(fAdjustWait, (waitMilliSecs > 10) ? waitMilliSecs : 10);
		} else {
			callback();
		}
	};

	oldTimer.id = window.setTimeout(fAdjustWait, waitMilliSecs);

	return oldTimer;
}



/**
 * @namespace Timers:reschedule
 */

/**
 * Alias for schedule() with more natural param-order for rescheduling.
 *
 * @param {(Object|Number)} timer - the timer to refresh/reset
 * @param {Number} ms - time in milliseconds until execution
 * @param {Function} callback - callback function to execute after ms
 * @throws error if callback is not a function
 * @returns {Object} timer (may be the original timer, if given timer is precise from pschedule or ploop)
 *
 * @memberof Timers:reschedule
 * @alias reschedule
 * @see schedule
 * @example
 * const timer = reschedule(timer, 3000, function(){ alert('taking even more time'); });
 */
export function reschedule(timer, ms, callback){
	ms = orDefault(ms, 1, 'integer');

	assert(isA(callback, 'function'), `${MODULE_NAME}:reschedule | callback must be a function`);

	if( hasValue(timer) && hasValue(timer.precise) && !!timer.precise ){
		return pschedule(ms, callback, timer);
	} else {
		return schedule(ms, callback, timer);
	}
}



/**
 * @namespace Timers:loop
 */

/**
 * Setup a loop for repeated execution of a callback, kills old loop if wished
 * to prevent overlapping loops.
 *
 * @param {Number} ms - time in milliseconds until execution
 * @param {Function} callback - callback function to execute after ms
 * @param {?(Object|Number)} [oldLoop] - if set, kills the loop before setting up new one
 * @throws error if callback is not a function
 * @returns {Object} new loop
 *
 * @memberof Timers:loop
 * @alias loop
 * @see ploop
 * @see countermand
 * @example
 * const loop = loop(250, function(){ document.body.classList.add('brightred'); });
 * const loop = loop(100, function(){ document.body.classList.add('brightgreen'); }, loop);
 */
export function loop(ms, callback, oldLoop){
	ms = orDefault(ms, 1, 'integer');

	assert(isA(callback, 'function'), `${MODULE_NAME}:loop | callback must be a function`);

	if( hasValue(oldLoop) ){
		countermand(oldLoop, true);
	}

	return {id : window.setInterval(callback, ms), type : 'interval'};
}



/**
 * @namespace Timers:ploop
 */

/**
 * Setup a loop for repeated execution of a callback, kills old loop if wished
 * to prevent overlapping loops.
 * This implementation uses Date.getTime() to improve on timer precision for long running loops.
 *
 * Warning: these timers are more precise than normal timer for _long_ time spans and less precise for short ones,
 * if you are dealing with times at least above 30s (or minutes and hours) this the right choice, if you look to
 * use precise timers in the second and millisecond range, definitely use schedule/loop instead!
 *
 * The loops of this method can also be used in countermand().
 * This method does not actually use intervals internally but timeouts,
 * so don't wonder if you can't find the ids in JS.
 *
 * @param {Number} ms - time in milliseconds until execution
 * @param {Function} callback - callback function to execute after ms
 * @param {?(Object|Number)} [oldLoop] - if set, kills the loop before setting up new one
 * @throws error if callback is not a function
 * @returns {Object} loop (if you give an old loop into the function the same reference will be returned)
 *
 * @memberof Timers:ploop
 * @alias ploop
 * @see loop
 * @see countermand
 * @example
 * const loop = ploop(250, function(){ document.body.classList.add('brightred'); });
 * const loop = ploop(100, function(){ document.body.classList.add('brightgreen'); }, loop);
 */
export function ploop(ms, callback, oldLoop){
	ms = orDefault(ms, 1, 'integer');

	assert(isA(callback, 'function'), `${MODULE_NAME}:ploop | callback must be a function`);

	if(
		hasValue(oldLoop)
		&& hasMembers(oldLoop, ['id', 'type'])
	){
		countermand(oldLoop, true);
		oldLoop.precise = true;
	} else {
		oldLoop = {id : -1, type : 'interval', precise : true};
	}

	let
		waitStart = new Date().getTime(),
		waitMilliSecs = ms
	;

	const fAdjustWait = function(){
		if( waitMilliSecs > 0 ){
			waitMilliSecs -= (new Date().getTime() - waitStart);
			oldLoop.id = window.setTimeout(fAdjustWait, (waitMilliSecs > 10) ? waitMilliSecs : 10);
		} else {
			callback();
			waitStart = new Date().getTime();
			waitMilliSecs = ms;
			oldLoop.id = window.setTimeout(fAdjustWait, waitMilliSecs);
		}
	};

	oldLoop.id = window.setTimeout(fAdjustWait, waitMilliSecs);

	return oldLoop;
}



/**
 * @namespace Timers:countermand
 */

/**
 * Cancel a timer or loop immediately.
 *
 * @param {(Object|Number)} timer - the timer or loop to end
 * @param {?Boolean} [isInterval] - defines if a timer or a loop is to be stopped, set in case timer is a GUID
 *
 * @memberof Timers:countermand
 * @alias countermand
 * @see schedule
 * @see pschedule
 * @see loop
 * @see ploop
 * @example
 * countermand(timer);
 * countermand(loop);
 */
export function countermand(timer, isInterval){
	if( hasValue(timer) ){
		if( hasMembers(timer, ['id', 'type']) ){
			if( timer.type === 'interval' ){
				window.clearInterval(timer.id);
			} else {
				window.clearTimeout(timer.id);
			}
		} else {
			if( !hasValue(isInterval) || !isInterval ){
				window.clearTimeout(timer);
			} else {
				window.clearInterval(timer);
			}
		}
	}
}



/**
 * @namespace Timers:requestAnimationFrame
 */

/**
 * This is a simple streamlined, vendor-cascading version of window.requestAnimationFrame with a timeout fallback in
 * case the functionality is missing from the browser.
 *
 * @param {Function} callback - the code to execute once the browser has assigned an execution slot for it
 * @return {Number} either the id of the requestAnimationFrame or the internal timeout, both are cancellable via cancelAnimationFrame
 *
 * @memberof Timers:requestAnimationFrame
 * @alias requestAnimationFrame
 * @see raf
 * @see cancelAnimationFrame
 * @see caf
 * @example
 * const requestId = requestAnimationFrame(function(){ window.body.style.opacity = 0; });
 */
export function requestAnimationFrame(callback){
	const raf = window.requestAnimationFrame
		?? window.webkitRequestAnimationFrame
		?? window.mozRequestAnimationFrame
		?? window.msRequestAnimationFrame
		?? function(callback){ return schedule(16, callback); }
	;

	return raf(callback);
}



/**
 * @namespace Timers:raf
 */

/**
 * This is just an alternate name for requestAnimationFrame.
 *
 * @param {Function} callback - the code to execute once the browser has assigned an execution slot for it
 * @return {Number} either the id of the requestAnimationFrame or the internal timeout, both are cancellable via cancelAnimationFrame
 *
 * @memberof Timers:raf
 * @alias raf
 * @see requestAnimationFrame
 * @see cancelAnimationFrame
 * @see caf
 * @example
 * const requestId = raf(function(){ window.body.style.opacity = 0; });
 */
export function raf(callback){
	return requestAnimationFrame(callback);
}



/**
 * @namespace Timers:cancelAnimationFrame
 */

/**
 * This is a simple streamlined, vendor-cascading version of window.cancelAnimationFrame.
 *
 * @param {Number} id - either the id of the requestAnimationFrame or its timeout fallback
 *
 * @memberof Timers:cancelAnimationFrame
 * @alias cancelAnimationFrame
 * @see requestAnimationFrame
 * @see raf
 * @see caf
 * @example
 * cancelAnimationFrame(requestAnimationFrame(function(){ window.body.style.opacity = 0; }));
 */
export function cancelAnimationFrame(id){
	const raf = window.requestAnimationFrame
		?? window.webkitRequestAnimationFrame
		?? window.mozRequestAnimationFrame
		?? window.msRequestAnimationFrame
	;

	let caf = window.cancelAnimationFrame
		?? window.mozCancelAnimationFrame
	;

	if( !hasValue(raf) ){
		caf = countermand;
	}

	return caf(id);
}



/**
 * @namespace Timers:caf
 */

/**
 * This is just an alternate name for cancelAnimationFrame.
 *
 * @param {Number} id - either the id of the requestAnimationFrame or its timeout fallback
 *
 * @memberof Timers:caf
 * @alias caf
 * @see requestAnimationFrame
 * @see raf
 * @see cancelAnimationFrame
 * @example
 * caf(raf(function(){ window.body.style.opacity = 0; }));
 */
export function caf(id){
	return cancelAnimationFrame(id);
}



/**
 * @namespace Timers:waitForRepaint
 */

/**
 * This function has the purpose to offer a safe execution slot for code depending on an up-to-date rendering state of
 * the DOM after a change to styles for example. Let's say you add a class to an element and right in the next line
 * you'll want to read a layout attribute like width or height from it. This might fail, because there is no guarantee
 * the browser actually already applied the new styles to be read from the DOM.
 *
 * To wait safely for the new DOM state this method works with two stacked requestAnimationFrame calls.
 *
 * Since requestAnimationFrame always happens _before_ a repaint, two stacked calls ensure, that there has to be a
 * repaint between them.
 *
 * @param {Function} callback - the code to execute once the browser performed a repaint
 * @return {Object} dictionary of ids for the inner and outer request ids, outer gets assigned right away, while inner gets assigned after first callback => {outer : 1, inner : 2}
 *
 * @memberof Timers:waitForRepaint
 * @alias waitForRepaint
 * @see requestAnimationFrame
 * @see raf
 * @example
 * element.classList.add('special-stuff');
 * waitForRepaint(function(){ alert(`the new dimensions after class change are: ${element.offsetWidth}x${element.offsetHeight}`); });
 */
export function waitForRepaint(callback){
	const ids = {};

	ids.outer = requestAnimationFrame(function(){
		ids.inner = requestAnimationFrame(callback);
	});

	return ids;
}
