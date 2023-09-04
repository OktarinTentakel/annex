/*!
 * Module Context
 */

/**
 * @namespace Context
 */

const MODULE_NAME = 'Context';



//###[ IMPORTS ]########################################################################################################

import {hasValue, isFunction, isArray, orDefault, Observable} from './basic.js';
import {throttle} from './functions.js';
import {reschedule} from './timers.js';



//###[ DATA ]###########################################################################################################

const INTERACTION_TYPE_DETECTION = {
	touchHappening : false,
	touchEndingTimer : null,
	touchStartHandler(){
		INTERACTION_TYPE_DETECTION.touchHappening = true;
		if( CURRENT_INTERACTION_TYPE.getValue() !== 'touch' ){
			CURRENT_INTERACTION_TYPE.setValue('touch');
		}
	},
	touchEndHandler(){
		INTERACTION_TYPE_DETECTION.touchEndingTimer = reschedule(INTERACTION_TYPE_DETECTION.touchEndingTimer, 1032, () => {
			INTERACTION_TYPE_DETECTION.touchHappening = false;
		});
	},
	blurHandler(){
		INTERACTION_TYPE_DETECTION.touchEndingTimer = reschedule(INTERACTION_TYPE_DETECTION.touchEndingTimer, 1032, () => {
			INTERACTION_TYPE_DETECTION.touchHappening = false;
		});
	},
	mouseMoveHandler : throttle(1000, function(){
		if( (CURRENT_INTERACTION_TYPE.getValue('pointer')) && !INTERACTION_TYPE_DETECTION.touchHappening ){
			CURRENT_INTERACTION_TYPE.setValue('pointer');
		}
	})
};

export let CURRENT_INTERACTION_TYPE;



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Context:browserSupportsHistoryManipulation
 */

/**
 * Detects if the browser supports history manipulation, by checking the most common
 * methods for presence in the history-object.
 *
 * @returns {Boolean} true if browser seems to support history manipulation
 *
 * @memberof Context:browserSupportsHistoryManipulation
 * @alias browserSupportsHistoryManipulation
 * @example
 * if( browserSupportsHistoryManipulation() ){
 *   window.history.replaceState(null, 'test', '/test');
 * }
 */
export function browserSupportsHistoryManipulation(){
	return hasValue(window.history)
		&& isFunction(window.history.pushState)
		&& isFunction(window.history.replaceState)
	;
}



/**
 * @namespace Context:contextHasHighDpi
 */

/**
 * Checks if the context would benefit from high DPI graphics.
 *
 * @returns {Boolean} true if device has high DPI, false if not or browser does not support media queries
 *
 * @memberof Context:contextHasHighDpi
 * @alias contextHasHighDpi
 * @example
 * if( contextHasHighDpi() ){
 *     document.querySelectorAll('img').forEach(img => {
 *         img.setAttribute('src', img.getAttribute('src').replace('.jpg', '@2x.jpg'));
 *     });
 * }
 */
export function contextHasHighDpi(){
	if( window.matchMedia ){
		return window.matchMedia(
			'only screen and (-webkit-min-device-pixel-ratio: 1.5),'
			+'only screen and (-o-min-device-pixel-ratio: 3/2),'
			+'only screen and (min--moz-device-pixel-ratio: 1.5),'
			+'only screen and (min-device-pixel-ratio: 1.5),'
			+'only screen and (min-resolution: 144dpi),'
			+'only screen and (min-resolution: 1.5dppx)'
		).matches;
	} else {
		return false;
	}
}



/**
 * @namespace Context:getBrowserScrollbarWidth
 */

