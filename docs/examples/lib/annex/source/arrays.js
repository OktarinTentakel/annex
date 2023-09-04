/*!
 * Module Arrays
 */

/**
 * @namespace Arrays
 */

const MODULE_NAME = 'Arrays';



//###[ IMPORTS ]########################################################################################################

import {assert, isArray, isNumber, isString, isMap, isSet, isPlainObject, orDefault} from './basic.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Arrays:removeFrom
 */

/**
 * Removes Elements from an Array, where to and from are inclusive.
 * If you only provide "from", that exact index is removed.
 *
 * Does not modify the original.
 *
 * Keep in mind, that "from" should normally be smaller than "to" to slice from left to right. This means that the elements
 * indexed by "from" and "to" should have the right order. For example: [1,2,3,4]. Here from=-1 and to=-3 are illegal since
 * "from" references a later element than "to", but there are also viable examples where "from" is numerically bigger. If we
 * use from=2 and to=-1, "from" is numerically bigger, but references an earlier element than -1 (which is the last element),
 * which is totally okay. Just make sure "from" comes before "to" in the element's order.
 *
 * If you provide a string for "from" everything matching that string with its string representation will be removed
 * (you can provide stringification for objects via the toString method, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString).
 *
 * Everything else (except collections) provided for "from" will determine the element(s) to remove by identity (===).
 *
 * If you want to remove several elements at once, you may provide an iterable collection as "from" and
 * This also makes it possible to actually remove numbers from an array by identity: define the number(s) as an array,
 * to signal, that these are no indices. If you need to remove a collection from the array by reference, either put
 * the collection in an array or set "to" to true, to force the collection being treated as a reference.
 *
 * Iterable collections, usable in "from" in the sense of this method are:
 * - PlainObject (values)
 * - Array
 * - Set
 * - Map (values)
 * To remove these by reference from target, instead of iterating them, set "to" to true.
 *
 * @param {Array} target - the array to remove elements from
 * @param {*} from - numerical index to start removing from (can also be negative to start counting from back), a string to identify elements to remove by their string representation or any other value identifying elements to remove by identity, if this is an iterable collection, the collection is iterated instead of being treated as a reference, enforce treatment as a reference, by setting "to" to true
 * @param {?Number|Boolean} [to=null] - index to end removing (can also be negative to end counting from back), if true, "from" defines a given iterable collection to be removed by reference, instead of removing the contained values, with this you can remove an array from an array for example
 * @throws error if target is not an array
 * @returns {Array} new array without index/range/matches
 *
 * @memberof Arrays:removeFrom
 * @alias removeFrom
 * @example
 * removeFrom([1, 2, 3, 4, 5], 0, 2);
 * => [4, 5]
 * removeFrom([1, 2, 3, 4, 5], -3, -1);
 * => [1, 2]
 * removeFrom([{a : 'b', toString(){ return 'b'; }}, 'b', b, 1], 'b');
 * => [b, 1]
 * removeFrom([{a : 'b', toString(){ return 'b'; }}, 'b', b, 1], b);
 * => [{a : 'b', toString(){ return 'b'; }}, 'b', 1]
 * removeFrom([true, true, false, true, true], true)
 * => [false]
 * removeFrom([{a : 'b', toString(){ return 'b'; }}, 'b', b, 1, 2], ['b', b, 2]);
 * => [1]
 */
export function removeFrom(target, from, to=null){
	assert(isArray(target), `${MODULE_NAME}:remove | target is no array`);

	if( isNumber(from) && (to !== true) ){
		from = parseInt(from, 10);
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
