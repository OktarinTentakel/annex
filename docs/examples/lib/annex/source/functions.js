/*!
 * Module Functions
 */

/**
 * @namespace Functions
 */

const MODULE_NAME = 'Functions';



import {orDefault, isA, isPlainObject, assert, hasValue} from './basic.js';
import {schedule, reschedule} from './timers.js';



/**
 * @namespace Functions:throttle
 */

/**
 * Returns a throttled function (based on an unthrottled one), which executes only once in a timeframe at most.
 * This is especially helpful to react to events, that might come in avalanches in an orderly and performant way,
 * let's say changing layout due to a resizing or scrolling event.
 *
 * Be aware that the precision of this method relies in part on the client's cpu, so this is implementation might
 * not be right if you need a razor sharp exact amount of calls in a given time every time, this is a more simple
 * and fuzzy implementation for basic purposes, which should cover 90% of your needs.
 * For a more precise and battle-tested version, see lodash's complex implementation:
 * https://www.npmjs.com/package/lodash.throttle
 *
 * @param {Number} ms - the timeframe for one execution at most in milliseconds
 * @param {Function} func - the function to throttle
 * @param {?Boolean} [hasLeadingExecution=false] - defines that the function call that starts a timeframe, does not count, so that during the following frame another call is possible
 * @param {?Boolean} [hasTrailingExecution=false] - defines if the function is executed at the end of the timeframe (will only happen, if there were more than one calls to the function in the time frame)
 * @throws error if ms is no number > 0 or func is not a function
 * @returns {Function} the throttling function (parameters will be handed as is to the throttled function)
 *
 * @memberof Functions:throttle
 * @alias throttle
 * @example
 * window.addEventListener('resize', throttle(400, function(){ console.log(`the viewport is now ${window.innerWidth}px wide`); }));
 */
export function throttle(ms, func, hasLeadingExecution=false, hasTrailingExecution=false){
	ms = orDefault(ms, 0, 'int');
	hasLeadingExecution = orDefault(hasLeadingExecution, false, 'bool');
	hasTrailingExecution = orDefault(hasTrailingExecution, false, 'bool');

	assert(ms > 0, `${MODULE_NAME}:throttle | ms must be > 0`);
	assert(isA(func, 'function'), `${MODULE_NAME}:throttle | no function given`);

	let
		frameHasStarted = false,
		callsInFrame = 0
	;

	return function(){
		const args = Array.from(arguments);

		if( !frameHasStarted ){
			frameHasStarted = true;
			if( !hasLeadingExecution ){
				callsInFrame++;
			}

			func.apply(this, args);

			 schedule(ms, () => {
				if( hasTrailingExecution && (callsInFrame > 1) ){
					func.apply(this, args);
				}

				frameHasStarted = false;
				callsInFrame = 0;
			});
		} else if( callsInFrame === 0 ){
			callsInFrame++;
			func.apply(this, args);
		} else {
			callsInFrame++;
		}
	};
}



/**
 * @namespace Functions:debounce
 */

/**
 * Hold the execution of a function until it has not been called for a specific timeframe.
 *
 * This is a basic implementation for 90% of all cases, if you need more options and more control
 * over details, have a look at lodash's implementation:
 * https://www.npmjs.com/package/lodash.debounce
 *
 * @param {Number} ms - timeframe in milliseconds without call before execution
 * @param {Function} func - the function to delay the execution of
 * @throws error if ms is no number > 0 or func is not a function
 * @returns {Function} the debounced function (parameters will be handed as is to the provided function)
 *
 * @memberof Functions:debounce
 * @alias debounce
 * @example
 * document.querySelector('input[name=search]').addEventListener('change', debounce(1000, function(){ refreshSearch(); }));
 */
export function debounce(ms, func){
	ms = orDefault(ms, 0, 'int');

	assert(ms > 0, `${MODULE_NAME}:debounce | ms must be > 0`);
	assert(isA(func, 'function'), `${MODULE_NAME}:debounce | no function given`);

	let	debounceTimer;

	return function(){
		debounceTimer = reschedule(debounceTimer, ms, () => { func.apply(this, Array.from(arguments)); });
	};
}



/**
 * @namespace Functions:defer
 */

