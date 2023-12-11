/*!
 * Module Conversion
 */

/**
 * @namespace Conversion
 */

const MODULE_NAME = 'Conversion';



//###[ IMPORTS ]########################################################################################################

import {isInt, isArray, orDefault} from './basic.js';
import {pad, trim} from './strings.js';



//###[ DATA ]###########################################################################################################

const
	UPPER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	LOWER_CHARS = 'abcdefghijklmnopqrstuvwxyz',
	NUMBERS = '0123456789',
	BASE_ALPHABETS = {
		'64' : `${UPPER_CHARS}${LOWER_CHARS}${NUMBERS}+/`,
		'63' : `${NUMBERS}${UPPER_CHARS}${LOWER_CHARS}_`,
		'36' : `${NUMBERS}${UPPER_CHARS}`,
		'26' : UPPER_CHARS,
		'16' : `${NUMBERS}${UPPER_CHARS.slice(0, 6)}`,
		'10' : NUMBERS,
		'8' : NUMBERS.slice(0, 8),
		'2' : NUMBERS.slice(0, 2)
	},
	BASE64_ALPHABET = BASE_ALPHABETS['64']
;



//###[ HELPERS ]########################################################################################################

/**
 * Builds an alphabet string, based on an integer, an alphabet string or an array of strings containing the alphabet's
 * chars. An integer uses BASE_ALPHABETS to select a base alphabet to slice the alphabet from. The first base alphabet
 * having enough chars is going be used. The configurations of the base alphabets are according to current base
 * practices.
 *
 * Characters in custom alphabets are sorted according to base64 definition, with additional chars appended at the end,
 * sorted ascending based on char value.
 *
 * @private
 */
function buildAlphabet(__methodName__='buildAlphabet', baseOrAlphabet=64, useChunks=false){
	baseOrAlphabet = orDefault(baseOrAlphabet, 64);

	let alphabet;

	if( isInt(baseOrAlphabet) ){
		if( (baseOrAlphabet < 2) || (baseOrAlphabet > 64) ){
			throw new Error(`${MODULE_NAME}:${__methodName__} | base not usable, smaller than 2 or larger than 64`);
		}

		if( useChunks && (baseOrAlphabet < 3) ){
			throw new Error(`${MODULE_NAME}:${__methodName__} | base not usable for chunks, smaller than 3`);
		}

		for( let baseAlphabetKey of Object.keys(BASE_ALPHABETS).sort() ){
			if( Number(baseAlphabetKey) >= baseOrAlphabet ){
				alphabet = BASE_ALPHABETS[baseAlphabetKey].slice(0, baseOrAlphabet);
				break;
			}
		}
	} else {
		alphabet = [];

		if( !isArray(baseOrAlphabet) ){
			baseOrAlphabet = `${baseOrAlphabet}`.split('');
		}

		baseOrAlphabet.forEach(char => {
			alphabet = alphabet.concat(`${char}`.split(''));
		});

		alphabet = Array.from(new Set(alphabet));
		alphabet.sort((a, b) => {
			const
				aBase64Index = BASE64_ALPHABET.indexOf(a),
				bBase64Index = BASE64_ALPHABET.indexOf(b)
			;

			if( (aBase64Index < 0) && (bBase64Index < 0) ){
				return (a === b) ? 0 : ((a < b) ? -1 : 1);
			} else if( aBase64Index < 0 ){
				return 1;
			} else if( bBase64Index < 0 ){
				return -1;
			} else {
				return (aBase64Index === bBase64Index) ? 0 : ((aBase64Index < bBase64Index) ? -1 : 1);
			}
		});

		alphabet = alphabet.join('');
	}

	if( (alphabet.length < 2) || (alphabet.length > 64) ){
		throw new Error(`${MODULE_NAME}:${__methodName__} | alphabet not usable, must have between two and 64 chars`);
	}

	if( useChunks && (alphabet.length < 3) ){
		throw new Error(`${MODULE_NAME}:${__methodName__} | alphabet not usable for chunks, less than 3 chars`);
	}

	return alphabet;
}



/**
 * Calculates how many character mapping pages/page characters we need for a specific alphabet,
 * defined by its length/base.
 *
 * @private
 */
function calculateNeededPages(base){
	const availablePages = Math.floor(base / 2);
	let
		neededPages = 0,
		charPoolSize = base,
		combinations = charPoolSize
	;

	while( combinations < 64 ){
		neededPages++;
		if( neededPages <= availablePages ){
			charPoolSize--;
		}
		combinations = (neededPages + 1) * charPoolSize;
	}

	return neededPages;
}



