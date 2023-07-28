/*!
 * Module Navigation
 */

/**
 * @namespace Navigation
 */

const MODULE_NAME = 'Navigation';



//###[ IMPORTS ]########################################################################################################

import {warn} from './logging.js';
import {hasValue, orDefault, isPlainObject, isEmpty, isA, assert} from './basic.js';
import {createNode} from './elements.js';
import {browserSupportsHistoryManipulation} from './context.js';



//###[ DATA ]###########################################################################################################

export const HISTORY = {
	current : {
		state : null,
		title : '',
		host : window?.location?.host,
		path : window?.location?.pathname
	},
	popState : {
		listening : false,
		callbacks : [],
		handler(e){
			const historyNew = {
				state : e.state,
				title : e.title,
				host : window.location.host,
				path : window.location.pathname
			};

			HISTORY.popState.callbacks.forEach(cb => {
				cb.stateful(e, historyNew);
			});

			HISTORY.current = historyNew;
		}
	}
};



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Navigation:redirect
 */

/**
 * Everything you need to do basic navigation without history API.
 * Provide a URL to navigate to or leave the URL out, to use the current full URL.
 * Add GET-parameters (adding to those already present in the URL), define an anchor (or automatically get the one
 * defined in the URL), set a target to define a window to navigate to (or open a new one) and even
 * define POST-parameters to navigate while providing POST-data.
 *
 * If you define POST-params to navigate to a URL providing POST-data we internally build a custom form element,
 * with type "post", filled with hidden fields adding the form data, which we submit to navigate to the action, which
 * contains our url. Even the target carries over.
 *
 * If you define a target window and therefore open a new tab/window this function adds "noopener,noreferrer"
 * automatically if the origins do not match to increase security. If you need the opener, have a look at
 * "openWindow", which gives you more manual control in that regard.
 *
 * If you define a target and open an external URL, repeated calls to the same target will open multiple windows
 * due to the security settings.
 *
 * @param {?String} [url] - the location to load, if null current location is reloaded/used
 * @param {?Object} [params=null] - plain object of GET-parameters to add to the url, adds to existing ones in the URL and overwrites existing ones with same name
 * @param {?String} [anchor=null] - anchor/hash to set for called url, has precedence over URL hash
 * @param {?String} [target=null] - name of the window to perform the redirect to/in, use "_blank" to open a new window/tab
 * @param {?Object} [postParams=null] - plain object of postParameters to send with the redirect, solved with a hidden form
 *
 * @memberof Navigation:redirect
 * @alias redirect
 * @example
 * redirect('https://test.com', {search : 'kittens', order : 'asc'}, 'fluffykittens');
 * redirect(null, {order : 'desc'});
 */
