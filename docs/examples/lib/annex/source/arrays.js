/*!
 * Module Arrays
 */

/**
 * @namespace Arrays
 */

const MODULE_NAME = 'Arrays';



//###[ IMPORTS ]########################################################################################################

import {
	assert,
	isArray,
	isNumber,
	isString,
	isMap,
	isSet,
	isPlainObject,
	orDefault,
} from './basic.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Arrays:removeFrom
 */

/**
 * Removes Elements from an Array.
 *
 * Does not modify the original.
 *
 * This function supports multiple parameter overrides, the most simple one being numerical "from" and "to",
 * to remove an index-based part of the array. "from" and "to" are inclusive in that case.
 * If you only provide "from", that exact index is removed.
 *
 * Keep in mind that "from" has to reference an element physically before "to", since we slice from left to right.
 * For example, [1, 2, 3, 4].
 * Here "from=-1" and "to=-3" are illegal since "from" references a later element than "to".
 * If we use "from=2" and "to=-1", "from" is numerically bigger but references an earlier element than -1
 * (which is the last element), which is totally okay.
 *
 * Apart from those basic index-cases, "from" can almost be any value to search for in the array.
 *
 * If you provide a string for "from" everything matching that string with its string representation will be removed
 * (you can provide stringification for objects via the toString method, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString).
 *
 * Everything else (except collections) provided for "from" will determine the element(s)
 * to remove by identity (===).
 *
 * If you want to remove several elements at once, you may provide an iterable collection as "from".
 * This also makes it possible to actually remove numbers from an array by identity:
 * define the number(s) as an array to signal that these are no indices.
 * If you need to remove a collection from the array by reference, either put the collection in an array or set
 * "to" to true, to force the collection being treated as a reference.
 *
 * Iterable collections, usable in "from" in the sense of this method, are:
 * - PlainObject (using the values as the list)
 * - Array
 * - Set
 * - Map (using the values as the list)
 * To remove these by reference from target, instead of iterating them, set "to" to true.
 *
 * @param {Array.<*>} target - the array to remove elements from
 * @param {*|Object.<string,*>|Array.<*>|Set.<*>|Map.<*,*>} from - numerical index to start removing from
 *   (can also be negative to start counting from back), a string to identify elements to remove by their string
 *   representation or any other value identifying elements to remove by identity, if this is an iterable
 *   collection, the collection is iterated instead of being treated as a reference, enforce treatment as
 *   a reference, by setting "to" to true
 * @param {?number|boolean} [to=null] - index to end removing (can also be negative to start counting from back),
 *   if true, "from" defines a given iterable collection to be removed by reference, instead of removing the
 *   contained values, with this you can remove an array from an array for example
 * @returns {Array.<*>} new array without index/range/matches
 * @throws {Error} error if target is not an array‚
 *
 * @memberof Arrays:removeFrom
 * @alias removeFrom
 * @example
 * removeFrom([1, 2, 3, 4, 5], 0, 2);
 * // => [4, 5]
 *
 * removeFrom([1, 2, 3, 4, 5], -3, -1);
 * // => [1, 2]
 *
 * removeFrom([{a : 'b', toString(){ return 'b'; }}, 'b', b, 1], 'b');
 * // => [b, 1]
 *
 * removeFrom([{a : 'b', toString(){ return 'b'; }}, 'b', b, 1], b);
 * // => [{a : 'b', toString(){ return 'b'; }}, 'b', 1]
 *
 * removeFrom([true, true, false, true, true], true)
 * // => [false]
 *
 * removeFrom([{a : 'b', toString(){ return 'b'; }}, 'b', b, 1, 2], ['b', b, 2]);
 * // => [1]
 */
export function removeFrom(target, from, to=null){
	const __methodName__ = 'removeFrom';

	assert(isArray(target), `${MODULE_NAME}:${__methodName__} | target is no array`);

	if( isNumber(from) && (to !== true) ){
		from = parseInt(`${from}`, 10);
		to = orDefault(to, null, 'int');

		target = target.slice(0);
		const rest = target.slice((to || from) + 1 || target.length);
		target.length = (from < 0) ? (target.length + from) : from;

		return target.concat(rest);
	} else if( isString(from) ){
		return target.reduce((reducedArray, item) => {
			if( `${item}` !== from ){
				reducedArray.push(item);
			}
			return reducedArray;
		}, []);
	} else {
		let fromList;
		if( isPlainObject(from) ){
			fromList = Object.values(from);
		} else if( isMap(from) ){
			fromList = Array.from(from.values());
		} else if( isSet(from) ){
			fromList = Array.from(from.values());
		} else {
			fromList = Array.from(from);
		}

		if( (fromList.length > 0) && (to !== true) ){
			return fromList.reduce((reducedArray, item) => {
				reducedArray = removeFrom(reducedArray, item, true);
				return reducedArray;
			}, [...target]);
		} else {
			return target.reduce((reducedArray, item) => {
				if( item !== from ){
					reducedArray.push(item);
				}
				return reducedArray;
			}, []);
		}
	}
}



/**
 * @namespace Arrays:generateRange
 */

/**
 * Generates a numerical or a character range.
 *
 * Define a "from" and a "to" value and let the function fill the rest automatically, returning
 * an array with a complete list.
 *
 * "from" and "to" can be numbers or strings. The first character of the string will be used.
 * If you use strings and numbers mixed, the numbers will be interpreted as character codes.
 *
 * "from" and "to" do not have to be in ascending order and can also be in reverse.
 *
 * Add a "step" to define the value frequency.
 *
 * @param {number|string} from - the start of the range, may also be negative,
 *   if larger than "to", the range is created in reverse,
 *   as a string, this can be a single character
 * @param {number|string} to - the end of the range, may also be negative,
 *   if smaller than "from", the range is created in reverse,
 *   as a string, this can be a single character
 * @param {?number} [step=null] - the (positive) step length in the range to use between individual range values,
 *   if the step length does not hit "to" exactly, the range will end at the last possible value before "to"
 * @returns {Array.<number>|Array.<string>} new array with generated range
 * @throws {Error} error if "from" or "to" are empty strings
 *
 * @memberof Arrays:generateRange
 * @alias generateRange
 * @example
 * generateRange(0, 10, 2)
 * // => [0, 2, 4, 6, 8, 10]
 *
 * generateRange(5, -5, 3.5)
 * // => [5, 1.5, -2]
 * 
 * generateRange('a', 'g', 3)
 * // => ['a', 'd', 'g']
 */
export function generateRange(from, to, step=1){
	const
		__methodName__ = 'generateRange',
		cannotBeEmptyMessage = 'cannot be empty'
	;

	const generateChars = !isNumber(from) || !isNumber(to);
	if( generateChars ){
		if( !isNumber(from) ){
			from = `${from}`;
			assert((from.length > 0), `${MODULE_NAME}:${__methodName__} | "from" ${cannotBeEmptyMessage}`);
			from = from.charCodeAt(0);
		}

		if( !isNumber(to) ){
			to = `${to}`;
			assert((to.length > 0), `${MODULE_NAME}:${__methodName__} | "to" ${cannotBeEmptyMessage}`);
			to = to.charCodeAt(0);
		}
	}

	step = orDefault(step, 1, 'float');

	const
		factor = ((to - from) < 0) ? -1 : 1,
		range = []
	;

	let
		diff = Math.abs(to - from),
		current = from
	;

	while( diff >= 0 ){
		range.push(generateChars ? String.fromCharCode(current) : current);
		current += step * factor;
		diff -= step;
	}

	return range;
}
