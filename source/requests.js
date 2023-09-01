/*!
 * Module Requests
 */

/**
 * @namespace Requests
 */

const MODULE_NAME = 'Requests';



//###[ IMPORTS ]########################################################################################################

import {warn} from './logging.js';
import {hasValue, orDefault, isPlainObject, assert, Deferred, getType} from './basic.js';
import {merge} from './objects.js';
import {createNode, insertNode} from './elements.js';
import {schedule, countermand} from './timers.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Requests:createFetchRequest
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
 * @property {Function} headers.keys - returns an Iterable containing the key for every header in the response, transform to array with Array.from
 * @property {Function} headers.entries - returns an Iterable containing the [key, value] pairs for every header in the response, transform to array with Array.from
 * @property {Function} headers.get - returns the value associated with the given key
 * @property {Function} headers.has - returns a boolean asserting the existence of a value for the given key among the response headers
 */

/**
 * @typedef FetchRequestExecuteFunction
 * @type {Function}
 * @returns {Deferred<FetchResponse>}
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
 * @property {?Number} [options.timeout=10000] - milliseconds until the request fails due to a timeout
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
 * The function signature is the same as "unfetch"'s and all non-implemented features are absent here as well.
 *
 * All usual responses (40X and 50X as well) resolve, only uncompletable requests, such as those being prevented by a
 * general network error, reject with the provided error.
 *
 * Set __ANNEX_USE_NATIVE_FETCH__ on window (true/false/'auto') to force useNative setting for all annex requests
 * globally.
 *
 * @param {String} url - the complete URL to query
 * @param {?Object} [options=null] - the request options
 * @param {?String} [options.method='GET'] - indicates the request method to be performed on the target resource (one of "GET", "POST", "PUT", "PATCH", "HEAD", "OPTIONS" or "DELETE")
 * @param {?Object} [options.headers] - an object containing additional information to be sent with the request (e.g. {"Content-Type": "application/json"} to indicate a JSON-typed request body)
 * @param {?String} [options.credentials] - accepts an "include" string, which will allow both CORS and same origin requests to work with cookies; the method won't send or receive cookies otherwise; the "same-origin" value is not supported
 * @param {?Object|String} [options.body] - the content to be transmitted in request's body; common content types include FormData, JSON, Blob, ArrayBuffer or plain text
 * @param {?Boolean|String} [useNative=false] - determines if the native Fetch implementation of the browser should be used, true forces usage, "auto" uses it only if available
 * @returns {FetchRequest} use this via the "execute" method, which resolves to a FetchResponse or rejects with error in case of a technical request error (request is not completable)
 *
 * @memberof Requests:createFetchRequest
 * @alias createFetchRequest
 * @see https://github.com/developit/unfetch
 * @see https://github.com/developit/unfetch#fetchurl-string-options-object
 * @example
 * createFetchRequest('/foo').execute()
 *     .then(r => r.text())
 *         .then(txt => console.log(txt))
 * ;
 * createFetchRequest(
 *     '/bear',
 *     {
 *         method : 'POST',
 *         headers : {'Content-Type' : 'application/json'},
 *         body : JSON.stringify({hungry : true})
 *     })
 *         .execute()
 *             .then(r => { open(r.headers.get('location')); return r.json(); })
 * ;
 */
export function createFetchRequest(url, options=null, useNative=false){
	const __methodName__ = 'createFetchRequest';

	assert(hasValue(url), `${MODULE_NAME}:${__methodName__} | no url given`);
	options = orDefault(options, {});
	assert(isPlainObject(options), `${MODULE_NAME}:${__methodName__} | options must be plain object`);

	options.method = orDefault(options.method, 'GET', 'str');
	options.method = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'OPTIONS', 'DELETE'].includes(options.method.toUpperCase())
		? options.method.toUpperCase()
		: 'GET'
	;

	// 0 would be unlimited/unset
	options.timeout = orDefault(options.timeout, 10000, 'int');
	options.timeout = (options.timeout < 0) ? 0 : options.timeout;

	useNative = window.__ANNEX_USE_NATIVE_FETCH__ ?? useNative;

	return {
		url,
		options,
		execute : !useNative || ((useNative === 'auto') && !('fetch' in window))
			? function(){
				const
					res = new Deferred(),
					request = new XMLHttpRequest(),
					headerKeys = new Set(),
					headerEntries = new Map(),
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
								return headerEntries.get(key);
							},
							has(key){
								return headerKeys.has(key);
							}
						}
					})
				;

				request.open(options.method, url, true);

				if( options.timeout > 0 ){
					request.timeout = options.timeout;
					request.ontimeout = () => { res.reject(new Error('timeout')); };
				}

				request.onload = () => {
					request.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, (m, key, value) => {
						key = `${key}`;
						headerKeys.add(key);
						if( headerEntries.has(key) ){
							headerEntries.set(key, `${headerEntries.get(key)},${value}`);
						} else {
							headerEntries.set(key, `${value}`);
						}
					});

					res.resolve(response());
				};

				request.onerror = res.reject;

				request.withCredentials = (options.credentials === 'include');

				if( hasValue(options.headers) ){
					for( let i in options.headers ){
						if( options.headers.hasOwnProperty(i) ){
							request.setRequestHeader(i, options.headers[i]);
						}
					}
				}

				request.send(options.body ?? null);

				return res;
			}
			: function(){
				const
					res = new Deferred(),
					timeout = options.timeout
				;

				let timeoutTimer, abortController;

				if( (timeout > 0) && ('AbortController' in window) ){
					abortController = new AbortController();
					options.signal = abortController.signal;
				}

				window.fetch(url, options)
					.then(response => {
						countermand(timeoutTimer);
						res.resolve(response);
					})
					.catch(error => {
						countermand(timeoutTimer);
						res.reject(error);
					})
				;

				if( (timeout > 0) && ('AbortController' in window) ){
					timeoutTimer = schedule(timeout, () => { abortController.abort(); });
				}

				return res;
			}
	};
}



