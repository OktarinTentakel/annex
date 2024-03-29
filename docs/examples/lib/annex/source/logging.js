/*!
 * Module Logging
 */

/**
 * @namespace Logging
 */

const MODULE_NAME = 'Logging';



//###[ DATA ]###########################################################################################################

export const
	LOG_LEVELS = ['log', 'warn', 'err'],
	XLOG_CONTEXT_COUNTS = {}
;

export let
	LOG_LEVEL = 'log',
	TRY_TO_LOG_TO_PARENT = false
;

/*
 * to make log calls chainable, this object is returned for every logging call, this offers extended functionality,
 * going far beyond log/warn/err, while keeping a very narrow interface for everyday stuff
 */
const LOG_CHAINABLE_OBJECT = {
	__documentation_for_chainable_object_of_log_execution__(){
		return 'Use this object to chain logging calls. All standard methods are supported'
			+' (see https://developer.mozilla.org/en-US/docs/Web/API/Console) and are executed'
			+' with silent fails if not supported by the browser. See other methods in this'
			+' object for an overview. Use disable()/enable() to deactivate/activate all debug outputs'
			+' (exceptions are assert, clear, error and warn) to the console centrally'
		;
	},
	setLogLevel(level){
		level = `${level}`;

		if( LOG_LEVELS.includes(level) ){
			LOG_LEVEL = level;
		}

		return log();
	},
	tryToLogToParent(setting){
		setting = (setting === undefined) ? true : !!setting;
		TRY_TO_LOG_TO_PARENT = setting;

		return log();
	},
	assert : genericConsoleMethodWrapperFactory('assert'),
	clear : genericConsoleMethodWrapperFactory('clear'),
	count : genericConsoleMethodWrapperFactory('count'),
	dir : genericConsoleMethodWrapperFactory('dir'),
	dirxml : genericConsoleMethodWrapperFactory('dirxml'),
	dirXml : genericConsoleMethodWrapperFactory('dirxml'),
	error(){
		return err(...Array.from(arguments));
	},
	group : genericConsoleMethodWrapperFactory('group'),
	groupCollapsed : genericConsoleMethodWrapperFactory('groupCollapsed'),
	groupEnd : genericConsoleMethodWrapperFactory('groupEnd'),
	info : genericConsoleMethodWrapperFactory('info'),
	log(){
		return log(...Array.from(arguments));
	},
	profile : genericConsoleMethodWrapperFactory('profile'),
	profileEnd : genericConsoleMethodWrapperFactory('profileEnd'),
	table : genericConsoleMethodWrapperFactory('table'),
	time : genericConsoleMethodWrapperFactory('time'),
	timeEnd : genericConsoleMethodWrapperFactory('timeEnd'),
	timeLog : genericConsoleMethodWrapperFactory('timeLog'),
	timeStamp : genericConsoleMethodWrapperFactory('timeStamp'),
	trace : genericConsoleMethodWrapperFactory('trace'),
	warn(){
		return warn(...Array.from(arguments));
	}
};



//###[ HELPERS ]########################################################################################################

/*
 * generically wraps console functions for chainability even if method is unavailable or fails
 * used in LOG_CHAINABLE_OBJECT below
 *
 * @private
 */
function genericConsoleMethodWrapper(name, logLevel=null, ...args){
	name = `${name}`;
	logLevel = LOG_LEVELS.includes(`${logLevel}`) ? `${logLevel}` : LOG_LEVELS[0];

	if( LOG_LEVELS.indexOf(LOG_LEVEL) <= LOG_LEVELS.indexOf(logLevel) ){
		if( typeof window.console?.[name] === 'function' ){
			try {
				if( TRY_TO_LOG_TO_PARENT ){
					parent.console[name].apply(parent.console, args);
				} else {
					console[name].apply(console, args);
				}
			} catch(ex){
				try {
					warn(`console call to "${name}" failed, implementation seemingly incompatible`);
				} catch(ex){}
			}
		} else {
			try {
				warn(`console call to "${name}" failed, is seemingly not supported`);
			} catch(ex){}
		}
	}

	return log();
}

/*
 * prepare an executable wrapper version based on a specific function name
 * used in LOG_CHAINABLE_OBJECT below
 *
 * @private
 */
function genericConsoleMethodWrapperFactory(name, logLevel){
	return function(){
		return genericConsoleMethodWrapper(name, logLevel, ...Array.from(arguments));
	};
}



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Logging:log
 */

