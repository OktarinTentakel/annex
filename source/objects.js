/*!
 * Module Objects
 */

/**
 * @namespace Objects
 */

const MODULE_NAME = 'Objects';



//###[ IMPORTS ]########################################################################################################

import {getType, isFunction, isPlainObject, orDefault} from './basic.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Objects:clone
 */

/**
 * Cloning arbitrary objects, values and structured values is no trivial task in JavaScript.
 * For basic values this can easily be achieved by serializing/deserializing via JSON.parse(JSON.stringify(value)), but
 * for everything not included in the JSON standard, such as nodes, sets, maps, functions and objects with constructors
 * this gets hairy pretty quickly.
 *
 * This function implements a fairly robust recursive cloning algorithm with circular dependency detection and should
 * be sufficient for 90% of your cloning needs. It can create deep and shallow copies, although I generally presume
 * that you need a deep copy if you are in need of a clone method to begin with. This method handles ordinal values,
 * regexes, dates and htmlelements/nodes, as well as nested structures consisting of arrays, plain objects,
 * simple constructed objects with settable properties, sets, maps and even nodelists.
 *
 * Be aware of these restrictions:
 * - map keys are not cloned since, if you would, you'd lose all access to values,
 *   because you would have no valid references
 * - cloning a nodelist in a shallow manner results in the original list being empty afterwards, since moving a node
 *   reference from one nodelist to another automatically removes the reference from the first, because a node may
 *   only appear at exactly one place in a dom tree
 *
 * If this function does not suffice, have a look at lodash's cloneDeep method, which is a very robust and complete
 * (but large and complex) solution: https://www.npmjs.com/package/lodash.clonedeep
 *
 * @param {*} target - the object/value to clone
 * @param {?Boolean} [deep=true] - define if nested objects/values are to be cloned as well or just referenced in a shallow way
 * @returns {*} the cloned object/value
 *
 * @memberof Objects:clone
 * @alias clone
 * @example
 * const foo = {foo : 'bar', bar : [new Foobar(1, 2, 3), new Set([new Date('2021-03-09'), new RegExp('^foobar$')])]};
 * const allNewFoo = clone(foo);
 * const shallowNewFoo = clone(foo, false);
 * const thatOneTextAgain = clone(document.querySelector('p.that-one-text'));
 * thatOneTextAgain.classList.add('hooray');
 */
export function clone(target, deep=true){
	deep = orDefault(deep, true, 'bool');

	if( isFunction(target?.clone) ){
		return target.clone(deep);
	}

	const
		seenReferences = Array.from(arguments)[2] ?? [],
		seenCopies = Array.from(arguments)[3] ?? []
	;

	if( seenReferences.indexOf(target) >= 0 ){
		return seenCopies[seenReferences.indexOf(target)];
	}

	const targetType = getType(target);
	switch( targetType ){
		case 'array':
			const arrayCopy = [...target];

			seenReferences.push(target);
			seenCopies.push(arrayCopy);

			if( deep ){
				let i = arrayCopy.length;
				while( i-- ){
					arrayCopy[i] = clone(arrayCopy[i], deep, seenReferences, seenCopies);
				}
			}

			return arrayCopy;

		case 'set':
		case 'weakset':
			const setCopy = (targetType === 'weakset')
				? new WeakSet()
				: new Set()
			;

			seenReferences.push(target);
			seenCopies.push(setCopy);

			target.forEach(value => {
				if( deep ){
					setCopy.add(clone(value, deep, seenReferences, seenCopies));
				} else {
					setCopy.add(value);
				}
			});

			return setCopy;

		case 'map':
		case 'weakmap':
			const mapCopy = (targetType === 'weakmap')
				? new WeakMap()
				: new Map()
			;

			seenReferences.push(target);
			seenCopies.push(mapCopy);

			target.forEach((value, key) => {
				if( deep ){
					mapCopy.set(key, clone(value, deep, seenReferences, seenCopies));
				} else {
					mapCopy.set(key, value);
				}
			});

			return mapCopy;

		case 'url':
			const urlCopy = new URL(target);

            seenReferences.push(target);
            seenCopies.push(urlCopy);

			return urlCopy;

		case 'urlsearchparams':
            const urlSearchParamsCopy = new URLSearchParams(target.toString());

            seenReferences.push(target);
            seenCopies.push(urlSearchParamsCopy);

            return urlSearchParamsCopy;

		case 'object':
			const objectCopy = Object.create(Object.getPrototypeOf ? Object.getPrototypeOf(target) : target.__proto__);

			seenReferences.push(target);
			seenCopies.push(objectCopy);

			for( let prop in target ){
				if( target.hasOwnProperty(prop) ){
					if( deep ){
						objectCopy[prop] = clone(target[prop], deep, seenReferences, seenCopies);
					} else {
						objectCopy[prop] = target[prop];
					}
				}
			}

			return objectCopy;

		case 'nodelist':
			const fragment = document.createDocumentFragment();

			// no optimization with seenReferences or seenCopies, since, in a dom tree, we cannot reuse
			// references or elements, since that would mean reattaching a node, which would move the node

			if( deep ){
				target.forEach(element => {
					if( deep ){
						fragment.appendChild(clone(element, deep, seenReferences, seenCopies));
					}
				});
			// shallow copying a nodelist is destructive, since appending the original element, empties the original
			// list, since every node may only exist once inside a dom
			} else {
				while( target.length ){
					fragment.appendChild(target.item(0));
				}
			}

			return fragment.childNodes;

		case 'date': return new Date(target.getTime());
		case 'regexp': return new RegExp(target);
		case 'htmlelement': return target.cloneNode(deep);
		default: return target;
	}
}



/**
 * @namespace Objects:merge
 */

/**
 * Merging objects in JS is easy, using spread operators, as long as we are talking about shallow merging of the first
 * level. This method aims to deep merge recursively, always returning a new object, never touching or changing the
 * original one.
 *
 * This method implements LIFO precedence: the last extension wins.
 *
 * Possible differences to other implementations (like lodash's):
 * - arrays are not concatenated here, but replaced.
 * - explicitly extending an empty object, replaces the value with the empty object instead of doing nothing
 * - all involved objects are cloned, so references in the resulting object will differ
 *
 * @param {Object} base - the object to extend
 * @param {Array<Object>} extensions - one or more objects to merge into base sequentially, the last taking precedence
 * @returns {Object} the (newly created) merged object
 *
 * @memberof Objects:merge
 * @alias merge
 * @example
 * merge(
 *   {ducks : {uncles : ['Donald', 'Scrooge'], nephews : {huey : true}}},
 *   {ducks : {nephews : {dewey : true}}, mice : ['Mickey']},
 *   {ducks : {uncles : ['Gladstone'], nephews : {louie : true}}, mice : ['Mickey', 'Minnie']}
 * )
 * => {ducks : {uncles : ['Gladstone'], nephews : {huey : true, dewey : true, louie : true}}, mice : ['Mickey', 'Minnie']}
 */
export function merge(base, ...extensions){
	base = clone(base);

	Array.from(extensions).forEach(extension => {
		extension = clone(extension);

		for( let prop in extension ){
			if( extension.hasOwnProperty(prop) ){
				if(
					base.hasOwnProperty(prop)
					&& (isPlainObject(base[prop]) && isPlainObject(extension[prop]))
					&& (Object.keys(extension[prop]).length > 0)
				){
					base[prop] = merge(base[prop], extension[prop]);
				} else {
					base[prop] = extension[prop];
				}
			}
		}
	});

	return base;
}