/**
 * @namespace Requests:createJsonRequest
 */

/**
 * @typedef JsonFetchResponse
 * @type {Object|HTMLElement|String}
 */

/**
 * @typedef JsonFetchRequestExecuteFunction
 * @type {Function}
 * @param {?String} [resolveTo='object'] - defines what the response should resolve to, may either be "object", "element" or "raw"
 * @param {?HTMLElement|Object} [insertTarget=null] - defines if the retrieved value should be inserted as a dom element and if so where; if this is an element, the value gets appended into that as a script tag, otherwise the properties below apply
 * @param {?HTMLElement} [insertTarget.element] - target element in relation to which the resolved value should be inserted into the dom
 * @param {?String} [insertTarget.position] - defines where, in relation to the target element, the resolved value will be inserted, see insertNode for more details
 * @param {?String} [dataId=null] - if you need an identifier, to find inserted elements again after they are inserted into dom, you can define an id here, which will be set as the "data-id" attribute on the created node
 * @see insertNode
 * @returns {Deferred<JsonFetchResponse>}
 */

/**
 * @typedef JsonFetchRequest
 * @type {Object}
 * @property {String} url - the request URL
 * @property {Object} options - the options with which the request has been created
 * @property {String} options.method - the request method
 * @property {?Object} options.headers - the set headers for the request
 * @property {?String} options.credentials - the credentials setting for the request
 * @property {?String} options.body - the provided request body of the request
 * @property {?Number} [options.timeout=10000] - milliseconds until the request fails due to a timeout
 * @property {JsonFetchRequestExecuteFunction} execute - call this to execute the request
 */

/**
 * This method creates a special version of a FetchRequest specifically designed to retrieve JSON data.
 *
 * Usually you'll want to retrieve JSON as a PlainObject, so that's the default resolve value here.
 * However, you may also specify to retrieve the raw JSON or let the method handle the creation of a DOM element
 * for you and return that, ready to be used/inserted however you like.
 *
 * If you plan on inserting the result into DOM anyway you'll like the fact that this is also directly possible, by
 * defining an insert target. BTW: Inserting does not automatically change the resolve value, those are separate
 * concerns.
 *
 * @param {String} url - the complete URL to query
 * @param {?Object} [options=null] - the request options (see: createFetchRequests for details)
 * @param {?Boolean|String} [useNative=false] - determines if the native Fetch implementation of the browser should be used, true forces usage, "auto" uses it only if available
 * @param {?Boolean} [strict=true] - if true, enforces "application/json" as accept header as well as response mime type, if false, accept header is not set and different mime type only results in warning
 * @throws error in strict mode if response content type is not "application/json"
 * @returns {JsonFetchRequest} use this via the "execute" method, which resolves to a FetchResponse or rejects with error in case of a technical request error (request is not completable)
 *
 * @memberof Requests:createJsonRequest
 * @alias createJsonRequest
 * @see createFetchRequest
 * @example
 * createJsonRequest('message.json').execute()
 *     .then(json => { alert(json.someProperty); })
 * ;
 * createJsonRequest('/dev/config.json')
 *     .execute('element', null, 'config-json-id')
 *         .then(jsonElement => { document.querySelector('main').appendChild(jsonElement); })
 * ;
 * createJsonRequest('https://foobar.com/config.json')
 *     .execute('raw', {element : document.body, position : 'prepend'}, 'config-json-id')
 *         .then(rawJson => { console.log(`"${rawJson}" has been inserted at the beginning of the document's body`); })
 * ;
 */
export function createJsonRequest(url, options=null, useNative=false, strict=true){
	const
		__methodName__ = 'createJsonRequest',
		contentType = 'application/json'
	;

	if( strict ){
		if( !hasValue(options) ){
			options = {};
		}

		if( !hasValue(options.headers) ){
			options.headers = {};
		}

		options.headers['Accept'] = contentType;
	}

	return {
		url,
		options,
		execute(resolveTo='object', insertTarget=null, dataId=null){
			const res = new Deferred();

			createFetchRequest(url, options, useNative).execute()
				.then(response => {
					const responseContentType = (
						response.headers.get('content-type') ?? response.headers.get('Content-Type') ?? ''
					).split(';')[0].trim();

					if( responseContentType !== contentType ){
						const message = `${MODULE_NAME}:${__methodName__} | content-type "${responseContentType}" is not valid for JSON, expecting "application/json"`;
						if( strict ){
							throw new Error(message);
						} else {
							warn(message);
						}
					}

					return response.json();
				})
				.then(json => {
					const element = createNode(`<script type="application/json">${JSON.stringify(json)}</script>`);
					if( dataId !== null ){
						element.setAttribute('data-id', `${dataId}`);
					}

					if( hasValue(insertTarget) ){
						const
							target = insertTarget.element ?? insertTarget,
							position = insertTarget.position ?? null
						;

						if( position === null ){
							insertNode(target, element);
						} else {
							insertNode(target, element, position);
						}
					}

					res.resolve(
						(resolveTo === 'element')
							? element
							: (
								(resolveTo === 'raw')
								? JSON.stringify(json)
								: json
							)
					);
				})
				.catch(error => {
					res.reject(error);
				})
			;

			return res;
		}
	};
}



/**
 * @namespace Requests:createRestfulJsonClient
 */

/**
 * @typedef RestfulJsonClientPathFunction
 * @type {Function}
 * @param {String} path - the current path to request from baseUrl
 * @returns {RestfulJsonClient}
 */