/**
 * Returns an array of value prefixes used to map characters to different code pages, in cases where we need to encode
 * a base64 character above the base of our target alphabet, which means, that we have to repeat character usage, but
 * with a page prefix to multiply the value set by reducing the base alphabet for that purpose.
 *
 * @private
 */
function buildPageMap(alphabet){
	const
		base = alphabet.length,
		neededPages = calculateNeededPages(base),
		availablePages = Math.floor(base / 2),
		pageMap = ['']
	;

	let remainder, quotient;
	for( let i = 1; i <= neededPages; i++ ){
		remainder = i % availablePages;
		quotient = Math.ceil(i / availablePages);
		pageMap.push(pad('', alphabet[(remainder > 0) ? (remainder - 1) : (availablePages - 1)], quotient));
	}

	return pageMap;
}



/**
 * Returns a dictionary, mapping each base64 character to one or more characters of the target alphabet.
 * In cases, where the character to encode is beyond the target alphabet, page prefixes are prepended to
 * cover all characters by increasing length.
 *
 * @private
 */
function buildCharMap(pageMap, alphabet){
	const
		base = alphabet.length,
		neededPages = calculateNeededPages(base),
		availablePages = Math.floor(base / 2),
		pagedAlphabet = alphabet.slice(Math.min(neededPages, availablePages)),
		pagedBase = pagedAlphabet.length,
		charMap = {}
	;

	let remainder, quotient;
	for( let i in BASE64_ALPHABET.split('') ){
		remainder = i % pagedBase;
		quotient = Math.floor(i / pagedBase);
		charMap[BASE64_ALPHABET[i]] = `${pageMap[quotient]}${pagedAlphabet[remainder]}`
	}

	return charMap;
}



/**
 * Converts a string to base64, while handling unicode characters correctly.
 * Be advised, that the result needs to be decoded with base64ToString() again, since
 * we also need to correctly handle unicode on the way back.
 *
 * @private
 */
function stringToBase64(value){
	return btoa(String.fromCodePoint(...((new TextEncoder()).encode(`${value}`)))).replaceAll('=', '');
}



/**
 * Decodes a base64-encoded string to its original value.
 * Be advised, that the base64 value has to be encoded using stringToBase64(), since unicode characters need
 * special handling during en/decoding.
 *
 * This function will fail with an error, if the given value is not actually decodable with base64.
 *
 * @private
 */
function base64ToString(value, __methodName__='base64ToString'){
	let res = null;

	try {
		res = (new TextDecoder()).decode(Uint8Array.from(atob(`${value}`), char => char.codePointAt(0)))
	} catch(ex){
		throw new Error(`${MODULE_NAME}:${__methodName__} | cannot decode "${value}"`);
	}

	return res;
}



/**
 * Converts a decimal/base10 value to a different base numerically.
 * Be aware that this needs the value to be a safe integer.
 * This function does not deal with negative numbers by itself.
 *
 * @private
 */
function base10toBaseX(value, alphabet){
	const base = alphabet.length;
	let
		baseXValue = '',
		quotient = value,
		remainder
	;

	if( quotient !== 0){
		while( quotient !== 0 ){
			remainder = quotient % base;
			quotient = Math.floor(quotient / base);
			baseXValue = `${alphabet[remainder]}${baseXValue}`;
		}
	} else {
		baseXValue = `${alphabet[0]}`;
	}

	return baseXValue;
}



/**
 * Converts a value, based on a defined alphabet, to its decimal/base10 representation.
 * Be aware that this needs the result to be a safe integer.
 * This function does not deal with negative numbers by itself.
 *
 * @private
 */
function baseXToBase10(value, alphabet){
	value = `${value}`.split('').reverse().join('');

	const base = alphabet.length;
	let base10Value = 0;

	for( let i = 0; i < value.length; i++ ){
		base10Value += Math.pow(base, i) * alphabet.indexOf(value[i]);
	}

	return base10Value;
}



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Conversion:toBaseX
 */

