/*!
 * Module Events
 */

/**
 * @namespace Events
 */

const MODULE_NAME = 'Events';



//###[ IMPORTS ]########################################################################################################

import {
	assert,
	isFunction,
	isString,
	isArray,
	isBoolean,
	isObject,
	isWindow,
	isEventTarget,
	isPlainObject,
	isElement,
	orDefault,
	hasValue,
	isEmpty,
	isSelector
} from './basic.js';
import {slugify, replace} from './strings.js';
import {removeFrom} from './arrays.js';
import {detectInteractionType} from './context.js';
import {warn} from './logging.js';



//###[ DATA ]###########################################################################################################

export const
	EVENT_MAP = new Map(),
	POST_MESSAGE_MAP = new Map()
;

const
	DEFAULT_NAMESPACE = '__default',
	SWIPE_DIRECTIONS = ['up', 'right', 'down', 'left'],
	SWIPE_HANDLERS = new WeakMap(),
	SWIPE_TOUCH = {
		startX : 0,
		startY : 0,
		endX : 0,
		endY : 0
	},
	EVENT_OPTION_SUPPORT = {
		capture : false,
		once : false,
		passive : false,
		signal : false
	}
;

try {
	const options = {
		get capture(){
			EVENT_OPTION_SUPPORT.capture = true;
			return false;
		},
		get once(){
			EVENT_OPTION_SUPPORT.once = true;
			return false;
		},
		get passive(){
			EVENT_OPTION_SUPPORT.passive = true;
			return false;
		},
		get signal(){
			EVENT_OPTION_SUPPORT.signal = true;
			return false;
		},
	};

	window.addEventListener('test', null, options);
	window.removeEventListener('test', null, options);
} catch (err){}



//###[ HELPERS ]########################################################################################################

/*
 * Takes the standard set of event function parameters, sanitizes the values and asserts basic compatability.
 * Returns the transformed parameters as an object, with keys of the same name as the relevant parameters.
 *
 * @private
 */
function prepareEventMethodBaseParams(methodName, targets, events, handler, handlerIsOptional=false){
	targets = orDefault(targets, [], 'arr');
	assert(targets.length > 0, `${MODULE_NAME}:${methodName} | no targets provided`);
	events = orDefault(events, [], 'arr');
	assert(events.length > 0, `${MODULE_NAME}:${methodName} | no events provided`);
	if( !handlerIsOptional || hasValue(handler) ){
		assert(isFunction(handler), `${MODULE_NAME}:${methodName} | handler is not a function`);
	}

	let
		targetsAreEventTargets = true,
		delegatedTargetsAreSelectorsAndHaveAncestor = true
	;

	targets.forEach((target, targetIndex) => {
		if( isString(target) ){
			const ancestor = (targetIndex > 0) ? targets[targetIndex - 1] : null;
			delegatedTargetsAreSelectorsAndHaveAncestor &&= isSelector(target) && isEventTarget(ancestor);
		} else {
			targetsAreEventTargets &&= isEventTarget(target);
		}
	});

	assert(targetsAreEventTargets, `${MODULE_NAME}:${methodName} | not all targets are event targets`);
	assert(
		delegatedTargetsAreSelectorsAndHaveAncestor,
		`${MODULE_NAME}:${methodName} | not all delegated targets are a selector or have an ancestor`
	);

	const normalizedEvents = events
		.map(event => event.replace(`.${DEFAULT_NAMESPACE}`, '.-default-ns'))
		.map(event => replace(event, ['xxyxxx-', '-xxyxx',], ''))
		.map(event => slugify(event, {
			'_' : 'xxyxx-underscore-xxyxx',
			'.' : 'xxyxx-dot-xxyxx',
			'*' : 'xxyxx-star-xxyxx',
			':' : 'xxyxx-colon-xxyxx'
		}))
		.map(event => replace(event, [
			'xxyxx-underscore-xxyxx',
			'xxyxx-dot-xxyxx',
			'xxyxx-star-xxyxx',
			'xxyxx-colon-xxyxx',
		], [
			'_',
			'.',
			'*',
			':'
		]))
		.map(event => event.replace('.-default-ns', `.${DEFAULT_NAMESPACE}`))
	;

	for( const normalizedEventIndex in normalizedEvents ){
		if( normalizedEvents[normalizedEventIndex] !== events[normalizedEventIndex] ){
			warn(`${MODULE_NAME}:${methodName} | invalid event name "${events[normalizedEventIndex]}" has been normalized to "${normalizedEvents[normalizedEventIndex]}", please check event handling`);
		}
	}

	events = normalizedEvents;

	return {targets, events, handler};
}



/*
 * Prepares basic information about the current target in a list of targets.
 * The current target is identified by index, since the same target may appear multiple times in a list,
 * for example as a target and a delegation ancestor.
 *
 * @private
 */
function prepareEventMethodAdditionalTargetInfo(methodName, targets, targetIndex){
	const
		prevTarget =  ((targetIndex - 1) >= 0) ? targets[targetIndex - 1] : null,
		nextTarget =  (targetIndex < (targets.length - 1)) ? targets[targetIndex + 1] : null,
		hasDelegation = isSelector(nextTarget),
		isDelegation = isSelector(targets[targetIndex])
	;

	assert(
		!isDelegation || (isDelegation && isEventTarget(prevTarget)),
		`${MODULE_NAME}:${methodName} | delegation has no ancestor`
	);

	return {prevTarget, nextTarget, hasDelegation, isDelegation};
}



/*
 * Prepares basic information about the current event in a list of events.
 * The current event is identified by a complete eventName string containing the event itself,
 * as well as the complete dot-separated namespace.
 *
 * @private
 */
function prepareEventMethodEventInfo(eventName, defaultNamespace=null, defaultEvent=null){
	const
		eventParts = eventName.replace('.', '/////').split('/////'),
		event = (isEmpty(eventParts[0]) || (eventParts[0] === '*')) ? defaultEvent : eventParts[0],
		namespace = (isEmpty(eventParts[1]) || (eventParts[1] === '*')) ? defaultNamespace : eventParts[1]
	;

	return {event, namespace};
}



/*
 * Gathers matching events with namespaces for a given target (with or without a delegation).
 * Returns the found namespaces and events as a dictionary of namespaces with values of sets containing
 * the corresponding event names.
 *
 * @private
 */
function gatherTargetEvents(target, namespace=null, event=null, delegation=null){
	const __methodName__ = 'gatherTargetEvents';

	const targetEvents = EVENT_MAP.get(target);
	assert(isPlainObject(targetEvents), `${MODULE_NAME}:${__methodName__} | invalid target "${target}"`);

	const gatheredTargetEvents = {};

	if( !hasValue(namespace) && !hasValue(event) ){
		Object.keys(targetEvents).forEach(ns => {
			gatheredTargetEvents[ns] = new Set([]);
			Object.keys(targetEvents[ns]).forEach(ev => {
				if( !hasValue(delegation) || hasValue(targetEvents[ns][ev].delegations[delegation]) ){
					gatheredTargetEvents[ns].add(ev);
				}
			});
		});
	} else if( !hasValue(event) ){
		const nameSpaceScope = targetEvents[namespace];
		if( hasValue(nameSpaceScope) ){
			gatheredTargetEvents[namespace] = new Set([]);
			Object.keys(targetEvents[namespace]).forEach(ev => {
				if( !hasValue(delegation) || hasValue(nameSpaceScope[ev].delegations[delegation]) ){
					gatheredTargetEvents[namespace].add(ev);
				}
			});
		}
	} else if( !hasValue(namespace) ){
		Object.keys(targetEvents).forEach(ns => {
			const nameSpaceScope = targetEvents[ns];
			if(
				hasValue(nameSpaceScope[event])
				&& (!hasValue(delegation) || hasValue(nameSpaceScope[event].delegations[delegation]))
			){
				if( !hasValue(gatheredTargetEvents[ns]) ){
					gatheredTargetEvents[ns] = new Set([]);
				}
				gatheredTargetEvents[ns].add(event);
			}
		});
	} else {
		const nameSpaceScope = targetEvents[namespace];
		if(
			hasValue(nameSpaceScope)
			&& hasValue(nameSpaceScope[event])
			&& (!hasValue(delegation) || hasValue(nameSpaceScope[event].delegations[delegation]))
		){
			if( !hasValue(gatheredTargetEvents[namespace]) ){
				gatheredTargetEvents[namespace] = new Set([]);
			}
			gatheredTargetEvents[namespace].add(event);
		}
	}

	return gatheredTargetEvents;
}



