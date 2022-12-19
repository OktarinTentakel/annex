/*!
 * Module Objects
 */

/**
 * @namespace Objects
 */

const MODULE_NAME = 'Objects';



//###[ IMPORTS ]########################################################################################################

import {getType, isA, orDefault} from './basic.js';



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

	if( isA(target?.clone, 'function') ){
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
