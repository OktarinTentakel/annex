/*!
 * Module Basic
 */

/**
 * @namespace Basic
 */

const MODULE_NAME = 'Basic';



import {log, warn} from './logging.js';



/**
 * @namespace Basic:assert
 */

/**
 * Classical assert method. If condition is falsy, throw assert exception.
 *
 * @param {Boolean} condition - defines if an assertion is successful
 * @param {?String} [message='assert exception: assertion failed'] - to display if assertion fails
 * @throws assert exception
 *
 * @memberof Basic:assert
 * @alias assert
 * @example
 * function set(name, value){
 *   assert(name.length > 0);
 *   assert(isPlainObject(value), 'error: value must be plain object');
 *   ...
 * }
 */
export function assert(condition, message){
	if( !condition ){
		message = orDefault(message, 'assert exception: assertion failed', 'str');
		throw new Error(message);
	}
}



/**
 * @namespace Basic:attempt
 */

/**
 * Attempt to compute contents of closure and catch all occurring exceptions.
 * The boolean result tells you if the operation was successful or not.
 *
 * This is most helpful, when used to test value conversions or other atomic/singluar operations, where it
 * just is important if something isolated works or not.
 *
 * Do not encapsulate complex code in the closure and mind recursively occurring exceptions!
 *
 * @param {Function} closure - the code to test
 * @throws error is closure is not a function
 * @returns {Boolean} true if no exception occurred
 *
 * @memberof Basic:attempt
 * @alias attempt
 * @example
 * if( !attempt(function(){ foobar(); }) ){ log('foobar cannot be executed!'); }
 */
export function attempt(closure){
	assert(isA(closure, 'function'), `${MODULE_NAME}:attempt | closure is no function`);

	try {
		closure();
	} catch(ex){
		return false;
	}

	return true;
}



/**
 * @namespace Basic:hasValue
 */

/**
 * Check if variable(s) is set, by being neither undefined nor null.
 *
 * @param {...*} [...] - add any number of variables you wish to check
 * @returns {Boolean} variable(s) is/are set
 *
 * @memberof Basic:hasValue
 * @alias hasValue
 * @example
 * function set(name, value){
 *   if( hasValue(name, value) ){
 *     ...
 *   }
 * }
 */
export function hasValue(){
	let res = true;

	Array.from(arguments).forEach(value => {
		res = res && ((value !== undefined) && (value !== null));
	});

	return res;
}



/**
 * @namespace Basic:isEmpty
 */

/**
 * Check if variable(s) contain non-empty value
 * (not undefined, null, '', 0, [], {} or an empty Set/Map).
 *
 * You can supply additional non-empty values by providing an object having the key "__additionalEmptyValues__" as
 * any single parameter. Multiple occurrences will be merged.
 *
 * @param {...*} [...] - add any number of variables you wish to check
 * @returns {Boolean} variable(s) is/are non-empty
 *
 * @memberof Basic:isEmpty
 * @alias isEmpty
 * @example
 * function set(name, value){
 *   if( isEmpty(fooBar) || isEmpty({'__additionalEmptyValues__' : [false, '0']}, someArray, someSet, someString, value) ){
 *     ...
 *   }
 * }
 */
export function isEmpty(){
	let
		res = true,
		emptyValues = [undefined, null, '', 0]
	;

	Array.from(arguments).forEach(obj => {
		if( isA(obj?.__additionalEmptyValues__, 'array') ){
			emptyValues = emptyValues.concat(obj.__additionalEmptyValues__);
		}
	});
	emptyValues = Array.from(new Set(emptyValues));

	Array.from(arguments).forEach(obj => {
		if( res && !isA(obj?.__additionalEmptyValues__, 'array') ){
			res = emptyValues.includes(obj);

			if( !res ){
				if( isA(obj, 'array') ){
					res = (obj.length === 0);
				} else if( isA(obj, 'object') ){
					res = Object.keys(obj).length === 0;
				} else if( isA(obj, 'set') || isA(obj, 'map') ){
					res = (obj.size === 0);
				}
			}
		}
	});

	return res;
}