/**
 * @typedef RestfulJsonClientOptionsFunction
 * @type {Function}
 * @param {?Object} options - options plain object to merge with baseOptions to define current request options (see JsonFetchRequest for details and defaults); if nullish, will reset to baseOptions
 * @throws error if given options are not a plain object
 * @returns {RestfulJsonClient}
 */

/**
 * @typedef RestfulJsonClientHeaderFunction
 * @type {Function}
 * @param {String} key - the header to set for all following requests
 * @param {?String} value - the header's value; nullish value will remove the header again
 * @returns {RestfulJsonClient}
 */

/**
 * @typedef RestfulJsonClientParamsFunction
 * @type {Function}
 * @param {?*} params - query parameters to set on the current URL, this parameter takes all regular definitions for URLSearchParams constructor, as well as flat plain objects, which may also have arrays as values; if nullish, parameters are emptied
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams
 * @returns {RestfulJsonClient}
 */

/**
 * @typedef RestfulJsonClientDataFunction
 * @type {Function}
 * @param {?Object} data - data payload to send with the next POST, PUT or PATCH request, this parameter will set a permanent payload, for one-off payloads, use the verb method's parameter; if nullish, data will be emptied
 * @throws error if given data is not a plain object
 * @returns {RestfulJsonClient}
 */

/**
 * @typedef RestfulJsonClientGetFunction
 * @type {Function}
 * @returns {Deferred<JsonFetchResponse>}
 */

/**
 * @typedef RestfulJsonClientPostFunction
 * @type {Function}
 * @param {?Object} [data=null] - one-off data to use in this request, will replace any central data defined before and will only be valid for this request
 * @returns {Deferred<JsonFetchResponse>}
 */

/**
 * @typedef RestfulJsonClientPutFunction
 * @type {Function}
 * @param {?Object} [data=null] - one-off data to use in this request, will replace any central data defined before and will only be valid for this request
 * @returns {Deferred<JsonFetchResponse>}
 */

/**
 * @typedef RestfulJsonClientPatchFunction
 * @type {Function}
 * @param {?Object} [data=null] - one-off data to use in this request, will replace any central data defined before and will only be valid for this request
 * @returns {Deferred<JsonFetchResponse>}
 */

/**
 * @typedef RestfulJsonClientDeleteFunction
 * @type {Function}
 * @returns {Deferred<JsonFetchResponse>}
 */

/**
 * @typedef RestfulJsonClient
 * @type {Object}
 * @property {Object} config - the current configuration state of the client
 * @property {URL} config.url=baseUrl - the current, complete URL to query (baseUrl + path)
 * @property {Object} config.options - the current request options (see JsonFetchRequest for details and defaults)
 * @property {URLSearchParams} config.params - the current searchParams of config.url, with which to query the URL
 * @property {Object} config.data={} - the current data payload object to send with POST, PUT and PATCH (this will persist between requests, set one-off data via verb methods)
 * @property {RestfulJsonClientPathFunction} path - sets the current request path, which will be concatenated after baseUrl
 * @property {RestfulJsonClientOptionsFunction} options - sets the current request options, which will be merged with baseOptions to constitute current request options
 * @property {RestfulJsonClientHeaderFunction} header - sets a header for all subsequent requests
 * @property {RestfulJsonClientParamsFunction} params - sets query parameters to be added to the request URL
 * @property {RestfulJsonClientDataFunction} data - sets data payload for POST, PUT and PATCH requests
 * @property {RestfulJsonClientGetFunction} get - queries the current URL via GET
 * @property {RestfulJsonClientPostFunction} post - queries the current URL via POST using defined data
 * @property {RestfulJsonClientPutFunction} put - queries the current URL via PUT using defined data
 * @property {RestfulJsonClientPatchFunction} patch - queries the current URL via PATCH using defined data
 * @property {RestfulJsonClientDeleteFunction} delete - queries the current URL via DELETE
 */

/**
 * This method creates a dedicated client for restful operations against an API via JSON payloads and responses.
 *
 * Internally this implementation uses createJsonRequest to actually request stuff, while the return value of this
 * method is a wrapper, providing central configuration, such as a base URL and options like credentials, as well as
 * standard methods for HTTP verbs and setup things like setting headers.
 *
 * @param {String} baseUrl - the base URL for all queries, based on which final request URLs will be built, adding the paths
 * @param {?Object} [baseOptions=null] - the base request options, can be expanded later via options() (see: createFetchRequests for details)
 * @param {?Boolean|String} [useNative=false] - determines if the native Fetch implementation of the browser should be used, true forces usage, "auto" uses it only if available
 * @param {?Boolean} [strict=true] - if true, enforces "application/json" as accept header as well as response mime type, if false, accept header is not set and different mime type only results in warning
 * @throws error in strict mode if response content type is not "application/json"
 * @returns {RestfulJsonClient}
 *
 * @memberof Requests:createRestfulJsonClient
 * @alias createRestfulJsonClient
 * @see createJsonRequest
 * @example
 * const client = createRestfulJsonClient('https://jsonplaceholder.typicode.com', {credentials : 'include'});
 * const postJson = await client
 *   .path('/posts')
 * 	 .params({
 * 	   ids : [1, 2],
 * 	   q : 'lorem'
 * 	 })
 * 	 .data({
 * 	   title : 'foo',
 * 	   body : 'bar',
 * 	   userId : 1,
 * 	 })
 * 	 .post()
 * ;
 */