/*
 * Iterates through the event map (starting with a specific target or using all targets) and searches for
 * deserted handler definitions. Deletes definitions that do not contain any handlers anymore and recursively
 * removes the path back to the starting point(s) if it turns out to be empty afterwards.
 *
 * @private
 */
function cleanUpEventMap(targets){
	targets = hasValue(targets) ? new Set([].concat(targets)) : null;

	const desertedTargets = [];

	EVENT_MAP.forEach((targetEvents, target) => {
		if( !hasValue(targets) || targets.has(target) ){
			Object.keys(targetEvents).forEach(targetNamespace => {
				Object.keys(targetEvents[targetNamespace]).forEach(targetEvent => {
					const targetScope = targetEvents[targetNamespace][targetEvent];
					let handlerCount = targetScope.handlers.length;

					Object.keys(targetScope.delegations).forEach(delegation => {
						const delegationHandlerCount = targetScope.delegations[delegation].handlers.length;
						handlerCount += delegationHandlerCount;

						if( delegationHandlerCount === 0 ){
							delete targetScope.delegations[delegation];
						}
					});

					if( handlerCount === 0){
						delete targetEvents[targetNamespace][targetEvent];
					}
				});

				if( Object.keys(targetEvents[targetNamespace]).length === 0 ){
					delete targetEvents[targetNamespace];
				}
			});

			if( Object.keys(targetEvents).length === 0 ){
				desertedTargets.push(target);
			}
		}
	});

	desertedTargets.forEach(desertedTarget => {
		EVENT_MAP.delete(desertedTarget);
	});
}



/*
 * Takes a handler function and returns a new function wrapping the handler, making sure, that the handler only
 * executes, if the event target matches the given delegation selector. So, the returned function automatically
 * checks if the delegation is actually met.
 *
 * @private
 */
function createDelegatedHandler(delegation, handler){
	return function delegatedHandler(e){
		const
			delegationSelector = `${delegation}`,
			delegationFulfilled = hasValue(e.target?.matches)
				? e.target.matches(delegationSelector)
				: (
					isEventTarget(e.syntheticTarget)
					|| (
						isArray(e.syntheticTarget)
						&& isSelector(e.syntheticTarget[1])
					)
					? (
						isEventTarget(e.syntheticTarget)
						? e.syntheticTarget.matches(delegationSelector)
						: (e.syntheticTarget[1] === delegationSelector))
					: null
				)
		;

		if( delegationFulfilled ){
			handler(e);
		}
	};
}



/*
 * Takes a handler function and returns a new function, which, when executed, removes the handler from the exact
 * path in the EVENT_MAP, defined by the given target, namespace and event (and, optionally, a delegation selector).
 * Using this function, one can undo the setting of a handler, using "on" or "once".
 *
 * @private
 */
function createHandlerRemover(target, namespace, event, handler, delegation=null, ignoreInvalidScope=false){
	const
		__methodName__ = 'createHandlerRemover',
		targetEvents = EVENT_MAP.get(target)
	;
	let handlerScope = targetEvents?.[namespace]?.[event];

	if( hasValue(delegation) ){
		assert(isSelector(delegation), `${MODULE_NAME}:${__methodName__} | invalid delegation "${delegation}"`);
		handlerScope = handlerScope.delegations[`${delegation}`];
	}

	if( !ignoreInvalidScope ){
		assert(isPlainObject(handlerScope), `${MODULE_NAME}:${__methodName__} | invalid handlerScope`);
	} else if( !isPlainObject(handlerScope) ){
		return () => {};
	}

	return function handlerRemover(){
		const removedHandlers = handlerScope.handlers.filter(existingHandler => existingHandler.handler === handler);
		handlerScope.handlers = removeFrom(handlerScope.handlers, removedHandlers);

		removedHandlers.forEach(removedHandler => {
			target.removeEventListener(event, removedHandler.action);
		});

		cleanUpEventMap(target);
	};
}



/*
 * Takes a handler function and returns a new function, which, when executed, calls the handler and, afterwards,
 * automatically removes the handler from the path in the EVENT_MAP, defined by the given target, namespace and event
 * (and, optionally, a delegation selector). So, the returned function is essentially a self-destructing handler.
 *
 * @private
 */
function createSelfRemovingHandler(target, namespace, event, handler, delegation=null){
	return function selfRemovingHandler(e){
		handler(e);
		createHandlerRemover(target, namespace, event, handler, delegation, true)();
	};
}



/*
 * Removes (a) handler(s) from a path in the EVENT_MAP, defined by the given target, namespace, event and handler
 * (and, optionally, a delegation selector).
 *
 * @private
 */
function removeLocatedHandler(target, namespace, event, handler, delegation=null){
	const
		__methodName__ = 'removeLocatedHandler',
		targetEvents = EVENT_MAP.get(target),
		targetScope = targetEvents?.[namespace]?.[event]
	;

	assert(isPlainObject(targetScope), `${MODULE_NAME}:${__methodName__} | invalid targetScope`);

	let handlerScope;
	if( hasValue(delegation) ){
		const delegationScope = targetScope.delegations[`${delegation}`];
		assert(isPlainObject(delegationScope), `${MODULE_NAME}:${__methodName__} | invalid delegation "${delegation}"`);
		handlerScope = delegationScope;
	} else {
		handlerScope = targetScope;
	}
	const removedHandlers = handlerScope.handlers.filter(existingHandler => {
		return hasValue(handler)
			? (handler === existingHandler.handler)
			: true
		;
	});

	handlerScope.handlers = removeFrom(handlerScope.handlers, removedHandlers);

	removedHandlers.forEach(removedHandler => {
		target.removeEventListener(event, removedHandler.action);
		target.removeEventListener(event, removedHandler.action, {capture : true});
	});

	return removedHandlers.length;
}



/*
 * Removes all handlers matching the given definition provided by target, namespace, event and handler
 * (and, optionally, a delegation selector). Leaving out namespace, event or handler works as a wildcard.
 *
 * @private
 */
function removeHandlers(target, namespace=null, event=null, handler=null, delegation=null){
	const targetEvents = gatherTargetEvents(target, namespace, event, delegation);

	let removedCount = 0;

	Object.keys(targetEvents).forEach(ns => {
		Array.from(targetEvents[ns]).forEach(ev => {
			removedCount += removeLocatedHandler(target, ns, ev, handler, delegation);
		});
	});

	return removedCount;
}



/*
 * Shorthand-function for "removeHandlers" with more sane parameter order for delegations.
 *
 * @private
 */
function removeDelegatedHandlers(ancestor, delegation, namespace=null, event=null, handler=null){
	return removeHandlers(ancestor, namespace, event, handler, delegation);
}



/*
 * Pauses (a) handler(s) from a path in the EVENT_MAP, defined by the given target, namespace, event and handler
 * (and, optionally, a delegation selector). If paused is false, the function instead resumes the handlers.
 *
 * @private
 */
