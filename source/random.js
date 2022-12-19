/*!
 * Module Random
 */

/**
 * @namespace Random
 */

const MODULE_NAME = 'Random';



//###[ IMPORTS ]########################################################################################################

import {orDefault, assert, hasValue, isA} from './basic.js';



//###[ DATA ]###########################################################################################################

const RANDOM_UUIDS_USED_SINCE_RELOAD = new Set();



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Random:randomNumber
 */

/**
 * Special form of Math.random, returning a value in a defined range,
 * where floor and ceiling are included in the range.
 *
 * By default this method return an integer, but by setting "float" to true and
 * optionally providing a float precision you can also work with floating point numbers.
 *
 * @param {?Number} [floor=0] - the lower end of random range, can either be integer or float
 * @param {?Number} [ceiling=10] - the upper end of random range, can either be integer or float
 * @param {?Boolean} [float=false] - define if we are working with floating point numbers
 * @param {?Number} [precision=2] - if we are working with floats, what precision are we working with, considering floor, ceiling and result?
 * @throws error if ceiling is smaller than floor
 * @returns {Number} random integer or float between floor and ceiling
 *
 * @memberof Random:randomNumber
 * @alias randomNumber
 * @example
 * let randomInt = randomNumber(23, 42);
 * let randomFloat = randomNumber(23.5, 42.123, true, 3);
 */
export function randomNumber(floor=0, ceiling=10, float=false, precision=2){
	floor = orDefault(floor, 0, 'float');
	ceiling = orDefault(ceiling, 10, 'float');
	float = orDefault(float, false, 'bool');
	precision = orDefault(precision, 2, 'int');

	assert((ceiling >= floor), `${MODULE_NAME}:randomInt | ceiling smaller than floor`);

	const power = Math.pow(10, precision);

	if( float ){
		floor *= power;
		ceiling *= power;
	}

	const res = Math.floor(Math.random() * (ceiling - floor + 1) + floor);

	return float ? ((Math.round(parseFloat(res) * power) / power) / power) : res;
}



/**
 * @namespace Random:randomUuid
 */

/**
 * Generate a RFC4122-compliant random UUID, as far as possible with JS.
 * Generation is heavily dependent on the quality of randomization, which in some JS-engines is weak using
 * Math.random. Therefore we are using the specific crypto api if available and only fall back to random if necessary.
 * Additionally we track used UUIDs to never return the same id twice per reload.
 *
 * For a detailed discussion, see: https://stackoverflow.com/a/2117523
 *
 * @param {?Boolean} [withDashes=true] - defines if UUID shall include dashes or not
 * @throws error if too many collisions happen and the random implementation seems to be broken
 * @returns {String} a "UUID"
 *
 * @memberof Random:randomUuid
 * @alias randomUuid
 * @example
 * const uuidWithDashes = randomUuid();
 * const uuidWithoutDashes = randomUuid(false);
 */
export function randomUuid(withDashes=true){
	withDashes = orDefault(withDashes, true, 'bool');

	const getRandomValues = window.crypto?.getRandomValues ?? window.msCrypto?.getRandomValues;

	let
		uuid = null,
		collisions = 0
	;

	while( !hasValue(uuid) || RANDOM_UUIDS_USED_SINCE_RELOAD.has(uuid) ){
		if( isA(getRandomValues, 'function') ){
			uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
				(c ^ getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		} else {
			uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
				const
					r = Math.random() * 16 | 0,
					v = c === 'x' ? r : (r & 0x3 | 0x8)
				;
				return v.toString(16);
			});
		}

		if( RANDOM_UUIDS_USED_SINCE_RELOAD.has(uuid) ){
			collisions++;

			if( collisions > 100 ){
				assert(collisions <= 100, `${MODULE_NAME}:randomUuid | too many collisions, there seems to be randomization problem`)
			}
		}
	}

	RANDOM_UUIDS_USED_SINCE_RELOAD.add(uuid);

	return withDashes ? uuid : uuid.replace(/-/g, '');
}
