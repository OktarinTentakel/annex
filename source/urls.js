/*!
 * Module Urls
 */

/**
 * @namespace Urls
 */

const MODULE_NAME = 'Urls';



//###[ IMPORTS ]########################################################################################################

import {
	hasValue,
	orDefault,
	size,
	assert,
	isFunction,
	isString,
	isArray,
	isObject,
	isPlainObject,
	isNaN,
	isEmpty
} from './basic.js';
import {log} from './logging.js';
import {replace} from './strings.js';



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

const
	URISON_VALUE_FORMAT = `[^\-0123456789 '!:(),*@$][^ '!:(),*@$]*`,
	URISON_VALUE_REX = new RegExp(`^${URISON_VALUE_FORMAT}$`),
	URISON_NEXT_VALUE_REX = new RegExp(URISON_VALUE_FORMAT, 'g')
;



//###[ HELPERS ]########################################################################################################

/**
 * A parser to translate a Rison string such as `'(key1:value,key2:!t,key3:!(!f,42,!n))'` into its
 * JSON object/array representation `{key1 : 'value', key2 : true, key3 : [false, 42, null]}`. This is a helper class
 * for the public Urison class below.
 *
 * @protected
 * @memberof Urls
 * @name UrisonParser
 *
 * @see https://github.com/Nanonid/rison
 * @example
 * new UrisonParser(error => { console.error(error); });
 */
class UrisonParser {

	#__className__ = 'UrisonParser';
	#errorHandler;
	#string = '';
	#index = 0;
	#message = null;
	#bangTokens;
	#tokenMap;

	/**
	 * Creates a new UrisonParser instance.
	 *
	 * All errors in this class result in a console error message rather than an exception. To work with occurring
	 * errors, define an errorCallback for the constructor and throw errors from there if needed.
	 *
	 * @param {Function} [errorHandler=null] - function to call in case parsing fails, receives the error message and the character index as parameters
	 */
	constructor(errorHandler=null){
		const instance = this;

		this.#errorHandler = isFunction(errorHandler) ? errorHandler : null;

		// syntax tokens preceded with a "!" and the values they represent in JSON
		this.#bangTokens = {
			't' : true,
			'f' : false,
			'n' : null,
			'(' : this.#parseArray
		};

		// syntax structure tokens and the procedures, that transform these tokens into json structure
		this.#tokenMap = {
			'!' : function(){
				const char = instance.#string.charAt(instance.#index++);
				if( char === '' ) return instance.#error('"!" at end of input');

				const value = instance.#bangTokens[char];
				if( value === undefined ) return instance.#error(`unknown literal: "!${char}"`);
				if( isFunction(value) ) return value.call(this);

				return value;
			},

