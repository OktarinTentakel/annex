/*!
 * Module Viewport
 */

/**
 * @namespace Viewport
 */

const MODULE_NAME = 'Viewport';



//###[ IMPORTS ]########################################################################################################

import {
	hasValue,
	orDefault,
	isWindow,
	isFunction,
	isElement,
	isBoolean,
	isNumber,
	Deferred,
	Observable,
	assert,
	min,
	minMax,
	round
} from './basic.js';
import {isInDom} from './elements.js';
import {EasingFunctions} from './animation.js';
import {requestAnimationFrame, cancelAnimationFrame} from './timers.js';
import {throttle, defer} from './functions.js';
import {warn} from './logging.js';



//###[ DATA ]###########################################################################################################

export const VISIBILITY_BASE_FPS = 15;
const DISTANCE_BASE_FPS = 4;



//###[ HELPERS ]########################################################################################################

/**
 * Returns the boundingClientRect of an HTML element. Falls back to zero-valued default rect if retrieval fails
 * (as in IE11 with an element, which is not in the DOM).
 *
 * @param {HTMLElement} element - the element of which we want to retrieve the bounding client rect
 * @returns {DOMRect} the element's bounding client rect
 *
 * @private
 */
function getBoundingClientRect(element){
	let boundingClientRect;
	try {
		boundingClientRect = element.getBoundingClientRect();
	} catch(ex){
		boundingClientRect = !!window.DOMRect ?
			new DOMRect(0, 0, 0, 0)
			: {top : 0, right : 0, bottom : 0, left : 0, width : 0, height : 0}
		;
	}

	return boundingClientRect;
}



/**
 * A very simple polling-based implementation of the IntersectionObserver interface to replace a missing native
 * implementation for the VisibilityObserver. This is _not_ a polyfill, and it lacks a lot of implementation depth,
 * since it is tailored towards interoperability with VisibilityObserver.
 *
 * At its core, this implementation replaces real intersection events with stupid, brute-force, throttled polling
 * of all observed element's bounding boxes in respect to the viewport box.
 *
 * Be aware, that this is a very CPU/GPU intensive way of doing things and that using an IntersectionObserver is much
 * preferred. Only use this, if you have to support browsers like IE11 and you cannot leave out scroll animations there.
 * Also try to keep the number of observed elements to a minimum in that cases.
 *
 * @protected
 * @memberof Viewport
 * @name SimplePollingObserver
 * @example
 * new SimplePollingObserver(entries => { ... , {targetFps : 60}});
 */
class SimplePollingObserver {

	#__className__ = 'SimplePollingObserver';
	#handler;
	#elements;
	#targetFps;
	#pollTimer;

	/**
	 * Creates a new SimplePollingObserver, and starts observation.
	 *
	 * @param {Function} handler - the intersection handler function, that works with given entries
	 * @param {Object} options - in IntersectionObserver, this would hold the threshold(s), which we do not need here, but, optionally, you may define the targetFps here, to define polling precision in detail
	 */
	constructor(handler, options){
		this.#handler = handler;
		this.#elements = new Set();
		this.#targetFps = options?.targetFps ?? VISIBILITY_BASE_FPS;

		this.connect();
	}



	/**
	 * Starts polling elements and calls the intersection handler periodically with newly created entries.
	 *
	 * @returns {SimplePollingObserver} the observer instance
	 *
	 * @example
	 * simplePollingObserver.connect();
	 */
	connect(){
		this.disconnect();

		const
			fpsMs = round(1000 / this.#targetFps),
			throttledUpdate = throttle(fpsMs, () => {
				this.#handler(Array.from(this.#elements).map(element => {
					const
						boundingClientRect = getBoundingClientRect(element),
						viewportWidth = window.innerWidth,
						viewportHeight = window.innerHeight,
						upperCut = (boundingClientRect.top < 0) ? Math.abs(boundingClientRect.top) : 0,
						lowerCut = ((boundingClientRect.top + boundingClientRect.height) > viewportHeight)
							? (boundingClientRect.top + boundingClientRect.height) - viewportHeight
							: 0
						,
						visiblePixels = minMax(
							0,
							boundingClientRect.height - upperCut - lowerCut,
							round(boundingClientRect.height)
						),
						entry = {
							target : element,
							rootBounds : isInDom(element) ? {
								top : 0,
								right : viewportWidth,
								bottom : viewportHeight,
								left : 0,
								width : viewportWidth,
								height : viewportHeight
							} : null,
							boundingClientRect : boundingClientRect,
							intersectionRect : {
								height : visiblePixels
							}
						}
					;

					entry.intersectionRatio = visiblePixels / entry.boundingClientRect.height;

					return entry;
				}));
			}).bind(this),
			step = () => {
				throttledUpdate();
				this.#pollTimer = requestAnimationFrame(step);
			}
		;

		this.#pollTimer = requestAnimationFrame(step);

		return this;
	}



	/**
	 * Stops polling and removes all observed elements from the observer.
	 *
	 * @returns {SimplePollingObserver} the observer instance
	 *
	 * @example
	 * simplePollingObserver.disconnect();
	 */
	disconnect(){
		cancelAnimationFrame(this.#pollTimer);
		this.#pollTimer = null;
		this.#elements.clear();

		return this;
	}



	/**
	 * Adds the element to the set of observed elements, for which entries are created, that are, in-term,
	 * given to the intersection handler.
	 *
	 * @param {HTMLElement} element - the element to observe
	 * @returns {SimplePollingObserver} the observer instance
	 *
	 * @example
	 * simplePollingObserver.observe(teaserElement);
	 */
	observe(element){
		this.#elements.add(element);

		return this;
	}



	/**
	 * Removes the element from the set of observed elements.
	 *
	 * @param {HTMLElement} element - the element to unobserve
	 * @returns {SimplePollingObserver} the observer instance
	 *
	 * @example
	 * simplePollingObserver.unobserve(teaserElement);
	 */
	unobserve(element){
		this.#elements.delete(element);

		return this;
	}

}



/**
 * A class to manage the visibility of an element in respect to the viewport.
 * A VisibilityState contains information such as if the element is currently (fully) inside the viewport and if so,
 * how many pixels are currently visible. There's a whole bunch of information to be found here, that aims to allow
 * for flexible usage in scenarios that require visibility-based effects.
 *
 * @protected
 * @memberof Viewport
 * @name VisibilityState
 * @example
 * (new VisibilityState(teaserElement, true)).visiblePixels(42);
 */
class VisibilityState {