/**
 * @namespace Basic:hasMembers
 */

/**
 * "Validates" an object in a very basic way by checking if all given members are present and are not nullish.
 *
 * @param {Object} obj - the object to check
 * @param {String[]} memberNames - the names of the members to check
 * @param {Boolean} [verbose=false] - defines if method should output missing members to console
 * @returns {Boolean} all memberNames present and not nullish
 *
 * @memberof Basic:hasMembers
 * @alias hasMembers
 * @example
 * function pat(kitten){
 *   if( hasMembers(kitten, ['fluff', 'meow', 'scratch']) ){
 *     ...
 *   }
 * }
 */
export function hasMembers(obj, memberNames, verbose=false){
	verbose = orDefault(verbose, false, 'bool');
	memberNames = orDefault(memberNames, [], 'arr');

	let res = true;

	memberNames.forEach(memberName => {
		if( !hasValue(obj[`${memberName}`]) ){
			if( verbose ){
				log().info(`${MODULE_NAME}:hasMembers | missing member ${memberName}`);
			}

			res = false;
		}
	});

	return res;
}



/**
 * @namespace Basic:orDefault
 */

/**
 * If an expression returns an "empty" value, use the default value instead.
 * Define a caster name, to force expression result/value into certain data type.
 *
 * @param {*} expression - the expression to evaluate
 * @param {*} defaultValue - the default value to use if the expression is considered empty
 * @param {?(String|Function)} [caster=null] - either a default caster by name ('str', 'string', 'int', 'integer', 'bool', 'boolean', 'float', 'arr', 'array') or a function getting the value and returning the transformed value
 * @param {?Array} [additionalEmptyValues=null] - if set, provides a list of additional values to be considered empty, apart from undefined and null
 * @returns {*} expression of defaultValue
 *
 * @memberof Basic:orDefault
 * @alias orDefault
 * @example
 * function set(name, value){
 *   name = orDefault(name, 'kittens!', 'string', ['', 'none']);
 *   value = orDefault(value, 42, 'int');
 * }
 */
export function orDefault(expression, defaultValue, caster=null, additionalEmptyValues=null){
	if( hasValue(additionalEmptyValues) ){
		additionalEmptyValues = [].concat(additionalEmptyValues);
	} else {
		additionalEmptyValues = [];
	}

	if( hasValue(caster) ){
		if(
			!isA(caster, 'function')
			&& ([
				'str', 'string',
				'int', 'integer',
				'bool', 'boolean',
				'float',
				'arr', 'array'
			].includes(`${caster.toLowerCase()}`))
		){
			caster = `${caster}`.toLowerCase();

			if( ['str', 'string'].includes(caster) ){
				caster = function(value){ return `${value}`; };
			} else if( ['int', 'integer'].includes(caster) ){
				caster = function(value){ return parseInt(value, 10); };
			} else if( ['bool', 'boolean'].includes(caster) ){
				caster = function(value){ return !!value; };
			} else if( caster === 'float' ){
				caster = function(value){ return parseFloat(value); };
			} else if( ['arr', 'array'].includes(caster) ){
				caster = function(value){ return [].concat(value); };
			}
		} else if( !isA(caster, 'function') ){
			caster = function(value){ return value; };
		}
	} else {
		caster = function(value){ return value; };
	}

	if( !hasValue(expression) || (additionalEmptyValues.includes(expression)) ){
		return defaultValue;
	} else {
		return caster(expression);
	}
}



/**
 * @namespace Basic:getType
 */