export function redirect(url, params=null, anchor=null, target=null, postParams=null){
	url = orDefault(url, null, 'str');
	params = isPlainObject(params) ? params : null;
	anchor = orDefault(anchor, null, 'str');
	postParams = isPlainObject(postParams) ? postParams : null;
	target = orDefault(target, null, 'str');

	if( !hasValue(url) ){
		url = window.location.href;

		if( !isEmpty(window.location.hash) ){
			anchor = orDefault(anchor, window.location.hash.replace('#', ''), 'str');
			url = url.replace(/#.+$/, '');
		}
	} else {
		const anchorFromUrlParts = url.split('#', 2);

		if( anchorFromUrlParts.length > 1 ){
			anchor = orDefault(anchor, anchorFromUrlParts[1], 'str');
			url = url.replace(/#.+$/, '');
		}
	}

	const urlParts = url.split('?', 2);
	url = urlParts[0];

	const
		presentParamString = orDefault(urlParts[1], ''),
		presentParams = {},
		paramArray = []
	;

	if( presentParamString.length > 0 ){
		presentParamString.split('&').forEach(presentParam => {
			presentParam = presentParam.split('=', 2);
			if( presentParam.length === 2 ){
				presentParams[presentParam[0]] = presentParam[1];
			} else {
				presentParams[presentParam[0]] = null;
			}
		});
	}

	params = hasValue(params) ? {...presentParams, ...params} : presentParams;

	for( let paramName in params ){
		if( hasValue(params[paramName]) ){
			paramArray.push(`${paramName}=${encodeURIComponent(decodeURIComponent(params[paramName]))}`);
		} else {
			paramArray.push(paramName);
		}
	}

	const finalUrl = `${url}${
			(paramArray.length > 0)
			? `${(url.indexOf('?') === -1) ? '?' : '&'}${paramArray.join('&')}`
			: ''
		}${hasValue(anchor) ? `#${anchor}` : ''}`
	;

	if( hasValue(postParams) ){
		const formAttributes = {method : 'post', action : finalUrl, 'data-ajax' : 'false'};
		if( hasValue(target) ){
			formAttributes.target = target;
		}

		const redirectForm = createNode('form', formAttributes);
		for( let paramName in postParams ){
			if( isA(postParams[paramName], 'array') ){
				postParams[paramName].forEach(val => {
					redirectForm.appendChild(createNode(
						'input',
						{type : 'hidden', name : `${paramName}[]`, value : `${val}`}
					));
				});
			} else {
				redirectForm.appendChild(createNode(
					'input',
					{type : 'hidden', name : paramName, value : `${postParams[paramName]}`}
				));
			}
		}

		document.body.appendChild(redirectForm);
		redirectForm.submit();
		document.body.removeChild(redirectForm);
	} else if( hasValue(target) ){
		let parsedUrl;

		try {
			parsedUrl = new URL(url);
		} catch(ex) {
			parsedUrl = new URL(url, window.location);
		}

		if( parsedUrl.origin !== window.location.origin ){
			// we have to jump through hoops here, since adding security features to window.open
			// forces popup windows in some browsers and although we can set opener via the created
			// window, we cannot reliably set the referrer that way
			const eLink = document.createElement('a');
			eLink.href = finalUrl;
			eLink.target = target;
			eLink.rel = 'noopener noreferrer';
			document.body.appendChild(eLink);
			eLink.click();
			eLink.parentNode.removeChild(eLink);
		} else {
			window.open(finalUrl, target);
		}
	} else {
		window.location.assign(finalUrl);
	}
}



/**
 * @namespace Navigation:openTab
 */

/**
 * Opens a sub-window for the current window as _blank, which should result in a new tab in most browsers.
 *
 * This method is just a shortcut for "redirect" with a set target and reasonable parameters.
 *
 * By using "redirect", this method also automatically takes care of adding "noopener,noreferrer" to external
 * links, which are determined by not having the same origin as the current location. For more manual control
 * over such parameters, have a look at "openWindow" instead.
 *
 * @param {?String} [url] - the location to load, if null current location is reloaded/used
 * @param {?Object} [params=null] - plain object of GET-parameters to add to the url, adds to existing ones in the URL and overwrites existing ones with same name
 * @param {?String} [anchor=null] - anchor/hash to set for called url, has precedence over URL hash
 * @param {?Object} [postParams=null] - plain object of postParameters to send with the redirect, solved with a hidden form
 *
 * @memberof Navigation:openTab
 * @alias openTab
 * @see redirect
 * @example
 * openTab('/misc/faq.html');
 */
export function openTab(url, params=null, anchor=null, postParams=null){
	redirect(url, params, anchor, '_blank', postParams);
}



/**
 * @namespace Navigation:openWindow
 */

/**
 * Opens a sub-window for the current window or another defined parent window.
 * Be aware that most browsers open new windows as a tab by default, have a look at the "tryAsPopup"-parameter
 * if you need to open a new standalone window and your configuration results in new tabs instead.
 *
 * For window options (in this implementation, we consider "name" to be an option as well), see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/open#window_features
 *
 * Keep in mind to set "noopener" and/or "noreferrer" for external URLs in options, to improve security and privacy.
 * Hint for older MS browsers: if you set these security options, these will most likely open the URL in a popup
 * window. If you want to circumvent this, you'll have to drop the "noreferrer" and settle for "noopener", by
 * setting opener to null on the returned window like this: `openWindow('url').opener = null;`
 *
 * @param {String} url - the URL to load in the new window
 * @param {?Object} [options=null] - parameters for the new window according to the definitions of window.open & "name" for the window name
 * @param {?Window} [parentWindow=null] - parent window for the new window, current if not defined
 * @param {?Boolean} [tryAsPopup=false] - defines if it should be tried to force a real new window instead of a tab
 * @returns {Window} the newly opened window/tab
 *
 * @memberof Navigation:openWindow
 * @alias openWindow
 * @example
 * openWindow('/img/gallery.html');
 * openWindow('http://www.kittens.com', {name : 'kitten_popup'}, parent);
 */
export function openWindow(url, options=null, parentWindow=null, tryAsPopup=false){
	url = `${url}`;
	options = isPlainObject(options) ? options : null;
	parentWindow = isA(parentWindow, 'window') ? parentWindow : window;
	tryAsPopup = orDefault(tryAsPopup, false, 'bool');

	let	windowName = '';
	const optionArray = [];

	if( hasValue(options) ){
		for( let prop in options ){
			if( prop === 'name' ){
				windowName = options[prop];
			}

			if( (prop !== 'name') || tryAsPopup ){
				if( [true, 1, 'yes'].includes(options[prop]) ){
					optionArray.push(`${prop}`);
				} else {
					optionArray.push(`${prop}=${options[prop]}`);
				}
			}
		}
	}

	return parentWindow.open(url, windowName, optionArray.join(','));
}



/**
 * @namespace Navigation:reload
 */

/**
 * Reloads the current window-location. Differentiates between cached and cache-refreshing reload.
 * Hint: the forcedReload param in window.location.reload is deprecated and not supported anymore in all browsers,
 * so, in order to do a cache busting reload we have to use a trick, by using a POST-reload, since POST never
 * gets cached. If, for some reason, you cannot POST to a URL, I also provided a second, less effective fallback,
 * using "replace".
 *
 * Hint: depending on your browser a cached reload may keep the current scrolling position in the document, while
 * the uncached variants won't
 *
 * @param {?Boolean} [cached=true] - should we use the cache on reload?
 * @param {?Boolean} [postUsable=true] - if set to false, we try to replace URL instead of POSTing to it
 *
 * @memberof Navigation:reload
 * @alias reload
 * @example
 * // with cache
 * reload();
 * // without cache via POST
 * reload(false);
 * // without cache via "replace"
 * reload(false, false);
 */
export function reload(cached=true, postUsable=true){
	cached = orDefault(cached, true, 'bool');
	postUsable = orDefault(postUsable, true, 'bool');

	if( !cached && postUsable ){
		const form = document.createElement('form');
		form.method = 'post';
		form.action = window.location.href;
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	} else if( !cached && !postUsable ){
		window.location.replace(window.location.href);
	} else {
		window.location.reload();
	}
}



/**
 * @namespace Navigation:changeCurrentUrl
 */

/**
 * Changes the current URL by using the history API (this means, we can only change to a path on the same origin).
 * Be aware that this replaces the current URL in the history _without_ any normal navigation or reload.
 * This method only works if the history API is supported by the browser, otherwise no navigation will occur
 * (but a warning will be shown in console).
 * For more details on the history API see:
 * https://developer.mozilla.org/en-US/docs/Web/API/History
 *
 * @param {String} url - an absolute or relative url to change the current address to on the same origin
 * @param {?Boolean} [usePushState=false] - push new state instead of replacing current
 * @param {?*} [state=null] - a serializable object to append to the history state (gets retrieved on popState-event)
 * @param {?String} [title=null] - a name/title for the new state (as of yet, only Safari uses this, other browser will return undefined)
 * @throws error if state is not serializable by browser
 *
 * @memberof Navigation:changeCurrentUrl
 * @alias changeCurrentUrl
 * @see onHistoryChange
 * @example
 * changeCurrentUrl('/article/important-stuff', false, {id : 666});
 */
export function changeCurrentUrl(url, usePushState=false, state=null, title=null){
	url = orDefault(url, '', 'str');
	usePushState = orDefault(usePushState, false, 'bool');
	title = orDefault(title, '', 'str');

	if ( browserSupportsHistoryManipulation() ) {
		if( usePushState ){
			window.history.pushState(state, title, url);
		} else {
			window.history.replaceState(state, title, url);
		}

		HISTORY.current = {
			state,
			title,
			host : window.location.host,
			path : window.location.pathname
		};
	} else {
		warn(`${MODULE_NAME}:changeCurrentUrl | this browser does not support history api, skipping`);
	}
}



/**
 * @namespace Navigation:onHistoryChange
 */

/**
 * Registers an onpopstate event if history API is available (does nothing and warns if not available).
 * Takes a callback, which is provided with states as plain objects like: {state, title, host, path}.
 * Hint: do not rely on title, since that property may only be supported by browsers like Safari,
 * serialize everything important into state and use title as orientation only.
 *
 * In case of a regular binding all callbacks get the current state, so the state that is being changed to, but
 * if you set "usePreviousState" to true and prior navigation was done with "changeCurrentUrl", all callbacks
 * get two states: "from" and "to". With this you can define rules an behaviour depending on the state you are
 * coming from. Keep in mind: this only works if you use "changeCurrentUrl" for navigation in tandem with this method.
 *
 * @param {Function} callback - function to execute on popstate
 * @param {?Boolean} [clearOld=false] - defines if old handlers should be removed before setting new one
 * @param {?Boolean} [usePreviousState=false] - defines if callbacks should be provided with previous state as well (in that case, changeCurrentUrl must have been used for prior navigation)
 * @throws error if callback is no function
 *
 * @memberof Navigation:onHistoryChange
 * @alias onHistoryChange
 * @see changeCurrentUrl
 * @see offHistoryChange
 * @example
 * onHistoryChange(function(){ alert('Hey, don\'t do this!'); }, true);
 */
export function onHistoryChange(callback, clearOld=false, usePreviousState=false){
	const __methodName__ = 'onHistoryChange';

	clearOld = orDefault(clearOld, false, 'bool');
	usePreviousState = orDefault(usePreviousState, false, 'bool');

	assert(isA(callback, 'function'), `${MODULE_NAME}:${__methodName__} | callback is no function`);

	if ( browserSupportsHistoryManipulation() ) {
		if( clearOld ){
			HISTORY.popState.callbacks = [];
		}

		const statefulCallback = function(e, historyNew){
			if( usePreviousState ){
				callback(HISTORY.current, historyNew);
			} else {
				callback(historyNew);
			}
		};

		HISTORY.popState.callbacks.push({
			original : callback,
			stateful : statefulCallback
		});

		if( !HISTORY.popState.listening ){
			HISTORY.popState.listening = true;

			window.addEventListener('popstate',	HISTORY.popState.handler);
		}
	} else {
		warn(`${MODULE_NAME}:${__methodName__} | this browser does not support history api, skipping`);
	}
}



/**
 * @namespace Navigation:offHistoryChange
 */

/**
 * Removes registered history change handlers, that have been created with "onHistoryChange".
 * If a callback is provided, that callback is removed from callbacks, if the function is called
 * without parameters all callbacks are removed and the event listener for the callbacks is removed.
 *
 * @param {?Function} [callback=true] - reference to the callback to be removed, if missing all callbacks are removed
 * @throws error if callback is no function
 * @return {Boolean} true if callback(s) are/were removed, false if nothing was done
 *
 * @memberof Navigation:offHistoryChange
 * @alias offHistoryChange
 * @see changeCurrentUrl
 * @see onHistoryChange
 * @example
 * offHistoryChange(thatOneCallback);
 * offHistoryChange();
 */
export function offHistoryChange(callback=null){
	const __methodName__ = 'offHistoryChange';

	if( hasValue(callback) ){
		assert(isA(callback, 'function'), `${MODULE_NAME}:${__methodName__} | callback is not a function`);

		const oldCallbackCount = HISTORY.popState.callbacks.length;
		HISTORY.popState.callbacks = HISTORY.popState.callbacks.reduce((cbs, cb) => {
			if( cb.original !== callback ){
				cbs.push(cb);
			}

			return cbs;
		}, []);
		const newCallbackCount = HISTORY.popState.callbacks.length;

		if( newCallbackCount === 0 ){
			window.removeEventListener('popstate', HISTORY.popState.handler);
			HISTORY.popState.listening = false;
		}

		return oldCallbackCount > newCallbackCount;
	} else {
		HISTORY.popState.callbacks = [];
		window.removeEventListener('popstate', HISTORY.popState.handler);
		HISTORY.popState.listening = false;

		return true;
	}
}
