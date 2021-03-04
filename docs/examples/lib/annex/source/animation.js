/*!
 * Module Animation
 */

/**
 * @namespace Animation
 */

const MODULE_NAME = 'Animation';



/**
 * @namespace Animation:EasingFunctions
 */

/**
 * A collection of all basic easing functions to be used in animations.
 * All functions here take a float parameter between 0 and 1 and return a mapped value between 0 and 1.
 *
 * Taken from: https://gist.github.com/gre/1650294
 *
 * Available functions:
 * - linear
 * - easeInQuad
 * - easeOutQuad
 * - easeInOutQuad
 * - easeInCubic
 * - easeOutCubic
 * - easeInOutCubic
 * - easeInQuart
 * - easeOutQuart
 * - easeInOutQuart
 * - easeInQuint
 * - easeOutQuint
 * - easeInOutQuint
 *
 * @memberof Animation:EasingFunctions
 * @alias EasingFunctions
 * @example
 * scrollTo(window, 1000, 0, EasingFunctions.easeInOutQuint);
 */
export const EasingFunctions = {
	// no easing, no acceleration
	linear : t => t,
	// accelerating from zero velocity
	easeInQuad : t => t*t,
	// decelerating to zero velocity
	easeOutQuad : t => t*(2-t),
	// acceleration until halfway, then deceleration
	easeInOutQuad : t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
	// accelerating from zero velocity
	easeInCubic : t => t*t*t,
	// decelerating to zero velocity
	easeOutCubic : t => (--t)*t*t+1,
	// acceleration until halfway, then deceleration
	easeInOutCubic : t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
	// accelerating from zero velocity
	easeInQuart : t => t*t*t*t,
	// decelerating to zero velocity
	easeOutQuart : t => 1-(--t)*t*t*t,
	// acceleration until halfway, then deceleration
	easeInOutQuart : t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
	// accelerating from zero velocity
	easeInQuint : t => t*t*t*t*t,
	// decelerating to zero velocity
	easeOutQuint : t => 1+(--t)*t*t*t*t,
	// acceleration until halfway, then deceleration
	easeInOutQuint : t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
};