/**
 * Returns the current context's scrollbar width. Returns 0 if scrollbar is over content.
 * There are edge cases in which we might want to calculate positions in respect to the
 * actual width of the scrollbar. For example when working with elements with a 100vw width.
 *
 * This method temporarily inserts three elements into the body while forcing the body to
 * actually show scrollbars, measuring the difference between 100vw and 100% on the body and
 * returns the result.
 *
 * @returns {Number} the width of the body scrollbar in pixels
 *
 * @memberof Context:getBrowserScrollbarWidth
 * @alias getBrowserScrollbarWidth
 * @example
 * foobarElement.style.width = `calc(100vw - ${getBrowserScrollbarWidth()}px)`;
 */
export function getBrowserScrollbarWidth(){
	const sandbox = document.createElement('div');
	sandbox.style.visibility = 'hidden';
	sandbox.style.opacity = '0';
	sandbox.style.pointerEvents = 'none';
	sandbox.style.overflow = 'scroll';
	sandbox.style.position = 'fixed';
	sandbox.style.top = '0';
	sandbox.style.right = '0';
	sandbox.style.left = '0';
	// firefox needs container to be at least 30px high to display scrollbar
	sandbox.style.height = '50px';

	const scrollbarEnforcer = document.createElement('div');
	scrollbarEnforcer.style.width = '100%';
	scrollbarEnforcer.style.height = '100px';

	sandbox.appendChild(scrollbarEnforcer);
	document.body.appendChild(sandbox);

	const scrollbarWidth = sandbox.offsetWidth - scrollbarEnforcer.offsetWidth;

	document.body.removeChild(sandbox);

	return scrollbarWidth;
}



/**
 * @namespace Context:detectInteractionType
 */

/**
 * Try to figure out the current type of interaction between the user and the document.
 * This is determined by the input device and is currently limited to either "pointer" or "touch".
 *
 * On call the function returns an educated guess about the fact what interaction type might be more
 * probable based on browser features and sets up event listeners to update Context module's CURRENT_INTERACTION_TYPE
 * observable (to which you may subscribe to be informed about updates), when interaction type should change while
 * the page is being interacted with. In case a touch occurs we determine touch interaction and
 * on mousemove we determine pointer interaction. If you use this observable to set up a class on your document for
 * example you can even relatively safely handle dual devices like a surface book.
 *
 * Hint: because touch devices also emit a single mousemove after touchend with a single touch we have to block
 * mousemove detection for 1s after the last touchend. Therefore, it takes up to 1s after the last touch event until
 * we are able to detect the change to a pointer device.
 *
 * @param {?Boolean} [returnObservable=false] - if set to true, the call returns Context module's CURRENT_INTERACTION_TYPE observable
 * @returns {String|Observable} interaction type string "pointer" or "touch", or the CURRENT_INTERACTION_TYPE observable
 *
 * @memberof Context:detectInteractionType
 * @alias detectInteractionType
 * @example
 * let interactionTypeGuess = detectInteractionType();
 * detectInteractionType(true).subscribe(function(type){
 *     document.body.classList.toggle('touch', type === 'touch');
 * });
 */

export function detectInteractionType(returnObservable=false){
	returnObservable = orDefault(returnObservable, false, 'bool');

	if( !hasValue(CURRENT_INTERACTION_TYPE) ){
		CURRENT_INTERACTION_TYPE = new Observable('');
		if( ('ontouchstart' in document) && ('ontouchend' in document) && (window.navigator.maxTouchPoints > 0) ){
			CURRENT_INTERACTION_TYPE.setValue('touch');
		} else {
			CURRENT_INTERACTION_TYPE.setValue('pointer');
		}

		document.addEventListener('touchstart', INTERACTION_TYPE_DETECTION.touchStartHandler);
		document.addEventListener('touchend', INTERACTION_TYPE_DETECTION.touchEndHandler);
		window.addEventListener('blur', INTERACTION_TYPE_DETECTION.blurHandler);
		document.addEventListener('mousemove', INTERACTION_TYPE_DETECTION.mouseMoveHandler);
	}

	return returnObservable ? CURRENT_INTERACTION_TYPE : CURRENT_INTERACTION_TYPE.getValue();
}



