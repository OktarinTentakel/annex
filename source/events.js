/*!
 * Module Events
 */

/**
 * @namespace Events
 */

const MODULE_NAME = 'Events';



//###[ IMPORTS ]########################################################################################################

import {assert, isA, isEventTarget, isPlainObject, orDefault, hasValue, isEmpty, isSelector} from './basic.js';
import {slugify} from './strings.js';
import {removeFrom} from './arrays.js';



//###[ DATA ]###########################################################################################################

export const EVENT_MAP = new Map();

const
	DEFAULT_NAMESPACE = '__default',
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
 * Returns the transformed parameters as a object, with keys of the same name as the relevant parameters.
 */
function prepareEventMethodBaseParams(methodName, targets, events, handler, handlerIsOptional=false){
	targets = orDefault(targets, [], 'arr');
	assert(targets.length > 0, `${MODULE_NAME}:${methodName} | no targets provided`);
	events = orDefault(events, [], 'arr');
	assert(events.length > 0, `${MODULE_NAME}:${methodName} | no events provided`);
	if( !handlerIsOptional || hasValue(handler) ){
		assert(isA(handler, 'function'), `${MODULE_NAME}:${methodName} | handler is not a function`);
	}

	let
		targetsAreEventTargets = true,
		delegatedTargetsAreSelectorsAndHaveAncestor = true
	;

	targets.forEach((target, targetIndex) => {
		if( isA(target, 'string') ){
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

	events = events
		.map(event => event.replace(`.${DEFAULT_NAMESPACE}`, '.-default-ns'))
		.map(event => slugify(event, {
			'.' : '___dot___',
			'*' : '___star___'
		}))
		.map(event => event.replaceAll('___dot___', '.'))
		.map(event => event.replaceAll('___star___', '*'))
		.map(event => event.replace('.-default-ns', `.${DEFAULT_NAMESPACE}`))
	;

	return {targets, events, handler};
}



/*
 * Prepares basic information about the current target in a list of targets.
 * The current target is identified by index, since the same target may appear multiple times in a list,
 * for example as a target and a delegation ancestor.
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
 */
function gatherTargetEvents(target, namespace=null, event=null, delegation=null){
	const methodName = gatherTargetEvents.name;

	const targetEvents = EVENT_MAP.get(target);
	assert(isPlainObject(targetEvents), `${MODULE_NAME}:${methodName} | invalid target "${target}"`);

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
						isA(e.syntheticTarget, 'array')
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
 */
function createHandlerRemover(target, namespace, event, handler, delegation=null){
	const
		methodName = createHandlerRemover.name,
		targetEvents = EVENT_MAP.get(target)
	;
	let handlerScope = targetEvents?.[namespace]?.[event];

	if( hasValue(delegation) ){
		assert(isSelector(delegation), `${MODULE_NAME}:${methodName} | invalid delegation "${delegation}"`);
		handlerScope = handlerScope.delegations[`${delegation}`];
	}

	assert(isPlainObject(handlerScope), `${MODULE_NAME}:${methodName} | invalid handlerScope`);

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
 */
function createSelfRemovingHandler(target, namespace, event, handler, delegation=null){
	return function selfRemovingHandler(e){
		handler(e);
		createHandlerRemover(target, namespace, event, handler, delegation)();
	};
}



/*
 * Removes (a) handler(s) from a path in the EVENT_MAP, defined by the given target, namespace, event and handler
 * (and, optionally, a delegation selector).
 */
function removeLocatedHandler(target, namespace, event, handler, delegation=null){
	const
		methodName = removeLocatedHandler.name,
		targetEvents = EVENT_MAP.get(target),
		targetScope = targetEvents?.[namespace]?.[event]
	;

	assert(isPlainObject(targetScope), `${MODULE_NAME}:${methodName} | invalid targetScope`);

	let handlerScope;
	if( hasValue(delegation) ){
		const delegationScope = targetScope.delegations[`${delegation}`];
		assert(isPlainObject(delegationScope), `${MODULE_NAME}:${methodName} | invalid delegation "${delegation}"`);
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
	});

	return removedHandlers.length;
}



/*
 * Removes all handlers matching the given definition provided by target, namespace, event and handler
 * (and, optionally, a delegation selector). Leaving out namespace, event or handler works as a wildcard.
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
 */
function removeDelegatedHandlers(ancestor, delegation, namespace=null, event=null, handler=null){
	return removeHandlers(ancestor, namespace, event, handler, delegation);
}



/*
 * Pauses (a) handler(s) from a path in the EVENT_MAP, defined by the given target, namespace, event and handler
 * (and, optionally, a delegation selector). If paused is false, the function instead resumes the handlers.
 */
function pauseLocatedHandlers(target, namespace, event, handler, delegation=null, paused=true){
	const
		methodName = pauseLocatedHandlers.name,
		targetEvents = EVENT_MAP.get(target),
		targetScope = targetEvents?.[namespace]?.[event]
	;

	assert(isPlainObject(targetScope), `${MODULE_NAME}:${methodName} | invalid targetScope`);

	let handlerScope;
	if( hasValue(delegation) ){
		const delegationScope = targetScope.delegations[`${delegation}`];
		assert(isPlainObject(delegationScope), `${MODULE_NAME}:${methodName} | invalid delegation "${delegation}"`);
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
 */
function pauseDelegatedHandlers(ancestor, delegation, namespace=null, event=null, handler=null, paused=true){
	return pauseHandlers(ancestor, namespace, event, handler, delegation, paused);
}



/*
 * Takes a handler object and a corresponding action, which is not yet aware of its pause state and
 * returns an action function, which checks if the handler is paused, before executing the original action.
 * Using this, we can wrap handler actions to automatically react to the handler's pause state, preventing any
 * handler execution if the handler is currently paused.
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
 */
function compileEventListenerOptions(options){
	if( isA(options, 'boolean') ) return options;
	if( !isA(options, 'object') ) return null;

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
	const methodName = createSyntheticEvent.name;

	event = `${event}`;
	bubbles = orDefault(bubbles, false, 'bool');
	cancelable = orDefault(cancelable, bubbles, 'bool');
	eventOptions = isPlainObject(eventOptions) ? eventOptions : {};

	let e;
	if( isA(EventConstructor, 'function') ){
		if( isPlainObject(payload) ){
			console.warn(`${MODULE_NAME}:${methodName} | can't add payload to event "${EventConstructor.name}", skipping`);
		}
		e = new EventConstructor(event, {bubbles, cancelable, ...eventOptions});
	} else {
		e = isPlainObject(payload)
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
		isA(syntheticTarget, 'array')
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
 * @throws error in case no handler is not a function
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
	const methodName = on.name;

	({targets, events, handler} = prepareEventMethodBaseParams(methodName, targets, events, handler));
	once = !!once || !!options?.once;
	delete options?.once;

	const removers = [];

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(methodName, targets, targetIndex);

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
 * @throws error in case no handler is not a function
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
 * @param {EventTarget|Array<EventTarget>} targets - the target(s) to remove event handlers from
 * @param {String|Array<String>} events - the event name(s) to remove, can be either a single name or a list of names, each name may also have a namespace, separated by a dot, to target all events/namespaces, you may use "*"/"*.*"
 * @param {?Function} [handler=null] - a specific callback function to remove
 * @throws error in case no targets are defined
 * @throws error in case no events are defined
 * @throws error in case no handler is not a function
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
export function off(targets, events, handler=null){
	const methodName = off.name;

	({targets, events, handler} = prepareEventMethodBaseParams(methodName, targets, events, handler, true));

	let removedCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(methodName, targets, targetIndex);

		if( !hasDelegation ){
			const targetEvents = isDelegation ? EVENT_MAP.get(prevTarget) : EVENT_MAP.get(target);

			if( hasValue(targetEvents) ){
				events.forEach(eventName => {
					const {event, namespace} = prepareEventMethodEventInfo(eventName);

					if( isDelegation ){
						removedCount += removeDelegatedHandlers(prevTarget, target, namespace, event, handler);
					} else {
						removedCount += removeHandlers(target, namespace, event, handler);
					}
				});

				cleanUpEventMap(isDelegation ? prevTarget : target);
			}
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
 * @throws error in case no handler is not a function
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
	const methodName = pause.name;

	({targets, events, handler} = prepareEventMethodBaseParams(methodName, targets, events, handler, true));

	let pausedCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(methodName, targets, targetIndex);

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
 * @throws error in case no handler is not a function
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
	const methodName = fire.name;

	({targets, events} = prepareEventMethodBaseParams(methodName, targets, events, null, true));

	let fireCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(methodName, targets, targetIndex);

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
	const methodName = emit.name;

	({targets, events} = prepareEventMethodBaseParams(methodName, targets, events, null, true));

	let emitCount = 0;

	targets.forEach((target, targetIndex) => {
		const {
			prevTarget,
			hasDelegation,
			isDelegation
		} = prepareEventMethodAdditionalTargetInfo(methodName, targets, targetIndex);

		if( !hasDelegation ){
			events.forEach(eventName => {
				const {event, namespace} = prepareEventMethodEventInfo(eventName);

				assert(hasValue(event), `${MODULE_NAME}:${methodName} | missing event name`);

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