export function createRestfulJsonClient(baseUrl, baseOptions=null, useNative=false, strict=true){
	const
		__methodName__ = 'createRestfulJsonClient',
		implementation = createJsonRequest,
		contentTypeHeader = 'Content-Type',
		contentType = 'application/json',
		dataValidationMessage = 'data must be plain object',
		optionsValidationMessage = 'options must be plain object'
	;


	function flatEntries(obj){
		const
			entries = Object.entries(obj),
			flattenedEntries = []
		;

		for(const entryIndex in entries ){
			const
				entryKey = entries[entryIndex][0],
				entryVal = entries[entryIndex][1],
				entryValType = getType(entryVal)
			;

			if( ['array', 'set'].includes(entryValType) ){
				Array.from(entryVal).forEach(val => {
					flattenedEntries.push([entryKey, `${val}`]);
				});
			} else {
				flattenedEntries.push([entryKey, `${entryVal}`]);
			}
		}

		return flattenedEntries;
	}


	function request(client, method){
		method = method.toUpperCase();
		assert(['GET', 'DELETE'].includes(method), `${MODULE_NAME}:${__methodName__} | invalid request method "${method}"`);

		client.config.options.method = method;
		return implementation(client.config.url, client.config.options, useNative, strict)
			.execute()
			.finally(() => {
				delete client.config.options.method;
			})
		;
	}


	function requestWithPayload(client, method, data=null){
		method = method.toUpperCase();
		assert(['POST', 'PUT', 'PATCH'].includes(method), `${MODULE_NAME}:${__methodName__} | invalid request method "${method}"`);

		if( hasValue(data) ){
			assert(isPlainObject(data), `${MODULE_NAME}:${__methodName__} | ${dataValidationMessage}`);
		}

		client.config.options.method = method;
		client.config.options.body = JSON.stringify(data ?? client.config.data);
		client.header(contentTypeHeader, `${contentType}; charset=UTF-8`);

		return implementation(client.config.url, client.config.options, useNative, strict)
			.execute()
			.finally(() => {
				delete client.config.options.method;
				delete client.config.options.body;
				client.header(contentTypeHeader, null);
			})
		;
	}


	return {
		config : {
			url : new URL('/', baseUrl),
			options : isPlainObject(baseOptions) ? baseOptions : {},
			params : new URLSearchParams(),
			data : {},
		},

		path(path){
			this.config.url = new URL(path, baseUrl);
			return this;
		},

		options(options){
			if( hasValue(options) ){
				assert(isPlainObject(options), `${MODULE_NAME}:${__methodName__} | ${optionsValidationMessage}`);
				this.config.options = merge(baseOptions, options);
			} else {
				this.config.options = baseOptions;
			}
			return this;
		},

		header(key, value){
			if( !hasValue(this.config.options.headers) ){
				this.config.options.headers = {};
			}
			if( hasValue(value) ){
				this.config.options.headers[`${key}`] = `${value}`;
			} else {
				delete this.config.options.headers[`${key}`];
			}
			return this;
		},

		params(params){
			if( hasValue(params) ){
				this.config.params = new URLSearchParams(isPlainObject(params) ? flatEntries(params) : params);
			} else {
				this.config.params = new URLSearchParams();
			}
			this.config.url.search = this.config.params.toString();
			return this;
		},

		data(data){
			if( hasValue(data) ){
				assert(isPlainObject(data), `${MODULE_NAME}:${__methodName__} | `);
				this.config.data = data;
			} else {
				this.config.data = {};
			}
			return this;
		},

		get(){
			return request(this, 'GET');
		},

		post(data=null){
			return requestWithPayload(this, 'POST', data);
		},

		put(data=null){
			return requestWithPayload(this, 'PUT', data);
		},

		patch(data=null){
			return requestWithPayload(this, 'PATCH', data);
		},

		delete(){
			return request(this, 'DELETE');
		},
	};
}



/**
 * @namespace Requests:createJsRequest
 */

/**
 * @typedef JsFetchResponse
 * @type {HTMLElement|String}
 */

/**
 * @typedef JsFetchRequestExecuteFunction
 * @type {Function}
 * @param {?String} [resolveTo='element'] - defines what the response should resolve to, may either be "element", "raw" or "sourced-element" (which is the special case to insert a script with a src instead of doing a real request)
 * @param {?HTMLElement|Object} [insertTarget=null] - defines if the retrieved value should be inserted as a dom element and if so where; if this is an element, the value gets appended into that as a script tag, otherwise the properties below apply
 * @param {?HTMLElement} [insertTarget.element] - target element in relation to which the resolved value should be inserted into the dom
 * @param {?String} [insertTarget.position] - defines where, in relation to the target element, the resolved value will be inserted, see insertNode for more details
 * @param {?String} [dataId=null] - if you need an identifier, to find inserted elements again after they are inserted into dom, you can define an id here, which will be set as the "data-id" attribute on the created node
 * @param {?Boolean} [resolveSourcedOnInsert=false] - normally sourced elements resolve on load to work with the request as far as possible, but if you want to ignore the request after insertion, you may set this parameter to "true", resulting in immediate resolution after insertion
 * @see insertNode
 * @returns {Deferred<JsFetchResponse>}
 */

/**
 * @typedef JsFetchRequest
 * @type {Object}
 * @property {String} url - the request URL
 * @property {Object} options - the options with which the request has been created
 * @property {String} options.method - the request method
 * @property {?Object} options.headers - the set headers for the request
 * @property {?String} options.credentials - the credentials setting for the request
 * @property {?String} options.body - the provided request body of the request
 * @property {?Number} [options.timeout=10000] - milliseconds until the request fails due to a timeout
 * @property {JsFetchRequestExecuteFunction} execute - call this to execute the request
 */

