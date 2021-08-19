/*!
 * Module DynamicLoading
 */

/**
 * @namespace DynamicLoading
 */

const MODULE_NAME = 'DynamicLoading';



import {hasValue, orDefault, isPlainObject, isA, assert} from './basic.js';



/**
 * @namespace DynamicLoading:createFetchRequest
 */

/**
 * @typedef FetchResponse
 * @type {Object}
 * @property {Boolean} ok - returns true if the request received a status in the OK range (200-299)
 * @property {Number} status - contains the status code of the response, e.g. 404 for a not found resource, 200 for a success
 * @property {String} statusText - a message related to the status attribute, e.g. OK for a status 200
 * @property {Function} clone -  will return another object with the same shape and content as response
 * @property {Function} text - will return the response content as plain text
 * @property {Function} json - will return the response content as JSON
 * @property {Function} blob - will return the response content as a (binary) blob
 * @property {Object} headers - we do not implement a full spec-compliant Headers class, but emulate some of the functionality
 * @property {Function} headers.keys - returns an array containing the key for every header in the response
 * @property {Function} headers.entries - returns an array containing the [key, value] pairs for every header in the response
 * @property {Function} headers.get - returns the value associated with the given key
 * @property {Function} headers.has - returns a boolean asserting the existence of a value for the given key among the response headers
 */

/**
 * @typedef FetchRequestExecuteFunction
 * @type {Function}
 * @returns {Promise<FetchResponse>}
 */

/**
 * @typedef FetchRequest
 * @type {Object}
 * @property {String} url - the request URL
 * @property {Object} options - the options with which the request has been created
 * @property {String} options.method - the request method
 * @property {?Object} options.headers - the set headers for the request
 * @property {?String} options.credentials - the credentials setting for the request
 * @property {?String} options.body - the provided request body of the request
 * @property {FetchRequestExecuteFunction} execute - call this to execute the request
 */

/**
 * This method creates a ponyfilled fetch request based on "unfetch", but basically fulfilling the signature of
 * a native fetch request.
 *
 * The reasoning for this is to provide a baseline fetch implementation for all requests of annex, as long as we
 * still support non ES6 browsers or old implementations in any way. During transpilation with core js, fetch does
 * not automatically get polyfilled, so we need to do this ourselves and to actually stay testable, we provide the
 * polyfill as long as we might target legacy contexts. As soon as we drop legacy contexts, we can immediately also
 * remove this method and its uses.
 *
 * The function signature is the same as "unfetch"'s and all non implemented features are absent here as well.
 *
 * All usual responses (40X and 50X as well) are handled via a resolved promise, only uncompletable requests, such as
 * those being prevented by a general network error, do reject with the provided error.
 *
 * @param {String} url - the complete URL to query
 * @param {?Object} [options] - the request options
 * @param {?String} [options.method='GET'] - indicates the request method to be performed on the target resource (one of "GET", "POST", "PUT", "PATCH", "HEAD", "OPTIONS" or "DELETE")
 * @param {?Object} [options.headers] - an object containing additional information to be sent with the request (e.g. {"Content-Type": "application/json"} to indicate a JSON-typed request body)
 * @param {?String} [options.credentials] - accepts an "include" string, which will allow both CORS and same origin requests to work with cookies; the method won't send or receive cookies otherwise; the "same-origin" value is not supported
 * @param {?Object|String} [options.body] - the content to be transmitted in request's body; common content types include FormData, JSON, Blob, ArrayBuffer or plain text
 * @returns {FetchRequest} the request result, resolves with a FetchResponse object and rejects with error in case of a technical request error (request is not completable)
 *
 * @memberof DynamicLoading:createFetchRequest
 * @alias createFetchRequest
 * @see https://github.com/developit/unfetch
 * @see https://github.com/developit/unfetch#fetchurl-string-options-object
 * @example
 * createFetchRequest('/foo').execute().then(r => r.text()).then(txt => console.log(txt));
 * createFetchRequest('/bear', {method : 'POST', headers : {'Content-Type' : 'application/json'}, body : JSON.stringify({hungry : true})}).execute().then(r => {open(r.headers.get('location')); return r.json();})
 */
export function createFetchRequest(url, options){
	const methodName = 'createFetchRequest';

	assert(hasValue(url), `${MODULE_NAME}:${methodName} | no url given`);
	options = orDefault(options, {});
	assert(isPlainObject(options), `${MODULE_NAME}:${methodName} | options must be plain object`);

	options.method = orDefault(options.method, 'GET');
	options.method = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'OPTIONS', 'DELETE'].includes(options.method.toUpperCase())
		? options.method.toUpperCase()
		: 'GET'
	;

	return {
		url,
		options,
		execute(){
			return new Promise((resolve, reject) => {
				const
					request = new XMLHttpRequest(),
					headerKeys = [],
					headerEntries = [],
					headers = {},
					response = () => ({
						ok : (parseInt(request.status, 10) >= 200) && (parseInt(request.status, 10) <= 299),
						statusText : request.statusText,
						status : request.status,
						url : request.responseURL,
						text : () => Promise.resolve(request.responseText),
						json : () => Promise.resolve(request.responseText).then(JSON.parse),
						blob : () => Promise.resolve(new Blob([request.response])),
						clone : response,
						headers : {
							keys(){
								return headerKeys;
							},
							entries(){
								return headerEntries;
							},
							get(key){
								return headers[key.toLowerCase()];
							},
							has(key){
								return key.toLowerCase() in headers;
							}
						}
					})
				;

				request.open(options.method, url, true);

				request.onload = () => {
					request.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, (m, key, value) => {
						key = key.toLowerCase();
						headerKeys.push(key);
						headerEntries.push([key, value]);
						headers[key] = headers[key] ? `${headers[key]},${value}` : value;
					});

					resolve(response());
				};

				request.onerror = reject;

				request.withCredentials = (options.credentials === 'include');

				for( let i in options.headers ){
					if( options.headers.hasOwnProperty(i) ){
						request.setRequestHeader(i, options.headers[i]);
					}
				}

				request.send(options.body || null);
			});
		}
	};
}



/*
 * Helper function to provide createFetchRequest with the same call signature as fetch, to make implementation
 * easily replaceable in the future.
 *
 * @private
 * @returns {Function} a fetch implementation
 */
function _fetch(url, options){
	return createFetchRequest(url, options).execute();
}



/**
 * @namespace DynamicLoading:polyfillFetch
 */

/**
 * Polyfills window.fetch with a simple XMLHttpRequest-based implementation adapted from "unfetch", to provide
 * basic functionality with a compatible signature while keeping the source as small as possible.
 *
 * This polyfill should cover most basic use cases, but for complex cases you might need to polyfill something more
 * complete (for example Github's implementation: https://github.com/github/fetch).
 *
 * @param {?Boolean} [force=false] - if true, replaces a possibly present native implementation with the polyfill as well
 *
 * @memberof DynamicLoading:polyfillFetch
 * @alias polyfillFetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://github.com/developit/unfetch
 * @example
 * polyfillFetch(true);
 */
export function polyfillFetch(force=false){
	force = orDefault(force, false, 'bool');

	if( force || !isA(window.fetch, 'function') ){
		window.fetch = _fetch;
	}
}