/**
 * Prod-ready type detection for values, expanding on flawed typeof functionality, roughly following
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof, but expanding on
 * useful frontend types like "htmldocument", "htmlelement" and "nodelist"
 *
 * Types:
 * - "undefined"
 * - "null"
 * - "boolean"
 * - "number"
 * - "bigint"
 * - "string"
 * - "symbol"
 * - "function"
 * - "object"
 * - "array"
 * - "date"
 * - "error"
 * - "generator"
 * - "regexp"
 * - "set"
 * - "weakset"
 * - "map"
 * - "weakmap"
 * - "htmldocument"
 * - "htmlelement"
 * - "nodelist"
 * - "window"
 *
 * @param {*} [value] - variable to check the type of
 * @returns {String} the value type in lower case
 *
 * @memberof Basic:getType
 * @alias getType
 * @example
 * if( getType(cb) === 'function' ){
 *     ...
 * }
 */
export function getType(value) {
	if( !hasValue(value) ) return `${value}`.toLowerCase();

	const deepType = Object.prototype.toString.call(value).slice(8,-1).toLowerCase();

	if( deepType === 'generatorfunction' ) return 'function';
	if( deepType === 'document' ) return 'htmldocument';
	if( deepType === 'element' ) return 'htmlelement';
	if( /^html.*element$/.test(deepType) ) return 'htmlelement';

	return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol|set|weakset|map|weakmap|htmldocument|nodelist|window)$/)
		? deepType
		: ((typeof value === 'object') || (typeof value === 'function')) ? 'object' : typeof value
	;
}



/**
 * @namespace Basic:isA
 */

/**
 * Short form of "getType"-method with a more compact syntax.
 * Can identify all types listed in getType.
 *
 * @param {*} value - variable to check the type of
 * @param {String} type - the name of the type to check for, has to be a standard JS-type, is case insensitive
 * @returns {Boolean} target has type
 *
 * @memberof Basic:isA
 * @alias isA
 * @see getType
 * @example
 * let stringBool = (isA(test, 'boolean') && test) ? 'true' : 'false';
 */
export function isA(value, type){
	if(
		[
			'undefined',
			'null',
			'boolean',
			'number',
			'bigint',
			'string',
			'symbol',
			'function',
			'object',
			'array',
			'date',
			'error',
			'generator',
			'regexp',
			'set',
			'weakset',
			'map',
			'weakmap',
			'htmldocument',
			'htmlelement',
			'nodelist',
			'window'
		].includes(`${type}`.toLowerCase())
	){
		return getType(value) === `${type}`.toLowerCase();
	} else {
		warn(`${MODULE_NAME}:isA | "${type}" is not a recognized type`);
		return false;
	}
}



/**
 * @namespace Basic:isInt
 */

/**
 * Returns if a value is truly a real integer value and not just an int-parsable value for example.
 * Since JS only knows the data type "number" all numbers are usable as floats by default, but not the
 * other way round.
 *
 * @param {*} intVal - the value the check
 * @returns {Boolean} true if intVal is a true integer value
 *
 * @memberof Basic:isInt
 * @alias isInt
 * @example
 * if( !isInt(val) ){
 *   val = parseInt(val, 10);
 * }
 */
export function isInt(intVal){
	return parseInt(intVal, 10) === intVal;
}



/**
 * @namespace Basic:isFloat
 */

/**
 * Returns if a value is a numeric value, usable as a float number in any calculation.
 * Any number that fulfills isInt, is also considered a valid float, which lies in JS's
 * nature of not differentiating ints and floats by putting them both into a "number"-type.
 * So ints are always floats, but not necessarily the other way round.
 *
 * @param {*} floatVal - the value to check
 * @returns {Boolean} true if floatVal is usable in a float context
 *
 * @memberof Basic:isFloat
 * @alias isFloat
 * @example
 * if( !isFloat(val) ){
 *   alert('val can not be calculated with!');
 * }
 */
export function isFloat(floatVal){
	return parseFloat(floatVal) === floatVal;
}



/**
 * @namespace Basic:isPlainObject
 */