/**
 * This function converts a value to a representation in a defined base between 2 and 64.
 * So this covers common use cases like binary, octal, hexadecimal, alphabetical, alphanumeric and of course base64.
 *
 * The result of this function is always either a decimal number or a string, just as the input value. All numbers
 * apart from decimal ones are returned as strings without prefix. So, decimal 5 will be the number 5, but the binary
 * version will be the string "101". Positive and negative decimal integers are valid numbers here, but this
 * implementation does not support floats (multiply and divide if needed). Only numerical bases above 36 contain
 * lower case characters, so decimal 255 is "FF" in base 16 and not "ff".
 *
 * This function is unicode safe, by using byte conversion
 * (see: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem).
 * Be aware, that this also means, that results of `btoa/atob()` and `toBaseX/fromBaseX()` are _not_ interchangeable,
 * since they work with different values internally.
 *
 * There are three approaches to changing the base of a value in JavaScript:
 *
 * 1. Either you are taking the numerical/mathematical road, treating a value as a number in its alphabet being
 * interpreted as a number, where each character, counting from the back is the base to the power of the
 * character index. This is the approach you'd expect, when, for instance, you'd want to convert the decimal number 5
 * to binary 101. The downside of this approach is, that the relatively small max safe integer in JavaScript makes
 * converting large numbers, such as longer strings, impossible.
 *
 * 2. Therefore, the second approach takes the numeric approach, but combines it with chunking, splitting the value into
 * pieces, which are, by themselves, safely convertible. The downside is, that we need an extra character to delimit
 * chunks in the result, since values have non-uniform lengths. This means, that this does not work with the basic
 * binary base, and we need at least 3 alphabet characters.
 *
 * 3. The last approach uses the native base64 string encoding with `btoa()` as a safe translation layer, mapping the
 * resulting string to the target base, using a generated (and possibly paged) character map. This way treats all
 * values as strings and is not compatible to numerical conversion anymore, but uses the same characters. The result
 * of this approach can encode every string of every length without structural tricks, but has the longest results.
 *
 * This function is capable of all three approaches, which are equally safe for unicode values. The numerical
 * approach is the default. If you want to encode large numbers or strings longer than ~6 characters, select
 * a different approach using the `useCharacterMap` or `useChunks` parameters. Character mapping has preference, while
 * chunks have no effect in character mapping.
 *
 * Each encoding process ends with a self-test, checking if the result is actually decodable using
 * `fromBaseX()`, using the same settings again. This ensures, that every result is valid and retrievable in the future,
 * preventing any undiscovered errors, which would make it impossible to work with the original value again.
 *
 * You may define the base as an integer between 2 and 64 or as a custom alphabet in the same range. Integer based
 * alphabets are generated using defined base alphabets, which are sliced if necessary. Custom alphabets are
 * automatically sorted to match base64 are far as possible, pushing additional characters to the end, which are then
 * sorted ascending by character value.
 *
 * "{" and "}" are the only forbidden characters in a custom alphabet, since we need these to mark number values in
 * `fromBaseX()`.
 *
 * Numerical conversion keeps negative numbers negative and marks the result with a preceding "-".
 *
 * Hint: if you want to genrate codes to be presented to the user, see `Random:randomUserCode`.
 *
 * @param {Number|String} value - value to be encoded
 * @param {?Number|String|Array<String>} [baseOrAlphabet=64] - either the numerical base to convert to (64, 36, ...) or the alphabet of characters to use in encoding; numerical bases must be between 2 and 64 (if the result is chunked, we need a base 3)
 * @param {?Boolean} [useCharacterMap=true] - set to true, to use a character map, based on btoa(), instead of numerical conversion
 * @param {?Boolean} [useChunks=false] - set to true, to add chunking to the numerical approach, converting the value in groups separated by a delimiter, which is the first letter of the base's alphabet
 * @param {?Number} [chunkSize=6] - define a different chunks size; only change this, if 6 seems too big in your context, going higher is not advisable
 * @throws error if baseOrAlphabet is not usable
 * @throws error if result is not decodable again using the same settings
 * @returns {String} the encoded value
 *
 * @memberof Conversion:toBaseX
 * @alias toBaseX
 * @see fromBaseX
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
 * @see Random:randomUserCode
 * @example
 * toBaseX('foobar')
 * => 'Zm9vYmFy'
 * toBaseX(-5, 2)
 * => '-101'
 * toBaseX(42, 'abcdefghij')
 * => 'ec'
 * toBaseX('too-long-for-number-conversion', 36, true)
 * => 'U70R0DCN0F0DS04T0BQ040R0GCN0N0JSNA03TZ0J01S0K0N0KQOA0HRN0R0C'
 * toBaseX('too-long-for-number-conversion', 16, false, true)
 * => 'D3EF5D81F026D9DFDA970BBF17222402A47D5AD650CF6C2FE2102A494BCBDD0A2864C'
 */
