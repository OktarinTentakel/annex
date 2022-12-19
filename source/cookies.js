/*!
 * Module Cookies
 */

/**
 * @namespace Cookies
 */

const MODULE_NAME = 'Cookies';



//###[ IMPORTS ]########################################################################################################

import {assert, isA, orDefault, hasValue} from './basic.js';
import {warn} from './logging.js';



//###[ HELPERS ]########################################################################################################

/*
 * Encodes a string to be stored in a cookie.
 */
function encodeCookieValue(value){
	return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
}



/*
 * Decodes a cookie value to be used as a string in JavaScript.
 */
function decodeCookieValue(value){
	if( value[0] === '"' ){
		value = value.slice(1, -1);
	}
	return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
}



/*
 * Makes sure a cookie name conforms to the cookie name rules and translates special chars to % representations.
 */
function encodeCookieName(name){
	return encodeURIComponent(`${name}`)
		.replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
		// using escape, because encodeURIComponent, indeed, does _not_ encode brackets
		.replace(/[()]/g, escape)
	;
}



/*
 * Decodes a cookie name, set prior with encodeCookieName to a standard JavaScript string again.
 */
function decodeCookieName(name){
	return decodeURIComponent(name);
}



/**
 * @typedef CookieOptions
 * @type {Object}
 * @property {?Date|Number} [expires=null] - expiry time of the cookie, either a Date object or time in days
 * @property {?Number} [max-age=null] - max age of the cookie in seconds
 * @property {?String} [path='/'] - the cookie path, setting this to "auto" or an empty string defines auto-mode, which targets the current site path, which usually is the default, but we use '/' to set a cookie for while site, this being the common use-case
 * @property {?Boolean} [secure=false] - define if the cookie should only be transmitted via https (see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
 * @property {?Boolean} [httponly=false] - define this, if cookie should only be sent to servers and not be accessible to javascript (see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
 * @property {?String} [samesite=null] - define if this cookie should be included in cross-site requests, may be either "strict" (will only ever transmit same-site), "lax" (usual browser default, transmits same-site and top-level GET) or "none" (no restrictions, will always be sent)
 */

/*
 * Makes sure, that supplied cookie options are in a usable form for setting a cookie.
 */
function normalizeCookieOptions(options){
	options = orDefault(options, {});

	const normalizedOptions = {};
	for( let optionsProp in options ){
		normalizedOptions[optionsProp.toLowerCase()] = options[optionsProp];
	}
	options = normalizedOptions;

	if( hasValue(options.expires) ){
		if( !isA(options.expires, 'date') ){
			options.expires = new Date(Date.now() + (Math.round(parseFloat(options.expires)) * 24 * 60 * 60 * 1000));
		}
		options.expires = options.expires.toUTCString();
	} else {
		options.expires = null;
	}

	options['max-age'] = orDefault(options['max-age'], null, 'int');

	options.path = orDefault(options.path, '/', 'str');
	if( options.path === 'auto' ){
		options.path = '';
	}

	options.domain = orDefault(options.domain, null, 'str');

	options.httponly = orDefault(options.httponly, false, 'bool');

	options.samesite = orDefault(options.samesite, 'lax', 'str').toLowerCase();
	if( !['strict', 'lax', 'none'].includes(options.samesite) ){
		console.warn(`${MODULE_NAME}:setCookie | unknown samesite mode "${options.samesite}"`);
	}

	options.secure = orDefault(options.secure, options.samesite === 'none', 'bool');

	return options;
}



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Cookies:getCookie
 */

/**
 * Retrieves a decoded cookie value by name. Automatically decodes the value (assumes, that, if encoded, url/percent
 * encoding has been used).
 *
 * @param {?String|Array<String>} [name] - the name of the cookie (or several names), if empty, all available cookies are returned
 * @returns {String|Object|null} decoded value of the cookie, null, if no such cookie available or a dictionary of found cookies if all or a list are being returned (if a list is requested and non are found, an empty object is returned)
 *
 * @memberof Cookies:getCookie
 * @alias getCookie
 * @see getCookies
 * @see setCookie
 * @see removeCookie
 * @example
 * getCookie('foobar')
 * => 'value'
 * getCookie(['foobar', 'boofar'])
 * => {foobar : 'value', boofar : 'value'}
 * getCookie()
 * => all available cookies
 */