function pauseLocatedHandlers(target, namespace, event, handler, delegation=null, paused=true){
	const
		__methodName__ = 'pauseLocatedHandlers',
		targetEvents = EVENT_MAP.get(target),
		targetScope = targetEvents?.[namespace]?.[event]
	;

	assert(isPlainObject(targetScope), `${MODULE_NAME}:${__methodName__} | invalid targetScope`);

	let handlerScope;
	if( hasValue(delegation) ){
		const delegationScope = targetScope.delegations[`${delegation}`];
		assert(isPlainObject(delegationScope), `${MODULE_NAME}:${__methodName__} | invalid delegation "${delegation}"`);
		handlerScope = delegationScope;
	} else {
		handlerScope = targetScope;
	}

	const pausedHandlers = handlerScope.handlers.filter(existingHandler => {
		return hasValue(handler)
			? (handler === existingHandler.handler)
			: true
		;
	});

	pausedHandlers.forEach(pausedHandler => {
		pausedHandler.paused = !!paused;
	});

	return pausedHandlers.length;
}



/*
 * Pauses all handlers matching the given definition provided by target, namespace, event and handler
 * (and, optionally, a delegation selector). Leaving out namespace, event or handler works as a wildcard.
 * If paused is false, the function instead resumes the handlers.
 *
 * @private
 */
function pauseHandlers(target, namespace=null, event=null, handler=null, delegation=null, paused=true){
	const targetEvents = gatherTargetEvents(target, namespace, event, delegation);

	let pausedCount = 0;

	Object.keys(targetEvents).forEach(ns => {
		Array.from(targetEvents[ns]).forEach(ev => {
			pausedCount += pauseLocatedHandlers(target, ns, ev, handler, delegation, paused);
		});
	});

	return pausedCount;
}



/*
 * Shorthand-function for "pauseHandlers" with more sane parameter order for delegations.
 *
 * @private
 */
function pauseDelegatedHandlers(ancestor, delegation, namespace=null, event=null, handler=null, paused=true){
	return pauseHandlers(ancestor, namespace, event, handler, delegation, paused);
}



/*
 * Takes a handler object and a corresponding action, which is not yet aware of its pause state and
 * returns an action function, which checks if the handler is paused, before executing the original action.
 * Using this, we can wrap handler actions to automatically react to the handler's pause state, preventing any
 * handler execution if the handler is currently paused.
 *
 * @private
 */
function createPauseAwareAction(managedHandler, nonPauseAwareAction){
	return function pauseAwareHandler(e){
		if( !managedHandler.paused ){
			nonPauseAwareAction(e);
		}
	};
}



/*
 * Takes an event listener options object as provided by the user, to be used as the third parameter of
 * addEventListener, and returns a sanitized version, taking into regard what options the browser actually supports
 * and falling back to boolean capture values, if the browser does not know about listener options at all.
 *
 * @private
 */
function compileEventListenerOptions(options){
	if( isBoolean(options) ) return options;
	if( !isObject(options) ) return null;

	const supportedOptions = {};

	Object.keys(EVENT_OPTION_SUPPORT).forEach(option => {
		if( !!EVENT_OPTION_SUPPORT[option] && hasValue(options[option]) ){
			supportedOptions[option] = options[option];
		}
	});

	if( (Object.keys(supportedOptions).length === 0) && !!options.capture ){
		return true;
	}

	return supportedOptions;
}



/*
 * Creates a synthetic event to dispatch on an event target.
 *
 * @private
 */
function createSyntheticEvent(
	event,
	namespace=null,
	payload=null,
	bubbles=null,
	cancelable=null,
	syntheticTarget=null,
	EventConstructor=null,
	eventOptions=null
){
	const __methodName__ = 'createSyntheticEvent';

	event = `${event}`;
	bubbles = orDefault(bubbles, false, 'bool');
	cancelable = orDefault(cancelable, bubbles, 'bool');
	eventOptions = isPlainObject(eventOptions) ? eventOptions : {};

	let e;
	if( isFunction(EventConstructor) ){
		if( hasValue(payload) ){
			warn(`${MODULE_NAME}:${__methodName__} | can't add payload to event "${EventConstructor.name}", skipping`);
		}
		e = new EventConstructor(event, {bubbles, cancelable, ...eventOptions});
	} else {
		e = hasValue(payload)
			? new CustomEvent(event, {detail : payload, bubbles, cancelable, ...eventOptions})
			// we could use new Event() here, but jsdom and ava cannot use that constructor for dispatchEvent :(
			: new CustomEvent(event, {bubbles, cancelable, ...eventOptions})
		;
	}

	if( hasValue(namespace) ){
		e.namespace = `${namespace}`;
	}

	if( isEventTarget(syntheticTarget) ){
		e.syntheticTarget = syntheticTarget;
		e.syntheticTargetElements = [syntheticTarget]
	} else if(
		isArray(syntheticTarget)
		&& isEventTarget(syntheticTarget[0])
		&& isSelector(syntheticTarget[1])
	){
		e.syntheticTarget = syntheticTarget;
		Object.defineProperty(e, 'syntheticTargetElements', {
			get(){
				return Array.from(syntheticTarget[0].querySelectorAll(`${syntheticTarget[1]}`));
			}
		});
	}

	return e;
}



/*
 * Updates touch data for a start swipe event.
 *
 * @private
 */
function updateSwipeTouch(e){
	const startOrEnd = ['touchstart', 'mousedown'].includes(e.type) ? 'start' : 'end';
	if( ['touchstart', 'touchend'].includes(e.type) ){
		SWIPE_TOUCH[`${startOrEnd}X`] = e.changedTouches[0].screenX;
		SWIPE_TOUCH[`${startOrEnd}Y`] = e.changedTouches[0].screenY;
	} else {
		SWIPE_TOUCH[`${startOrEnd}X`] = e.screenX;
		SWIPE_TOUCH[`${startOrEnd}Y`] = e.screenY;
	}
}



/*
 * Tries to find a usable target for post messages, based on a given target element.
 *
 * @private
 */
function resolvePostMessageTarget(target, method){
	target = isWindow(target)
		? target
		: (
			isWindow(target?.contentWindow)
			? target.contentWindow
			: null
		)
	;

	assert(hasValue(target), `${MODULE_NAME}:${method} | no usable target`);

	return target
}



/*
 * Default handling for post messages for a window.
 *
 * @private
 */
function windowPostMessageHandler(e){
	const
		target = e.currentTarget,
		targetPostMessages = POST_MESSAGE_MAP.get(target),
		origin = !isEmpty(e.origin) ? e.origin : (!!window.__AVA_ENV__ ? window.location.href : null),
		messageType = e.data?.type
	;

	if( hasValue(targetPostMessages) ){
		const messageTypes = hasValue(messageType) ? [messageType] : Object.keys(targetPostMessages);
		messageTypes.forEach(messageType => {
			(targetPostMessages[messageType] ?? []).forEach(handler => {
				if( (handler.origin === '*') || (handler.origin === origin) ){
					handler.handler(e);
				}
			});
		});
	}
}



/*
 * Iterates message handlers for a target, and removes handlers, based on given handler and origin.
 *
 * @private
 */
function removePostMessageHandlers(targetPostMessages, messageType, origin=null, handler=null){
	if( hasValue(targetPostMessages[messageType]) ){
		const handlerCountBefore = targetPostMessages[messageType].length;

		if( !hasValue(origin) && !hasValue(handler) ){
			targetPostMessages[messageType] = [];
		} else if( hasValue(origin) && !hasValue(handler) ){
			targetPostMessages[messageType] = targetPostMessages[messageType].filter(h => h.origin !== origin);
		} else if( !hasValue(origin) && hasValue(handler) ){
			targetPostMessages[messageType] = targetPostMessages[messageType].filter(h => h.handler !== handler);
		} else if( hasValue(origin, handler) ) {
			targetPostMessages[messageType] = targetPostMessages[messageType].filter(
				h => (h.origin !== origin) && (h.handler !== handler)
			);
		}

		const handlerCountAfter = targetPostMessages[messageType].length;

		if( targetPostMessages[messageType].length === 0 ){
			delete targetPostMessages[messageType];
		}

		return handlerCountBefore - handlerCountAfter;
	} else {
		return 0;
	}
}



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Events:on
 */