/**
 * Logs a message to the console. Prevents errors in browsers, that don't support this feature.
 * This method is chainable (always returns a chainable object with all methods) and wraps all
 * advanced logging methods like dir, assert and count (https://developer.mozilla.org/en-US/docs/Web/API/Console).
 *
 * Use setLogLevel() on the chainable object to globally define the current log level.
 * 'log' is the default value and allows for all logs to appear on console. 'warn' reduces logs to warnings and errors.
 * 'err' only shows errors on console. Use this to mute debug stuff in production.
 *
 * You can use the method tryToLogToParent(true/false) to instruct log to try to log to the parent window also,
 * which comes in handy if you are developing inside a same domain iframe.
 *
 * @param {...*} [...] - any number of arguments you wish to log
 * @returns {Object} - chainable logging object
 *
 * @memberof Logging:log
 * @alias log
 * @example
 * log(randomVar, 'string');
 * log(false, true);
 * log().group().log(1).log(2).log(3).groupEnd().error('ouch');
 * log().setLogLevel('warn');
 * log('test', {test : 'test'}).setLogLevel('warn').warn('oh noez, but printed').log('not printed').setLogLevel('log').clear();
 * log().tryToLogToParent().log('hooray times two').tryToLogToParent(false);
 */
export function log(){
	if(
		(typeof window.console?.log === 'function')
		&& (LOG_LEVELS.indexOf(LOG_LEVEL) <= LOG_LEVELS.indexOf('log'))
	){
		Array.from(arguments).forEach(obj => {
			if( (obj  === true) || (obj === false) ){
				obj = obj ? 'true' : 'false';
			}

			if( TRY_TO_LOG_TO_PARENT ){
				parent.console.log(obj);
			} else {
				console.log(obj);
			}
		});
	}

	return LOG_CHAINABLE_OBJECT;
}



/**
 * @namespace Logging:warn
 */

/**
 * Logs a warning to the console. Prevents errors in browsers, that don't support this feature.
 *
 * @param {...*} [...] - add any number of arguments you wish to log
 *
 * @memberof Logging:warn
 * @alias warn
 * @example
 * warn('warning yo!');
 * warn(randomVar, 'string');
 * warn(false);
 * warn(true);
 */
export function warn(){
	if(
		(typeof window.console?.warn === 'function')
		&& (LOG_LEVELS.indexOf(LOG_LEVEL) <= LOG_LEVELS.indexOf('warn'))
	){
		Array.from(arguments).forEach(obj => {
			if( (obj  === true) || (obj === false) ){
				obj = obj ? 'true' : 'false';
			}

			if( TRY_TO_LOG_TO_PARENT ){
				parent.console.warn(obj);
			} else {
				console.warn(obj);
			}
		});
	}

	return LOG_CHAINABLE_OBJECT;
}



/**
 * @namespace Logging:err
 */

/**
 * Logs an error to the console. Prevents errors in browsers, that don't support this feature.
 *
 * This function is not named error because that already might be misleading with the Error object and is not a verb.
 *
 * @param {...*} [...] - add any number of arguments you wish to log
 *
 * @memberof Logging:err
 * @alias err
 * @example
 * err('error yo!');
 * err(randomVar, 'string');
 * err(false);
 * err(true);
 */
export function err(){
	if(
		(typeof window.console?.error === 'function')
		&& (LOG_LEVELS.indexOf(LOG_LEVEL) <= LOG_LEVELS.indexOf('err'))
	){
		Array.from(arguments).forEach(obj => {
			if( (obj  === true) || (obj === false) ){
				obj = obj ? 'true' : 'false';
			}

			if( TRY_TO_LOG_TO_PARENT ){
				parent.console.error(obj);
			} else {
				console.error(obj);
			}
		});
	}

	return LOG_CHAINABLE_OBJECT;
}



/**
 * @namespace Logging:xlog
 */

/**
 * X marks the spot. A very simple method for urgent cases of printf-debugging.
 * Simply logs the context of the call to the console, also providing a counter,
 * counting the executions from that context.
 *
 * For real detailed debugging, you have to instantiate/throw an error and work with that information,
 * this is just for quick checking.
 *
 * This method uses Error.stack, which is a rather wonky and unstable feature feature. Use this for debugging and better
 * remove it again afterwards. For more info on Error.stack, read:
 * https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
 *
 * @param {?String} [message=null] - an optional message to be printed besides the context information
 *
 * @memberof Logging:xlog
 * @alias xlog
 * @example
 * for( let i = 0; i < 10; i++ ){
 *   xlog('purely optional message');
 * }
 */
export function xlog(message=null){
	let context;

	try {
		context = (new Error()).stack.split('\n')[2].trim();
	} catch(ex){
		context = 'anonymous';
	}

	if( XLOG_CONTEXT_COUNTS[context] === undefined ){
		XLOG_CONTEXT_COUNTS[context] = 0;
	}
	XLOG_CONTEXT_COUNTS[context]++;

	log(`<<XLOG>> ${context} [${XLOG_CONTEXT_COUNTS[context]}]${!!message ? ' | '+message : ''}`);
}