/**
 * This method creates a special version of a FetchRequest specifically designed to retrieve JavaScript.
 *
 * Usually you'll want to retrieve JavaScript to include it into a page to execute the script on the page
 * currently open, so the default mode of this method is to resolve to a directly usable script tag, you may
 * insert into the DOM wherever you please. However, you may also specify to retrieve the raw JavaScript source.
 *
 * Be aware that requesting JavaScript from an unsecure source is a very big security risk. Do not load and execute
 * source from a source you do not fully trust!
 *
 * If you plan on inserting the result into DOM anyway you'll like the fact that this is also directly possible, by
 * defining an insert target. In case you decide to insert the result directly, the default is an inline script, but
 * you may also choose to insert a sourced script tag, loading a script on insertion and executing in asynchronously
 * in turn. This is not strictly a programmatic "request" anymore, but very handy. If you are inserting a sourced
 * script, the Deferred resolves on load by default (and rejects on error), thereby keeping the general idea of
 * working with a request. But you may also define a parameter on execute to force resolve immediately on insert.
 *
 * BTW: Inserting does not automatically change the resolve value, those are separate concerns.
 *
 * @param {String} url - the complete URL to query
 * @param {?Object} [options=null] - the request options (see: createFetchRequests for details)
 * @param {?Boolean|String} [useNative=false] - determines if the native Fetch implementation of the browser should be used, true forces usage, "auto" uses it only if available
 * @param {?Boolean} [strict=true] - if true, enforces "application/javascript" as accept header as well as response mime type, if false, accept header is not set and different mime type only results in warning
 * @throws error in strict mode if response content type is not "application/javascript"
 * @returns {JsFetchRequest} use this via the "execute" method, which resolves to a FetchResponse or rejects with error in case of a technical request error (request is not completable)
 *
 * @memberof Requests:createJsRequest
 * @alias createJsRequest
 * @see createFetchRequest
 * @example
 * createJsRequest('/js/test.js')
 *     .execute()
 *         .then(jsElement => { document.body.appendChild(jsElement); })
 * ;
 * createJsRequest('/js/test.js')
 *     .execute(null, injectTarget, 'request-2')
 *         .then(jsElement => { alert(`has been injected: "${jsElement.textContent}"`); })
 * ;
 * createJsRequest('/js/test.js')
 *     .execute('raw', {element : injectTarget, position : 'beforebegin'})
 *         .then(rawJs => { alert(`has been injected: "${rawJs}"`); })
 * ;
 * createJsRequest('/js/test.js')
 *     .execute('sourced-element', {element : injectTarget, position : 'prepend'}, 'request-4')
 *         .then(jsElement => { alert(`has been injected: "${jsElement.getAttribute('data-id')}"`); })
 * ;
 */
export function createJsRequest(url, options=null, useNative=false, strict=true){
	const
		__methodName__ = 'createJsRequest',
		contentType = 'application/javascript'
	;

	if( strict ){
		if( !hasValue(options) ){
			options = {};
		}

		if( !hasValue(options.headers) ){
			options.headers = {};
		}

		options.headers['Accept'] = contentType;
	}

	return {
		url,
		options,
		execute(resolveTo='element', insertTarget=null, dataId=null, resolveSourcedOnInsert=false){
			const
				sourceElementValue = 'sourced-element',
				res = new Deferred(),
				fInsertAndResolve = (element, js='') => {
					if( dataId !== null ){
						element.setAttribute('data-id', `${dataId}`);
					}

					if( hasValue(insertTarget) ){
						const
							target = insertTarget.element ?? insertTarget,
							position = insertTarget.position ?? null
						;

						if( !resolveSourcedOnInsert ){
							element.onload = () => { res.resolve((resolveTo === 'raw') ? js : element); };
							element.onerror = error => { res.reject(error); };
						}

						if( position === null ){
							insertNode(target, element);
						} else {
							insertNode(target, element, position);
						}
					}

					if(
						(resolveTo !== sourceElementValue)
						|| ((resolveTo === sourceElementValue) && resolveSourcedOnInsert)
					){
						res.resolve((resolveTo === 'raw') ? js : element);
					}
				}
			;

			if( resolveTo === sourceElementValue ){
				fInsertAndResolve(createNode('script', {src : url}));
			} else {
				createFetchRequest(url, options, useNative).execute()
					.then(response => {
						const responseContentType = (
							response.headers.get('content-type') ?? response.headers.get('Content-Type') ?? ''
						).split(';')[0].trim();

						if( responseContentType !== contentType ){
							const message = `${MODULE_NAME}:${__methodName__} | content-type "${responseContentType}" is not valid for JavaScript, expecting "application/javascript"`;
							if( strict ){
								throw new Error(message);
							} else {
								warn(message);
							}
						}

						return response.text();
					})
					.then(js => {
						fInsertAndResolve(createNode('script', null, js), js);
					})
					.catch(error => {
						res.reject(error);
					})
				;
			}

			return res;
		}
	};
}



/**
 * @namespace Requests:createCssRequest
 */

/**
 * @typedef CssFetchResponse
 * @type {HTMLElement|String}
 */

/**
 * @typedef CssFetchRequestExecuteFunction
 * @type {Function}
 * @param {?String} [resolveTo='element'] - defines what the response should resolve to, may either be "element", "raw" or "sourced-element" (which is the special case to insert a link with a href instead of doing a real request)
 * @param {?HTMLElement|Object} [insertTarget=null] - defines if the retrieved value should be inserted as a dom element and if so where; if this is an element, the value gets appended into that as a style/link tag, otherwise the properties below apply
 * @param {?HTMLElement} [insertTarget.element] - target element in relation to which the resolved value should be inserted into the dom
 * @param {?String} [insertTarget.position] - defines where, in relation to the target element, the resolved value will be inserted, see insertNode for more details
 * @param {?String} [dataId=null] - if you need an identifier, to find inserted elements again after they are inserted into dom, you can define an id here, which will be set as the "data-id" attribute on the created node
 * @param {?String} [media='all'] - define the style's media attribute here to target the output device(s), could be "screen" or "print" for example
 * @param {?Boolean} [resolveSourcedOnInsert=false] - normally sourced elements resolve on load to work with the request as far as possible, but if you want to ignore the request after insertion, you may set this parameter to "true", resulting in immediate resolution after insertion
 * @see insertNode
 * @returns {Deferred<CssFetchResponse>}
 */