export function toBaseX(value, baseOrAlphabet=64, useCharacterMap=false, useChunks=false, chunkSize=6){
	const __methodName__ = 'toBaseX';

	const
		valueIsNumber = isInt(value),
		valueIsNegativeNumber = valueIsNumber && (value < 0)
	;

	value = valueIsNumber ? `${Math.abs(value)}` : `${value}`;
	useCharacterMap = orDefault(useCharacterMap, false, 'bool');
	useChunks = orDefault(useChunks, false, 'bool');
	chunkSize = orDefault(chunkSize, 10, 'int');

	const alphabet = buildAlphabet(__methodName__, baseOrAlphabet, useChunks);
	if( alphabet.includes('{') || alphabet.includes('}') ){
		throw new Error(`${MODULE_NAME}:${__methodName__} | invalid alphabet, must not contain "{" or "}"`)
	}

	let
		base64Value = '',
		base10Value = 0,
		baseXValue = ''
	;

	if( useCharacterMap ){
		base64Value = stringToBase64(value);
		if( baseOrAlphabet === 64 ) return base64Value;

		const
			pageMap = buildPageMap(alphabet),
			charMap = buildCharMap(pageMap, alphabet)
		;

		for( let char of base64Value ){
			baseXValue += charMap[char];
		}
	} else {
		if( valueIsNumber ){
			base64Value = base10toBaseX(value, BASE64_ALPHABET);
		} else {
			base64Value = stringToBase64(value);
		}

		const
			chunks = [],
			chunkAlphabet = useChunks ? alphabet.slice(1) : alphabet,
			chunkSeparator = useChunks ? alphabet[0] : ''
		;

		if( useChunks ){
			let chunkStart = 0;
			while( chunkStart < base64Value.length ){
				chunks.push(base64Value.slice(chunkStart, chunkStart + chunkSize));
				chunkStart += chunkSize;
			}
		} else {
			chunks.push(base64Value);
		}

		for( let chunk of chunks ){
			base10Value = baseXToBase10(chunk, BASE64_ALPHABET);

			if( !useChunks && (baseOrAlphabet === 10) ){
				baseXValue += base10Value;
				break;
			}

			baseXValue += `${chunkSeparator}${base10toBaseX(base10Value, chunkAlphabet)}`;
		}

		if( chunkSeparator !== '' ){
			baseXValue = baseXValue.slice(1);
		}
	}

	baseXValue = `${valueIsNegativeNumber ? '-' : ''}${baseXValue}`;
	const decodedValue = `${fromBaseX(baseXValue, baseOrAlphabet, useCharacterMap, useChunks, valueIsNumber)}`;
	if( decodedValue !== `${valueIsNegativeNumber ? '-' : ''}${value}` ){
		throw new Error(
			`${MODULE_NAME}:${__methodName__} | critical error, encoded value "${baseXValue}" `
			+`not decodable to "${value}", is "${decodedValue}" instead; `
			+`if this looks "cut off", this may be a problem with JS max safe integer size `
			+`(safe value length for number-based conversion is just ~8 chars), `
			+`try using character mapping or chunks to circumvent this problem`
		);
	}
	return baseXValue;
}



/**
 * @namespace Conversion:fromBaseX
 */

/**
 * This function converts a based representation back to its original number or string value.
 * This is the mirror function to `toBaseX()` and expects a value encoded with that function. See that function
 * for implementation details, modes and restrictions.
 *
 * The result of this function is always either a decimal number or a string, just as the input value. All numbers
 * apart from decimal ones are returned as strings without prefix. So, decimal 5 will be the number 5, but the binary
 * version will be the string "101".
 *
 * You may define the base as an integer between 2 and 64 or as a custom alphabet in the same range. Integer based
 * alphabets are generated using defined base alphabets, which are sliced if necessary. Custom alphabets are
 * automatically sorted to match base64 are far as possible, pushing additional characters to the end, which are then
 * sorted ascending by character value.
 *
 * "{" and "}" are the only forbidden characters in a custom alphabet, since we need these to mark number values in
 * `fromBaseX()`.
 *
 * Numerical conversion keeps negative numbers negative and marks the result with a preceding "-".
 *
 * @param {Number|String} value - value to be decoded
 * @param {?Number|String|Array<String>} [baseOrAlphabet=64] - either the numerical base to convert to (64, 36, ...) or the alphabet of characters to use in encoding; numerical bases must be between 2 and 64 (if the result is chunked, we need a base 3)
 * @param {?Boolean} [useCharacterMap=true] - set to true, to use a character map, based on btoa(), instead of numerical conversion
 * @param {?Boolean} [useChunks=false] - set to true, to add chunking to the numerical approach, converting the value in groups separated by a delimiter, which is the first letter of the base's alphabet
 * @param {?Boolean} [valueIsNumber=false] - if true, the given value is treated as a number for numerical conversion; this is necessary, since numbers such as binaries are defined as strings and are therefore not auto-detectable
 * @throws error if baseOrAlphabet is not usable
 * @throws error character mapped decoding fails, due to missing token/unmatched alphabet
 * @returns {String} the decoded value
 *
 * @memberof Conversion:fromBaseX
 * @alias fromBaseX
 * @see toBaseX
 * @example
 * fromBaseX('Zm9vYmFy')
 * => 'foobar'
 * fromBaseX('16W33YPUS', 36)
 * => 'äす'
 * fromBaseX('{-3C3}', 13)
 * => -666
 * fromBaseX('q', 64, false, false, true)
 * => 42
 * fromBaseX('U70R0DCN0F0DS04T0BQ040R0GCN0N0JSNA03TZ0J01S0K0N0KQOA0HRN0R0C', 36, true)
 * => 'too-long-for-number-conversion'
 * fromBaseX('D3EF5D81F026D9DFDA970BBF17222402A47D5AD650CF6C2FE2102A494BCBDD0A2864C', 16, false, true)
 * => 'too-long-for-number-conversion'
 */
