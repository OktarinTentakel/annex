/*!
 * Module Basic
 */

/**
 * @namespace Basic
 */

const MODULE_NAME = 'Basic';



//###[ IMPORTS ]########################################################################################################

import {log, warn} from './logging.js';



//###[ EXPORTS ]########################################################################################################

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
 * @throws error if closure is not a function
 * @returns {Boolean} true if no exception occurred
 *
 * @memberof Basic:attempt
 * @alias attempt
 * @example
 * if( !attempt(function(){ foobar(); }) ){ console.log('foobar cannot be executed!'); }
 */
export function attempt(closure){
	assert(isFunction(closure), `${MODULE_NAME}:attempt | closure is no function`);

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
		res &&= ((value !== undefined) && (value !== null));
	});

	return res;
}



/**
 * @namespace Basic:size
 */

/**
 * Determine the (value) size of a collection.
 *
 * A collection is an object with countable values:
 * - Arrays return their length
 * - Sets and Maps return their size
 * - Strings return their (character) length
 * - Iterators return the length of their value list
 * - Objects return the length of their value list
 * - any object implementing .values() returns the length of the returned value list
 *
 * @param {Object|Array|Set|Map|String|Iterable} target - a collection to determine the (value) size of
 * @param {?Boolean} [countStringCharacters=true] - if we want to determine the length of a string, we'd normally like to count actual characters, but length normally returns the technical length counting more than one for unicode chars, set this to "false" to use technical length instead of characters
 * @returns {Number|null} the size of the collection or null if no size could be determined
 *
 * @memberof Basic:size
 * @alias size
 * @example
 * size('日本国💩👻');
 * => 5
 * size('日本国💩👻', false);
 * => 7
 * size({a : 1, b : new Date(), c : [1, 2, 3]});
 * => 3
 * size(['test', 'test', 'test']);
 * => 3
 * size(new Set(['test1', 'test2', 'test3']));
 * => 3
 * size(new Set(['test1', 'test2', 'test3']).values());
 * => 3
 * size(new Map([[1, 1], [new Date(), new Date()], ['foo', 'bar']]));
 * => 3
 * size(new Map([[1, 1], [new Date(), new Date()], ['foo', 'bar']]).values());
 * => 3
 * size(null);
 * => null
 * size(undefined);
 * => null
 */