/**
 * @typedef CssFetchRequest
 * @type {Object}
 * @property {String} url - the request URL
 * @property {Object} options - the options with which the request has been created
 * @property {String} options.method - the request method
 * @property {?Object} options.headers - the set headers for the request
 * @property {?String} options.credentials - the credentials setting for the request
 * @property {?String} options.body - the provided request body of the request
 * @property {?Number} [options.timeout=10000] - milliseconds until the request fails due to a timeout
 * @property {CssFetchRequestExecuteFunction} execute - call this to execute the request
 */

/**
 * This method creates a special version of a FetchRequest specifically designed to retrieve Cascading Stylesheets.
 *
 * Usually you'll want to retrieve CSS to include it into a page and thereby style something on the page
 * currently open, so the default mode of this method is to resolve to a directly usable style tag, you may
 * insert into the DOM wherever you please. However, you may also specify to retrieve the raw CSS source.
 *
 * If you plan on inserting the result into DOM anyway you'll like the fact that this is also directly possible, by
 * defining an insert target. In case you decide to insert the result directly, the default is an inline style, but
 * you may also choose to insert a sourced link tag, loading a stylesheet on insertion and adding the included styles
 * on load. This is not strictly a programmatic "request" anymore, but very handy. If you are inserting a sourced
 * link, the Deferred resolves on load by default (and rejects on error), thereby keeping the general idea of
 * working with a request. But you may also define a parameter on execute to force resolve immediately on insert.
 *
 * BTW: Inserting does not automatically change the resolve value, those are separate concerns.
 *
 * @param {String} url - the complete URL to query
 * @param {?Object} [options=null] - the request options (see: createFetchRequests for details)
 * @param {?Boolean|String} [useNative=false] - determines if the native Fetch implementation of the browser should be used, true forces usage, "auto" uses it only if available
 * @param {?Boolean} [strict=true] - if true, enforces "text/css" as accept header as well as response mime type, if false, accept header is not set and different mime type only results in warning
 * @throws error in strict mode if response content type is not "text/css"
 * @returns {CssFetchRequest} use this via the "execute" method, which resolves to a FetchResponse or rejects with error in case of a technical request error (request is not completable)
 *
 * @memberof Requests:createCssRequest
 * @alias createCssRequest
 * @see createFetchRequest
 * @example
 * createCssRequest('/css/test.css')
 *     .execute()
 *         .then(cssElement => { document.head.appendChild(cssElement); })
 * ;
 * createCssRequest('/css/test.css')
 *     .execute(null, injectTarget, 'request-2')
 *         .then(cssElement => { alert(`has been injected: "${cssElement.textContent}"`); })
 * ;
 * createCssRequest('/css/test.css')
 *     .execute('raw', {element : injectTarget, position : 'beforebegin'}, 'request-3', 'screen')
 *         .then(rawCss => { alert(`has been injected: "${rawCss}"`); })
 * ;
 * createCssRequest('/css/test.css')
 *     .execute('sourced-element', {element : injectTarget, position : 'prepend'}, 'request-4', 'screen')
 *         .then(cssElement => { alert(`has been injected: "${cssElement.getAttribute('data-id')+}"`); })
 * ;
 */
export function createCssRequest(url, options=null, useNative=false, strict=true){
	const
		__methodName__ = 'createCssRequest',
		contentType = 'text/css'
	;


	if( strict ){
		if( !hasValue(options) ){
			options = {};
		}

		if( !hasValue(options.headers) ){
			options.headers = {};
		}

		options.headers['Accept'] = contentType;
	}

	return {
		url,
		options,
		execute(resolveTo='element', insertTarget=null, dataId=null, media='all', resolveSourcedOnInsert=false){
			const
				sourceElementValue = 'sourced-element',
				res = new Deferred(),
				fInsertAndResolve = (element, css='') => {
					if( dataId !== null ){
						element.setAttribute('data-id', `${dataId}`);
					}

					if( hasValue(insertTarget) ){
						const
							target = insertTarget.element ?? insertTarget,
							position = insertTarget.position ?? null
						;

						if( !resolveSourcedOnInsert ){
							element.onload = () => { res.resolve((resolveTo === 'raw') ? css : element); };
							element.onerror = error => { res.reject(error); };
						}

						if( position === null ){
							insertNode(target, element);
						} else {
							insertNode(target, element, position);
						}
					}

					if(
						(resolveTo !== sourceElementValue)
						|| ((resolveTo === sourceElementValue) && resolveSourcedOnInsert)
					){
						res.resolve((resolveTo === 'raw') ? css : element);
					}
				}
			;

			if( resolveTo === sourceElementValue ){
				const linkAttrs = {href : url, rel : 'stylesheet'};
				if( media !== 'all' ){
					linkAttrs.media = media;
				}
				fInsertAndResolve(createNode('link', linkAttrs));
			} else {
				createFetchRequest(url, options, useNative).execute()
					.then(response => {
						const responseContentType = (
							response.headers.get('content-type') ?? response.headers.get('Content-Type') ?? ''
						).split(';')[0].trim();

						if( responseContentType !== contentType ){
							const message = `${MODULE_NAME}:${__methodName__} | content-type "${responseContentType}" is not valid for CSS, expecting "text/css"`;
							if( strict ){
								throw new Error(message);
							} else {
								warn(message);
							}
						}

						return response.text();
					})
					.then(css => {
						fInsertAndResolve(createNode('style', (media !== 'all') ? {media} : null, css), css);
					})
					.catch(error => {
						res.reject(error);
					})
				;
			}

			return res;
		}
	};
}



/**
 * @namespace Requests:createHtmlRequest
 */