			'(' : function(){
				const res = {};
				let
					first = true,
					char
				;

				while( (char = instance.#next()) !== ')' ){
					if( !first ){
						if( char !== ',' ){
							return instance.#error('missing ","');
						}
					} else if( char === ',' ){
						return instance.#error('extra ","');
					} else {
						instance.#index--;
					}

					const key = instance.#readValue();
					if( key === undefined ) return undefined;
					if( instance.#next() !== ':' ) return instance.#error('missing ":"');

					const value = instance.#readValue();
					if( value === undefined ) return undefined;
					res[key] = value;

					first = false;
				}

				return res;
			},

			"'" : function(){
				const segments = [];
				let
					i = instance.#index,
					start = instance.#index,
					char
				;

				while( (char = instance.#string.charAt(i++)) !== "'" ){
					if( char === '' ) return instance.#error(`unmatched "'"`);
					if( char === '!' ){
						if( start < (i - 1) ){
							segments.push(instance.#string.slice(start, i - 1));
						}
						char = instance.#string.charAt(i++);
						if( ['!', "'"].includes(char) ){
							segments.push(char);
						} else {
							return instance.#error(`invalid string escape: "!${char}"`);
						}
						start = i;
					}
				}
				if( start < (i - 1) ){
					segments.push(instance.#string.slice(start, i - 1));
				}
				instance.#index = i;

				return (segments.length === 1) ? segments[0] : segments.join('');
			},

			'-' : function(){
				const
					start = instance.#index - 1,
					numberTypeMap = {
						'int+.' : 'frac',
						'int+e' : 'exp',
						'frac+e' : 'exp'
					}
				;
				let
					s = instance.#string,
					i = instance.#index,
					numberType = 'int',
					permittedSigns = '-'
				;

				do {
					const char = s.charAt(i++);
					if( char === '' ) break;
					if( (char >= '0') && (char <= '9') ) continue;
					if( permittedSigns.includes(char) ){
						permittedSigns = '';
						continue;
					}

					numberType = numberTypeMap[`${numberType}+${char.toLowerCase()}`];
					if( numberType === 'exp' ){
						permittedSigns = '-';
					}
				} while( numberType !== undefined );

				i--;
				instance.#index = i;
				s = s.slice(start, i);
				if( s === '-' ) return instance.#error('invalid number');
				return Number(s);
			}
		};

		(function(tokenMap){
			for( let i = 0; i <= 9; i++ ){
				tokenMap[`${i}`] = tokenMap['-'];
			}
		})(this.#tokenMap);
	}



	/**
	 * Parses a Rison string into a JSON object.
	 * Resets internal parsing info, like parsing index, to start new parsing process.
	 *
	 * @param {String} risonString - the string to parse
	 * @returns {Object|Array|undefined} the parsed JSON object or undefined, in case parsing failed
	 *
	 * @example
	 * (new UrisonParser()).parse('(key1:value,key2:!t,key3:!(!f,42,!n))')
	 * => {key1 : 'value', key2 : true, key3 : [false, 42, null]}
	 */
	parse(risonString){
		this.#string = `${risonString}`;
		this.#index = 0;
		this.#message = null;

		let value = this.#readValue();

		const trailingChar = this.#next();
		if( !this.#message && (trailingChar !== undefined) ){
			let detailMessage;
			if( /\s/.test(trailingChar) ){
				detailMessage = 'whitespace detected';
			} else {
				detailMessage = `trailing char "${trailingChar}"`;
			}
			value = this.#error(`unable to parse string "${risonString}", ${detailMessage}`);
		}

		if( this.#message && this.#errorHandler ){
			this.#errorHandler(this.#message, this.#index);
		}

		return value;
	}



	/**
	 * Parses the structure of an array. Is a helper function for #parse/#readValue.
	 * Works with previously set internal parsing info such as string and parsing index.
	 *
	 * @returns {Array|undefined} the parsed array or undefined, in case parsing failed
	 *
	 * @private
	 * @example
	 * this.#parseArray()
	 * => [true, null, 'value']
	 */
	#parseArray(){
		const res = [];
		let char;

		while( (char = this.#next()) !== ')' ){
			if( char === '' ) return this.#error('unmatched "!("');

			if( !isEmpty(res) ){
				if( char !== ',' ){
					return this.#error('missing ","');
				}
			} else if( char === ',' ){
				return this.#error('extra ","');
			} else {
				this.#index--;
			}

			const value = this.#readValue();
			if( value === undefined ) return undefined;
			res.push(value);
		}

		return res;
	}



	/**
	 * Either reads the next value or key in the current parser string or triggers recursive handling of syntax tokens.
	 * Progresses parsing to the next section so to speak.
	 *
	 * @returns {Object|Array|String|Number|Boolean|null|undefined} the parsed value or undefined if parsing failed
	 *
	 * @private
	 * @example
	 * this.#readValue()
	 * => 'valueorkeyorstructure'
	 */
	#readValue(){
		const
			char = this.#next(),
			mapper = this.#tokenMap[char]
		;

		if( isFunction(mapper) ) return mapper.apply(this);

		const i = this.#index - 1;
		URISON_NEXT_VALUE_REX.lastIndex = i;
		const matches = URISON_NEXT_VALUE_REX.exec(this.#string);
		if( !isEmpty(matches) ){
			const id = matches[0];
			this.#index = i + id.length;
			return id;
		}

		if( hasValue(char) && (char !== '') ) return this.#error(`invalid character "${char}"`);
		return this.#error('empty expression');
	}



	/**
	 * Reads the next character of the currently given Rison string, increments the index
	 * and returns the character.
	 *
	 * @returns {String|undefined} the next character or undefined if there is none
	 *
	 * @private
	 * @example
	 * this.#next()
	 * => '!'
	 */
	#next(){
		let
			i = this.#index,
			char
		;

		if( i >= this.#string.length ) return undefined;
		char = this.#string.charAt(i++);
		this.#index = i;

		return char;
	}



	/**
	 * Sets the error message and writes it to `console.error()` for info purposes.
	 * This method does _not_ throw an exception, for this, please set an error handler
	 * in the constructor and throw it externally.
	 *
	 * @param {String} message - the error message
	 * @returns {undefined} is always undefined to be uniform return value for failed value parsing in case of error
	 *
	 * @private
	 * @example
	 * this.#error('oh noez')
	 * => undefined
	 */
	#error(message){
		console.error(`${this.#__className__} error: `, message);
		this.#message = message;
		return undefined;
	}

}



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Urls:urlHref
 */

/**
 * Will return a fully qualified URL based on the given URL base string for use as a href/source-value
 * or navigation target.
 *
 * Provide a base URL or leave the URL out, to use the current URL.
 * Add GET-parameters (adding to those already present in the URL), define an anchor (or automatically get the one
 * defined in the URL).
 *
 * Provided URLs are handled with some automagic:
 * - a URL starting with "//" will receive the current page protocol
 * - a URL starting with a single "/" will be seen as relative and will be expanded to an absolute URL, based
 *   on the current URL
 * - a URL starting with "?" will be treated as a singular query string, resulting in the query being added to the
 *   current URL, replacing any present query
 * - a URL starting with "#" will be treated as a singular hash string, resulting in the hash being added to the
 *   current URL, replacing any present hash
 * - if, after all automagic applied, the URL still does not start with a http-protocol, the current page's protocol
 *   will be added
 *
 * Provided params have to be a flat plain object, with ordinal values or arrays of ordinal values on the first level.
 * Everything else will be stringified and url-encoded as is. Usually, parameters defined here add to present
 * parameters in the URL. To force-override present values, declare the param name with a "!" prefix
 * (`{'!presentparam' : 'new'}`).
 *
 * This method implements some quality-of-life improvements, that differ from the native result of `new URL().href`:
 * - `+`-encoding for whitespace is replaced with `%20`, while `+` will stay what it is, a verbatim URL-safe character
 *   with repeating keys (`tags=1&tags=2&tags=3`)
 * - empty parameters are rendered without "=". So, "?test=&foo" will be "?test&foo"
 * - `path/?` will become just `path?`
 * - `path/#` will become just `path#`
 * - trailing slashes will be removed
 * - parameters will be sorted alphabetically by keys
 *   (value order will be kept if possible, might change, when using markListParams)
 * - identical key/value pairs will be reduced to one occurrence, so `?q=a&q=a` will become `?q=a`
 *
 * @param {?String|URL} [url=null] - the base URL to use, if nullish current location is used
 * @param {?Object} [params=null] - plain object of GET-parameters to add to the url
 * @param {?String} [anchor=null] - anchor/hash to set, has precedence over URL hash
 * @param {?Boolean} [markListParams=false] - if true, params with more than one value will be marked with "[]" preceding the param name
 * @param {?Boolean} [keepEncodedUrlSafeChars=false] - if true, encoded chars, which are URL-safe, are kept encoded, instead of being returned raw
 * @throws error if url is not usable
 * @returns {String} the created URL including parameters and anchor
 *
 * @memberof Urls:urlHref
 * @alias urlHref
 * @example
 * buildUrl('https://test.com', {search : 'kittens', order : 'asc'}, 'fluffykittens');
 * => 'https://test.com?search=kittens&order=asc#fluffykittens'
 * buildUrl(null, {order : 'desc'});
 * => 'https://current.url?order=desc'
 */
export function urlHref(url=null, params=null, anchor=null, markListParams=false, keepEncodedUrlSafeChars=false){
	const __methodName__ = 'urlHref';

	url = orDefault(url, window.location.href, 'str');
	params = isPlainObject(params) ? params : null;
	anchor = orDefault(anchor, null, 'str');
	markListParams = orDefault(markListParams, false, 'bool');

	if( url === 'about:blank' ) return url;
	if( url.trim() === '' ){
		url = window.location.href;
	}
	if( url.startsWith('//') ){
		url = `${window.location.protocol}${url}`;
	} else if( url.startsWith('/') ){
		url = `${window.location.origin}${url}`;
	} else if( url.startsWith('?') ){
		const anchorPart = !url.includes('#') ? window.location.href.split('#')[1] : null;
		url = `${window.location.href.split('?')[0]}${url}${hasValue(anchorPart) ? '#'+anchorPart : ''}`;
	} else if( url.startsWith('#') ){
		url = `${window.location.href.split('#')[0]}${url}`;
	}
	if( !(/^https?:\/\//.test(url)) ){
		url = `${window.location.protocol}//${url}`;
	}

	let urlObj;
	try {
		urlObj = new URL(url);
	} catch(ex){
		throw new Error(`${MODULE_NAME}:${__methodName__} | unusable URL "${url}" [${ex}]`);
	}

	if( hasValue(anchor) ){
		urlObj.hash = anchor.startsWith('#') ? anchor : `#${anchor}`;
	}

	const urlParams = urlObj.searchParams;

	if( hasValue(params) ){
		for( let paramName in params ){
			let overrideName = paramName;
			if( paramName.startsWith('!') ){
				overrideName = paramName.slice(1);
			}

			if( overrideName !== paramName ){
				urlParams.delete(overrideName);
			}

			[].concat(params[paramName]).forEach(paramValue => {
				urlParams.append(overrideName, `${paramValue}`);
			});
		}
	}

	if( markListParams ){
		for( let k of urlParams.keys() ){
			const cleanKey = k.replace(/\[]$/, '');

			let presentValues = [].concat(urlParams.getAll(k));
			if( k.endsWith('[]') ){
				presentValues = presentValues.concat(urlParams.getAll(cleanKey));
			}

			if( (presentValues.length > 1) ){
				urlParams.delete(k);
				urlParams.delete(cleanKey);
				presentValues.forEach(v => {
					urlParams.append(`${cleanKey}[]`, v);
				});
			}
		}
	}

	let	query = urlObj.search
		.replace(/\+/g, '%20')
		.replace(/=&/g, '&')
		.replace(/=$/g, '')
	;

	if( !keepEncodedUrlSafeChars ){
		query = query
			.replaceAll('%2B', '+')
			.replaceAll('%5B', '[')
			.replaceAll('%5D', ']')
		;
	}

	let queryParts = query.startsWith('?') ? query.slice(1).split('&') : []
	if( !isEmpty(queryParts) ){
		queryParts.sort((a, b) => {
			const
				aKey = a.split('=')[0],
				bKey = b.split('=')[0]
			;
			return (aKey < bKey) ? -1 : ((aKey > bKey) ? 1 : 0 );
		});
		queryParts = queryParts.filter((part, index) => {
			if( index >= 1 ){
				return queryParts.indexOf(part) === index;
			} else {
				return true;
			}
		});
		query = `?${queryParts.join('&')}`;
	}

	let finalUrl;
	if( !isEmpty(query) ){
		finalUrl = `${urlObj.href.split('?')[0]}${query}${urlObj.hash}`.replace('/?', '?');
	} else if( !isEmpty(urlObj.hash) && isEmpty(query) ){
		finalUrl = `${urlObj.href.split('#')[0]}${urlObj.hash}`.replace('/#', '#');
	} else {
		finalUrl = urlObj.href.replace(/\/$/, '');
	}

	return keepEncodedUrlSafeChars ? finalUrl : replace(
		finalUrl,
		['%2C', '%3A', '%40', '%24', '%2F', '%2B'],
		[',', ':', '@', '$', '/', '+']
	);
}



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
 * @param {?String|URL} [url=null] - the url containing the parameter string, will use current URL if nullish
 * @param {?String} [parameter=null] - the name of the parameter to extract
 * @throws error if given url is not usable
 * @returns {null|true|String|Array|Object} null in case the parameter doesn't exist, true in case it exists but has no value, a string in case the parameter has one value, or an array of values, or a dictionary object of all available parameters with corresponding values
 *
 * @memberof Urls:urlParameter
 * @alias urlParameter
 * @see urlHref
 * @example
 * const hasKittens = urlParameter('//foobar.com/bar?has_kittens', 'has_kittens');
 * => true
 * const hasDoggies = urlParameter('has_doggies=yes&has_doggies', 'has_doggies');
 * => ['yes', true]
 * const allTheData = urlParameter('?foo=foo&bar=bar&bar=barbar&bar');
 * => {foo : 'foo', bar : ['bar', 'barbar', true]}
 */
export function urlParameter(url=null, parameter=null){
	url = urlHref(url, null, null, false, true);
	parameter = orDefault(parameter, null, 'str');

	const
		searchParams = new URL(url).searchParams,
		fMapParameterValue = parameterValue => ((parameterValue === '') ? true : parameterValue)
	;

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
 * @param {?String|URL} [url=null] - the url containing the parameter string, will use current URL if nullish
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
export function urlParameters(url=null){
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
 * @param {?String|URL} [url=null] - the url, in which to search for a hash, uses current url if nullish
 * @param {?Boolean} [withCaret=false] - defines if the returned anchor value should contain leading "#"
 * @throws error if given url is not usable
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
export function urlAnchor(url=null, withCaret=false){
	url = urlHref(url);
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
 * @throws error if url or next are not usable URLs
 * @throws error if assertBaseDomain is true an the base domains of url and next differ
 * @returns {String} the transformed URL with the added next parameter
 *
 * @memberof Urls:addNextParameter
 * @alias addNextParameter
 * @see urlHref
 * @example
 * addNextParameter('https://foobar.com', 'https://foo.bar', 'redirect');
 * => 'https://foobar.com?redirect=https%3A%2F%2Ffoo.bar'
 * addNextParameter('https://foobar.com?next=https%3A%2F%2Ffoo.bar', 'https://kittens.com');
 * => 'https://foobar.com?next=https%3A%2F%2Fkittens.com'
 */
export function addNextParameter(url, next, paramName='next', assertSameBaseDomain=false, additionalTopLevelDomains=null){
	const __methodName__ = 'addNextParameter';

	url = urlHref(url);
	next = urlHref(next);
	paramName = orDefault(paramName, 'next', 'str');
	assertSameBaseDomain = orDefault(assertSameBaseDomain, true, 'bool');

	if( assertSameBaseDomain ){
		assert(
			evaluateBaseDomain(new URL(url).hostname, additionalTopLevelDomains) === evaluateBaseDomain(new URL(next).hostname, additionalTopLevelDomains),
			`${MODULE_NAME}:${__methodName__} | different base domains in url and next`
		);
	}

	const params = new URL(url).searchParams;
	if( params.has(paramName) ){
		log().info(`${MODULE_NAME}:${__methodName__} | replaced "${paramName}" value "${params.get(paramName)}" with "${next}"`);
	}

	return urlHref(url, {[`!${paramName}`] : next});
}



/**
 * @namespace Urls:addCacheBuster
 */

/**
 * Adds a cache busting parameter to a given URL. If there is already a parameter of that name, it will be replaced.
 * This prevents legacy browsers from caching requests by changing the request URL dynamically, based on current time.
 *
 * @param {?String|URL} [url=null] - the URL to add the cache busting parameter to, if nullish, the current URL will be used
 * @param {?String} [paramName='_'] - the name of the cache busting parameter
 * @throws error if url is not a usable URL
 * @returns {String} the transformed URL with the added cache busting parameter
 *
 * @memberof Urls:addCacheBuster
 * @alias addCacheBuster
 * @see urlHref
 * @example
 * addCacheBuster('https://foobar.com');
 * => 'https://foobar.com?_=1648121948009'
 * addCacheBuster('https://foobar.com?next=https%3A%2F%2Ffoo.bar', 'nocache');
 * => 'https://foobar.com?next=https%3A%2F%2Ffoo.bar&nocache=1648121948009'
 */
export function addCacheBuster(url=null, paramName='_'){
	const __methodName__ = 'addCacheBuster';

	url = urlHref(url);

	const
		params = new URL(url).searchParams,
		buster = Date.now()
	;

	if( params.has(paramName) ){
		log().info(`${MODULE_NAME}:${__methodName__} | replaced "${paramName}" value "${params.get(paramName)}" with "${buster}"`);
	}

	return urlHref(url, {[`!${paramName}`] : buster})
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



/**
 * @namespace Urls:Urison
 */

/**
 * A class, which (re)implements the "Rison" standard of en- and decoding JSON structures to and from URL-safe strings,
 * which can be used as parameter or hash values, while staying readable and avoiding characters, which are not meant
 * to be used inside a URL.
 *
 * This is a renamed reimplementation of ES5 Rison, which has not gotten an update for years and should be fully
 * compatible with other available parsers for that standard.
 *
 * The basic idea is this:
 * We have some kind of complex data structure we want to serialize to a URL, to represent a current search and filter
 * setup for example. This structure should also be retrievable easily after a reload, to be able to use that config
 * as a starting point again for the page's search and filter widgets. A big plus here would be readability, which,
 * for instance, gets lost, if we just were to url-encode JSON as-is.
 *
 * This class provides the means to en- and decode JSON structures for usage in URLs. Additionally, it provides methods
 * to explicitly work with objects and array, for the en- and decoding process, removing the necessity to include
 * brackets into the result, making the string even leaner.
 *
 * See class documentation below for details.
 *
 * @memberof Urls:Urison
 * @name Urison
 *
 * @see Urison
 * @see https://github.com/Nanonid/rison
 * @example
 * (new Urison()).encode({key1 : 'value', key2 : true, key3 : [false, 42, null]})
 * => '(key1:value,key2:!t,key3:!(!f,42,!n))'
 * (new Urison()).decode('(key1:value,key2:!t,key3:!(!f,42,!n))')
 * => {key1 : 'value', key2 : true, key3 : [false, 42, null]}
 * (new Urison()).encodeObject({key1 : 'value', key2 : true, key3 : [false, 42, null]})
 * => 'key1:value,key2:!t,key3:!(!f,42,!n)'
 * (new Urison()).decodeObject('key1:value,key2:!t,key3:!(!f,42,!n)')
 * => {key1 : 'value', key2 : true, key3 : [false, 42, null]}
 * (new Urison()).encodeArray([false, 42, null])
 * => '!f,42,!n'
 * (new Urison()).decodeArray('!f,42,!n')
 * => [false, 42, null]
 */
class Urison {

	#__className__ = 'Urison';
	#autoEscape;
	#autoUnescape;
	#encoders;
	#parser;

	/**
	 * Creates a new Urison en- and decoder.
	 *
	 * @param {Boolean} [autoEscape=true] - if true, all keys and values are automatically uri-encoded and decoded if necessary, set this to false to keep values as is
	 */
	constructor(autoEscape=true){
		const instance = this;

		autoEscape = orDefault(autoEscape, true, 'bool');
		this.#autoEscape = autoEscape ? this.escape : val => val;
		this.#autoUnescape = autoEscape ? decodeURIComponent : val => val;

		// procedure map, defining how data types are string-represented in Rison
		this.#encoders = {
			array(value){
				const res = [];

				for( let v of value ){
					const encodedValue = instance.encode(v);
					if( isString(encodedValue) ){
						res.push(encodedValue);
					}
				}

				return `!(${res.join(',')})`;
			},

			boolean(value){
				return !!value ? '!t' : '!f';
			},

			null(){
				return '!n';
			},

			number(value){
				if( !isFinite(value) ) return '!n';
				return `${value}`.replace(/\+/, '');
			},

			object(value){
				if( hasValue(value) ){
					if( isArray(value) ){
						return this.array(value);
					}

					const keys = Object.keys(value);
					keys.sort();

					const res = [];
					for( let key of keys ){
						const v = instance.encode(value[key]);
						if( isString(v) ){
							const k = isNaN(parseInt(key, 10)) ? this.string(key) : this.number(key);
							res.push(`${k}:${v}`);
						}
					}

					return `(${res.join(',')})`;
				}

				return '!n';
			},

			string(value){
				if( value === '' ) return "''";
				if( URISON_VALUE_REX.test(value) ) return value;

				value = value.replace(/(['!])/g, function(_, quotedChar){
					return `!${quotedChar}`;
				});

				return `'${value}'`;
			}
		};

		this.#parser = (new UrisonParser((error, index) => {
			throw Error(`decoding error [${error}] at string index ${index}`);
		}));
	}



	/**
	 * Encodes a JSON value to a Rison string.
	 *
	 * @param {Array|Object|String|Number|Boolean|null} value - the value to encode
	 * @throws error if encoding fails or value is not usable JSON
	 * @returns {String|undefined} the encoded Rison string or undefined if value cannot be encoded
	 *
	 * @example
	 * (new Urison()).encode({key1 : 'value', key2 : true, key3 : [false, 42, null]})
	 * => '(key1:value,key2:!t,key3:!(!f,42,!n))'
	 */
	encode(value){
		const __methodName__ = 'encode';

		if( isFunction(value?.toJson) ){
			value = value.toJson();
		}

		if( isFunction(value?.toJSON) ){
			value = value.toJSON();
		}

		const encoder = this.#encoders[typeof value];
		if( !isFunction(encoder) ){
			throw new Error(`${this.#__className__}.${__methodName__} | invalid data type`);
		}

		let res;
		try {
			res = encoder.call(this.#encoders, value);
		} catch(ex){
			throw new Error(`${this.#__className__}.${__methodName__} | encoding error [${ex}]`);
		}

		return this.#autoEscape(this.#autoUnescape(res));
	}



	/**
	 * Encodes a JSON value to a Rison string.
	 *
	 * @param {Object} value - the object to encode
	 * @returns {String|undefined} the encoded Rison string or undefined if value cannot be encoded
	 * @throws error if value is not an object
	 *
	 * @example
	 * (new Urison()).encodeObject({key1 : 'value', key2 : true, key3 : [false, 42, null]})
	 * => 'key1:value,key2:!t,key3:!(!f,42,!n)'
	 */
	encodeObject(value){
		const __methodName__ = 'encodeObject';

		if( !isObject(value) ){
			throw new Error(`${this.#__className__}.${__methodName__} | value is not an object`);
		}

		const res = this.#encoders.object(value);
		return this.#autoEscape(this.#autoUnescape(res.substring(1, res.length - 1)));
	}



	/**
	 * Encodes a JSON array to a Rison string.
	 *
	 * @param {Array} value - the array to encode
	 * @returns {String|undefined} the encoded Rison string or undefined if value cannot be encoded
	 * @throws error if value is not an array
	 *
	 * @example
	 * (new Urison()).encodeArray([false, 42, null])
	 * => '!f,42,!n'
	 */
	encodeArray(value){
		const __methodName__ = 'encodeArray';

		if( !isArray(value) ){
			throw new Error(`${this.#__className__}.${__methodName__} | value is not an array`);
		}

		const res = this.#encoders.array(value);
		return this.#autoEscape(this.#autoUnescape(res.substring(2, res.length - 1)));
	}



	/**
	 * Decodes a Rison string to a JSON value.
	 *
	 * @param {String} risonString - the Rison string to decode
	 * @returns {Object|Array|String|Number|Boolean|null} the decoded JSON value
	 * @throws error if decoding fails
	 *
	 * @example
	 * (new Urison()).decode('(key1:value,key2:!t,key3:!(!f,42,!n))')
	 * => {key1 : 'value', key2 : true, key3 : [false, 42, null]}
	 */
	decode(risonString){
		return this.#parser.parse(this.#autoUnescape(risonString));
	}



	/**
	 * Decodes a shortened Rison object string to a JSON object.
	 *
	 * @param {String} risonString - the Rison object string to decode
	 * @returns {Object} the decoded JSON object
	 * @throws error if decoding fails
	 *
	 * @example
	 * (new Urison()).decodeObject('key1:value,key2:!t,key3:!(!f,42,!n)')
	 * => {key1 : 'value', key2 : true, key3 : [false, 42, null]}
	 */
	decodeObject(risonString){
		return this.decode(`(${risonString})`);
	}



	/**
	 * Decodes a shortened Rison array string to a JSON array.
	 *
	 * @param {String} risonString - the Rison array string to decode
	 * @returns {Array} the decoded JSON array
	 * @throws error if decoding fails
	 *
	 * @example
	 * (new Urison()).decodeArray('!f,42,!n')
	 * => [false, 42, null]
	 */
	decodeArray(risonString){
		return this.decode(`!(${risonString})`);
	}



	/**
	 * URI-Escapes a value, if necessary, according to the rules of Rison, which is a little bit
	 * more lax than native uri encoding (allows [,:@$/+]).
	 *
	 * This method has one difference to the reference implementation:
	 * We do _not_ encode whitespace as "+", but as "%20". This is done, because "+"-encoding is not
	 * compatible with `decodeURIComponent` and makes working with URL-encoded values manually painful.
	 * So here, "+" is just a normal, allowed URL-safe character and whitespace becomes "%20".
	 * Since `encode_uri` was never automatically applied in Rison, this should not break anything.
	 *
	 * @param {String} value - the value to escape problematic chars in
	 * @returns {String} uri-encoded string
	 *
	 * @example
	 * (new Urison()).escape('abc,:@')
	 * => 'abc%2C%3A%40'
	 */
	escape(value){
		value = `${value}`;

		if( /^[\-A-Za-z0-9~!*()_.',:@$\/+]*$/.test(value) ) return value;

		return replace(
			encodeURIComponent(value),
			['%2C', '%3A', '%40', '%24', '%2F', '%2B'],
			[',', ':', '@', '$', '/', '+']
		);
	}

}

export {Urison};
