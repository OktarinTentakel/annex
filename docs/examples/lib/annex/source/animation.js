/*!
 * Module Animation
 */

/**
 * @namespace Animation
 */

const MODULE_NAME = 'Animation';



//###[ IMPORTS ]########################################################################################################

import {hasValue, isA, isPlainObject, isEmpty, isNaN, orDefault, assert, Deferred} from './basic.js';
import {warn} from './logging.js';
import {pschedule, countermand, waitForRepaint} from './timers.js';
import {applyStyles} from './css.js';



//###[ DATA ]###########################################################################################################

const RUNNING_TRANSITIONS = new WeakMap();



//###[ EXPORTS ]########################################################################################################

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



/**
 * @namespace Animation:transition
 */

/**
 * This method offers the possibility to apply CSS transitions via classes and/or styles and wait for the transition
 * to finish, which results in the resolution of a Deferred.
 *
 * In general, this method remedies the pain of having to manage transitions manually in JS, entering precise ms for
 * timers waiting on conclusion of transitions.
 *
 * The general principle of this is the parsing of transition CSS attributes, which may contain transition
 * timings (transition and transition-duration) and looks for the longest currently running transition.
 * Values are excepted as milliseconds or seconds (int or float notation).
 *
 * Why would you do this, if there is something like the `animationend` event, you ask? Well, the problem is, that,
 * if the animation is interrupted or never finishes for any other reason, the event never fires. For that, there is
 * the `animationcancel` event, but that is not really robustly supported at the moment. So, in cases of complex
 * style changes, where we definitively want to have a callback when the animation has been (or would have been)
 * finished, this is still the safer option. But, for simple and small cases I'd strongly recommend using the native
 * `AnimationEvent` API.
 *
 * Calling this method successively on the same element replaces the currently running transition, normally
 * resulting in premature resolution of the Deferred and application of the newly provided changes.
 *
 * Be advised, that legacy browsers like IE11 and Edge <= 18 have problems connecting interrupted transitions,
 * especially when transition-durations change during animation, resulting in skipped or choppy animations. If you
 * experience this, try to keep timings stable during animation and chain animations without overlap.
 *
 * @param {Element} element - the element to transition, by applying class and/or style changes
 * @param {?Object} [classChanges=null] - plain object containing class changes to apply, add classes via the "add" key, remove them via the "remove" key (add has precedence over remove); values may be standard CSS class string notation or an array of standard CSS class notations
 * @param {?Object} [styleChanges=null] - plain object containing style changes to apply (via applyStyles)
 * @param {?Boolean} [rejectOnInterruption=false] - if a new transition is applied using this function while a previous transition is still running the Deferred would normally be resolved before continuing, set this to true to let the Deferred reject in that case (the rejection message is "interrupted", access the element using "element)
 * @return {Deferred} resolves on transition completion or repeated call on the same element, with the resolution value being the element, rejects on repeated call on same element if rejectOnInterruption is true (the rejection message is "interrupted", access the element using "element")
 *
 * @memberof Animation:transition
 * @alias transition
 * @see applyStyles
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event
 * @example
 * transition(element, {add : 'foobar'}).then(element => { return transition(element, {remove : 'foobar'}); }).then(() => { console.log('finished'); });
 * transition(element, null, {top : 0, left : 0, background : 'pink', transition : 'all 1500ms'}).then(() => { console.log('finished'); });
 * transition(element, {add : 'foobar'}).then(() => { console.log('finished'); }).catch(error => { console.log('cancelled'); });
 */
export function transition(element, classChanges=null, styleChanges=null, rejectOnInterruption=false){
	const __methodName__ = 'cssTransition';

	classChanges = orDefault(classChanges, {});
	styleChanges = orDefault(styleChanges, {});
	rejectOnInterruption = orDefault(rejectOnInterruption, false, 'bool');

	assert(isA(element, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | element is not usable`);
	assert(isPlainObject(classChanges), `${MODULE_NAME}:${__methodName__} | classChanges is not a plain object`);
	assert(isPlainObject(styleChanges), `${MODULE_NAME}:${__methodName__} | styleChanges is not a plain object`);

	const
		deferred = new Deferred(),
		runningTransition = RUNNING_TRANSITIONS.get(element)
	;

	if( hasValue(runningTransition) ){
		countermand(runningTransition.timer);
		if( !rejectOnInterruption ){
			runningTransition.deferred.resolve(element);
		} else {
			const error = new Error('interrupted');
			error.element = element;
			runningTransition.deferred.reject(error);
		}
	}
	RUNNING_TRANSITIONS.delete(element);

	const
		transitionDurationProperties = [
			'transition-duration',
			'-webkit-transition-duration',
			'-moz-transition-duration',
			'-o-transition-duration'
		],
		transitionProperties = [
			'transition',
			'-webkit-transition',
			'-moz-transition',
			'-o-transition'
		],
		timingProperties = [
			...transitionDurationProperties,
			...transitionProperties
		],
		transitionDefinition = {
			property : null,
			value : null
		}
	;

	if( !isEmpty(styleChanges) ){
		let vendorPropertiesAdded;
		[transitionDurationProperties, transitionProperties].forEach(properties => {
			vendorPropertiesAdded = false;
			properties.forEach(property => {
				const transitionValue = styleChanges[property];
				if( !vendorPropertiesAdded && hasValue(transitionValue) ){
					vendorPropertiesAdded = true;
					properties.forEach(property => {
						styleChanges[property] = transitionValue;
					});
				}
			});
		});

		applyStyles(element, styleChanges);
	}

	if( !isEmpty(classChanges?.remove) ){
		[].concat(classChanges.remove).forEach(removeClass => {
			`${removeClass}`.split(' ').forEach(removeClass => {
				element.classList.remove(removeClass.trim());
			});
		});
	}

	if( !isEmpty(classChanges?.add) ){
		[].concat(classChanges.add).forEach(addClass => {
			`${addClass}`.split(' ').forEach(addClass => {
				element.classList.add(addClass.trim());
			});
		});
	}

	waitForRepaint(() => {
		const elementStyles = getComputedStyle(element);
		timingProperties.forEach(timingProperty => {
			if( !hasValue(transitionDefinition.value) && hasValue(elementStyles[timingProperty]) ){
				transitionDefinition.property = timingProperty;
				transitionDefinition.value = elementStyles[timingProperty];
			}
		});

		if( !hasValue(transitionDefinition.value) ){
			warn(`${MODULE_NAME}:${__methodName__} | no usable transitions on element "${element}"`);
			deferred.resolve(element);
		} else {
			const
				sTimings = transitionDefinition.value.match(/(^|\s)(\d+(\.\d+)?)s(\s|,|$)/g),
				msTimings = transitionDefinition.value.match(/(^|\s)(\d+)ms(\s|,|$)/g)
			;
			let	longestTiming = 0;

			(sTimings ?? []).forEach(timing => {
				timing = parseFloat(timing);

				if( !isNaN(timing) ){
					timing = Math.floor(timing * 1000);

					if( timing > longestTiming ){
						longestTiming = timing;
					}
				}
			});

			(msTimings ?? []).forEach(timing => {
				timing = parseInt(timing, 10);

				if( !isNaN(timing) && (timing > longestTiming) ){
					longestTiming = timing;
				}
			});

			RUNNING_TRANSITIONS.set(element, {
				deferred,
				timer : pschedule(longestTiming, () => {
					waitForRepaint(() => {
						deferred.resolve(element);
						RUNNING_TRANSITIONS.delete(element);
					});
				})
			});
		}
	});

	return deferred;
}