export function getCookie(name){
	const
		names = hasValue(name) ? new Set([].concat(name).map(n => n.trim())) : new Set(),
		foundNames = new Set()
	;

	let res = (names.size === 0) ? {} : null;
	if( !hasValue(document.cookie) ) return res;

	const cookies = document.cookie.split(';');
	for( let i in cookies ){
		try {
			const
				cookie = cookies[i].trim(),
				cookieParts = cookie.split('='),
				cookieName = decodeCookieName(cookieParts[0]).trim(),
				cookieValue = decodeCookieValue(cookieParts.slice(1).join('='))
			;

			if( (cookieName !== '') && (names.has(cookieName) || (names.size === 0)) ){
				if( res === null ){
					res = {};
				}

				res[cookieName] = cookieValue;
				foundNames.add(cookieName);

				if( (foundNames.size === names.size) && (names.size !== 0) ){
					break;
				}
			}
		} catch(ex){
			warn(`${MODULE_NAME}:getCookie | decoding cookie "${cookies[i]}" failed with "${ex}"`)
		}
	}

	if( names.size === 1 ){
		return res?.[name] ?? null;
	} else {
		return res;
	}
}



/**
 * @namespace Cookies:getCookies
 */

/**
 * Retrieve decoded cookie values by name. If no name is provided, all available cookie are being returned.
 * Automatically decodes the values (assumes, that, if encoded, url/percent encoding has been used).
 *
 * You can provide names as an array or as comma-separated parameters.
 *
 * @param {?String|Array<String>} [names] - the names of the cookies, if empty or not set, all available cookies are returned
 * @returns {Object} dictionary of named decoded values of the cookies, will be empty if none of the cookies were available
 *
 * @memberof Cookies:getCookies
 * @alias getCookies
 * @see getCookie
 * @see setCookie
 * @see removeCookie
 * @example
 * getCookies(['foobar', 'boofar'])
 * => {foobar : 'value', boofar : 'value'}
 * getCookies('foobar', 'boofar')
 * => {foobar : 'value', boofar : 'value'}
 * getCookie()
 * => all available cookies
 */
export function getCookies(names){
	names = [];
	Array.from(arguments).forEach(argument => {
		names = names.concat(argument);
	});

	return getCookie(names);
}



/**
 * @namespace Cookies:setCookie
 */

/**
 * Set a cookie value (if possible) by name. Value will automatically be encoded.
 *
 * If you set a cookie to a nullish value, the method will try to remove the cookie with the given options.
 *
 * @param {String} name - the name of the cookie to set
 * @param {?String} [value] - the value of the cookie to set
 * @param {?CookieOptions} [options] - the cookie options to apply
 * @returns {String|null} returns the set cookie value if available after setting or null if cookie not available (which would also mean, that setting the cookie did not work, or, in case of removal, that the removal worked)
 *
 * @memberof Cookies:setCookie
 * @alias setCookie
 * @see getCookie
 * @see getCookies
 * @see removeCookie
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#write_a_new_cookie
 * @example
 * setCookie('mykittencookie', 'meow meow', {expires : 7, path : '/kittens', secure : true, samesite : 'strict'});
 */
export function setCookie(name, value, options){
	assert(hasValue(name) && (name !== ''), `${MODULE_NAME}:setCookie | no usable name`);

	name = `${name}`.trim();
	value = hasValue(value) ? encodeCookieValue(orDefault(value, '', 'str')) : null;
	options = normalizeCookieOptions(options);

	let cookieOptions = '';
	for( let optionsProp in options ){
		const option = options[optionsProp];

		if( !hasValue(option) || (option === false) ) continue;

		cookieOptions += `; ${optionsProp}`;

		if( option === true ) continue;

		// if the value itself contains a semicolon, according to RFC 6265 section 5.2,
		// we use everything that comes before the semicolon as the value and drop the rest
		cookieOptions += `=${option.split(';')[0]}`;
	}

	if( hasValue(value) ){
		document.cookie = `${encodeCookieName(name)}=${value}${cookieOptions}`;
	} else {
		removeCookie(name, options);
	}

	return getCookie(name);
}



/**
 * @namespace Cookies:removeCookie
 */

/**
 * Removes a cookie (if possible) by name.
 *
 * @param {String} name - the name of the cookie to remove
 * @param {?CookieOptions} [options] - the cookie options to apply (needed for different paths/domains for example)
 * @returns {Boolean} true if cookie is not available anymore after removal, if this is false, cookie removal failed or another cookie of the same name is still available
 *
 * @memberof Cookies:removeCookie
 * @alias removeCookie
 * @see getCookie
 * @see getCookies
 * @see setCookie
 * @example
 * removeCookie('mykittencookie', {path : '/kittens'});
 */
export function removeCookie(name, options){
	assert(hasValue(name) && (name !== ''), `${MODULE_NAME}:removeCookie | no usable name`);

	options = normalizeCookieOptions(options);
	options.expires = -1;

	return (setCookie(name, '', options) === null);
}