/**
 * Registers (an) event listener(s) to (a) valid EventTarget(s) (most likely (a) DOM-element(s)).
 *
 * This method is inspired by jQuery and cash, though not identical.
 * You may define one or more targets as well as one or more events to register a handler to, by either providing single
 * arguments or arrays. You may also, additionally, namespace events, like in jQuery/cash, by adding it after the event
 * name, separated by a dot ('click.namespace').
 *
 * This method returns a remover function, which removes all event registrations done by this method call.
 * So, in essence, calling that function, removes exactly, what was added, in a single call.
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to register event handlers on
 * @param {String|Array<String>} events - the event name(s) to listen to, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {Function} handler - the callback to execute if the event(s) defined in events are being received on target
 * @param {?Object|Boolean} [options=null] - event listener options according to "addEventListener"-syntax, will be ignored, if browser does not support this, if boolean, will be used as "useCapture", the same will happen if options are not supported, but you defined "{capture : true}", "{once : true}" will not be applied directly to the listener, but will, instead, set the "once"-parameter to true (otherwise delegated listeners would self-destroy immediately on any check)
 * @param {?Boolean} [once=false] - defines if the handler should only execute once, after which it self-destroys automatically, this will automatically be enabled, if you set options.once to true
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case handler is not a function
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Function} remover function, which removes all handlers again, added by the current execution
 *
 * @memberof Events:on
 * @alias on
 * @see off
 * @see once
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?retiredLocale=de#syntax
 * @example
 * on(linkElement, 'click', e => {	e.stopPropagation(); });
 * on(someElementWithCustomEvents, 'crash.test', () => { alert('crashed!'); });
 * on([ancestorElement, 'a'], 'click', e => { e.target.classList.add('clicked'); });
 * on(buttonElement, 'click', () => { console.log('click twice, but I'll just print once); }, {passive : true, once : true});
 * on([ancestorElement, '.btn[data-foobar="test"]'], 'click', () => { console.log('I'll just fire once); }, null, true);
 * on(document.body, 'click', e => { console.log(`oh, a bubbled event, let's see what has been clicked: "${e.target}"`); });
 * on([foo, foo, 'button', bar], ['mousedown', 'touchstart'], e => { e.target.classList.add('interaction-start'); });
 */
export function on(targets, events, handler, options=null, once=false){
	const __methodName__ = 'on';

	({targets, events, handler} = prepareEventMethodBaseParams(__methodName__, targets, events, handler));
	once = !!once || !!options?.once;
	delete options?.once;

	const removers = [];

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(__methodName__, targets, targetIndex);

		let targetEvents = EVENT_MAP.get(target);
		if( isDelegation ){
			targetEvents = EVENT_MAP.get(prevTarget);
		} else if( !hasValue(targetEvents) ){
			EVENT_MAP.set(target, {[DEFAULT_NAMESPACE] : {}});
			targetEvents = EVENT_MAP.get(target);
		}

		if( !hasDelegation ){
			events.forEach(eventName => {
				const {event, namespace} = prepareEventMethodEventInfo(eventName, DEFAULT_NAMESPACE);

				if( !hasValue(targetEvents[namespace]) ){
					targetEvents[namespace] = {};
				}

				if( !hasValue(targetEvents[namespace][event]) ){
					targetEvents[namespace][event] = {
						target : isDelegation ? prevTarget : target,
						handlers : [],
						delegations : {}
					};
				}

				const targetScope = targetEvents[namespace][event];
				let handlerScope, action, remover;

				if( isDelegation ){
					if( !hasValue(targetScope.delegations[target]) ){
						targetScope.delegations[target] = {handlers : []};
					}
					handlerScope = targetScope.delegations[target];

					action = !!once
						? createDelegatedHandler(
							target,
							createSelfRemovingHandler(targetScope.target, namespace, event, handler, target)
						)
						: createDelegatedHandler(target, handler)
					;
					remover = createHandlerRemover(targetScope.target, namespace, event, handler, target);
				} else {
					handlerScope = targetScope;
					action = !!once
						? createSelfRemovingHandler(targetScope.target, namespace, event, handler)
						: handler
					;
					remover = createHandlerRemover(targetScope.target, namespace, event, handler);
				}

				const managedHandler = {
					handler,
					remover,
					paused : false,
				};
				managedHandler.action = createPauseAwareAction(managedHandler, action);
				handlerScope.handlers = handlerScope.handlers.concat(managedHandler);

				const eventListenerOptions = compileEventListenerOptions(options);
				if( hasValue(eventListenerOptions) ){
					targetScope.target.addEventListener(event, managedHandler.action, eventListenerOptions);
				} else {
					targetScope.target.addEventListener(event, managedHandler.action);
				}

				removers.push(remover);
			});
		}
	});

	return (removers.length > 1)
		? function(){
			removers.forEach(remover => remover());
		}
		: (
			(removers.length > 0)
			? removers[0]
			: null
		)
	;
}



/**
 * @namespace Events:once
 */

/**
 * Registers (an) event listener(s) to (a) valid EventTarget(s) (most likely (a) DOM-element(s)).
 *
 * This version automatically removes the handler, after it has fired once.
 *
 * This method is inspired by jQuery and cash, though not identical.
 * You may define one or more targets as well as one or more events to register a handler to, by either providing single
 * arguments or arrays. You may also, additionally, namespace events, like in jQuery/cash, by adding it after the event
 * name, separated by a dot ('click.namespace').
 *
 * This method returns a remover function, which removes all event registrations done by this method call.
 * So, in essence, calling that function, removes exactly, what was added, in a single call.
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to register event handlers on
 * @param {String|Array<String>} events - the event name(s) to listen to, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {Function} handler - the callback to execute if the event(s) defined in events are being received on target
 * @param {?Object|Boolean} [options=null] - event listener options according to "addEventListener"-syntax, will be ignored, if browser does not support this, if boolean, will be used as "useCapture", the same will happen if options are not supported, but you defined "{capture : true}", "{once : true}" makes no sense in this case, because the behaviour will automatically be applied anyway
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case handler is not a function
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Function} remover function, which removes all handlers again, added by the current execution
 *
 * @memberof Events:once
 * @alias once
 * @see on
 * @see off
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?retiredLocale=de#syntax
 * @example
 * once(linkElement, 'click', e => {	e.stopPropagation(); });
 * once(someElementWithCustomEvents, 'crash.test', () => { alert('crashed!'); });
 * once([ancestorElement, 'a'], 'click', e => { e.target.classList.add('clicked'); });
 * once(buttonElement, 'click', () => { console.log('click twice, but I'll just print once); }, {passive : true});
 * once([ancestorElement, '.btn[data-foobar="test"]'], 'click', () => { console.log('I'll just fire once); });
 * once(document.body, 'click', e => { console.log(`oh, a bubbled event, let's see what has been clicked: "${e.target}"`); });
 * once([foo, foo, 'button', bar], ['mousedown', 'touchstart'], e => { e.target.classList.add('interaction-start'); });
 */
export function once(targets, events, handler, options=null){
	return on(targets, events, handler, options, true);
}



/**
 * @namespace Events:off
 */

