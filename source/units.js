/*!
 * Module Units
 */

/**
 * @namespace Units
 */

const MODULE_NAME = 'Units';



//###[ IMPORTS ]########################################################################################################

import {orDefault, assert, isNaN, isArray, round} from './basic.js';



//###[ DATA ]###########################################################################################################

export const
	LOCAL_FLOAT_SEPARATOR = (0.1).toLocaleString().replace(/[0-9]/g, '').slice(0, 1),
	LOCAL_THOUSAND_SEPARATOR = (1000).toLocaleString().replace(/[0-9]/g, '').slice(0, 1)
;



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Units:asFileSize
 */

/**
 * Renders a byte number as a human-readable file size with the correct unit.
 *
 * Switch calculation base by setting useBinaryBase to true.
 * Today, file sizes are usually calculated against a decimal base of 1000, while in the
 * past, a binary base of 1024 was commonly used (and still is today by some software such as Microsoft Windows).
 * In 1998 the IEC standardized byte units to be metric in nature, which is the base assumption of this method.
 *
 * @param {Number} bytes - file size in bytes to render as string
 * @param {?String} [separator=LOCAL_FLOAT_SEPARATOR] - the character to separate the fraction in float numbers, will default to the current browser's default for local strings
 * @param {?Number} [precision=1] - the floating point precision to use for the size
 * @param {?Boolean} [useBinaryBase=false] - set to true to activate binary calculation and units
 * @returns {String} the formatted file size
 *
 * @memberof Units:asFileSize
 * @alias asFileSize
 * @see https://en.wikipedia.org/wiki/Kilobyte
 * @example
 * asFileSize(1_500_000, ',')
 * => '1,5 MB'
 * asFileSize(1024, '.', 0, true)
 * => '1 KiB'
 */
export function asFileSize(bytes, separator=LOCAL_FLOAT_SEPARATOR, precision=1, useBinaryBase=false){
	const __methodName__ = 'asFileSize';

	bytes = parseInt(bytes, 10);
	assert(
		!isNaN(bytes) && (bytes >= 0),
		`${MODULE_NAME}:${__methodName__} | bytes not usable or negative`
	);

	separator = orDefault(separator, LOCAL_FLOAT_SEPARATOR, 'str');
	precision = orDefault(precision, 1, 'int');

	const
		thresh = !!useBinaryBase ? 1024 : 1000,
		units = !!useBinaryBase
			? ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB']
			: ['kB','MB','GB','TB','PB','EB','ZB','YB']
	;

	if( bytes < thresh ){
		return `${bytes} B`;
	}

	let unitIndex = -1;
	do {
		bytes /= thresh;
		unitIndex++;
	} while(
		(bytes >= thresh)
		&& (unitIndex < (units.length - 1))
	);

	bytes = `${round(bytes, precision)}`.replace('.', separator);
	return `${bytes} ${units[unitIndex]}`;
}



/**
 * @namespace Units:asCurrency
 */

/**
 * Renders a number as a currency value, using native Intl.NumberFormat functionality.
 *
 * @param {Number} number - the number to use as a currency amount
 * @param {?String|Array<String>} [locale='en-US'] - locale to use, use array to define fallback; always falls back to en-US if nothing else works
 * @param {?String} [currency='USD'] - a ISO4217 currency code, such as EUR for Euro
 * @param {?String} [currencyDisplay='symbol'] - one of "symbol", "narrowSymbol", "code" or "name", defining, how the currency should be displayed in the result
 * @returns {String} the formatted currency amount
 *
 * @memberof Units:asCurrency
 * @alias asCurrency
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 * @see https://en.wikipedia.org/wiki/ISO_4217#List_of_ISO_4217_currency_codes
 * @example
 * asCurrency(42.666)
 * => '42.67 $'
 * asCurrency(42.666, 'de-DE', 'EUR')
 * => '42,67 €'
 */
export function asCurrency(number, locale='en-US', currency='USD', currencyDisplay='symbol'){
	number = parseFloat(number);

	locale = orDefault(locale, 'en-US');
	if(
		(!isArray(locale) && (locale !== 'en-US'))
		|| (isArray(locale) && !locale.includes('en-US'))
	){
		locale = [].concat(locale).concat('en-US');
	}

	currency = orDefault(currency, 'USD', 'str');
	currencyDisplay = orDefault(currencyDisplay, 'symbol', 'str');

	return new Intl.NumberFormat(
		locale,
		{
			style : 'currency',
			currency,
			currencyDisplay,
		}
	).format(number);
}



/**
 * @namespace Units:asDecimal
 */

/**
 * Renders a number as a decimal value, using native Intl.NumberFormat functionality.
 *
 * @param {Number} number - the number to use as a decimal amount
 * @param {?String|Array<String>} [locale='en-US'] - locale to use, use array to define fallback; always falls back to en-US if nothing else works
 * @param {?Number} [minPrecision=2] - the minimal precision to use in decimal display
 * @param {?Number} [maxPrecision=null] - the minimal precision to use in decimal display; if nullish, will be set to minPrecision
 * @returns {String} the formatted decimal amount
 *
 * @memberof Units:asDecimal
 * @alias asDecimal
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 * @example
 * asDecimal(42.666)
 * => '42.67'
 * asDecimal(42.666, 'de-DE', 1)
 * => '42,7'
 */
export function asDecimal(number, locale='en-US', minPrecision=2, maxPrecision=null){
	number = parseFloat(number);

	locale = orDefault(locale, 'en-US');
	if(
		(!isArray(locale) && (locale !== 'en-US'))
		|| (isArray(locale) && !locale.includes('en-US'))
	){
		locale = [].concat(locale).concat('en-US');
	}

	minPrecision = orDefault(minPrecision, 2, 'int');
	maxPrecision = orDefault(maxPrecision, minPrecision, 'int');

	return new Intl.NumberFormat(
		locale,
		{
			style : 'decimal',
			useGrouping : false,
			minimumFractionDigits : minPrecision,
			maximumFractionDigits : maxPrecision
		}
	).format(number);
}
