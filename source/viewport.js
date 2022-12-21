/*!
 * Module Viewport
 */

/**
 * @namespace Viewport
 */

const MODULE_NAME = 'Viewport';



//###[ IMPORTS ]########################################################################################################

import {hasValue, orDefault, isA, Deferred, assert} from './basic.js';
import {EasingFunctions} from './animation.js';
import {requestAnimationFrame} from './timers.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Viewport:isInViewport
 */

/**
 * Returns if the current element is visible in the window's viewport at the moment.
 * This method uses getBoundingClientRect(), which has to be supported by the browser, otherwise
 * the method will always return true.
 *
 * @param {HTMLElement} element - the element to check
 * @param {?Boolean} [mustBeFullyInside=false] - defines if the element has to be fully enclosed in the viewport, default is false
 * @returns {Boolean} true if in viewport
 *
 * @memberof Viewport:isInViewport
 * @alias isInViewport
 * @example
 * if( isInViewport(document.querySelector('div.moving'), true) ){
 *   ...
 * }
 */
export function isInViewport(element, mustBeFullyInside=false){
	mustBeFullyInside = orDefault(mustBeFullyInside, false, 'bool');

	let bb;
	try {
		bb = element.getBoundingClientRect();
	} catch(err){
		// if we cannot calculate position, we must assume the element is in
		return true;
	}

	let viewportBounds;
	if( mustBeFullyInside ){
		viewportBounds = {
			top: 0,
			right : window.innerWidth,
			bottom : window.innerHeight,
			left : 0
		};
	} else {
		viewportBounds = {
			top : -(bb.bottom - bb.top) + 1,
			right : (window.innerWidth + (bb.right - bb.left)) + 1,
			bottom : (window.innerHeight + (bb.bottom - bb.top)) + 1,
			left : -(bb.right - bb.left) + 1
		};
	}

	return (
		bb.top >= viewportBounds.top &&
		bb.right <= viewportBounds.right &&
		bb.left >= viewportBounds.left &&
		bb.bottom <= viewportBounds.bottom
	);
}



/**
 * @namespace Viewport:scrollTo
 */

/**
 * Scrolls the viewport to the element's position (first pixel at half viewport height).
 * Does not do anything if target element is already fully in viewport, unless scrollEvenIfFullyInViewport is set to
 * true. Uses getBoundingClientRect to measure viewport check, scrolls always if missing.
 *
 * If you use this function on a window, the offset is directly used as scrollTop, so this function may also be used for
 * things like back to top buttons.
 *
 * Scrolls may be cancelled by setting cancelOnUserScroll to true, but keep in mind, that this will only work
 * with mousewheels and (maybe) touchpads on modern browsers. No keyboard or scrollbar support yet.
 * The root of the problem is that a user scroll is indistinguishable from a js-triggered scroll,
 * since both trigger the scroll event and look exactly the same. So we have to use exotic
 * and specific events like mousewheel and DOMMouseScroll. So, please, use cancelOnUserScroll only
 * as a convenience option and not as a must.
 *
 *
 * @param {HTMLElement|Window} element - the element to scroll to or the window to scroll within
 * @param {?Number} [durationMs=1000] - duration of the scrolling animation
 * @param {?Number} [offset=0] - offset from the viewport center to apply to the end position
 * @param {?String} [easing='easeInOutCubic'] - easing function to use, can be any of Animation.EasingFunctions
 * @param {?Boolean} [scrollEvenIfFullyInViewport=false] - if true, forces method to always scroll no matter the element's position
 * @param {?Boolean} [cancelOnUserScroll=false] - if true, scrolling animation will immediately be canceled on manual user scroll, promise will not resolve in that case
 * @throws error if element is not usable or if durationMs is <= 0
 * @returns {Promise} resolves when scroll complete, rejects if scroll fails or is cancelled
 *
 * @memberof Viewport:scrollTo
 * @alias scrollTo
 * @see EasingFunctions
 * @example
 * document.querySelector('a.jumpitem').addEventListener('click', function(){ scrollTo(document.querySelector('.jumptarget'), function(){ alert('scrolled!'); }, 500, -100, true); });
 * scrollTo(document.querySelector('.jumptarget'), function(){ alert('Not triggered if user uses mousewheel.'); }, 5000, -0, false, true);
 * scrollTo(window, null, 500, 0, false, true);
 */
export function scrollTo(element, durationMs=1000, offset=0, easing='easeInOutCubic', scrollEvenIfFullyInViewport=false, cancelOnUserScroll=false){
	durationMs = orDefault(durationMs, 1000, 'int');
	offset = orDefault(offset, 0, 'int');
	easing = orDefault(easing, 'easeInOutCubic', 'str');
	scrollEvenIfFullyInViewport = orDefault(scrollEvenIfFullyInViewport, false, 'bool');
	cancelOnUserScroll = orDefault(cancelOnUserScroll, false, 'bool');

	assert(isA(element, 'htmlelement') || isA(element, 'window'), `${MODULE_NAME}:scrollTo | element unusable`);
	assert(durationMs > 0, `${MODULE_NAME}:scrollTo | durationMs must be > 0`);

	if( !isA(EasingFunctions[easing], 'function') ){
		easing = EasingFunctions.easeInOutCubic;
	} else {
		easing = EasingFunctions[easing];
	}

	const
		res = new Deferred(),
		elementIsWindow = (element.self === element)
	;

	// the window itself is considered not to be in viewport
	let elementInViewport = elementIsWindow ? false : isInViewport(element, true);

	// in this case missing support for bounding rects should result in scrolling
	try {
		element.getBoundingClientRect();
	} catch(err){
		elementInViewport = false;
	}

	if( scrollEvenIfFullyInViewport || !elementInViewport ){
		let start, targetY, cancelled = false;
		const startY = window.pageYOffset;

		if( elementIsWindow ){
			targetY = offset;
		} else {
			targetY = window.pageYOffset + element.getBoundingClientRect().top - Math.round(window.innerHeight / 2) + offset;
		}

		const
			diff = targetY - startY,
			fScroll = function(timestamp){
				if( !cancelled ){
					if( !hasValue(start) ){
						start = timestamp;
					}

					const
						time = timestamp - start,
						progress = easing(Math.min(time / durationMs, 1))
					;

					window.scrollTo(0, startY + (diff * progress));

					if( (time < durationMs) && (progress < 1) ){
						requestAnimationFrame(fScroll)
					} else {
						res.resolve();
					}
				}
			}
		;

		if( cancelOnUserScroll ){
			const fCancelScroll = function(){
				cancelled = true;
				res.reject();
				window.removeEventListener('DOMMouseScroll', fCancelScroll);
				window.removeEventListener('mousewheel', fCancelScroll);
			};

			window.addEventListener('DOMMouseScroll', fCancelScroll);
			window.addEventListener('mousewheel', fCancelScroll);
		}

		if( diff !== 0 ){
			requestAnimationFrame(fScroll);
		}
	}

	return res;
}