/**
 * @typedef HtmlFetchResponse
 * @type {HTMLElement|Array<HTMLElement>|String}
 */

/**
 * @typedef HtmlFetchRequestExecuteFunction
 * @type {Function}
 * @param {?String} [resolveTo='element'] - defines what the response should resolve to, may either be "element" or "raw"
 * @param {?HTMLElement|Object} [insertTarget=null] - defines if the retrieved value should be inserted as a dom element and if so where; if this is an element, the value gets appended into that as (a) node(s), otherwise the properties below apply
 * @param {?HTMLElement} [insertTarget.element] - target element in relation to which the resolved value should be inserted into the dom
 * @param {?String} [insertTarget.position] - defines where, in relation to the target element, the resolved value will be inserted, see insertNode for more details
 * @param {?String} [dataId=null] - if you need an identifier, to find inserted elements again after they are inserted into dom, you can define an id here, which will be set as the "data-id" attribute on the created node(s)
 * @param {?String} [selector=null] - if you'd like to preselect something from the result, you may define a regular query selector to find matching elements in the result
 * @param {?Boolean} [selectAll=false] - usually, if a selector is defined, we select a single element, if you need to select a list, set this to true
 * @see insertNode
 * @returns {Deferred<HtmlFetchResponse>}
 */

/**
 * @typedef HtmlFetchRequest
 * @type {Object}
 * @property {String} url - the request URL
 * @property {Object} options - the options with which the request has been created
 * @property {String} options.method - the request method
 * @property {?Object} options.headers - the set headers for the request
 * @property {?String} options.credentials - the credentials setting for the request
 * @property {?String} options.body - the provided request body of the request
 * @property {?Number} [options.timeout=10000] - milliseconds until the request fails due to a timeout
 * @property {HtmlFetchRequestExecuteFunction} execute - call this to execute the request
 */

/**
 * This method creates a special version of a FetchRequest specifically designed to retrieve HTML content.
 *
 * Usually you'll want to retrieve HTML to include it into a page or extract information from it, so the default mode
 * of this method is to resolve to a node, you may insert into the DOM wherever you please or use stuff like a
 * querySelector on. However, you may also specify to retrieve the raw HTML source.
 *
 * Be aware, that requesting and parsing HTML from an unsecure source comes with a high risk. If you cannot fully
 * trust the source, request the HTML raw and use something like dom purify before using the result.
 *
 * If you plan on inserting the result into DOM anyway you'll like the fact that this is also directly possible, by
 * defining an insert target.
 *
 * BTW: Inserting does not automatically change the resolve value, those are separate concerns.
 *
 * @param {String} url - the complete URL to query
 * @param {?Object} [options=null] - the request options (see: createFetchRequests for details)
 * @param {?Boolean|String} [useNative=false] - determines if the native Fetch implementation of the browser should be used, true forces usage, "auto" uses it only if available
 * @param {?Boolean} [strict=true] - if true, enforces "text/html" as accept header as well as response mime type, if false, accept header is not set and different mime type only results in warning
 * @throws error in strict mode if response content type is not "text/html"
 * @returns {HtmlFetchRequest} use this via the "execute" method, which resolves to a FetchResponse or rejects with error in case of a technical request error (request is not completable)
 *
 * @memberof Requests:createHtmlRequest
 * @alias createHtmlRequest
 * @see createFetchRequest
 * @example
 * createHtmlRequest('/html/test.html')
 *     .execute()
 *         .then(htmlElement => { document.body.appendChild(htmlElement); })
 * ;
 * createHtmlRequest('/html/test.html')
 *     .execute('raw', null, 'request-1')
 *         .then(rawHtml => { alert(`document has been loaded: "${rawHtml}"`); })
 * ;
 * createHtmlRequest('/html/test.html')
 *     .execute(null, injectTarget, 'request-3', 'body > main > h1')
 *         .then(htmlElement => { alert(`has been injected: "${htmlElement.outerHTML}"`); })
 * ;
 * createHtmlRequest('/files/html/requests-test-1.html')
 *     .execute('raw', {element : injectTarget, position : 'beforebegin'}, 'request-4', 'h1 ~ p', true)
 *         .then(rawHtml => { alert(`has been injected: "${rawHtml}"`); })
 * ;
 * createHtmlRequest('/files/html/requests-test-2.html')
 *     .execute('element', {element : injectTarget, position : 'prepend'}, 'request-5', 'p', true)
 *         .then(htmlElements => { alert(`has been injected: "${htmlElements.map(e => e.outerHTML).join('')}"`); })
 * ;
 */
