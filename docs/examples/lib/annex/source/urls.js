/*!
 * Module Urls
 */

/**
 * @namespace Urls
 */

const MODULE_NAME = 'Urls';



//###[ IMPORTS ]########################################################################################################

import {hasValue, orDefault, size, assert} from './basic.js';
import {log} from './logging.js';



//###[ DATA ]###########################################################################################################

export const COMMON_TOP_LEVEL_DOMAINS = [
	'aero', 'biz', 'cat', 'com', 'coop', 'edu', 'gov', 'info', 'int', 'jobs', 'mil', 'mobi', 'museum', 'name', 'net',
	'org', 'travel', 'ac', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'an', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw',
	'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bv', 'bw', 'by',
	'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cs', 'cu', 'cv', 'cx', 'cy',
	'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm',
	'fo', 'fr', 'ga', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu',
	'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je',
	'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk',
	'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr',
	'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu',
	'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro',
	'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'st', 'su',
	'sv', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tm', 'tn', 'to', 'tp', 'tr', 'tt', 'tv', 'tw', 'tz',
	'ua', 'ug', 'uk', 'um', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'yu',
	'za', 'zm', 'zr', 'zw', 'local'
];



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Urls:urlParameter
 */

/**
 * Searches for and returns parameters embedded in the provided url containing a query string
 * (make sure all values are url encoded).
 *
 * You may also just provide the query string.
 *
 * Returns a single parameter's value if a parameter name is given, otherwise returns dictionary with all parameters
 * as keys and the associated parameter value.
 *
 * If a parameter has more than one value the values are returned as an array, whether being requested by name
 * or in the dictionary containing all params.
 *
 * If a parameter is set, but has no defined value (name present, but no = before next param)
 * the value is returned as boolean true.
 *
 * @param {String} url - the url containing the parameter string, is expected to be url-encoded (at least stuff like [+?&=]), may also be only the query string (_must_ begin with ?)
 * @param {?String} [parameter=null] - the name of the parameter to extract
 * @throws error if given url is not usable
 * @returns {null|true|String|Array|Object} null in case the parameter doesn't exist, true in case it exists but has no value, a string in case the parameter has one value, or an array of values, or a dictionary object of all available parameters with corresponding values
 *
 * @memberof Urls:urlParameter
 * @alias urlParameter
 * @example
 * const hasKittens = urlParameter('//foobar.com/bar?has_kittens', 'has_kittens');
 * => true
 * const hasDoggies = urlParameter('has_doggies=yes&has_doggies', 'has_doggies');
 * => ['yes', true]
 * const allTheData = urlParameter('?foo=foo&bar=bar&bar=barbar&bar');
 * => {foo : 'foo', bar : ['bar', 'barbar', true]}
 */
export function urlParameter(url, parameter=null){
	const __methodName__ = 'urlParameter';

	url = orDefault(url, '', 'str');
	parameter = orDefault(parameter, null, 'str');

	let searchParams;
	if( !url.startsWith('?') ){
		if(	!url.startsWith('http://') && !url.startsWith('https://') ){
			const protocol = window.location.protocol;
			url = `${url.startsWith('//') ? protocol : protocol+'//'}${url}`;
		}

		try {
			searchParams = new URL(url).searchParams;
		} catch {
			throw new Error(`${MODULE_NAME}:${__methodName__} | invalid url "${url}"`);
		}
	} else {
		searchParams = new URLSearchParams(url);
	}

	const fMapParameterValue = parameterValue => ((parameterValue === '') ? true : parameterValue);

	if( hasValue(parameter) ){
		const parameterValues = searchParams.getAll(parameter);
		if( parameterValues.length === 0 ){
			return null;
		} else if( parameterValues.length === 1 ){
			return fMapParameterValue(parameterValues[0]);
		} else {
			return Array.from(new Set(parameterValues.map(fMapParameterValue)));
		}
	} else {
		const parameters = {};
		Array.from(searchParams.keys()).forEach(parameterName => {
			const parameterValues = searchParams.getAll(parameterName);
			if( parameterValues.length > 0 ){
				parameters[parameterName] =
					(parameterValues.length === 1)
					? fMapParameterValue(parameterValues[0])
					: Array.from(new Set(parameterValues.map(fMapParameterValue)))
				;
			}
		});
		return (size(parameters) > 0) ? parameters : null;
	}
}