/**
 * Returns if a value is an object literal, so so-called "plain object.
 * A plain object is something like "{hello : 'world'}".
 *
 * This might especially be helpful when dealing with JSON configs, so quickly check if
 * something might even be parsed JSON (which in most cases is a plain object in js).
 *
 * Be aware that this function cannot differentiate between contructor based simple objects and
 * plain objects declared inline. So, if someone took on the work to instantiate a base object and assign
 * properties either in a function or a contructor, we accept that as a plain object.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value seems to be a plain object
 *
 * @memberof Basic:isPlainObject
 * @alias isPlainObject
 * @example
 * const isParameterConfigObject = isPlainObject(param);
 */
export function isPlainObject(value){
	return isA(value, 'object')
		&& hasValue(value)
		&& (value.constructor === Object)
		&& Object.prototype.toString.call(value) === '[object Object]'
	;
}



/**
 * @namespace Basic:isNaN
 */

/**
 * Returns if an expression is NaN or not.
 * This method employs two different approaches:
 * By default it really checks if the expression is the _value_ NaN or not, this being a valid JS-value for something.
 * In JS this gets checked by comparing an expression with itself on identity, since NaN is the only value not being
 * identical to itself. If you set checkForIdentity to false, this method will use the standard JS-isNaN, which
 * inspects the expression, tries to cast or parse a number from it and returns the result.
 *
 * @param {*} expression - the expression to check
 * @param {Boolean} [checkForIdentity=true] - set to false if you want to use default JS-functionality
 * @returns {Boolean} true if expression is NaN
 *
 * @memberof Basic:isNaN
 * @alias isNaN
 * @example
 * if( !isNaN(suspiciousCalculatedValue) ){
 *   return suspiciousCalculatedValue * 3;
 * }
 */
export function isNaN(expression, checkForIdentity=true){
	checkForIdentity = orDefault(checkForIdentity, true, 'bool');

	if( checkForIdentity ){
		return expression !== expression;
	} else {
		return isNaN(expression);
	}
}



/**
 * @namespace Basic:minMax
 */

/**
 * Checks if a value is within bounds of a minimum and maximum and returns
 * the value or the upper or lower bound respectively.
 *
 * Accepts all values comparable with > and <.
 *
 * @param {*} min - the lower bound
 * @param {*} value - the value to check
 * @param {*} max - the upper bound
 * @throws error if min is not smaller than max
 * @returns {*} value, min or max
 *
 * @memberof Basic:minMax
 * @alias minMax
 * @example
 * let croppedVal = minMax(-100, value, 100);
 */
export function minMax(min, value, max){
	assert(min <= max, `${MODULE_NAME}:minMax | min can not be larger than max`);

	return (value < min)
		? min
		: (
			(value > max)
				? max
				: value
		)
	;
}



/**
 * @namespace Basic:Deferred
 */

/**
 * Class that wraps a Promise, to allow resolving and rejecting outside of the
 * Promise's function scope. This allows for decoupled handling of states and
 * handling promises as references in a distributed context, like a class, where
 * a Deferred might then represent an async state.
 *
 * This follows ideas by jQuery and Q Promises:
 * - https://api.jquery.com/jQuery.Deferred/
 * - https://github.com/kriskowal/q/wiki/Coming-from-jQuery#deferreds-promises-resolvers
 *
 * Keep in mind, that Promises might need a polyfill such as core-js.
 *
 * @memberof Basic:Deferred
 * @name Deferred
 * @example
 * const doStuff = new Deferred();
 * doStuff.then(value => { alert(`yeah, ready with "${value}"!`); }).catch(err => { console.error(err); });
 * ...
 * if( foobar === 42 ){
 *   doStuff.resolve(42);
 * } else {
 *   doStuff.reject(new Error('not 42!'));
 * }
 */
export class Deferred {
	constructor(){
		this.resolve = null;
		this.reject = null;
		this.promise = new Promise((res, rej) => {
			this.resolve = res;
			this.reject = rej;
		});
	}

	then(f){
		return this.promise.then(f);
	}

	catch(f){
		return this.promise.catch(f);
	}
}