export function createHtmlRequest(url, options=null, useNative=false, strict=true){
	const
		__methodName__ = 'createHtmlRequest',
		contentType = 'text/html'
	;

	if( strict ){
		if( !hasValue(options) ){
			options = {};
		}

		if( !hasValue(options.headers) ){
			options.headers = {};
		}

		options.headers['Accept'] = contentType;
	}

	return {
		url,
		options,
		execute(resolveTo='element', insertTarget=null, dataId=null, selector=null, selectAll=false){
			const
				res = new Deferred(),
				fInsertAndResolve = (element, html='') => {
					if( hasValue(element) ){
						const elements = [].concat(element);

						if( dataId !== null ){
							elements.forEach(element => {
								element.setAttribute('data-id', `${dataId}`);
							});
						}

						if( hasValue(insertTarget) ){
							const
								target = insertTarget.element ?? insertTarget,
								position = insertTarget.position ?? null
							;

							if( ['before', 'beforebegin', 'prepend', 'afterbegin'].includes(position) ){
								elements.reverse();
							}

							elements.forEach(element => {
								if( position === null ){
									insertNode(target, element);
								} else {
									insertNode(target, element, position);
								}
							});
						}
					}

					res.resolve((resolveTo === 'raw') ? html : element);
				}
			;

			createFetchRequest(url, options, useNative).execute()
				.then(response => {
					const responseContentType = (
						response.headers.get('content-type') ?? response.headers.get('Content-Type') ?? ''
					).split(';')[0].trim();
					if( responseContentType !== contentType ){
						const message = `${MODULE_NAME}:${__methodName__} | content-type "${responseContentType}" is not valid for HTML, expecting "text/html"`;
						if( strict ){
							throw new Error(message);
						} else {
							warn(message);
						}
					}

					return response.text();
				})
				.then(html => {
					const
						isWholeDocument = html.includes('<html') || html.includes('<HTML'),
						isDocument = isWholeDocument
							|| (html.includes('<head') || html.includes('<HEAD'))
							|| (html.includes('<body') || html.includes('<BODY'))
						,
						fragmentNode = (new DOMParser())
							.parseFromString(html, 'text/html')
								.documentElement
					;

					let element;
					if( hasValue(selector) ){
						if( selectAll ){
							element = fragmentNode.querySelectorAll(`${selector}`);
						} else {
							element = fragmentNode.querySelector(`${selector}`);
						}
					} else if( isWholeDocument ){
						element = fragmentNode;
					} else if( isDocument) {
						element = fragmentNode.children;
					} else {
						element = fragmentNode.querySelector('body').children;
					}

					if( hasValue(element?.length) ){
						if( element.length === 0 ){
							element = null;
						} else if( element.length === 1 ){
							element = element.item(0);
						} else {
							element = Array.from(element);
						}
					}

					if( hasValue(selector) ){
						html = '';
						if( hasValue(element) ){
							([].concat(element)).forEach(element => {
								html += element.outerHTML;
							});
						}
					}

					fInsertAndResolve(element, html);
				})
				.catch(error => {
					res.reject(error);
				})
			;

			return res;
		}
	};
}



/**
 * @namespace Requests:visitUrl
 */

/**
 * This function opens a given URL, using a dynamically created iframe, thereby opening the URL as if the user
 * him- or herself navigates to the URL using a browser window. Why should we do this you ask?
 *
 * For example: In session management, you'll sometimes have the case, that you need to trigger URLs on login or logout,
 * that construct or destruct parts of the session by creating of removing cookie or other client-storage items.
 * If that domain is part of a system running on another (sub)domain, using a usual client request for this will
 * not work, since the calling context of the request will have no access to the storage scope of that domain.
 *
 * So, to allow those domains to do their tasks, triggered from a different context, we can use this method to execute
 * those webhooks with the iframe, which natively runs in the called domains scope and therefore can do all necessary
 * domain-based storage actions.
 *
 * The big downside of this is, that we cannot really handle errors well this way. So if the URL returns a 404
 * or a 500, this will actually be treated as a resolved promise, since the iframe loaded. The only case a request
 * of this kind fails, is if the request runs into a timeout. So, for really critical actions, this way of handling
 * thing should be avoided in favour of an approach, that actually includes a postMessage implementation on the other
 * domain, to verify completion on load.
 *
 * @param {String} url - the URL to query, will be the current one if left empty
 * @param {?Number} [timeout=5000] - the timeout in ms to wait for completion of the request, before rejecting the promise
 * @param {?String} [tokenValue=null] - if the URL needs to include a token, you can provide this token here, which will replace the placeholder defined in "tokenPlaceholder"
 * @param {?String} [tokenPlaceholder='token'] = the placeholder in the url to replace with the tokenValue, must be surrounded with curly braces in the url ("{token}")
 * @returns {Deferred} resolves on load of URL (with the final URL as resolution value), rejects on timeout (with a "timeout" error)
 *
 * @memberof Requests:visitUrl
 * @alias visitUrl
 * @example
 * visitUrl('https://some.other.domain?token={token}', 2500, 'A38')
 *   .then(() => { console.log('loaded!'); })
 * ;
 * visitUrl(
 *   'https://some.other.domain?token={session_value}',
 *   5000,
 *   'A38',
 *   'session_value'
 * )
 *   .then(url => { console.log(`"${url}" loaded!`); })
 *   .catch(error => { console.log(`${error.message} - URL did not load super fast, blimey!`); })
 * ;
 */
export function visitUrl(url, timeout=5000, tokenValue=null, tokenPlaceholder='token'){
	url = orDefault(url, '', 'str');
	timeout = Math.abs(orDefault(timeout, 5000, 'int'));
	tokenValue = orDefault(tokenValue, null, 'str');
	tokenPlaceholder = orDefault(tokenPlaceholder, 'token', 'str');
	url = hasValue(tokenValue) ? url.replaceAll(`{${tokenPlaceholder}}`, tokenValue) : url;

	const
		deferred = new Deferred(),
		outerNode = document.createElement('div')
	;

	outerNode.innerHTML = `
		<iframe
			class="webhook"
			frameborder="0"
			frameborder="0"
			marginwidth="0"
			marginheight="0"
			style="width:0;height:0;opacity:0;"
			src="${url}"
		></iframe>
	`.trim();

	const
		iframe = outerNode.firstChild,
		fOnLoad = () => {
			iframe.removeEventListener('load', fOnLoad);
			window.clearTimeout(loadTimeout);
			// we need to wait a bit after load before removing the iframe,
			// otherwise safari considers the request cancelled :(
			window.setTimeout(() => {
				document.body.removeChild(iframe);
				deferred.resolve(url);
			}, 250);
		},
		loadTimeout = window.setTimeout(() => {
			iframe.removeEventListener('load', fOnLoad);
			document.body.removeChild(iframe);
			deferred.reject(new Error('timeout'));
		}, timeout)
	;

	iframe.addEventListener('load', fOnLoad);
	document.body.appendChild(iframe);

	return deferred;
}
