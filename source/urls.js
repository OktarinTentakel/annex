/*!
 * Module Urls
 */

/**
 * @namespace Urls
 */

const MODULE_NAME = 'Urls';



//###[ IMPORTS ]########################################################################################################

import {hasValue, orDefault, size} from './basic.js';



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