	#__className__ = 'VisibilityState';
	#eventNameSpace = 'visibilitystate';
	#element;
	#inViewport = false;
	#fullyInViewport = false;
	#upperBoundInViewport = false;
	#lowerBoundInViewport = false;
	#visiblePercent = 0;
	#visiblePixels = 0;
	calculateScrolled = false;
	#scrolledPercent = 0;
	#autoScrolledUpdateObservable = null;
	#autoScrolledUpdateSubscription = null;
	calculateDistance = false;
	#distancePixels = Number.POSITIVE_INFINITY;
	#distanceViewports = Number.POSITIVE_INFINITY;
	#autoDistanceUpdateObservable = null;
	#autoDistanceUpdateSubscription = null;
	autoHandleTooLargeElements = true;
	#autoHandleTooLargeUpdatesObservable = null;
	#autoHandleTooLargeUpdatesSubscription = null;
	#deferredChange = null;

	/**
	 * Creates a new VisibilityState object.
	 *
	 * @param {HTMLElement} element - the element being described by this state
	 * @param {?Boolean} [calculateScrolled=false] -  defines if the state should have scroll information, not available by default due to performance impact (such as scrolledPercent); scrolled information covers the question of how far the element has been scrolled through the viewport starting with the first pixel entering and ending with the last pixel leaving
	 * @param {?Boolean} [calculateDistance=false] - defines if the state should have distance information, not available by default due to performance impact (such as distanceViewports); distance information covers the question of how far away an element currently is from the viewport
	 * @param {?Boolean} [autoHandleTooLargeElements=true] - defines if element, which are larger/higher than the viewport, should be automatically handled, by adding additional means to update values without an interception taking place, because no edge is inside the viewport; this has a performance impact, but beware that setting this to false, will stop updates if no edge is inside the viewport
	 */
	constructor(element, calculateScrolled=false, calculateDistance=false, autoHandleTooLargeElements=true){
		this.#element = element;
		this.calculateScrolled = !!calculateScrolled;
		this.calculateDistance = !!calculateDistance;
		this.autoHandleTooLargeElements = !!autoHandleTooLargeElements;
	}



	/**
	 * Gets/sets information about the element currently being in the viewport or not.
	 *
	 * @param {?Boolean} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"enteredviewport.visibilitystate"
	 * @fires CustomEvent#"leftviewport.visibilitystate"
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Boolean} true if element is currently in the viewport by any degree
	 *
	 * @example
	 * state.inViewport()
	 * => true/false
	 * state.inViewport(true)
	 * => true
	 */
	inViewport(value=null){
		if( hasValue(value) ){
			const oldValue = this.#inViewport;
			this.#inViewport = !!value;
			this.#triggerUpdateEvents(
				oldValue, this.#inViewport,
				'enteredviewport', 'leftviewport'
			);
		}

