/*!
 * Module Context
 */

/**
 * @namespace Context
 */

const MODULE_NAME = 'Context';



//###[ IMPORTS ]########################################################################################################

import {hasValue, isA, orDefault, Observable} from './basic.js';
import {throttle} from './functions.js';
import {createNode} from './elements.js';
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
		&& isA(window.history.pushState, 'function')
		&& isA(window.history.replaceState, 'function')
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
 * @namespace Context:browserScrollbarWidth
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
 * @memberof Context:browserScrollbarWidth
 * @alias browserScrollbarWidth
 * @example
 * foobarElement.style.width = `calc(100vw - ${browserScrollbarWidth()}px)`;
 */
export function browserScrollbarWidth(){
	const sandbox = createNode('div');
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

	const scrollbarEnforcer = createNode('div');
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

		if( isA(additionalTest, 'function') ){
			deviceType = additionalTest(deviceType);
		}
	}

	return deviceType;
}