export function size(target, countStringCharacters=true){
	if( isFunction(target?.values) ) return Array.from(target.values()).length;

	let res;
	switch( getType(target) ){
		case 'array':
			res = target.length;
		break;

		case 'set':
		case 'map':
			res = target.size;
		break;

		case 'iterator':
			res = Array.from(target).length;
		break;

		case 'string':
			// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#description
			res = countStringCharacters ? [...target].length : target.length;
		break;

		case 'object':
			res = Object.values(target).length;
		break;

		default:
			res = null;
		break;
	}

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
 * @returns {Boolean} variable(s) is/are empty
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
		if( isArray(obj?.__additionalEmptyValues__) ){
			emptyValues = emptyValues.concat(obj.__additionalEmptyValues__);
		}
	});
	emptyValues = Array.from(new Set(emptyValues));

	Array.from(arguments).forEach(obj => {
		if( res && !isArray(obj?.__additionalEmptyValues__) ){
			res = emptyValues.includes(obj);

			if( !res ){
				res = (size(obj) === 0);
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
	memberNames = orDefault(memberNames, [], 'arr');
	verbose = orDefault(verbose, false, 'bool');

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
 * If an expression returns a non-value (undefined or null), use the default value instead.
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
			!isFunction(caster)
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
		} else if( !isFunction(caster) ){
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
 * useful frontend types like "htmldocument", "htmlelement", "htmlcollection" and "nodelist"
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
 * - "iterator"
 * - "regexp"
 * - "set"
 * - "weakset"
 * - "map"
 * - "weakmap"
 * - "htmldocument"
 * - "htmlelement"
 * - "htmlcollection"
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
	if( /^.*iterator$/.test(deepType) ) return 'iterator';

	return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol|set|weakset|map|weakmap|htmldocument|htmlcollection|nodelist|window)$/)
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
			'iterator',
			'regexp',
			'set',
			'weakset',
			'map',
			'weakmap',
			'htmldocument',
			'htmlelement',
			'htmlcollection',
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
 * @namespace Basic:isBoolean
 */

/**
 * Returns if a value is a boolean value.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a boolean
 *
 * @memberof Basic:isBoolean
 * @alias isBoolean
 * @example
 * if( isBoolean(val) ){
 *   console.log('val must be either true or false');
 * }
 */
export function isBoolean(value){
	return isA(value, 'boolean');
}



/**
 * @namespace Basic:isNumber
 */

/**
 * Returns if a value is a number.
 *
 * Hint: to check numbers in more detail, use isInt, isFloat and isNaN
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a number
 *
 * @memberof Basic:isNumber
 * @alias isNumber
 * @see isInt
 * @see isFloat
 * @see isNaN
 * @example
 * if( isNumber(val) ){
 *   result = val * 5;
 * }
 */
export function isNumber(value){
	return isA(value, 'number');
}



/**
 * @namespace Basic:isBigInt
 */

/**
 * Returns if a value is a BigInt value.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a BigInt
 *
 * @memberof Basic:isBigInt
 * @alias isBigInt
 * @example
 * if( isBigInt(val) ){
 *   console.log('this is a really huge number!');
 * }
 */
export function isBigInt(value){
	return isA(value, 'bigint');
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
 * @namespace Basic:isString
 */

/**
 * Returns if a value is a string.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a string
 *
 * @memberof Basic:isString
 * @alias isString
 * @example
 * if( isString(val) ){
 *   return prefix+val;
 * }
 */
export function isString(value){
	return isA(value, 'string');
}



/**
 * @namespace Basic:isSymbol
 */

/**
 * Returns if a value is a symbol.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a symbol
 *
 * @memberof Basic:isSymbol
 * @alias isSymbol
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
 * @example
 * if( isSymbol(val) ){
 *   return val.description;
 * }
 */
export function isSymbol(value){
	return isA(value, 'symbol');
}



/**
 * @namespace Basic:isFunction
 */

/**
 * Returns if a value is a function.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a function
 *
 * @memberof Basic:isFunction
 * @alias isFunction
 * @example
 * if( isFunction(val) ){
 *   val();
 * }
 */
export function isFunction(value){
	return isA(value, 'function');
}



/**
 * @namespace Basic:isObject
 */

/**
 * Returns if a value is an object.
 *
 * Hint: if you explicitly want to check for a plain object, use isPlainObject
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is an object
 *
 * @memberof Basic:isObject
 * @alias isObject
 * @see isPlainObject
 * @example
 * if( isObject(val) ){
 *   val.newProperty = 'foobar';
 * }
 */
export function isObject(value){
	return isA(value, 'object');
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
 * Be aware that this function cannot differentiate between constructor-based simple objects and
 * plain objects declared inline. So, if someone took on the work to instantiate a base object and assign
 * properties either in a function or a constructor, we accept that as a plain object.
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
	return isObject(value)
		&& hasValue(value)
		&& (value.constructor === Object)
		&& Object.prototype.toString.call(value) === '[object Object]'
	;
}



/**
 * @namespace Basic:isArray
 */

/**
 * Returns if a value is an array.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is an array
 *
 * @memberof Basic:isArray
 * @alias isArray
 * @example
 * if( isArray(val) ){
 *   val.push('foobar');
 * }
 */
export function isArray(value){
	return isA(value, 'array');
}



/**
 * @namespace Basic:isDate
 */

/**
 * Returns if a value is a date.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a date
 *
 * @memberof Basic:isDate
 * @alias isDate
 * @example
 * if( isDate(val) ){
 *   return val.toISOString();
 * }
 */
export function isDate(value){
	return isA(value, 'date');
}



/**
 * @namespace Basic:isError
 */

/**
 * Returns if a value is an error.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is an error
 *
 * @memberof Basic:isError
 * @alias isError
 * @example
 * if( isError(val) ){
 *   return val.message;
 * }
 */
export function isError(value){
	return isA(value, 'error');
}



/**
 * @namespace Basic:isGenerator
 */

/**
 * Returns if a value is a generator.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a generator
 *
 * @memberof Basic:isGenerator
 * @alias isGenerator
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
 * @example
 * if( isGenerator(val) ){
 *   return val.return(val.next().value);
 * }
 */
export function isGenerator(value){
	return isA(value, 'generator');
}



/**
 * @namespace Basic:isIterator
 */

/**
 * Returns if a value is an iterator.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is an iterator
 *
 * @memberof Basic:isIterator
 * @alias isIterator
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator
 * @example
 * if( isIterator(val) ){
 *   return val.next().value;
 * }
 */
export function isIterator(value){
	return isA(value, 'iterator');
}



/**
 * @namespace Basic:isRegExp
 */

/**
 * Returns if a value is a regular expression.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a regular expression
 *
 * @memberof Basic:isRegExp
 * @alias isRegExp
 * @example
 * if( isRegExp(val) ){
 *   return val.test('foobar');
 * }
 */
export function isRegExp(value){
	return isA(value, 'regexp');
}



/**
 * @namespace Basic:isSet
 */

/**
 * Returns if a value is a set.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a set
 *
 * @memberof Basic:isSet
 * @alias isSet
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 * @example
 * if( isSet(val) ){
 *   return val.has('foobar');
 * }
 */
export function isSet(value){
	return isA(value, 'set');
}



/**
 * @namespace Basic:isWeakSet
 */

/**
 * Returns if a value is a weak set.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a weak set
 *
 * @memberof Basic:isWeakSet
 * @alias isWeakSet
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
 * @example
 * if( isWeakSet(val) ){
 *   return val.has(someSymbol);
 * }
 */
export function isWeakSet(value){
	return isA(value, 'weakset');
}



/**
 * @namespace Basic:isMap
 */

/**
 * Returns if a value is a map.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a map
 *
 * @memberof Basic:isMap
 * @alias isMap
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 * @example
 * if( isMap(val) ){
 *   return val.get('foobar');
 * }
 */
export function isMap(value){
	return isA(value, 'map');
}



/**
 * @namespace Basic:isWeakMap
 */

/**
 * Returns if a value is a weak map.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a weak map
 *
 * @memberof Basic:isWeakMap
 * @alias isWeakMap
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
 * @example
 * if( isWeakMap(val) ){
 *   return val.get('foobar');
 * }
 */
export function isWeakMap(value){
	return isA(value, 'weakmap');
}



/**
 * @namespace Basic:isDocument
 */

/**
 * Returns if a value is an HTML document.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is an HTML document
 *
 * @memberof Basic:isDocument
 * @alias isDocument
 * @example
 * if( isDocument(val) ){
 *   return val.body;
 * }
 */
export function isDocument(value){
	return isA(value, 'htmldocument');
}



/**
 * @namespace Basic:isElement
 */

/**
 * Returns if a value is an HTML element.
 * Be aware, that this explicitly means an element, not necessarily any node.
 * So text nodes, comments and such do not qualify.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is an HTML element
 *
 * @memberof Basic:isElement
 * @alias isElement
 * @example
 * if( isElement(target) ){
 *   target.classList.add('foo');
 * }
 */
export function isElement(value){
	return isA(value, 'htmlelement');
}



/**
 * @namespace Basic:isCollection
 */

/**
 * Returns if a value is a collection of html elements.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a collection of html elements
 *
 * @memberof Basic:isCollection
 * @alias isCollection
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
 * @example
 * if( isCollection(val) ){
 *   return val.item(0);
 * }
 */
export function isCollection(value){
	return isA(value, 'htmlcollection');
}



/**
 * @namespace Basic:isNodeList
 */

/**
 * Returns if a value is a node list.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a node list
 *
 * @memberof Basic:isNodeList
 * @alias isNodeList
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
 * @example
 * if( isNodeList(val) ){
 *   return val.item(0);
 * }
 */
export function isNodeList(value){
	return isA(value, 'nodelist');
}



/**
 * @namespace Basic:isWindow
 */

/**
 * Returns if a value is a window.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a window
 *
 * @memberof Basic:isWindow
 * @alias isWindow
 * @example
 * if( isWindow(val) ){
 *   return val.location.origin;
 * }
 */
export function isWindow(value){
	return isA(value, 'window');
}



/**
 * @namespace Basic:isEventTarget
 */

/**
 * Returns if a value is an EventTarget, which means that it is able to dispatch and receive events.
 * This is determined via duck-typing and not via class inheritance check, since this method is not
 * about type-safety, but the question if we can use the target for events, which is simply determined
 * by three essential object methods: addEventListener, removeEventListener and dispatchEvent. All
 * objects supporting these are fine with us.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value supports event methods
 *
 * @memberof Basic:isEventTarget
 * @alias isEventTarget
 * @example
 * if( isEventTarget(target) ){
 *   target.dispatchEvent(new CustomEvent('foobar'));
 * }
 */
export function isEventTarget(value){
	return hasValue(value)
		&& isFunction(value.addEventListener)
		&& isFunction(value.removeEventListener)
		&& isFunction(value.dispatchEvent)
	;
}



/**
 * @namespace Basic:isSelector
 */

/**
 * Returns if a value is a valid selector, usable in methods such as querySelector
 * and querySelectorAll.
 *
 * @param {*} value - the value to check
 * @returns {Boolean} true if value is a valid selector
 *
 * @memberof Basic:isSelector
 * @alias isSelector
 * @example
 * if( isSelector(selector) ){
 *   document.querySelector(selector)?.style.setProperty('color', 'red');
 * }
 */
export function isSelector(value){
	// almost all values like "null", "undefined" and "NaN" are accepted querySelectors, numbers are not
	value = orDefault(value, 0, 'str');

	const fragment = document.createDocumentFragment();

	try {
		fragment.querySelector(value);
	} catch(ex){
		return false;
	}

	return true;
}



/**
 * @namespace Basic:isPotentialId
 */

/**
 * Determines if a given value is potentially a valid id for something, because it matches a format of given
 * prefix, postfix and id regex. "Potential", because we can only assume by the format, we do not actually know
 * if the id really matches anything like a database entry for example.
 *
 * @param {(String|Number)} value - the value to test, will be stringified
 * @param {?String} [prefix=''] - a prefix for the id
 * @param {?String} [idRex='[1-9][0-9]*'] - the regex string to use to identify the id part of the value
 * @param {?String} [postfix=''] - a postfix for the id
 * @param {?Boolean} [maskFixes=true] - usually, prefixes are not treated as regexes and are automatically masked, if you'd like to define complex pre- and postfixes using regexes, set this to false
 * @returns {String|Boolean} if value is potential id according to format, the id is returned as a string (still usable as a truthy value), otherwise the return value is false
 *
 * @memberof Basic:isPotentialId
 * @alias isPotentialId
 * @example
 * if( isPotentialId(id, 'test_(', '[0-9]+', ')') ){
 *   createJsonRequest(`/backend/${id}`).then(() => { alert('done'); });
 * }
 */
export function isPotentialId(value, prefix='', idRex='[1-9][0-9]*', postfix='', maskFixes=true){
	value = `${value}`;
	prefix = orDefault(prefix, '', 'str');
	idRex = orDefault(idRex, '[1-9][0-9]*', 'str');
	postfix = orDefault(postfix, '', 'str');
	maskFixes = orDefault(maskFixes, true, 'bool');

	const mask = str => `${str}`.replace(/([\-\[\]\/{}()*+?.\\^$|])/g, "\\$&");

	let rex;
	if( maskFixes ){
		rex = new RegExp(`^${mask(prefix)}(${idRex})${mask(postfix)}$`);
	} else {
		rex = new RegExp(`^${prefix}(${idRex})${postfix}$`);
	}

	const matches = rex.exec(value);
	return hasValue(matches) ? matches[1] : false;
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
 * @typedef Deferred
 * @type {Object}
 * @property {Promise} promise - the wrapped promise
 * @property {Function} resolve - resolves the wrapped promise with given value
 * @property {Function} reject - rejects the wrapped promise with given error
 * @property {Function} then - defines a success handler for the wrapped promise and returns its result
 * @property {Function} catch - defines an error handler for the wrapped promise and returns its result
 * @property {Function} finally - defines a "settled" handler for the wrapped promise and returns its result
 * @property {String} status - holds the current resolution status, can either be "pending", "fulfilled" or "rejected"
 * @property {Function} isSettled - returns true, if the Deferred is either "fulfilled" or "rejected"
 * @property {?*} [provision=null] - may contain (a) provisional value(s) to use for a newly instantiated Deferred, before it has resolved to the actual value(s)
 */

/**
 * Class that wraps a Promise, to allow resolving and rejecting outside the
 * Promise's function scope. This allows for decoupled handling of states and
 * handling promises as references in a distributed context, like a class, where
 * a Deferred might then represent an async state.
 *
 * Deferreds also provide accessible status information, normal Promises do not have.
 * Accessing the "status" property returns the current status, being either "pending",
 * "fulfilled" or "rejected". You may also check if the Deferred has been settled via
 * "isSettled()". If you want to provide a preliminary result, available before the
 * promise has settled, you may set this result as a payload using the "provision" property.
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
 * doStuff.provision = 'provisional value';
 * doStuff
 *   .then(value => { alert(`yeah, ready with "${value}"!`); })
 *   .catch(error => { console.error(error); })
 *   .finally(() => { console.info('has been settled); })
 * ;
 * if( foobar === 42 ){
 *   doStuff.resolve(42);
 * } else {
 *   doStuff.reject(new Error('not 42!'));
 * }
 * console.info(doStuff.status);
 */
export class Deferred {
	constructor(){
		const
			STATUS_PENDING = 'pending',
			STATUS_FULFILLED = 'fulfilled',
			STATUS_REJECTED = 'rejected'
		;
		this.resolve = null;
		this.reject = null;
		this.provision = null;
		this.status = STATUS_PENDING;
		this.isSettled = () => [STATUS_FULFILLED, STATUS_REJECTED].includes(this.status);
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolution => {
				this.status = STATUS_FULFILLED;
				resolve(resolution);
			};
			this.reject = rejection => {
				this.status = STATUS_REJECTED;
				reject(rejection);
			};
		});
	}

	then(f){
		return this.promise.then(f);
	}

	catch(f){
		return this.promise.catch(f);
	}

	finally(f){
		return this.promise.finally(f);
	}
}



/**
 * @namespace Basic:Observable
 */

/**
 * @typedef Observable
 * @type {Object}
 * @property {Function} getValue - returns the current value
 * @property {Function} setValue - sets a new value, which will subsequently trigger all subscriptions
 * @property {Function} subscribe - register a given function to be executed on any value change, the subscription receives the new and the old value on each execution, returns the subscription value, which can later be used to unsubscribe again
 * @property {Function} unsubscribe - removes a given subscription again, use subscription value returned by subscribe here
 */

/**
 * A class offering the bare minimum feature set to observe a value and subscribe to future value changes.
 * No automatic magic going on here, this simply follows a basic subscription pattern, where each subscription is
 * a function, being called with a newly set value. This closely resembles the kind of observables knockout is using.
 *
 * @memberof Basic:Observable
 * @name Observable
 * @example
 * const status = new Observable('ok');
 * const subscription = status.subscribe(s => {
 *     console.log(`status changed to: ${s}`);
 * });
 * status.setValue('oh noez');
 * status.unsubscribe(subscription);
 */
export class Observable {
	constructor(initialValue){
		this.__className__ = 'Observable';
		this._value = initialValue;
		this._subscriptions = [];
	}

	getValue(){
		return this._value;
	}

	setValue(newValue, force=false){
		const
			oldValue = this._value,
			isNewValue = oldValue !== newValue
		;
		this._value = newValue;
		if( isNewValue || force ){
			this._subscriptions.forEach(s => s(newValue, oldValue));
		}
	}

	subscribe(subscription){
		const __methodName__ = 'subscribe';
		assert(isFunction(subscription), `${MODULE_NAME}:${this.__className__}.${__methodName__} | subscription must be function`);
		if( this._subscriptions.indexOf(subscription) < 0 ){
			this._subscriptions = [...this._subscriptions, subscription];
		}
		return subscription;
	}

	unsubscribe(subscription){
		this._subscriptions = this._subscriptions.filter(s => s !== subscription);
	}

	toString(){
		return `${this._value}`;
	}
}