/**
 * Removes (a), previously defined, event listener(s) on (a) valid EventTarget(s) (most likely (a) DOM-element(s)).
 *
 * The definition of targets and events works exactly as in "on" and "once", the only difference being, that the handler
 * is optional in this case, which results in the removal of all handlers, without targeting a specific one.
 *
 * To specifically target handlers without a namespace, please use the namespace-string "__default".
 *
 * This function does _not_ differentiate between removal of capture/non-capture events, but always removes both.
 *
 * If you try to remove event handlers not previously created with `on` (and therefore there are no fitting target
 * entries in the EVENT_MAP), the function will fall back to native `removeEventListener`
 * (if `tryNativeRemoval` is true), but in that case, a handler has to be defined and the return value will not
 * increment, since we do not know if the removal really worked.
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to remove event handlers from
 * @param {String|Array<String>} events - the event name(s) to remove, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {?Function} [handler=null] - a specific callback function to remove
 * @param {?Boolean} [tryNativeRemoval=true] - if a target is not part of the EVENT_MAP native removeEventListener is used as a fallback if this is true (handler needs to be set in that case)
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case a defined handler is not a function
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Number} the number of handlers actually removed by the function call, may also be 0 if nothing matched
 *
 * @memberof Events:off
 * @alias off
 * @see on
 * @see once
 * @example
 * off(buttonElement, 'click');
 * off(bar, '*.__default');
 * off(customEventElement, 'crash');
 * off([ancestorElement, 'a'], 'click');
 * off([ancestorElement, '.btn[data-foobar="test"]'], '*.delegated', fSpecificHandler);
 * off(linkElement, '*', fSpecificHandler);
 * off(customEventElement, ['*.test', '*.site']);
 * off([ancestorElement, 'a', ancestorElement, '.btn[data-foobar="test"]'], '*.*', fSpecificHandler);
 * off(buttonElement, '*.*');
 */
export function off(targets, events, handler=null, tryNativeRemoval=true){
	const __methodName__ = 'off';

	({targets, events, handler} = prepareEventMethodBaseParams(__methodName__, targets, events, handler, true));
	tryNativeRemoval = orDefault(tryNativeRemoval, true, 'bool');

	let removedCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(__methodName__, targets, targetIndex);

		if( !hasDelegation ){
			const targetEvents = isDelegation ? EVENT_MAP.get(prevTarget) : EVENT_MAP.get(target);

			events.forEach(eventName => {
				const {event, namespace} = prepareEventMethodEventInfo(eventName);

				if( hasValue(targetEvents) ){
					if( isDelegation ){
						removedCount += removeDelegatedHandlers(prevTarget, target, namespace, event, handler);
					} else {
						removedCount += removeHandlers(target, namespace, event, handler);
					}

					cleanUpEventMap(isDelegation ? prevTarget : target);
				} else if( tryNativeRemoval ){
					if( hasValue(handler) ){
						(isDelegation ? prevTarget : target).removeEventListener(eventName, handler);
						(isDelegation ? prevTarget : target).removeEventListener(eventName, handler, {capture : true});
					} else {
						warn(`${MODULE_NAME}:${__methodName__} | native fallback event removal for "${eventName}" not possible, handler is missing`);
					}
				}
			});
		}
	});

	return removedCount;
}



/**
 * @namespace Events:pause
 */

/**
 * Pauses (a), previously defined, event listener(s), without actually removing anything. Subsequent executions
 * of the handler will not fire, while the handler is paused, which also means, that paused handlers, set up to only
 * fire once, will not self-destroy while being paused.
 *
 * The definition of targets and events works exactly as in "on" and "once", the only difference being, that the handler
 * is optional in this case, which results in the pausing of all handlers, without targeting a specific one.
 *
 * To specifically target handlers without a namespace, please use the namespace-string "__default".
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to pause event handlers on
 * @param {String|Array<String>} events - the event name(s) to pause, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {?Function} [handler=null] - a specific callback function to pause
 * @param {?Boolean} [paused=true] - defines if the matched handlers are being paused or resumed
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case a defined handler is not a function
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Number} the number of handlers actually paused by the function call, may also be 0 if nothing matched
 *
 * @memberof Events:pause
 * @alias pause
 * @see on
 * @see resume
 * @example
 * pause(buttonElement, 'click');
 * pause(linkElement, '*.__default');
 * pause(customEventElement, 'crash');
 * pause([ancestorElement, 'a'], 'click');
 * pause([ancestorElement, '.btn[data-foobar="test"]'], '*.delegated', fSpecificHandler);
 */
export function pause(targets, events, handler=null, paused=true){
	const __methodName__ = 'pause';

	({targets, events, handler} = prepareEventMethodBaseParams(__methodName__, targets, events, handler, true));

	let pausedCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(__methodName__, targets, targetIndex);

		if( !hasDelegation ){
			const targetEvents = isDelegation ? EVENT_MAP.get(prevTarget) : EVENT_MAP.get(target);

			if( hasValue(targetEvents) ){
				events.forEach(eventName => {
					const {event, namespace} = prepareEventMethodEventInfo(eventName);

					if( isDelegation ){
						pausedCount += pauseDelegatedHandlers(prevTarget, target, namespace, event, handler, paused);
					} else {
						pausedCount += pauseHandlers(target, namespace, event, handler, null, paused);
					}
				});
			}
		}
	});

	return pausedCount;
}



/**
 * @namespace Events:resume
 */

/**
 * Resumes (a), previously paused, event listener(s). Subsequent executions of the handler will fire again.
 *
 * The definition of targets and events works exactly as in "on" and "once", the only difference being, that the handler
 * is optional in this case, which results in the un-pausing of all handlers, without targeting a specific one.
 *
 * To specifically target handlers without a namespace, please use the namespace-string "__default".
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to resume event handlers on
 * @param {String|Array<String>} events - the event name(s) to resume, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {?Function} [handler=null] - a specific callback function to resume
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case a defined handler is not a function
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Number} the number of handlers actually resumed by the function call, may also be 0 if nothing matched
 *
 * @memberof Events:resume
 * @alias resume
 * @see on
 * @see pause
 * @example
 * resume(linkElement, '*', fSpecificHandler);
 * resume(customEventElement, ['*.test', '*.site']);
 * resume([ancestorElement, 'a', ancestorElement, '.btn[data-foobar="test"]'], '*.*', fSpecificHandler);
 * resume(buttonElement, '*.*');
 */
export function resume(targets, events, handler=null){
	return pause(targets, events, handler, false);
}



/**
 * @namespace Events:fire
 */

/**
 * Fires event handlers of all matched targets for given events.
 *
 * This function does not actually dispatch events, but identifies matches in the internal event map, based on
 * previously registered handlers using "on" and "once" and executes the attached handlers, providing them a synthetic
 * CustomEvent as first parameter, carrying the event name as well as a potential payload. So this, function is
 * using the event map as an event bus, instead of the DOM, so these events also will never bubble, but just hit the
 * currently present handlers identified exactly by the provided parameters.
 *
 * The definition of targets and events works exactly as in "on" and "once", the only difference being, that we have no
 * handler, since if we'd have the handler already, we could just call it.
 *
 * Since we do not use the DOM in this function, we also do not have native events, and therefore we do not have normal
 * event targets we can work with. Instead, this implementation adds the "syntheticTarget" and the
 * "syntheticTargetElements" event properties to the event that is given to the handler. "syntheticTarget" contains
 * the defined event map target, either as a EventTarget or an array of an EventTarget and a corresponding delegation
 * selector (just as you defined them before), while "syntheticTargetElements" returns the actual elements as an
 * iterable array. So, in case of a delegation, this gives you the power to actually work with the current delegation
 * targets, without having to write own logic for this.
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to execute event handlers on
 * @param {String|Array<String>} events - the event name(s) to fire, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {?Object} [payload=null] - a plain object payload to relay to the event handlers via the detail of the CustomEvent given to the handler as first parameter
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Number} the number of handlers actually executed by the function call, may also be 0 if nothing matched
 *
 * @memberof Events:fire
 * @alias fire
 * @see on
 * @see once
 * @see emit
 * @example
 * fire(buttonElement, 'click');
 * fire(linkElement, '*.__default', {importantFlag : true});
 * fire(divElement, 'crash');
 * fire([ancestorElement, 'a'], 'click', {linkWasClicked : true});
 * fire([ancestorElement, '.btn[data-foobar="test"]'], '*.delegated');
 * fire(linkElement, '*');
 * fire([ancestorElement, 'a', ancestorElement, '.btn[data-foobar="test"]'], '*.*');
 * fire(buttonElement, 'click.*', {price : 666});
 */