		return this.#inViewport;
	}



	/**
	 * Gets/sets information about the element currently being _fully_ in the viewport or not.
	 *
	 * @param {?Boolean} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"fullyenteredviewport.visibilitystate"
	 * @fires CustomEvent#"fullyleftviewport.visibilitystate"
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Boolean} true if element is currently in the viewport completely
	 *
	 * @example
	 * state.fullyInViewport()
	 * => true/false
	 * state.fullyInViewport(true)
	 * => true
	 */
	fullyInViewport(value=null){
		if( hasValue(value) ){
			const oldValue = this.#fullyInViewport;
			this.#fullyInViewport = !!value;
			this.#triggerUpdateEvents(
				oldValue, this.#fullyInViewport,
				'fullyenteredviewport', 'fullyleftviewport'
			);
		}

		return this.#fullyInViewport;
	}



	/**
	 * Gets/sets information about the element's upper bound currently being in the viewport or not.
	 *
	 * @param {?Boolean} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"upperboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"upperboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Boolean} true if element's upper bound is currently in the viewport
	 *
	 * @example
	 * state.upperBoundInViewport()
	 * => true/false
	 * state.upperBoundInViewport(true)
	 * => true
	 */
	upperBoundInViewport(value=null){
		if( hasValue(value) ){
			const oldValue = this.#upperBoundInViewport;
			this.#upperBoundInViewport = !!value;
			this.#triggerUpdateEvents(
				oldValue, this.#upperBoundInViewport,
				'upperboundenteredviewport', 'upperboundleftviewport'
			);
		}

		return this.#upperBoundInViewport;
	}



	/**
	 * Gets/sets information about the element's lower bound currently being in the viewport or not.
	 *
	 * @param {?Boolean} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"lowerboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"lowerboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Boolean} true if element's lower bound is currently in the viewport
	 *
	 * @example
	 * state.lowerBoundInViewport()
	 * => true/false
	 * state.lowerBoundInViewport(true)
	 * => true
	 */
	lowerBoundInViewport(value=null){
		if( hasValue(value) ){
			const oldValue = this.#lowerBoundInViewport;
			this.#lowerBoundInViewport = !!value;
			this.#triggerUpdateEvents(
				oldValue, this.#lowerBoundInViewport,
				'lowerboundenteredviewport', 'lowerboundleftviewport'
			);
		}

		return this.#lowerBoundInViewport;
	}



	/**
	 * Gets/sets information about the percentage of the element currently being inside the viewport.
	 *
	 * @param {?Number} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"visiblepercent.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Number} the visible percentage between 0.00 and 100.00
	 *
	 * @example
	 * state.visiblePercent()
	 * => 0.00 ... 100.00
	 * state.visiblePercent(66.6)
	 * => 66.6
	 */
	visiblePercent(value=null){
		if( hasValue(value) ){
			const oldValue = this.#visiblePercent;
			this.#visiblePercent = minMax(0, round(parseFloat(value), 2), 100);
			this.#triggerUpdateEvents(
				oldValue, this.#visiblePercent,
				'visiblepercent'
			);
		}

		return this.#visiblePercent;
	}



	/**
	 * Gets/sets information about the number of vertical pixels of the element currently being inside the viewport.
	 *
	 * @param {?Number} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"visiblepixels.visibilitystate" - {detail : pixelNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Number} the visible pixels between 0 and element height
	 *
	 * @example
	 * state.visiblePixels()
	 * => 0 ... element height
	 * state.visiblePixels(66)
	 * => 66
	 */
	visiblePixels(value=null){
		if( hasValue(value) ){
			const oldValue = this.#visiblePixels;
			this.#visiblePixels = minMax(0, round(parseFloat(value)), round(this.#element.scrollHeight));
			this.#triggerUpdateEvents(
				oldValue, this.#visiblePixels,
				'visiblepixels'
			);
		}

		return this.#visiblePixels;
	}



	/**
	 * Gets/sets information about the percentage the element has already been scrolled through the entirety of the
	 * viewport, starting with the first pixel entering from below and ending with the last pixel leaving at the top.
	 *
	 * @param {?Number} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"scrolledpercent.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Number} the percentage scrolled between 0.00 and 100.00
	 *
	 * @example
	 * state.scrolledPercent()
	 * => 0.00 ... 100.00
	 * state.scrolledPercent(66.6)
	 * => 66.6
	 */
	scrolledPercent(value=null){
		if( hasValue(value) ){
			const oldValue = this.#scrolledPercent;
			this.#scrolledPercent = minMax(0, round(parseFloat(value), 2), 100);
			this.#triggerUpdateEvents(
				oldValue, this.#scrolledPercent,
				'scrolledpercent'
			);
		}

		return this.#scrolledPercent;
	}



	/**
	 * Gets/sets information about the pixel distance of the element from the viewport, describing how long we still
	 * need to scroll, until the first pixel hits the viewport bounds. This value may also be negative, if so, it
	 * indicates distance from the top.
	 *
	 * @param {?Number} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"distancepixels.visibilitystate" - {detail : pixelNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Number} the amount of pixels to scroll until the element hits the viewport bounds
	 *
	 * @example
	 * state.distancePixels()
	 * => -document height ... document height
	 * state.distancePixels(66)
	 * => 66
	 */
	distancePixels(value=null){
		if( hasValue(value) ){
			const oldValue = this.#distancePixels;
			this.#distancePixels = round(parseFloat(value));
			this.#triggerUpdateEvents(
				oldValue, this.#distancePixels,
				'distancepixels'
			);
		}

		return this.#distancePixels;
	}



	/**
	 * Gets/sets information about the distance of the element from the viewport, measured in viewport heights as a
	 * floating point number, describing how long we still need to scroll, until the first pixel hits the viewport
	 * bounds. This value may also be negative, if so, it indicates distance from the top.
	 *
	 * @param {?Number} [value=null] - the value to set, if left out or nullish, the method will just return the current value
	 * @fires CustomEvent#"distanceviewports.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {Number} the amount of viewports to scroll until the element hits the viewport bounds
	 *
	 * @example
	 * state.distanceViewports()
	 * => -document height in viewports ... document height in viewports
	 * state.distanceViewports(6.6)
	 * => 6.6
	 */
	distanceViewports(value=null){
		if( hasValue(value) ){
			const oldValue = this.#distanceViewports;
			this.#distanceViewports = round(parseFloat(value), 2);
			this.#triggerUpdateEvents(
				oldValue, this.#distanceViewports,
				'distanceviewports'
			);
		}

		return this.#distanceViewports;
	}



	/**
	 * Starts the measurement of scrolledPercent for an element, which cannot be measured by just evaluating
	 * interceptions (since we do not have any, if element is not intersecting a viewport edge).
	 *
	 * This is a feature, that should specifically be activated, since it is a CPU-intensive operation and should
	 * only be used for elements, that really need this information.
	 *
	 * The range during which this updates should take place is: as long as the element is fully inside the viewport.
	 *
	 * @param {Basic.Observable} viewportHashObservable - observable, which changes on any change to the viewport, indicating that a new calculation is necessary
	 * @param {Number} [targetFps=VISIBILITY_BASE_FPS] - the target amount of frames per second we are aiming for with these updates
	 * @param {Boolean} [precisionUpdate=true] - since this operation is running a high-precision update to scrolledPercent anyway, we can also update the other properties as well, using the timer precision here, this is especially helpful for effects with positioning, that need razor-sharp in-sync information; set to false to save a few cpu-cycles
	 * @fires CustomEvent#"scrolledpercent.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"upperboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"upperboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"lowerboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"lowerboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"visiblepixels.visibilitystate" - {detail : pixelNumber}
	 * @fires CustomEvent#"visiblepercent.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {VisibilityState} the current state
	 *
	 * @see Basic.Observable
	 * @example
	 * state.startAutoScrolledPercentUpdates(new Observable('hash'), 30);
	 */
	startAutoScrolledPercentUpdates(viewportHashObservable, targetFps=VISIBILITY_BASE_FPS, precisionUpdate=true){
		if( this.calculateScrolled && !hasValue(this.#autoScrolledUpdateObservable) ){
			this.#autoScrolledUpdateObservable = viewportHashObservable;
			const fpsMs = round(1000 / targetFps);
			this.#autoScrolledUpdateSubscription = this.#autoScrolledUpdateObservable.subscribe(throttle(fpsMs, () => {
				const
					boundingClientRect = getBoundingClientRect(this.#element),
					viewportHeight = window.innerHeight
				;

				this.scrolledPercent(
					(boundingClientRect.top - viewportHeight)
					/ (-boundingClientRect.height - viewportHeight) * 100
				);

				if( precisionUpdate ){
					this.#calculatePreciseUpdate();
				}
			}));
		}

		return this;
	}



	/**
	 * Stops the measurement of scrolledPercent for an element.
	 *
	 * @returns {VisibilityState} the current state
	 *
	 * @example
	 * state.stopAutoScrolledPercentUpdates();
	 */
	stopAutoScrolledPercentUpdates(){
		if( hasValue(this.#autoScrolledUpdateObservable) ){
			this.#autoScrolledUpdateObservable.unsubscribe(this.#autoScrolledUpdateSubscription);
		}

		this.#autoScrolledUpdateSubscription = null;
		this.#autoScrolledUpdateObservable = null;

		return this;
	}



	/**
	 * Starts the measurement of pixel and viewport distance for an element, which cannot be measured by just evaluating
	 * interceptions (since we do not have any, if element is not intersecting a viewport edge, while off-screen).
	 *
	 * This is a feature, that should specifically be activated, since it is a CPU-intensive operation and should
	 * only be used for elements, that really need this information.
	 *
	 * The range during which this updates should take place is: as long as the element is completely outside of the
	 * viewport.
	 *
	 * @param {Basic.Observable} viewportHashObservable - observable, which changes on any change to the viewport, indicating that a new calculation is necessary
	 * @param {Number} [targetFps=VISIBILITY_BASE_FPS] - the target amount of frames per second we are aiming for with these updates
	 * @fires CustomEvent#"distancepixels.visibilitystate" - {detail : pixelNumber}
	 * @fires CustomEvent#"distancepercent.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {VisibilityState} the current state
	 *
	 * @see Basic.Observable
	 * @example
	 * state.startAutoDistanceUpdates(new Observable('hash'), 30);
	 */
	startAutoDistanceUpdates(viewportHashObservable, targetFps=VISIBILITY_BASE_FPS){
		if( this.calculateDistance && !hasValue(this.#autoDistanceUpdateObservable) ){
			this.#autoDistanceUpdateObservable = viewportHashObservable;
			const fpsMs = round(1000 / targetFps);
			this.#autoDistanceUpdateSubscription = this.#autoDistanceUpdateObservable.subscribe(throttle(fpsMs, () => {
				const
					boundingClientRect = getBoundingClientRect(this.#element),
					viewportHeight = window.innerHeight,
					distancePxToTop = boundingClientRect.top - viewportHeight,
					distancePxToBottom = boundingClientRect.bottom,
					distancePx = (Math.abs(distancePxToTop) < Math.abs(distancePxToBottom))
						? distancePxToTop
						: distancePxToBottom
				;

				this.distancePixels(distancePx);
				this.distanceViewports(distancePx / viewportHeight);
			}));
		}

		return this;
	}



	/**
	 * Stops the measurement of pixel and viewport distance for an element.
	 *
	 * @returns {VisibilityState} the current state
	 *
	 * @example
	 * state.stopAutoDistanceUpdates();
	 */
	stopAutoDistanceUpdates(){
		if( hasValue(this.#autoDistanceUpdateObservable) ){
			this.#autoDistanceUpdateObservable.unsubscribe(this.#autoDistanceUpdateSubscription);
		}

		this.#autoDistanceUpdateSubscription = null;
		this.#autoDistanceUpdateObservable = null;

		return this;
	}



	/**
	 * Starts the measurement of properties for an element larger than the viewport itself, which are not measured,
	 * if no intersection is taking place at the moment, because both element bounds are outside the viewport.
	 * The is especially necessary, because very large elements also tend to need enormous amounts of thresholds to
	 * precisely update values, which, at the end, quickly gets worse, then using a poll in that case. So, using this
	 * feature keeps values precise and lets you define a reasonable granularity for all elements, no matter the size.
	 *
	 * This is a feature, that should specifically be activated, since it is a CPU-intensive operation and should
	 * only be used for elements, that really need this information.
	 *
	 * The range during which this updates should take place is: the element is larger than the viewport height and
	 * it is currently inside the viewport by any degree.
	 *
	 * @param {Basic.Observable} viewportHashObservable - observable, which changes on any change to the viewport, indicating that a new calculation is necessary
	 * @param {Number} [targetFps=VISIBILITY_BASE_FPS] - the target amount of frames per second we are aiming for with these updates
	 * @fires CustomEvent#"upperboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"upperboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"lowerboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"lowerboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"visiblepixels.visibilitystate" - {detail : pixelNumber}
	 * @fires CustomEvent#"visiblepercent.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {VisibilityState} the current state
	 *
	 * @see Basic.Observable
	 * @example
	 * state.startAutoTooLargeUpdates(new Observable('hash'), 30);
	 */
	startAutoTooLargeUpdates(viewportHashObservable, targetFps=VISIBILITY_BASE_FPS){
		if( this.autoHandleTooLargeElements && !hasValue(this.#autoHandleTooLargeUpdatesObservable) ){
			this.#autoHandleTooLargeUpdatesObservable = viewportHashObservable;
			const fpsMs = round(1000 / targetFps);
			this.#autoHandleTooLargeUpdatesSubscription = this.#autoHandleTooLargeUpdatesObservable.subscribe(throttle(fpsMs, () => {
				this.#calculatePreciseUpdate();
			}));
		}

		return this;
	}



	/**
	 * Stops the measurement of properties for an element larger than the viewport itself, which are not measured,
	 * if no intersection is taking place at the moment, because both element bounds are outside the viewport.
	 *
	 * @returns {VisibilityState} the current state
	 *
	 * @example
	 * state.stopAutoTooLargeUpdates();
	 */
	stopAutoTooLargeUpdates(){
		if( hasValue(this.#autoHandleTooLargeUpdatesObservable) ){
			this.#autoHandleTooLargeUpdatesObservable.unsubscribe(this.#autoHandleTooLargeUpdatesSubscription);
		}

		this.#autoHandleTooLargeUpdatesSubscription = null;
		this.#autoHandleTooLargeUpdatesObservable = null;

		return this;
	}



	/**
	 * Returns a JSON snapshot of the element's current visibility state.
	 *
	 * @returns {Object} with active, inViewport, fullyInViewport, upperBoundInViewport, lowerBoundInViewport, visiblePercent, visiblePixels and (optionally) scrolledPercent, distancePixels and distanceViewports
	 *
	 * @example
	 * state.toJson()
	 * => {
	 *     active : true,
	 *     inViewport : true,
	 *     fullyInViewport : false,
	 *     upperBoundInViewport : true,
	 *     lowerBoundInViewport : false,
	 *     visiblePercent : 10.11,
	 *     visiblePixels : 42
	 * }
	 */
	toJson(){
		const info = {
			inViewport : this.inViewport(),
			fullyInViewport : this.fullyInViewport(),
			upperBoundInViewport : this.upperBoundInViewport(),
			lowerBoundInViewport : this.lowerBoundInViewport(),
			visiblePercent : this.visiblePercent(),
			visiblePixels : this.visiblePixels(),
		};

		if( this.calculateScrolled ){
			info.scrolledPercent = this.scrolledPercent()
		}

		if( this.calculateDistance ){
			info.distancePixels = this.distancePixels();
			info.distanceViewports = this.distanceViewports();
		}

		return info;
	}



	/**
	 * Triggers a named custom event of the state's element.
	 * The primary reason for doing this, is to notify the DOM about visibility changes, that happened on the element.
	 *
	 * This method always constructs an eventname with a namespace attached after the event name, separated by a dot.
	 * So, "eventname.visibilitystate" for example.
	 *
	 * @param {String} eventName - the name of the event
	 * @param {?*} [payload=null] - payload to attach to the event's "detail" property
	 * @fires CustomEvent#"eventName.visibilitystate"
	 * @returns {VisibilityState} the current state
	 *
	 * @private
	 * @example
	 * this.#triggerEvent('foobar', {foo : 'bar'})
	 * => CustomEvent('foobar.visibilitystate', {detail : {foo : 'bar'}})
	 */
	#triggerEvent(eventName, payload=null){
		this.#element.dispatchEvent(new CustomEvent(
			`${eventName}.${this.#eventNameSpace}`,
			{detail : payload ?? {}}
		));

		return this;
	}



	/**
	 * Triggers a general change event, notifying the dom about the fact, that something/anything has changed on
	 * the element's visibility state.
	 *
	 * This event is triggered in a deferred way and not strictly synchronous to gather change events of several
	 * changes in one event at the end of the change chain, the idea being, that changing five props only results in
	 * one deferred change event. This means, that code, that relies on being executed synchronously at the exact moment
	 * the change occurs, should use the precise property event instead.
	 *
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {VisibilityState} the current state
	 *
	 * @private
	 * @example
	 * this.#triggerChanged()
	 * => CustomEvent('changed.visibilitystate')
	 */
	#triggerChanged(){
		if( !hasValue(this.#deferredChange) ){
			this.#deferredChange = defer(() => {
				this.#deferredChange = null;
				this.#triggerEvent('changed');
			});
			this.#deferredChange();
		}

		return this;
	}



	/**
	 * Triggers standardized update events for a property change.
	 * Boolean values get specific enter and leave events, since they signify something starting and ending, while
	 * numbers get a general change event.
	 *
	 * @param {Boolean|Number} oldValue - the old value, before the change
	 * @param {Boolean|Number} newValue - the new value, after the change
	 * @param {String} enterEventName - the event name for something starting/becoming true or the event name for number changes
	 * @param {String} leaveEventName - the event name for something ending/becoming false; optional for number values
	 * @fires CustomEvent#"enterOrLeaveEventname.visibilitystate"
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {VisibilityState} the current state
	 *
	 * @private
	 * @example
	 * this.#triggerUpdateEvents(42, 66.6, 'propertyupdated');
	 * this.#triggerUpdateEvents(true, false, 'somethingappeared', 'somethingdisappeared');
	 */
	#triggerUpdateEvents(oldValue, newValue, enterEventName, leaveEventName){
		if( hasValue(newValue) ){
			if( isBoolean(newValue) ){
				if( newValue && !oldValue ){
					this.#triggerEvent(enterEventName);
					this.#triggerChanged();
				} else if( !newValue && oldValue ){
					this.#triggerEvent(leaveEventName);
					this.#triggerChanged();
				}
			} else if( isNumber(newValue) ){
				if( newValue !== oldValue ){
					this.#triggerEvent(enterEventName ?? leaveEventName, newValue);
					this.#triggerChanged();
				}
			}
		}

		return this;
	}



	/**
	 * Calculates properties on-the-fly, which might not get updated precisely in certain scenarios, such as with
	 * elements larger than the viewport itself.
	 *
	 * @fires CustomEvent#"upperboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"upperboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"lowerboundenteredviewport.visibilitystate"
	 * @fires CustomEvent#"lowerboundleftviewport.visibilitystate"
	 * @fires CustomEvent#"visiblepixels.visibilitystate" - {detail : pixelNumber}
	 * @fires CustomEvent#"visiblepercent.visibilitystate" - {detail : percentNumber}
	 * @fires CustomEvent#"changed.visibilitystate"
	 * @returns {VisibilityState} the current state
	 *
	 * @private
	 * @example
	 * this.#calculatePreciseUpdate()
	 */
	#calculatePreciseUpdate(){
		const
			boundingClientRect = getBoundingClientRect(this.#element),
			viewportHeight = window.innerHeight,
			upperCut = (boundingClientRect.top < 0) ? Math.abs(boundingClientRect.top) : 0,
			lowerCut = ((boundingClientRect.top + boundingClientRect.height) > viewportHeight)
				? (boundingClientRect.top + boundingClientRect.height) - viewportHeight
				: 0
		;

		this.upperBoundInViewport(
			(boundingClientRect.top >= 0)
			&& (boundingClientRect.top <= viewportHeight)
		);

		this.lowerBoundInViewport(
			(boundingClientRect.bottom >= 0)
			&& (boundingClientRect.bottom <= viewportHeight)
		);

		this.visiblePixels(boundingClientRect.height - upperCut - lowerCut);

		this.visiblePercent((this.visiblePixels() / boundingClientRect.height) * 100);

		return this;
	}

}



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Viewport:isInViewport
 */