/**
 * @namespace Urls:urlParameters
 */

/**
 * Searches for and returns parameters embedded in provided url with a parameter string.
 *
 * Semantic shortcut version of urlParameter without any given parameter.
 *
 * @param {String} url - the url containing the parameter string, is expected to be url-encoded (at least stuff like [+?&=]), may also be only the query string (_must_ begin with ?)
 * @throws error if given url is not usable
 * @returns {Object|null} dictionary object of all parameters or null if url has no parameters
 *
 * @memberof Urls:urlParameters
 * @alias urlParameters
 * @see urlParameter
 * @example
 * const allParams = urlParameters('http://www.foobar.com?foo=foo&bar=bar&bar=barbar&bar');
 * => {foo : 'foo', bar : ['bar', 'barbar', true]}
 */
export function urlParameters(url){
	return urlParameter(url);
}



/**
 * @namespace Urls:urlAnchor
 */

/**
 * Returns the currently set URL-Anchor on given URL.
 *
 * Theoretically, this function also works with any other string containing a hash (as long as there is "#" included),
 * since this implementation does not lean on "new URL()", but is a simple string operation.
 *
 * In comparison to "location.hash", this function actually decodes the hash automatically.
 *
 * @param {String} url - the url, in which to search for a hash
 * @param {?Boolean} [withCaret=false] - defines if the returned anchor value should contain leading "#"
 * @returns {String|null} current anchor value or null if no anchor was found
 *
 * @memberof Urls:urlAnchor
 * @alias urlAnchor
 * @example
 * const anchorWithoutCaret = urlAnchor('https://foobar.com#test');
 * => 'test'
 * const hrefAnchorWithCaret = urlAnchor(linkElement.getAttribute('href'), true);
 * => '#test'
 * const decodedAnchorFromLocation = urlAnchor(window.location.hash);
 */
export function urlAnchor(url, withCaret=false){
	url = orDefault(url, '', 'str');
	withCaret = orDefault(withCaret, false, 'bool');

	const urlParts = url.split('#');

	let anchor = (urlParts.length > 1) ? decodeURIComponent(urlParts[1].trim()) : null;
	if( anchor === '' ){
		anchor = null;
	}
	if( withCaret && hasValue(anchor) ){
		anchor = `#${anchor}`;
	}

	return anchor;
}



/**
 * @namespace Urls:addNextParameter
 */

/**
 * Adds a "next"-parameter to a given URL. If there is already a parameter of that name, it will be replaced.
 *
 * A "next"-parameter is usually used to relay a second URL, which should be redirected to after something happens,
 * such as a login or another (possibly automatic) action.
 *
 * @param {?String} [url=''] - the URL to add the next parameter to, if left empty, will be "", which is synonymous with the current URL
 * @param {?String} [next=''] - the next URL to add as parameter to the given URL (will automatically be URL-encoded)
 * @param {?String} [paramName='next'] - the name of the next parameter
 * @param {?Boolean} [assertSameBaseDomain=false] - if true, url and next must have the same base domain (ignoring subdomains), to prevent injections
 * @param {?Array<String>} [additionalTopLevelDomains=null] - this function uses a list of common TLDs (if assertSameBaseDomain is true), if yours is missing, you may provide it, using this parameter
 * @throws error if assertBaseDomain is true an the base domains of url and next differ
 * @returns {String} the transformed URL with the added next parameter
 *
 * @memberof Urls:addNextParameter
 * @alias addNextParameter
 * @example
 * addNextParameter('https://foobar.com', 'https://foo.bar', 'redirect');
 * => 'https://foobar.com?redirect=https%3A%2F%2Ffoo.bar'
 * addNextParameter('https://foobar.com?next=https%3A%2F%2Ffoo.bar', 'https://kittens.com');
 * => 'https://foobar.com?next=https%3A%2F%2Fkittens.com'
 */