export function fire(targets, events, payload=null){
	const __methodName__ = 'fire';

	({targets, events} = prepareEventMethodBaseParams(__methodName__, targets, events, null, true));

	let fireCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(__methodName__, targets, targetIndex);

		if( !hasDelegation ){
			const targetEvents = isDelegation ? EVENT_MAP.get(prevTarget) : EVENT_MAP.get(target);

			if( hasValue(targetEvents) ){
				events.forEach(eventName => {
					const {event, namespace} = prepareEventMethodEventInfo(eventName);

					let gatheredTargetEvents;
					if( isDelegation ){
						gatheredTargetEvents = gatherTargetEvents(prevTarget, namespace, event, target);
					} else {
						gatheredTargetEvents = gatherTargetEvents(target, namespace, event);
					}

					Object.keys(gatheredTargetEvents).forEach(ns => {
						Array.from(gatheredTargetEvents[ns]).forEach(ev => {
							const
								handlerScope = isDelegation
									? targetEvents[ns][ev].delegations[target]
									: targetEvents[ns][ev]
								,
								syntheticEvent = isDelegation
									? createSyntheticEvent(ev, ns, payload, false, false, [prevTarget, target])
									: createSyntheticEvent(ev, ns, payload, false, false, target)
							;

							handlerScope.handlers.forEach(handler => {
								handler.action(syntheticEvent);
								fireCount++;
							});
						});
					});
				});
			}
		}
	});

	return fireCount;
}



/**
 * @namespace Events:emit
 */

/**
 * Dispatches synthetic events on all given targets.
 *
 * In contrast to "fire", this function actually dispatches bubbling events on the provided EventTargets. Delegations
 * are resolved using "querySelectorAll". This function does not check actual handler presence using the event map, but
 * blindly emits what has been given, purely using the DOM as the event bus. Handlers defined with "on" and "once" will
 * of course still be triggered if hit, since they always also register a native event listener. The events emitted
 * are purely synthetic basic Events and CustomEvents, lacking special properties, which, for example, MouseEvents
 * provide. So, using "screenX" in the handler will not work. If you need a certain base class for the created events,
 * use the "EventConstructor" to provide the base class and add special options via "eventOptions".
 *
 * The definition of targets and events works almost as in "on" and "once", the only differences being, that we have no
 * handler, and we cannot leave out the event name. Using a wildcard for the namespace will leave out the namespace in
 * the created events.
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to dispatch events on
 * @param {String|Array<String>} events - the event name(s) to emit, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {?Object} [payload=null] - a plain object payload to relay to the event handlers via the detail of the CustomEvent given to the handler as first parameter
 * @param {?Function} [EventConstructor=null] - the default constructor is Event/CustomEvent, if you need another specific synthetic event, provide a constructor such as MouseEvent here
 * @param {?Object} [eventOptions=null] - use this plain object to provide constructor specific options to use in event construction, this should especially come in handy in case you provide a custom EventConstructor
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Number} the number of events actually dispatched by the function call, may also be 0 if nothing matched
 *
 * @memberof Events:emit
 * @alias emit
 * @see on
 * @see once
 * @see fire
 * @example
 * emit([buttonElement, ancestorElement, 'a'], 'click');
 * emit(linkElement, 'click.__default', {defaultClick: true});
 * emit([divElement, document.body], 'crash');
 * emit([ancestorElement, 'a'], 'click', {trackingId : 'abc123'});
 * emit([ancestorElement, '.btn[data-foobar="test"]'], 'click.delegated');
 * emit(ancestorElement, ['crash.test', 'crash.site'], {damage : 1000});
 * emit([ancestorElement, 'a', ancestorElement, '.btn[data-foobar="test"]'], 'click.delegated', null, null, {bubbles : false});
 * emit(buttonElement, 'click.*', {price : 666}, MouseEvent, {bubbles : false});
 */
export function emit(targets, events, payload=null, EventConstructor=null, eventOptions=null){
	const __methodName__ = 'emit';

	({targets, events} = prepareEventMethodBaseParams(__methodName__, targets, events, null, true));

	let emitCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(__methodName__, targets, targetIndex);

		if( !hasDelegation ){
			events.forEach(eventName => {
				const {event, namespace} = prepareEventMethodEventInfo(eventName);

				assert(hasValue(event), `${MODULE_NAME}:${__methodName__} | missing event name`);

				if( isDelegation ){
					Array.from(prevTarget.querySelectorAll(target)).forEach(element => {
						element.dispatchEvent(
							createSyntheticEvent(event, namespace, payload, true, true, null, EventConstructor, eventOptions)
						);
						emitCount++;
					});
				} else {
					target.dispatchEvent(
						createSyntheticEvent(event, namespace, payload, true, true, null, EventConstructor, eventOptions)
					);
					emitCount++;
				}
			});

		}
	});

	return emitCount;
}



/**
 * @namespace Events:offDetachedElements
 */

/**
 * This method completely removes all handlers and listeners for provided targets in case that they
 * are actually an element and not part of the DOM (anymore).
 *
 * The most common use-case for this is to clean the event map after dynamically removing an element from the interface
 * during runtime, maybe as a reaction to a user interaction.
 *
 * Since we are overlaying the DOM event system with a separate (non-weak) event map, handlers in the map do not
 * automatically disappear if the event targets, being elements, are removed from the DOM. In that case, we have to
 * actually unregister events again, for which this is a handy little helper method.
 *
 * There are two common ways to use this:
 * 1. Just call it with the removed element, after removal of the element. This will only remove all data for that
 *    element, if it actually is an element and is not currently in the DOM.
 * 2. Call it without parameters, to iterate all current targets, check if they are elements and currently not in the
 *    DOM and remove all handlers and listeners in that case.
 *
 * So, you can either directly clean-up anything you remove or remove everything, that needs removing and do a general
 * clean-up after everything has been done.
 *
 * Be aware, that the definition of what an element is and if that element is part of the dom is defined by the actual
 * event target. So delegations are not automatically covered by this, since they rely on the ancestor element for
 * event handling.
 *
 * @param {?EventTarget|Array<EventTarget>} [targets=null] - the target(s) to remove from the event map, if not set, all event targets in the current event map are used
 * @returns {Number} the number of targets for which registered handlers and listeners have been removed
 *
 * @memberof Events:offDetachedElements
 * @alias offDetachedElements
 * @example
 * button.remove();
 * offDetachedElements(button);
 * => 1
 * link.innerText = 'test';
 * button.remove();
 * offDetachedElements([link, button]);
 * => 1
 * offDetachedElements()
 * => number of all currently registered targets, being elements and not in the dom
 */

export function offDetachedElements(targets){
	targets = orDefault(targets, [], 'arr');

	if( targets.length === 0 ){
		targets = Array.from(EVENT_MAP.keys());
	}

	let offCount = 0;

	targets.forEach(target => {
		if( isElement(target) && !document.body.contains(target) && EVENT_MAP.has(target) ){
			offCount++;
			off(target, '*');
		}
	});

	return offCount;
}



/**
 * @namespace Events:onSwipe
 */