/**
 * Returns if the current element is visible in the window's viewport at the moment.
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

	if( !isInDom(element) ) return false;

	const
		bb = element.getBoundingClientRect(),
		viewportWidth = window.innerWidth,
		viewportHeight = window.innerHeight
	;

	let viewportBounds;
	if( mustBeFullyInside ){
		viewportBounds = {
			top: 0,
			right : viewportWidth,
			bottom : viewportHeight,
			left : 0
		};
	} else {
		viewportBounds = {
			top : -(bb.bottom - bb.top) + 1,
			right : (viewportWidth + (bb.right - bb.left)) + 1,
			bottom : (viewportHeight + (bb.bottom - bb.top)) + 1,
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
 * @param {HTMLElement|Window} element - the element to scroll to or the window to scroll within
 * @param {?Number} [durationMs=1000] - duration of the scrolling animation
 * @param {?Number} [offset=0] - offset from the viewport center to apply to the end position
 * @param {?String} [easing='easeInOutCubic'] - easing function to use, can be any of Animation.EasingFunctions
 * @param {?Boolean} [scrollEvenIfFullyInViewport=false] - if true, forces method to always scroll no matter the element's position
 * @param {?Boolean} [cancelOnUserScroll=false] - if true, scrolling animation will immediately be canceled on manual user scroll, return value will not resolve in that case
 * @throws error if element is not usable or if durationMs is <= 0
 * @returns {Basic.Deferred} resolves when scroll complete, rejects if scroll fails or is cancelled
 *
 * @memberof Viewport:scrollTo
 * @alias scrollTo
 * @see EasingFunctions
 * @example
 * document.querySelector('a.jumpitem').addEventListener('click', function(){ scrollTo(document.querySelector('.jumptarget'), function(){ alert('scrolled!'); }, 500, -100, true); });
 * scrollTo(document.querySelector('.jumptarget'), function(){ alert('Not triggered if user uses mousewheel.'); }, 5000, -0, false, true);
 * scrollTo(window, null, 500, 0, false, true);
 */