/**
 * @namespace Context:detectAppleDevice
 */

/**
 * Try to determine if the execution context is an Apple device and if so: which type.
 *
 * We use an escalating test starting with the user agent and then, as a fallback, checking the platform value
 * to determine the general device class (iPhone, iPad ,iPod ,Macintosh). If we get a Macintosh, we double check
 * if the device might be a falsely reporting iPad with iPadOS13+.
 *
 * You can hook up additional tests by providing an "additionalTest" function as a function parameter,
 * that function takes the evaluated device type at the end of the function and expects a new device type to be
 * returned. Using this, you can tap into the process and handle edge cases yourself.
 *
 * @param {?Function} [additionalTest=null] - if set, is executed after determining the device type, takes the current device type as parameter and is expected to return a new one; use this to add edge case tests to overwrite the result in certain conditions
 * @returns {String} "ipad", "iphone", "ipod" or "mac"
 *
 * @memberof Context:detectAppleDevice
 * @alias detectAppleDevice
 * @example
 * const IS_IOS_DEVICE = ['iphone', 'ipod', 'ipad'].includes(detectAppleDevice());
 */
export function detectAppleDevice(additionalTest=null){
	let
		family = /iPhone|iPad|iPod|Macintosh/.exec(window.navigator.userAgent),
		deviceType = null
	;

	if( Array.isArray(family) && (family.length > 0) ){
		family = family[0];
	} else {
		family = /^(iPhone|iPad|iPod|Mac)/.exec(window.navigator.platform);

		if( Array.isArray(family) && (family.length > 0) ){
			family = family[0];

			if( family === 'Mac' ){
				family = 'Macintosh';
			}
		} else {
			family = null;
		}
	}

	if( hasValue(family) ){
		// If User-Agent reports Macintosh double check this against touch points, since the device might
		// be a disguised iPad with i(Pad)Os13+
		if(
			(family === 'Macintosh')
			&& (window.navigator.maxTouchPoints > 1)
		){
			family = 'iPad';
		}

		switch( family ) {
			case 'iPad':
				deviceType = 'ipad';
			break;
			case 'iPhone':
				deviceType = 'iphone';
			break;
			case 'iPod':
				deviceType = 'ipod';
			break;
			case 'Macintosh':
				deviceType = 'mac';
			break;
		}

		if( isFunction(additionalTest) ){
			deviceType = additionalTest(deviceType);
		}
	}

	return deviceType;
}



/**
 * @namespace Context:getBrowserLanguage
 */

/**
 * Evaluates all available browser languages and tries to return the preferred one.
 *
 * Since browsers could not agree on a uniform way to return language values yet, the returned language
 * will always be "lowercaselanguage-UPPERCASECOUNTRY" or just "lowercaselanguage", if we have no country.
 *
 * @param {?String} [fallbackLanguage=null] - fallback value to return if no language could be evaluated
 * @returns {String|null} the preferred browser language if available, null if no language can be detected and no fallback has been defined
 *
 * @memberof Context:getBrowserLanguage
 * @alias getBrowserLanguage
 * @see getBrowserLocale
 * @example
 * getBrowserLanguage()
 * => "en"
 */
export function getBrowserLanguage(fallbackLanguage=null){
	let language = null;

	if( hasValue(window.navigator.languages) ){
		const browserLanguages = Array.from(window.navigator.languages);
		if( isArray(browserLanguages) && (browserLanguages.length > 0) ){
			language = `${browserLanguages[0]}`;
		}
	}

	if( !hasValue(language) ){
		['language', 'browserLanguage', 'userLanguage', 'systemLanguage'].forEach(browserLanguagePropertyKey => {
			if( !hasValue(language) ){
				const browserLanguage = window.navigator[browserLanguagePropertyKey];
				language = hasValue(browserLanguage) ? `${browserLanguage}` : null;
			}
		});
	}

	if( !hasValue(language) && hasValue(fallbackLanguage) ){
		language = `${fallbackLanguage}`;
	}

	const languageParts = language.split('-');
	language = languageParts[0].toLowerCase().trim();
	const country = languageParts?.[1]?.toUpperCase()?.trim();
	language = hasValue(country) ? `${language}-${country}` : language;

	return language;
}