/**
 * Defines a handler for a swipe gesture on (an) element(s).
 * Offers four swipe directions (up/right/down/left), where triggering the handler depends on the distance
 * between touchstart and touchend in relation to the element's width or height, depending on the direction,
 * multiplied by a factor to express a percentage.
 *
 * You may also set this method to also fire upon mouse swipes, by setting "hasToBeTouchDevice" to false.
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to register event handlers on
 * @param {String} direction - the direction to bind => up/down/left/right
 * @param {Function} handler - the callback to execute if the event(s) defined in events are being received on target
 * @param {?Number} [dimensionFactor=0.2] - to determine what registers as a swipe we use a percentage of the element's width/height, the touch has to move, default is 20%
 * @param {?Boolean} [hasToBeTouchDevice=true] - if true, makes sure the handlers are only active on touch devices, if false, also reacts to mouse swipes
 * @param {?String} [eventNameSpace='annex-swipe'] - apply an event namespace, which identifies specific events, helpful for a specific unbind later using the same namespace
 * @throws error in case no targets are defined
 * @throws error in case unknown direction is defined
 * @throws error in case handler is not a function
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Function} remover function, which removes all handlers again, added by the current execution
 *
 * @memberof Events:onSwipe
 * @alias onSwipe
 * @see offSwipe
 * @example
 * onSwipe(slider, 'up', e => { e.currentTarget.fadeOut(); });
 * onSwipe(slider, 'right', () => { document.body.dispatchEvent(new CustomEvent('load-previous-thing')); }, 0.15, false, 'foobar-prev');
 */
export function onSwipe(targets, direction, handler, dimensionFactor=0.2, hasToBeTouchDevice=true, eventNameSpace='annex-swipe'){
	const __methodName__ = 'onSwipe';

	direction = orDefault(direction, '', 'str');
	dimensionFactor = orDefault(dimensionFactor, 0.2, 'float');
	hasToBeTouchDevice = orDefault(hasToBeTouchDevice, true, 'bool');
	eventNameSpace = orDefault(eventNameSpace, 'annex-swipe', 'str');

	assert(SWIPE_DIRECTIONS.includes(direction), `${MODULE_NAME}:${__methodName__} | unknown direction "${direction}"`);

	let events = [`touchstart.${eventNameSpace}-${direction}`, `touchend.${eventNameSpace}-${direction}`];
	if( !hasToBeTouchDevice ){
		events.push(`mousedown.${eventNameSpace}-${direction}`);
		events.push(`mouseup.${eventNameSpace}-${direction}`);
	}

	({targets, events, handler} = prepareEventMethodBaseParams(__methodName__, targets, events, handler));

	const originalHandler = handler;
	handler = (hasToBeTouchDevice && (detectInteractionType() !== 'touch')) ? () => {} : originalHandler;
	const swipeHandler = SWIPE_HANDLERS.get(originalHandler) ?? (e => {
		updateSwipeTouch(e);

		if( ['touchend', 'mouseup'].includes(e.type) ){
			const
				width = e.currentTarget.offsetWidth,
				height = e.currentTarget.offsetHeight
			;

			if(
				(!hasToBeTouchDevice || (detectInteractionType() === 'touch'))
				&& (
					((direction === 'up') && (SWIPE_TOUCH.startY > (SWIPE_TOUCH.endY + height * dimensionFactor)))
					|| ((direction === 'right') && (SWIPE_TOUCH.startX < (SWIPE_TOUCH.endX - width * dimensionFactor)))
					|| ((direction === 'down') && (SWIPE_TOUCH.startY < (SWIPE_TOUCH.endY - height * dimensionFactor)))
					|| ((direction === 'left') && (SWIPE_TOUCH.startX > (SWIPE_TOUCH.endX + width * dimensionFactor)))
				)
			){
				handler(e);
			}
		}
	});
	SWIPE_HANDLERS.set(originalHandler, swipeHandler);

	return on(targets, events, swipeHandler);
}



/**
 * @namespace Events:offSwipe
 */

/**
 * Removes (a) handler(s) for a swipe gesture from (an) element(s).
 *
 * Normally all directions are removed individually, but if you leave out `direction` all directions are removed at once.
 *
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to remove event handlers from
 * @param {?String} [direction=null] - the direction to remove => up/down/left/right, if empty, all directions are removed
 * @param {?Function} [handler=null] - a specific callback function to remove
 * @param {?String} [eventNameSpace='annex-swipe'] - event namespace to remove
 * @throws error in case no targets are defined
 * @throws error in case unknown direction is defined
 * @throws error in case a defined handler is not a function
 * @throws error in case targets are not all usable event targets
 * @throws error in case delegations are missing viable ancestor targets
 * @returns {Number} the number of handlers actually removed by the function call, may also be 0 if nothing matched
 *
 * @memberof Events:offSwipe
 * @alias offSwipe
 * @see onSwipe
 * @example
 * offSwipe(slider, 'right');
 * offSwipe(slider, 'left', fSpecialHandler, 'foobar-prev');
 * offSwipe(slider);
 */
export function offSwipe(targets, direction=null, handler=null, eventNameSpace='annex-swipe'){
	const __methodName__ = 'offSwipe';

	direction = orDefault(direction, '', 'str');
	eventNameSpace = orDefault(eventNameSpace, 'annex-swipe', 'str');

	assert(SWIPE_DIRECTIONS.concat('').includes(direction), `${MODULE_NAME}:${__methodName__} | unknown direction "${direction}"`);

	const directions = (direction === '') ? SWIPE_DIRECTIONS : [direction];
	let removedCount = 0;

	directions.forEach(direction => {
		let events = [
			`touchstart.${eventNameSpace}-${direction}`,
			`touchend.${eventNameSpace}-${direction}`,
			`mousedown.${eventNameSpace}-${direction}`,
			`mouseup.${eventNameSpace}-${direction}`
		];

		({targets, events, handler} = prepareEventMethodBaseParams(__methodName__, targets, events, handler, true));

		if( hasValue(handler) ){
			const swipeHandler = SWIPE_HANDLERS.get(handler);
			if( hasValue(swipeHandler) ){
				removedCount += off(targets, events, swipeHandler);
			}
		} else {
			removedCount += off(targets, events);
		}
	});

	return removedCount;
}



/**
 * @namespace Events:onDomReady
 */

/**
 * Executes a callback on document ready (DOM parsed, complete and usable, not loaded/onload).
 *
 * @param {Function} callback - function to execute, once document is parsed and ready
 *
 * @memberof Events:onDomReady
 * @alias onDomReady
 * @example
 * onDomReady(() => {
 *     document.body.classList.add('dom-ready');
 * });
 */
export function onDomReady(callback){
	if( document.readyState !== 'loading' ){
		callback();
	} else {
		const wrappedCallback = () => {
			document.removeEventListener('DOMContentLoaded', wrappedCallback);
			callback();
		};
		document.addEventListener('DOMContentLoaded', wrappedCallback);
	}
}



/**
 * @namespace Events:onPostMessage
 */

/**
 * Register an event handler for a post message on a valid target, like a window or an iframe.
 *
 * The handler will only be executed, if the messageType as well as the origin match. The messageType must be
 * part of the payload, using the key "type", which `emitPostMessage` does automatically.
 *
 * Putting the origin as an obligatory parameter at the second place, is deliberate by design, to force everyone
 * to really think about, what to use here. Usually, most people, just throw in the "*" wildcard, paying no attention
 * to the security implications. Please really think about what to use here.
 *
 * A word of advice: keep in mind, that, contrary to most other events in javascript, post messages actually work
 * asynchronously (so you cannot be sure, that the handler has been executed, directly after a post message has been
 * sent) and that messages/payload are not transferred as-is, but are cloned, using the "structured clone algorithm",
 * which means, that not every javascript object is transferable without losses.
 *
 * @param {Window|HTMLIFrameElement} target - window/iframe to register the handler to (iframes are automatically resolved to the contentWindow)
 * @param {String} origin - the origin the received post message has to have, for the handler to get executed (defaults to "*", if receiving a nullish value)
 * @param {String} messageType - the type/name the post message has to have, for the handler to get executed (will be checked using the key "type" in the message's payload)
 * @param {Function} handler - the handler to execute, if a post message, matching all conditions, is received
 * @throws error if target is not usable
 * @return a function, which, if executed, removes everything registered by the current call
 *
 * @memberof Events:onPostMessage
 * @alias onPostMessage
 * @see offPostMessage
 * @see emitPostMessage
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Origin
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @example
 * const removeAgainFunction = onPostMessage(window, '*', 'foobar-message', () => { doSomething(); });
 * onPostMessage(iframeElement, 'https://foobar.com:80/', 'foobar-message', e => { resizeIframe(e.data.payload.height); });
 */