export function scrollTo(
	element,
	durationMs=1000,
	offset=0,
	easing='easeInOutCubic',
	scrollEvenIfFullyInViewport=false,
	cancelOnUserScroll=false
){
	durationMs = orDefault(durationMs, 1000, 'int');
	offset = orDefault(offset, 0, 'int');
	easing = orDefault(easing, 'easeInOutCubic', 'str');
	scrollEvenIfFullyInViewport = orDefault(scrollEvenIfFullyInViewport, false, 'bool');
	cancelOnUserScroll = orDefault(cancelOnUserScroll, false, 'bool');

	assert(isElement(element) || isWindow(element), `${MODULE_NAME}:scrollTo | element unusable`);
	assert(durationMs > 0, `${MODULE_NAME}:scrollTo | durationMs must be > 0`);

	if( !isFunction(EasingFunctions[easing]) ){
		easing = EasingFunctions.easeInOutCubic;
	} else {
		easing = EasingFunctions[easing];
	}

	const
		res = new Deferred(),
		elementIsWindow = (element.self === element),
		elementInDom = !elementIsWindow && isInDom(element),
		elementInViewport = (elementIsWindow || !elementInDom) ? false : isInViewport(element, true)
	;

	if( (elementInDom || elementIsWindow) && (scrollEvenIfFullyInViewport || !elementInViewport) ){
		let start, targetY, cancelled = false;
		const startY = window.scrollY ?? window.pageYOffset;

		if( elementIsWindow ){
			targetY = offset;
		} else {
			targetY = startY + getBoundingClientRect(element).top - round(window.innerHeight / 2) + offset;
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
				res.reject(new Error('cancelled'));
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



/**
 * @namespace Viewport:VisibilityObserver
 */

/**
 * @typedef ViewportInfo
 * @type Object
 *
 * @property {Number} scrollTop - scroll distance of the window/document in pixels to the upper bound of the viewport
 * @property {Number} width - inner width of the window/viewport
 * @property {Number} height - inner height of the window/viewport
 * @property {Object} bounds - the viewport bound rectangle
 * @property {Number} bounds.top - upper bound of the viewport (typically 0)
 * @property {Number} bounds.right - right edge of the viewport (typically equals width)
 * @property {Number} bounds.bottom - bottom edge of the viewport (typically equals height)
 * @property {Number} bounds.left - left bound of the viewport (typically 0)
 * @property {Number} bounds.width - inner width of the window/viewport
 * @property {Number} bounds.height - inner height of the window/viewport
 *
 * @memberof Viewport
 */

/**
 * A class offering extended visibility information about elements in regard to their positioning to the viewport
 * (bounds). An intersection observer is nice and concise, but if you want to build scroll-based effects or control
 * lazy loading a little bit more in detail, you are out of luck, since the intersection observer does not offer much
 * to help you in these cases.
 *
 * The VisibilityObserver offers tailor-fit information to build visibility-based effects, such as "pixels visible",
 * "percent scrolled" or "distance in viewports". Additionally, the VisibilityObserver handles edge-cases like
 * elements, which are bigger than the viewport itself, which results in intersections not being recognized is bounds
 * are not visible.
 *
 * This class aims to do the heavy lifting using an IntersectionObservers, to keep CPU usage down, but cover the edge
 * cases, if needed, with polling and precise calculations. Features, that are not achievable with intersections alone,
 * are very likely opt-in features.
 *
 * In case there is no native IntersectionObserver available, this implementation falls back to a SimplePollingObserver,
 * which replaces the IntersectionObserver and brute-forces the functionality with CPU-intensive polling. This should
 * be avoided if possible, but guarantees interoperability with older ES5 environments.
 *
 * This class roughly follows the interface defined by things like MutationObserver and IntersectionObserver.
 *
 * See class documentation below for details.
 *
 * @memberof Viewport:VisibilityObserver
 * @name VisibilityObserver
 *
 * @see VisibilityObserver
 * @see VisibilityState
 * @see SimplePollingObserver
 * @example
 * (new VisibilityObserver(100, 30))
 *   .observe(element1, false, true)
 *   .observe(element2, true, true)
 *   .observe(element4, true, true)
 *   .observe(element5)
 *   .unobserve(element5)
 * ;
 * element1.addEventListener(
 *   'visiblepixels.visibilityobserver',
 *   visiblePixels => { console.log(`${visiblePixels} vertical pixels of element1 are visible`); }
 * );
 */
class VisibilityObserver {

	#__className__ = 'VisibilityObserver';
	#eventNameSpace = 'visibilityobserver';
	#htmlElementRequiredMessage = 'html element required';
	#states;
	#started = false;
	#initialized = false;
	#granularity;
	#targetFps;
	#throttledHandleScroll;
	#throttledHandleResize;
	#throttledHandleMutation;
	#throttledHandlePoll;
	#throttledTriggerEvent;
	#thresholds;
	#observer;
	#refreshPoll;
	#documentMutationObserver;
	#viewportInfo;
	#viewportInfoHash;

	/**
	 * Creates a new VisibilityObserver and starts the observation of elements.
	 *
	 * @param {?Number} [granularity=10] - the number of intersection thresholds to use for each element (see IntersectionObserver threshold documentation) -> 2: just the outer bounds - 10: 10% steps - 100: one intersection every visible percent; make sure this number fits you needs and maybe think about using multiple observers with different granularities to cover different use cases
	 * @param {?Number} [targetFps=VISIBILITY_BASE_FPS] - target frames per second to target with polls (be aware, that higher values put more stress on the CPU)
	 * @param {?Boolean} [forcePollingObserver=false] - set this to true, if you want to skip usage of IntersectionObserver and, instead, just use polling all the time (this is a brute-force method putting stress on the CPU, only do this for a good reason)
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
	 */
	constructor(granularity=10, targetFps=VISIBILITY_BASE_FPS, forcePollingObserver=false){
		this.#states = new Map();

		this.connect(granularity, targetFps, forcePollingObserver);
	}



	/**
	 * Starts the observation of observed elements, which produces all visibility-related events.
	 *
	 * Be sure, that the observer is started before using any detail functions (these should be safe-guarded and warn
	 * about the fact, that the observer is not connected).
	 *
	 * @param {?Number} [granularity=10] - the number of intersection thresholds to use for each element (see IntersectionObserver threshold documentation) -> 2: just the outer bounds - 10: 10% steps - 100: one intersection every visible percent; make sure this number fits you needs and maybe think about using multiple observers with different granularities to cover different use cases
	 * @param {?Number} [targetFps=VISIBILITY_BASE_FPS] - target frames per second to target with polls (be aware, that higher values put more stress on the CPU)
	 * @param {?Boolean} [forcePollingObserver=false] - set this to true, if you want to skip usage of IntersectionObserver and, instead, just use polling all the time (this is a brute-force method putting stress on the CPU, only do this for a good reason)
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @example
	 * visibilityObserver.connect(100, 50);
	 */
	connect(granularity=10, targetFps=VISIBILITY_BASE_FPS, forcePollingObserver=false){
		const __methodName__ = 'connect';

		this.disconnect();

		this.#granularity = min(orDefault(granularity, 10, 'int'), 1);
		this.#targetFps = minMax(1, orDefault(targetFps, VISIBILITY_BASE_FPS, 'int'), 120);

		const fpsMs = round(1000 / targetFps);
		this.#throttledHandleScroll = throttle(fpsMs, this.#handleScroll).bind(this);
		this.#throttledHandleResize = throttle(fpsMs, this.#handleResize).bind(this);
		this.#throttledHandleMutation = throttle(fpsMs, this.#handleMutation).bind(this);
		this.#throttledHandlePoll = throttle(fpsMs, this.#handlePoll).bind(this);
		this.#throttledTriggerEvent = throttle(fpsMs, this.#triggerEvent, true, true).bind(this);

		let ObserverImplementation;
		try {
			ObserverImplementation = !forcePollingObserver ? IntersectionObserver : SimplePollingObserver;
		} catch(ex){
			warn(`${MODULE_NAME}:${this.#__className__}.${__methodName__} | IntersectionObserver not available, falling back to SimplePollingObserver`);
			ObserverImplementation = SimplePollingObserver;
		}

		this.#buildThresholds();
		this.#observer = new ObserverImplementation(this.#handleIntersections.bind(this), {
			threshold : this.#thresholds,
			targetFps : this.#targetFps,
		});

		this.#refreshViewportInfo();
		this.#registerEvents();

		this.#started = true;

		return this;
	}



	/**
	 * Stops the observation of observed elements.
	 *
	 * Be sure to use this method before removing a VisibilityObserver to prevent trailing event registrations
	 * and timers.
	 *
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @example
	 * visibilityObserver.disconnect();
	 */
	disconnect(){
		this.#unregisterEvents();
		if( hasValue(this.#observer) ){
			this.#observer.disconnect();
			this.#observer = null;
		}
		this.#states.clear();

		this.#started = false;
		this.#initialized = false;

		return this;
	}



	/**
	 * Adds an element to the set of observed elements.
	 *
	 * @param {HTMLElement} element - the element to observe
	 * @param {?Boolean} [calculateScrolled=false] - defines if the element should be observed in terms of scrolled distance inside the viewport (which is not possible by watching intersections alone), setting this to true adds the property "scrolledPercent" to the visibility state
	 * @param {?Boolean} [calculateDistance=false] - defines if the element should be observed in terms of distance from the viewport (which is not possible by watching intersections alone), setting this to true adds the properties "distancePixels" and "distanceViewports" to the visibility state
	 * @param {?Boolean} [autoHandleTooLargeElements=true] - defines if elements, that are larger than the viewport should automatically be handled differently, to keep property updates consistent, if no element bounds are in the viewport (this is CPU-intensive, but normally something you'll expect, set this to false, if you are sure, that you do not need continuous updates during scrolling)
	 * @throws error if element is not an HTML element
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @example
	 * visibilityObserver.observe(teaserElement);
	 * visibilityObserver.observe(anotherTeaserElement, true, true);
	 */
	observe(element, calculateScrolled=false, calculateDistance=false, autoHandleTooLargeElements=true){
		if( this.#startedSafeguard() ){
			const __methodName__ = 'addElement';

			assert(
				isElement(element),
				`${MODULE_NAME}:${this.#__className__}.${__methodName__} | ${this.#htmlElementRequiredMessage}`
			);

			if( !isInDom(element) ){
				warn(`${MODULE_NAME}:${this.#__className__}.${__methodName__} | element not in DOM`);
			}

			this.#states.set(element, new VisibilityState(
				element,
				calculateScrolled,
				calculateDistance,
				autoHandleTooLargeElements
			));

			this.#observer.observe(element);
		}

		return this;
	}



	/**
	 * Removes an element from the set of observed elements.
	 *
	 * @param {HTMLElement} element - the element to unobserve
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @example
	 * visibilityObserver.unobserve(teaserElement);
	 */
	unobserve(element){
		if( this.#states.has(element) ){
			this.#states.delete(element);
			this.#observer.unobserve(element);
		}

		return this;
	}



	/**
	 * Returns information about the current state of the viewport.
	 *
	 * This includes dimensions as well as scroll state.
	 *
	 * @returns {Viewport.ViewportInfo|null} the current viewport info or null if observer is not running
	 *
	 * @example
	 * visibilityObserver.getViewportInfo().scrollTop;
	 */
	getViewportInfo(){
		if( this.#startedSafeguard() ){
			return this.#viewportInfo;
		}

		return null;
	}



	/**
	 * Returns an Observable, which changes on every update of the viewport.
	 *
	 * Subscribing to this value, allows you to programmatically react to every relevant viewport change.
	 *
	 * @returns {Basic.Observable|null} the observable or null if observer is not running
	 *
	 * @see Basic.Observable
	 * @example
	 * visibilityObserver.getViewportObservable().subscribe(() => { console.log(visibilityObserver.getViewportInfo().scrollTop); });
	 */
	getViewportObservable(){
		if( this.#startedSafeguard() ){
			return this.#viewportInfoHash;
		}

		return null;
	}



	/**
	 * Returns the current visibility state of an element.
	 *
	 * @param {HTMLElement} element - the element of which to retrieve the current visibility state
	 * @returns {VisibilityState|null} the element's visibility state or null if observer is not running
	 *
	 * @example
	 * if( visibilityObserver.getState(teaserElement).inViewport() ){ ... }
	 */
	getState(element){
		if( this.#startedSafeguard() ){
			if( this.#states.has(element) ){
				return this.#states.get(element);
			}
		}

		return null;
	}



	/**
	 * This is a guard method for public instance methods, which makes sure, that the observer is actually running,
	 * automatically producing a warning, if this is not the case.
	 *
	 * @returns {Boolean} true if observer is running
	 *
	 * @private
	 * @example
	 * if( this.#startedSafeguard() ){ ... }
	 */
	#startedSafeguard(){
		if( !this.#started ){
			warn(`${MODULE_NAME}:${this.#__className__}.${__methodName__} | not running, call connect() before`);
			return false;
		}

		return true;
	}



	/**
	 * Builds InterceptionObserver thresholds based on the currently defined granularity, by dividing the range between
	 * 0.0 and 1.0 into n + 1 equally distanced values.
	 *
	 * E.g.: granularity=10 -> 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
	 *
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @private
	 * @example
	 * this.#buildThresholds();
	 */
	#buildThresholds(){
		const thresholds = [];

		for( let i = 0.0; i <= this.#granularity; i++ ){
			thresholds.push(round(i / this.#granularity, 2));
		}

		this.#thresholds = thresholds;

		return this;
	}



	/**
	 * Updates the viewport info object with the latest state, based on width, height and scrollTop.
	 *
	 * @param {?Boolean} [onlyScroll=false] - if true, only scrolling values are updated, which prevents some reflow-relevant calls; this is primarily used to connect "scroll" event to property updates, that might actually change
	 * @fires CustomEvent#"viewportchanged.visibilityobserver"
	 * @returns {Viewport.ViewportInfo} the updated viewport information
	 *
	 * @private
	 * @example
	 * this.#refreshViewportInfo(true);
	 */
	#refreshViewportInfo(onlyScroll=false){
		const
			viewportWidth = window.innerWidth,
			viewportHeight = window.innerHeight
		;

		if( !hasValue(this.#viewportInfo) ){
			this.#viewportInfo = {
				scrollTop : window.scrollY ?? window.pageYOffset,
				width : viewportWidth,
				height : viewportHeight,
				bounds : {
					top : 0,
					right : viewportWidth,
					bottom : viewportHeight,
					left : 0,
					width : viewportWidth,
					height : viewportHeight,
				}
			};
			this.#viewportInfoHash = new Observable(
				`${this.#viewportInfo.scrollTop}${this.#viewportInfo.width}${this.#viewportInfo.height}`
			);
		} else if( !onlyScroll ){
			this.#viewportInfo.scrollTop = window.scrollY ?? window.pageYOffset;
			this.#viewportInfo.width = viewportWidth;
			this.#viewportInfo.height = viewportHeight;
			this.#viewportInfo.bounds.right = viewportWidth;
			this.#viewportInfo.bounds.bottom = viewportHeight;
			this.#viewportInfo.bounds.width = viewportWidth;
			this.#viewportInfo.bounds.height = viewportHeight;
		} else {
			this.#viewportInfo.scrollTop = window.scrollY ?? window.pageYOffset;
		}

		const viewportInfoHash = `${this.#viewportInfo.scrollTop}${this.#viewportInfo.width}${this.#viewportInfo.height}`;
		if( viewportInfoHash !== this.#viewportInfoHash.getValue() ){
			this.#viewportInfoHash.setValue(viewportInfoHash);
			this.#throttledTriggerEvent('viewportchanged', this.#viewportInfo);
		}

		return this.#viewportInfo;
	}



	/**
	 * The event handler for scroll events, updating the viewport information.
	 *
	 * @fires CustomEvent#"viewportchanged.visibilityobserver"
	 *
	 * @private
	 * @example
	 * window.addEventListener('scroll', this.#handleScroll);
	 */
	#handleScroll(){
		this.#refreshViewportInfo(true);
	}



	/**
	 * The event handler for resize events, updating the viewport information.
	 *
	 * @fires CustomEvent#"viewportchanged.visibilityobserver"
	 *
	 * @private
	 * @example
	 * window.addEventListener('resize', this.#handleResize);
	 */
	#handleResize(){
		this.#refreshViewportInfo();
	}



	/**
	 * The event handler for document mutation events, updating the viewport information.
	 *
	 * @fires CustomEvent#"viewportchanged.visibilityobserver"
	 *
	 * @private
	 * @example
	 * new MutationObserver(this.#handleMutation);
	 */
	#handleMutation(){
		this.#refreshViewportInfo();
	}



	/**
	 * The event handler for polling events, updating the viewport information.
	 *
	 * @fires CustomEvent#"viewportchanged.visibilityobserver"
	 *
	 * @private
	 * @example
	 * const pollTimer = window.setInterval(this.#handlePoll, 100);
	 */
	#handlePoll(){
		this.#refreshViewportInfo();
	}



	/**
	 * The event handler for intersection events, updating VisibilityStates of all involved elements.
	 *
	 * This is the primary method for visibility logic, containing compilation, management and updates of
	 * visibility information for all observed elements.
	 *
	 * @param {Array<HTMLElement>} entries - all elements with intersections currently happening
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @private
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
	 * @example
	 * new IntersectionObserver(this.#handleIntersections);
	 */
	#handleIntersections(entries){
		entries.forEach(entry => {
			if( hasValue(entry.rootBounds) ){
				const state = this.#states.get(entry.target);

				state.inViewport(entry.intersectionRatio > 0);
				state.fullyInViewport(entry.intersectionRatio >= 1);

				state.upperBoundInViewport(
					(entry.boundingClientRect.top >= entry.rootBounds.top)
					&& (entry.boundingClientRect.top <= entry.rootBounds.bottom)
				);
				state.lowerBoundInViewport(
					(entry.boundingClientRect.bottom >= entry.rootBounds.top)
					&& (entry.boundingClientRect.bottom <= entry.rootBounds.bottom)
				);

				state.visiblePercent(entry.intersectionRatio * 100);
				state.visiblePixels(entry.intersectionRect.height);

				if( state.calculateScrolled ){
					state.scrolledPercent(
						(entry.boundingClientRect.top - entry.rootBounds.height)
						/ (-entry.boundingClientRect.height - entry.rootBounds.height) * 100
					);

					if( state.fullyInViewport() ){
						state.startAutoScrolledPercentUpdates(this.#viewportInfoHash, this.#targetFps);
					} else {
						state.stopAutoScrolledPercentUpdates();
					}
				}

				if( state.calculateDistance ){
					if( !state.inViewport() ){
						state.startAutoDistanceUpdates(this.#viewportInfoHash, DISTANCE_BASE_FPS);
					} else {
						state.stopAutoDistanceUpdates();
						state.distancePixels(0);
						state.distanceViewports(0);
					}
				}

				if(
					state.autoHandleTooLargeElements
					&& (entry.boundingClientRect.height > entry.rootBounds.height)
				){
					if( state.inViewport() ){
						state.startAutoTooLargeUpdates(this.#viewportInfoHash, this.#targetFps);
						if( state.calculateScrolled ){
							state.startAutoScrolledPercentUpdates(this.#viewportInfoHash, this.#targetFps, false);
						}
					} else {
						state.stopAutoTooLargeUpdates();
						if( state.calculateScrolled ){
							state.stopAutoScrolledPercentUpdates();
						}
					}
				}
			}
		});

		if( !this.#initialized ){
			this.#initialized = true;
			this.#triggerEvent('initialized');
		}

		this.#throttledTriggerEvent('updated');
	}



	/**
	 * Dispatches a custom event on document.body, signifying a global viewport/visibility event or update.
	 *
	 * Every event is automatically namespaced with a dotted postfix.
	 *
	 * @param {String} eventName - the name of the event
	 * @param {?*} [payload=null] -
	 * @fires CustomEvent#"eventName.visibilityobserver"
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @private
	 * @example
	 * this.#triggerEvent('foobar', {foo : 'bar'});
	 */
	#triggerEvent(eventName, payload=null){
		document.body.dispatchEvent(new CustomEvent(
			`${eventName}.${this.#eventNameSpace}`,
			{detail : payload ?? {}}
		));

		return this;
	}



	/**
	 * Sets up all global events, which are necessary to track viewport updates.
	 *
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @private
	 * @example
	 * this.#registerEvents();
	 */
	#registerEvents(){
		window.addEventListener('scroll', this.#throttledHandleScroll);
		window.addEventListener('resize', this.#throttledHandleResize);
		this.#documentMutationObserver = new MutationObserver(this.#throttledHandleMutation);
		this.#documentMutationObserver.observe(document.body, {attributes : true, childList : true, subtree : true});
		const
			fpsMs = round(1000 / this.#targetFps),
			lazyFpsMs = round(fpsMs / 10)
		;
		this.#refreshPoll = window.setInterval(this.#handlePoll.bind(this), lazyFpsMs);

		return this;
	}



	/**
	 * Removes all global events, which are necessary to track viewport updates.
	 *
	 * @returns {VisibilityObserver} the observer instance
	 *
	 * @private
	 * @example
	 * this.#registerEvents();
	 */
	#unregisterEvents(){
		window.clearInterval(this.#refreshPoll);
		window.removeEventListener('scroll', this.#throttledHandleScroll);
		window.removeEventListener('resize', this.#throttledHandleResize);
		if( hasValue(this.#documentMutationObserver) ){
			this.#documentMutationObserver.disconnect();
			this.#documentMutationObserver = null;
		}

		return this;
	}

}

export {VisibilityObserver};
