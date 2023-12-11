/*!
 * Module Random
 */

/**
 * @namespace Random
 */

const MODULE_NAME = 'Random';



//###[ IMPORTS ]########################################################################################################

import {orDefault, assert, hasValue, isFunction} from './basic.js';
import {pad} from './strings.js';
import {toBaseX} from './conversion.js';



//###[ DATA ]###########################################################################################################

const
	RANDOM_UUIDS_USED_SINCE_RELOAD = new Set(),
	DEFAULT_USER_CODE_ALPHABET = 'ACDEFGHKLMNPQRSTUVWXYZ2345679'
;



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Random:randomNumber
 */

/**
 * Special form of Math.random, returning a value in a defined range,
 * where floor and ceiling are included in the range.
 *
 * By default, this method return an integer, but by setting "float" to true and
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
 * Math.random. Therefore, we are using the specific crypto api if available and only fall back to random if necessary.
 * Additionally, we track used UUIDs to never return the same id twice per reload.
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

	let
		uuid = null,
		collisions = 0
	;

	while( !hasValue(uuid) || RANDOM_UUIDS_USED_SINCE_RELOAD.has(uuid) ){
		// we have to do this highly convoluted check, because we have to call getRandomValues
		// explicitly from either window.crypto or window.msCrypto, since invoking it from another
		// context will trigger an "illegal invocation" of the method :(
		if(
			isFunction(window.crypto?.getRandomValues)
			|| isFunction(window.msCrypto?.getRandomValues)
		){
			uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (
				c
				^ (
					isFunction(window.crypto?.getRandomValues)
					? window.crypto.getRandomValues(new Uint8Array(1))
					: window.msCrypto?.getRandomValues(new Uint8Array(1))
				)[0]
				& 15 >> c / 4
			).toString(16));
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



/**
 * @namespace Random:randomUserCode
 */

/**
 * Generates a random code, to be presented to the user, being easily readable and concise.
 * Use this for things like, coupon codes, session IDs and everything, that might be transcribed by hand.
 *
 * The algorithm used is using time-based information in combination with a larger random number, so, there should not
 * be any collisions, but build in a fail-safe, if you persist this code to a database, to make absolutely sure, that
 * the code is unique.
 *
 * The used method here is formulated, to result in a short, concise highly readable code, while keeping the value
 * highly random and as collision-free as possible. The basis for this is a combination of a compressed ISO-datetime
 * string and a crypto-random-based combination of several random Uint8-values.
 *
 * Hint: if you need a general implementation to convert a value to a certain alphabet/base, have a look at
 * `Conversion:toBaseX`.
 *
 * @param {?String} [alphabet='ACDEFGHKLMNPQRSTUVWXYZ2345679'] - the character pool to use for code generation
 * @param {?String} [paddingCharacter='8'] - the character to use for value padding if generated code is too short
 * @param {?Number} [minLength=8] - the min length, the code has to have at least, will be padded if too short
 * @param {?Number} [maxLength=12] - the max length, the code can have at most, a code longer than this, will result in an error
 * @param {?Number} [randomValue=null] - random integer to include in the code's base value, should be ~6 digits, will automatically be generated if missing
 * @throws error if maxLength is smaller than minLength
 * @throws error if the generated code is longer than maxLength
 * @returns {String} the generated user code
 *
 * @memberof Random:randomUserCode
 * @alias randomUserCode
 * @see Conversion:toBaseX
 * @example
 * randomUserCode()
 * => 'GVK6RNQ8'
 * randomUserCode('0123456789ABCDEF', 10, 10, '=')
 * => 'A03CF25D7='
 */
export function randomUserCode(
	alphabet=DEFAULT_USER_CODE_ALPHABET,
	paddingCharacter='8',
	minLength=8,
	maxLength=12,
	randomValue=null
){
	const __methodName__ = 'randomUserCode';

	alphabet = orDefault(alphabet, DEFAULT_USER_CODE_ALPHABET, 'str');
	paddingCharacter = orDefault(paddingCharacter, '8', 'str')[0];
	minLength = orDefault(minLength, 8, 'int');
	maxLength = orDefault(maxLength, 12, 'int');
	randomValue = orDefault(
		randomValue,
		window.crypto?.getRandomValues?.(new Uint16Array(15)).reduce((sum, v) => sum + v, 0)
			?? window.msCrypto?.getRandomValues?.(new Uint16Array(15)).reduce((sum, v) => sum + v, 0)
			?? randomNumber(1, 999999)
		,
		'int'
	);

	if( maxLength < minLength ){
		throw Error(`${MODULE_NAME}:${__methodName__} | minLength cannot be smaller than maxLength`);
	}

	let code = ''+toBaseX(Number(
		`${randomValue}${
			(new Date()).toISOString().replace(/[\-T:.Z]/g, '?')
				.split('?')
				.reduce((sum, v) => sum + Number(v), 0)
		}`
	), alphabet);

	if( code.length > maxLength ){
		throw Error(
			`${MODULE_NAME}:${__methodName__} | code too long, check maxLength and custom randomValue`
		);
	} else if( code.length < minLength ){
		code = pad(code, paddingCharacter, minLength, 'right');
	}

	return code;
}