export function addNextParameter(url, next, paramName='next', assertSameBaseDomain=false, additionalTopLevelDomains=null){
	const __methodName__ = 'addNextParameter';

	url = new URL(orDefault(url, '', 'str'));
	next = new URL(orDefault(next, '', 'str'));
	paramName = orDefault(paramName, 'next', 'str');
	assertSameBaseDomain = orDefault(assertSameBaseDomain, true, 'bool');

	if( assertSameBaseDomain ){
		assert(
			evaluateBaseDomain(url.hostname, additionalTopLevelDomains) === evaluateBaseDomain(next.hostname, additionalTopLevelDomains),
			`${MODULE_NAME}:${__methodName__} | different base domains in url and next`
		);
	}

	const urlParams = new URLSearchParams(url.search);

	if( urlParams.has(paramName) ){
		log().info(`${MODULE_NAME}:${__methodName__} | replaced "${paramName}" value "${urlParams.get(paramName)}" with "${next.href}"`);
	}

	urlParams.set(paramName, next.href);

	return `${url.origin}${url.pathname}?${urlParams.toString().replaceAll('+', '%20')}${url.hash}`;
}



/**
 * @namespace Urls:addCacheBuster
 */

/**
 * Adds a cache busting parameter to a given URL. If there is already a parameter of that name, it will be replaced.
 * This prevents legacy browsers from caching requests by changing the request URL dynamically, based on current time.
 *
 * @param {?String} [url=''] - the URL to add the cache busting parameter to, if left empty, will be "", which is synonymous with the current URL
 * @param {?String} [paramName='_'] - the name of the cache busting parameter
 * @returns {String} the transformed URL with the added cache busting parameter
 *
 * @memberof Urls:addCacheBuster
 * @alias addCacheBuster
 * @example
 * addCacheBuster('https://foobar.com');
 * => 'https://foobar.com?_=1648121948009'
 * addCacheBuster('https://foobar.com?next=https%3A%2F%2Ffoo.bar', 'nocache');
 * => 'https://foobar.com?next=https%3A%2F%2Ffoo.bar&nocache=1648121948009'
 */
export function addCacheBuster(url, paramName='_'){
	const __methodName__ = 'addCacheBuster';

	url = new URL(orDefault(url, '', 'str'));

	const
		urlParams = new URLSearchParams(url.search),
		buster = Date.now()
	;

	if( urlParams.has(paramName) ){
		log().info(`${MODULE_NAME}:${__methodName__} | replaced "${paramName}" value "${urlParams.get(paramName)}" with "${buster}"`);
	}

	urlParams.set(paramName, buster);

	return `${url.origin}${url.pathname}?${urlParams}${url.hash}`;
}



/**
 * @namespace Urls:evaluateBaseDomain
 */

/**
 * Walks a domain string (e.g. foobar.barfoo.co.uk) backwards, separated by dots, skips over all top level
 * domains it finds and includes the first non-TLD value to retrieve the base domain without any subdomains
 * (e.g. barfoo.co.uk).
 *
 * This is not completely fool-proof in case of very exotic TLDs, but quite robust in most cases.
 *
 * This method is particularly helpful if you want to set a domain cookie while being on a subdomain.
 *
 * @param {String} domain - the domain string (hostname), which should be evaluated; you may also provide a full, parsable URL, from which to extract the hostname
 * @param {?Array<String>} [additionalTopLevelDomains=null] - this function uses a list of common TLDs, if yours is missing, you may provide it, using this parameter
 * @returns {String} the evaluated base domain string
 *
 * @memberof Urls:evaluateBaseDomain
 * @alias evaluateBaseDomain
 * @example
 * evaluateBaseDomain('foobar.barfoo.co.uk');
 * => 'barfoo.co.uk'
 * evaluateBaseDomain('https://foobar.barfoo.co.uk/?foo=bar');
 * => 'barfoo.co.uk'
 */
export function evaluateBaseDomain(domain, additionalTopLevelDomains=null){
	domain = orDefault(domain, window.location.hostname, 'str');
	additionalTopLevelDomains = orDefault(additionalTopLevelDomains, null, 'arr');

	let url;
	try {
		url = new URL(domain);
	} catch(error){
		url = null;
	}
	if( hasValue(url) ){
		domain = url.hostname;
	}

	const
		topLevelDomains = new Set([
			...COMMON_TOP_LEVEL_DOMAINS,
			...(hasValue(additionalTopLevelDomains) ? additionalTopLevelDomains.map(tld => `${tld}`) : [])
		]),
		domainParts = domain.split('.').reverse()
	;

	let baseDomain = domain;

	if( domainParts.length > 2 ){
		let i;

		for( i = 0; i < domainParts.length; i++ ){
			if( !topLevelDomains.has(domainParts[i]) ){
				break;
			}
		}

		baseDomain = domainParts.slice(0, i + 1).reverse().join('.');
	}

	return baseDomain;
}