export function fromBaseX(value, baseOrAlphabet=64, useCharacterMap=false, useChunks=false, valueIsNumber=false){
	const __methodName__ = 'fromBaseX';

	valueIsNumber = !!valueIsNumber
		|| isInt(value)
		|| (`${value}`.startsWith('{') && `${value}`.endsWith('}'))
	;
	value = `${value}`;
	if( valueIsNumber ){
		value = trim(value, ['{', '}']);
	}
	const valueIsNegativeNumber = valueIsNumber && value.startsWith('-');
	if( valueIsNegativeNumber ){
		value = value.slice(1);
	}

	useCharacterMap = orDefault(useCharacterMap, false, 'bool');
	useChunks = orDefault(useChunks, false, 'bool');

	if(
		(baseOrAlphabet === 64)
		&& !useCharacterMap
		&& !useChunks
		&& !valueIsNumber
	) return base64ToString(value, __methodName__);

	const alphabet = buildAlphabet(__methodName__, baseOrAlphabet, useChunks);
	if( alphabet.includes('{') || alphabet.includes('}') ){
		throw new Error(`${MODULE_NAME}:${__methodName__} | invalid alphabet, must not contain "{" or "}"`)
	}

	let
		base64Value = '',
		base10Value = 0,
		decodedValue
	;

	if( useCharacterMap ){
		const
			pageMap = buildPageMap(alphabet),
			charMap = buildCharMap(pageMap, alphabet),
			inverseCharMap = Object.fromEntries(
				Object
				.entries(charMap)
				.map(([key, value]) => [value, key])
			),
			tokensByLength = Object.keys(inverseCharMap).sort((a, b) => {
				return (a.length === b.length) ? 0 : ((a.length > b.length) ? -1 : 1);
			})
		;

		let tokenFound = false;
		while( value !== '' ){
			for( let token of tokensByLength ){
				tokenFound = false;
				if( value.startsWith(token) ){
					tokenFound = true;
					base64Value += inverseCharMap[token];
					value = value.slice(token.length);
					break;
				}
			}

			if( !tokenFound ){
				throw new Error(
					`${MODULE_NAME}:${__methodName__} | unknown token at start of "${value}", likely due to non-matching alphabet`
				);
			}
		}

		decodedValue = base64ToString(base64Value, __methodName__);
		if( valueIsNegativeNumber ){
			decodedValue = `-${decodedValue}`;
		}

		return decodedValue;
	} else {
		decodedValue = '';

		const
			chunkAlphabet = useChunks ? alphabet.slice(1) : alphabet,
			chunkSeparator = useChunks ? alphabet[0] : '',
			chunks = useChunks ? value.split(chunkSeparator) : [value]
		;

		for( let chunk of chunks ){
			base10Value = baseXToBase10(chunk, chunkAlphabet);

			if( valueIsNumber ){
				decodedValue += `${base10Value}`;
			} else {
				base64Value += base10toBaseX(base10Value, BASE64_ALPHABET);
			}
		}

		if( decodedValue === '' ){
			decodedValue = base64ToString(base64Value, __methodName__)
			if( valueIsNegativeNumber ){
				decodedValue = `-${decodedValue}`;
			}
		}

		if( !useChunks && valueIsNumber ){
			decodedValue = Number(decodedValue);
			if( valueIsNegativeNumber && (decodedValue >= 0) ){
				decodedValue = -decodedValue;
			}
		}

		return decodedValue;
	}
}