export function onPostMessage(target, origin, messageType, handler){
	const __methodName__ = 'onPostMessage';

	target = resolvePostMessageTarget(target, __methodName__);
	origin = orDefault(origin, '*', 'str');
	messageType = `${messageType}`;

	assert(isFunction(handler), `${MODULE_NAME}:${__methodName__} | handler is not a function`);

	if( !hasValue(POST_MESSAGE_MAP.get(target)) ){
		POST_MESSAGE_MAP.set(target, {});
		target.addEventListener('message', windowPostMessageHandler);
	}

	const targetPostMessages = POST_MESSAGE_MAP.get(target);
	if( !hasValue(targetPostMessages[messageType]) ){
		targetPostMessages[messageType] = [];
	}

	targetPostMessages[messageType].push({handler, origin});

	return () => { offPostMessage(target, origin, messageType, handler); };
}



/**
 * @namespace Events:offPostMessage
 */

/**
 * Unregister (an) event handler(s) for (a) post message(s) on a valid target, like a window or an iframe.
 *
 * Similar to `off`, this function can handle rather unspecific cases as well as very specific definitions.
 * Just setting the target, removes all registrations for that target. Setting an `origin` and/or a `messageType`
 * additionally, only removes handlers, that were registered explicitly for these values. Adding a handler only
 * removes that specific handler (without origin and/or messageType, the handler is removed everywhere).
 *
 * Putting the origin parameter at the second place, is deliberate by design, to force everyone to really think about,
 * what to use here. Usually, most people, just throw in the "*" wildcard, paying no attention to the security
 * implications, when setting a post message handler. Since we force this on `onPostMessage`, we keep the signature
 * here as well, just making everything except target optional.
 *
 * If you try to remove event handlers not previously created with `onPostMessage` (and therefore there are no fitting
 * target entries in the POST_MESSAGE_MAP), the function will fall back to native `removeEventListener`
 * (if `tryNativeRemoval` is true), but in that case, a handler has to be defined and the return value will not
 * increment, since we do not know if the removal really worked.
 *
 * @param {Window|HTMLIFrameElement} target - window/iframe to remove handler(s) from (iframes are automatically resolved to the contentWindow)
 * @param {?String} [origin=null] - the origin the received post message has to have, for the handler to get executed (defaults to "*", if receiving a nullish value)
 * @param {?String} [messageType=null] - the type/name the post message has to have, for the handler to get executed (will be checked using the key "type" in the message's payload)
 * @param {?Function} [handler=null] - the handler to execute, if a post message, matching all conditions, is received
 * @param {?Boolean} [tryNativeRemoval=true] - if a target is not part of the POST_MESSAGE_MAP native removeEventListener is used as a fallback if this is true (handler needs to be set in that case)
 * @throws error if target is not usable
 * @return the number of actually removed handlers, that matched the conditions
 *
 * @memberof Events:offPostMessage
 * @alias offPostMessage
 * @see onPostMessage
 * @see emitPostMessage
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Origin
 * @example
 * const offCount = offPostMessage(window, 'https://foobar.com:80/', 'foobar-message');
 * offPostMessage(window, null, null, specialHandlerFunction);
 */
export function offPostMessage(target, origin=null, messageType=null, handler=null, tryNativeRemoval=true){
	const __methodName__ = 'offPostMessage';

	target = resolvePostMessageTarget(target, __methodName__);
	origin = orDefault(origin, null, 'str');
	messageType = orDefault(messageType, null, 'str');
	tryNativeRemoval = orDefault(tryNativeRemoval, true, 'bool');

	if( hasValue(handler) ){
		assert(isFunction(handler), `${MODULE_NAME}:${__methodName__} | handler is not a function`);
	}

	let removedCount = 0;

	const targetPostMessages = POST_MESSAGE_MAP.get(target);
	if( hasValue(targetPostMessages) ){
		const messageTypes = hasValue(messageType) ? [messageType] : Object.keys(targetPostMessages);
		messageTypes.forEach(messageType => {
			removedCount += removePostMessageHandlers(targetPostMessages, messageType, origin, handler);
		});

		if( Object.keys(targetPostMessages).length === 0 ){
			POST_MESSAGE_MAP.delete(target);
		}
	} else if( tryNativeRemoval ){
		if( hasValue(handler) ){
			target.removeEventListener('message', handler);
		} else {
			warn(`${MODULE_NAME}:${__methodName__} | native fallback event removal for "${messageType}" not possible, handler is missing`);
		}
	}

	if( !hasValue(POST_MESSAGE_MAP.get(target)) ){
		target.removeEventListener('message', windowPostMessageHandler);
	}

	return removedCount;
}



/**
 * @namespace Events:emitPostMessage
 */

/**
 * Emit/dispatch a post message on a valid target, like a window or an iframe.
 *
 * Putting the origin as an obligatory parameter at the second place, is deliberate by design, to force everyone
 * to really think about, what to use here. Usually, most people, just throw in the "*" wildcard, paying no attention
 * to the security implications. Please really think about what to use here.
 *
 * This function adds the `messageType` automatically to the message/payload using the key `type`. `onPostMessage` will
 * use that information additionally to the `origin` to determine if a registration fits the occurred event. The
 * `payload` will be placed in the message using the key `payload`. So `e.data` will look like this in the
 * handler at the end: `{type : messageType, payload : {...payload}}`
 *
 * A word of advice: keep in mind, that, contrary to most other events in javascript, post messages actually work
 * asynchronously (so you cannot be sure, that the handler has been executed, directly after a post message has been
 * sent) and that messages/payload are not transferred as-is, but are cloned, using the "structured clone algorithm",
 * which means, that not every javascript object is transferable without losses.
 *
 * @param {Window|HTMLIFrameElement} target - window/iframe to receive the post message (iframes are automatically resolved to the contentWindow)
 * @param {String} origin - the origin the current context has to have, to actually send the post message the received post message has to have, this does NOT set the origin! (defaults to "*", if receiving a nullish value)
 * @param {String} messageType - the type/name of the post message (will be checked using the key "type" in the message's payload, which will automatically be set using this function)
 * @param {?*} [payload=null] - a payload to add to the message under the key "payload"
 * @throws error if target is not usable
 * @return the resolved target of the post message
 *
 * @memberof Events:emitPostMessage
 * @alias emitPostMessage
 * @see onPostMessage
 * @see offPostMessage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Origin
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @example
 * emitPostMessage(window, '*', 'foobar-message', {timestamp : new Date()});
 * emitPostMessage(iframeElement, 'https://foobar.com:80/', 'foobar-message');
 */
export function emitPostMessage(target, origin, messageType, payload=null){
	const __methodName__ = 'emitPostMessage';

	target = resolvePostMessageTarget(target, __methodName__);
	origin = orDefault(origin, '*', 'str');
	messageType = `${messageType}`;

	const message = {type : messageType};
	if( hasValue(payload) ){
		message.payload = payload;
	}

	target.postMessage(message, origin);

	return target;
}