/**
 * Defer the execution of a function until the callstack is empty.
 * This works identical to setTimeout(function(){}, 1);
 *
 * @param {Function} func - the function to defer
 * @param {?Number} [delay=1] - the delay to apply in milliseconds, 1 is a non-minifiable value to target the next tick, but you may define any millisecond value you want, to manually delay the function execution
 * @throws error if func is not a function or delay is no number > 0
 * @returns {Function} the deferred function; the deferred function returns the timer id, in case you want to cancel execution
 *
 * @memberof Functions:defer
 * @alias defer
 * @example
 * defer(function(){ doOnNextTick(); })();
 * defer(function(){ doInTwoSeconds(); }, 2000)();
 */
export function defer(func, delay=1){
	delay = orDefault(delay, 1, 'int');

	assert(isA(func, 'function'), `${MODULE_NAME}:defer | no function given`);
	assert(delay > 0, `${MODULE_NAME}:defer | delay must be > 0`);

	return function(){
		return schedule(delay, () => { func.apply(this, Array.from(arguments)); }).id;
	};
}



/**
 * @namespace Functions:kwargs
 */

/**
 * This function creates a function where we can set all parameters as a config object by name for each
 * call, while also allowing to set default values for parameters on function creation.
 *
 * This is heavily inspired by Python's way of handling parameters, therefore the name.
 *
 * This enables you to overload complex function signatures with tailor-fit version for your use cases and
 * to call functions with specific parameter sets in a very readable way, without adding empty values to the
 * list of parameters. So you just define what you want to set and those parts are clearly named.
 *
 * Each parameter you pass to the created kwargs function may be one of two variants:
 * - either it is not a plain object; in that case the parameter is passed to the original function as is at the
 *   position the parameter is declared in the call
 * - or the parameter is a plain object, in which case we treat the parameter as kwargs and try to match keys
 *   to parameters; in case you ever have to pass a plain object as-is: setting "kwargs: false" in the object
 *   tells the parser to skip matching props to parameters
 *
 * You can even mix these types. If two parameters describe the same value in the call, the last declaration wins.
 *
 * @param {Function} func - the function to provide kwargs to
 * @param {?Object} [defaults=null] - the default kwargs to apply to func, essentially setting default values for all given keys fitting parameters of the function
 * @throws error if func is not a function or parameter names of func could not be identified
 * @returns {Function} new function accepting mixed args, also being possible kwarg dicts
 *
 * @memberof Functions:kwargs
 * @alias kwargs
 * @example
 * const fTest = function(tick, trick, track){ console.log(tick, trick, track); };
 * const fKwargsTest = kwargs(fTest, {track : 'defaultTrack'});
 * fKwargsTest({tick : 'tiick', trick : 'trick'});
 * => "tiick, trick, defaultTrack"
 * kwargs(fTest, {track : 'defaultTrack'})('argumentTick', {trick : 'triick', track : 'trACK'});
 * => "argumentTick, triick, trACK"
 * kwargs(fTest, {track : 'defaultTrack'})('argumentTick', {trick : 'triick', track : 'track'}, 'trackkkk');
 * => "argumentTick, triick, trackkkk"
 */
export function kwargs(func, defaults=null){
	defaults = isPlainObject(defaults) ? defaults : {};

	assert(isA(func, 'function'), `${MODULE_NAME}:kwargs | no function given`);

	const
		argNamesString = func.toString().match(/\(([^)]+)/)[1],
		argNames = argNamesString ? argNamesString.split(',').map(argName => `${argName}`.trim()) : []
	;

	assert(argNames.length > 0, `${MODULE_NAME}:kwargs | could not identify parameter names in "${func.toString()}" using parameter string "${argNamesString}"`);

	return function(){
		const applicableArgs = [];

		Array.from(arguments).forEach((arg, argIndex) => {
			if(
				isPlainObject(arg)
				// if object contains falsy property "kwargs" leave it as is
				&& (!hasValue(arg.kwargs) || !!arg.kwargs)
			){
				argNames.forEach((argName, argNameIndex) => {
					if( hasValue(arg[argName]) ){
						applicableArgs[argNameIndex] = arg[argName];
					}
				});
			} else {
				applicableArgs[argIndex] = arg;
			}
		});

		argNames.forEach((argName, argNameIndex) => {
			if(
				!hasValue(applicableArgs[argNameIndex])
				&& hasValue(defaults[argName])
			){
				applicableArgs[argNameIndex] = defaults[argName];
			}
		});

		return func.apply(this, applicableArgs);
	};
}