/**
 * @namespace Context:getLocale
 */

/**
 * Evaluates the document's locale by having a look at the HTML element's lang-attribute.
 *
 * Since browsers could not agree on a uniform way to return locale values yet, the returned "code" will always be
 * "lowercaselanguage-UPPERCASECOUNTRY" (or just "lowercaselanguage", if we have no country), regardless of how the
 * browser returns the value, while "country" and "language" will always be lower case.
 *
 * @param {?HTMLElement} [element=document.documentElement] - the element holding the lang-attribute to evaluate
 * @param {?String} [fallbackLanguage=null] - if defined, a fallback lang value if element holds no lang information
 * @returns {Object} the locale as an object, having the lang value as "code", the split-up parts in "country" and "language" (if available) and "isFallback" to tell us if the fallback had to be used
 *
 * @memberof Context:getLocale
 * @alias getLocale
 * @see getBrowserLocale
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
 * @example
 * getLocale()
 * => {
 *   code : 'en-GB',
 *   country : 'gb',
 *   language : 'en',
 *   isFallback : false
 * }
 * getLocale(document.querySelector('p'), 'en-US')
 * => {
 *   code : 'en-US',
 *   country : 'us',
 *   language : 'en',
 *   isFallback : true
 * }
 */
export function getLocale(element=null, fallbackLanguage=null){
	// document.documentElement not as function default to prevent errors in document-less context on import
	element = orDefault(element, document.documentElement);

	const locale = {
		code : null,
		country : null,
		language : null,
		isFallback : false
	};

	let langAttr = isFunction(element.getAttribute) ?  element.getAttribute('lang') : null;
	if( !hasValue(langAttr) && hasValue(fallbackLanguage) ){
		langAttr = `${fallbackLanguage}`;
		locale.isFallback = true;
	}

	if( hasValue(langAttr) ){
		const localeParts = `${langAttr}`.split('-');
		locale.country = localeParts?.[1]?.toLowerCase()?.trim();
		locale.language = localeParts[0].toLowerCase().trim();
		locale.code = hasValue(locale.country) ? `${locale.language}-${locale.country.toUpperCase()}` : locale.language;
	}

	return locale;
}



/**
 * @namespace Context:getBrowserLocale
 */

/**
 * Evaluates the browser's locale by having a look at the preferred browser language, as reported by `getBrowserLanguage`.
 *
 * Since browsers could not agree on a uniform way to return locale values yet, the returned "code" will always be
 * "lowercaselanguage-UPPERCASECOUNTRY" (or just "lowercaselanguage", if we have no country), regardless of how the
 * browser returns the value, while "country" and "language" will always be lower case.
 *
 * @param {?String} [fallbackLanguage=null] - if defined, a fallback lang value if browser reports no preferred language
 * @returns {Object} the locale as an object, having the in "country" and "language" (if available) and "isFallback" to tell us if the fallback had to be used
 *
 * @memberof Context:getBrowserLocale
 * @alias getBrowserLocale
 * @see getBrowserLanguage
 * @example
 * getBrowserLocale()
 * => {
 *   code : 'en-GB',
 *   country : 'gb',
 *   language : 'en',
 *   isFallback : false
 * }
 * getBrowserLocale('en-US')
 * => {
 *   code : 'en-US',
 *   country : 'us',
 *   language : 'en',
 *   isFallback : true
 * }
 */
export function getBrowserLocale(fallbackLanguage=null){
	return getLocale({getAttribute(){ return getBrowserLanguage(fallbackLanguage); }}, fallbackLanguage);
}
