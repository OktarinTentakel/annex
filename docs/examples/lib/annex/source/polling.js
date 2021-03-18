/*!
 * Module Polling
 */

/**
 * @namespace Polling
 */

const MODULE_NAME = 'Polling';



import {orDefault, isA, assert, hasValue} from './basic.js';
import {loop, countermand} from './timers.js';



//###( MODULE DATA )###

export const POLLS = {
	defaultLoop : null,
	activePollCount : 0,
	activePolls : {}
};



/**
 * @namespace Polling:poll
 */

const POLL_DEFAULT_LOOP_MS = 250;

/**
 * Waits for a certain program- or DOM-state before executing a certain action. Waiting is implemented via
 * a global timer (and optionally locals as well). If you need to react to a certain case, that's not
 * defined by standard events and reaction does not have to be razor sharp, this is your method.
 * Pick a name for the state/event you want to poll, define a condition closure and an action closure that
 * holds what is to be done in case the condition works out.
 * Polls end or are repeated after an execution of the action depending on the result of the action closure.
 * There can always be only one poll of a certain name, redefining it overwrites the first one.
 *
 * If you need to evaluate a poll out of the line, to trigger a sharp synchronous evaluation due to an event
 * for example, you can use the "fire" method of the poll object itself, which will trigger the condition and all
 * subsequent actions. You can provide a boolean parameter to this function to override manually if the result
 * should be considered changed to the last run. You can only fire polls, that are still active, you can check this
 * state easily via "isActive" on the poll.
 *
 * @param {String} name - name of the state or event you are waiting/polling for
 * @param {Function} fCondition - closure to define the state to wait for, returns true if state exists and false if not
 * @param {Function} fAction - closure to define action to take place if condition is fulfilled, poll removes itself if this evaluates to true, receives Boolean parameter defining if condition result has changed since last call
 * @param {?Function} [fElseAction=null] - closure to define action to take place if condition is not fulfilled, receives Boolean parameter defining if condition result has changed since last call
 * @param {?Number} [newLoopMs=250] - sets interval length from here on, resets global loop if useOwnTimer is not set, otherwise sets local interval for that poll poll
 * @param {?Boolean} [useOwnTimer=false] - has to be true to tell the poll to use an independent local timer instead of the global one, use this if you need different levels of fuzziness for you polls, performance-wise it's better to have less independent intervals running
 * @throws error in case name, fCondition or fAction are missing or unfit to use
 * @returns {Object} new poll - structure: {name, condition, action, elseAction, loop, lastPollResult, isActive, fire()}
 *
 * @memberof Polling:poll
 * @alias poll
 * @see unpoll
 * @example
 * const pollBodyHeightPermanently = poll('permanent-body-height-poll', function(){ return document.body.scrollHeight > 1000; }, function(changed){ console.log(`too high${changed ? ' as of yet' : ''}!`); }, null, 5000);
 * const pollBodyHeightAndStopIfHighEnough = poll('one-time-body-height-poll', function(){ return document.body.scrollHeight > 1000; }, function(){ console.log('high enough!'); return true; }, function(){ console.log('not high enough yet :(') }, null, true);
 */
export function poll(name, fCondition, fAction, fElseAction=null, newLoopMs=POLL_DEFAULT_LOOP_MS, useOwnTimer=false){
	name = orDefault(name, '', 'str').trim();
	fCondition = isA(fCondition, 'function') ? fCondition : null;
	fAction = isA(fAction, 'function') ? fAction : null;
	fElseAction = isA(fElseAction, 'function') ? fElseAction : () => {};
	newLoopMs = orDefault(newLoopMs, POLL_DEFAULT_LOOP_MS, 'int');
	useOwnTimer = orDefault(useOwnTimer, false, 'bool');

	assert(name !== '', `${MODULE_NAME}:poll | "name" is missing`);
	assert(fCondition !== null, `${MODULE_NAME}:poll | "fCondition" is not a function`);
	assert(fAction !== null, `${MODULE_NAME}:poll | "fAction" is not a function`);

	const newPoll = {
		name,
		condition: fCondition,
		action : fAction,
		elseAction : fElseAction,
		loop : null,
		lastPollResult : false,
		isActive : true,
		fire(changed=null){
			if( hasValue(POLLS.activePolls[newPoll.name]) ){
				if( newPoll.condition() ){
					if( newPoll.action(hasValue(changed) ? !!changed : (newPoll.lastPollResult === false)) === true ){
						if( hasValue(newPoll.loop) ){
							countermand(newPoll.loop);
							newPoll.loop = null;
						}
						newPoll.isActive = false;
						delete POLLS.activePolls[newPoll.name];
						POLLS.activePollCount--;
					}
					newPoll.lastPollResult = true;
				} else {
					newPoll.elseAction(hasValue(changed) ? !!changed : (newPoll.lastPollResult === true));
					newPoll.lastPollResult = false;
				}
			}
		}
	};

	if( useOwnTimer ){
		newPoll.loop = loop(newLoopMs, function(){
			newPoll.fire();
		});
	}

	if( hasValue(POLLS.activePolls[name]) ){
		unpoll(name);
	}
	POLLS.activePolls[name] = newPoll;
	POLLS.activePollCount++;

	if(
		(
			!hasValue(POLLS.defaultLoop)
			|| ((newLoopMs !== POLL_DEFAULT_LOOP_MS) && !useOwnTimer)
		)
		&& (POLLS.activePollCount > 0)
	){
		if( hasValue(POLLS.defaultLoop) ){
			countermand(POLLS.defaultLoop);
		}

		POLLS.defaultLoop = loop(newLoopMs, function(){
			if( POLLS.activePollCount > 0 ){
				for( let name in POLLS.activePolls ){
					if( POLLS.activePolls.hasOwnProperty(name) ){
						const poll = POLLS.activePolls[name];
						if( !hasValue(poll.loop) ){
							poll.fire();
						}
					}
				}
			} else {
				countermand(POLLS.defaultLoop);
				POLLS.defaultLoop = null;
			}
		});
	}

	return newPoll;
}



/**
 * @namespace Polling:unpoll
 */

/**
 * Removes an active poll.
 *
 * @param {String|Object} poll - name of the poll to be removed or the poll object itself
 * @returns {Boolean} true if poll has been removed, false if poll has not been found
 *
 * @memberof Polling:unpoll
 * @alias unpoll
 * @see poll
 * @example
 * unpoll('permanent-body-height-poll');
 * unpoll(pollBodyHeightAndStopIfHighEnough);
 */
export function unpoll(poll){
	const name = (isA(poll, 'object') && hasValue(poll.name)) ? `${poll.name}` : `${poll}`.trim();
	if( name === '' ) return false;

	poll = POLLS.activePolls[name];
	if( !hasValue(poll) ) return false;

	if( hasValue(poll.loop) ){
		countermand(poll.loop);
	}

	poll.isActive = false;
	delete POLLS.activePolls[poll.name];
	POLLS.activePollCount--;

	if( POLLS.activePollCount <= 0 ){
		countermand(POLLS.defaultLoop);
		POLLS.defaultLoop = null;
		POLLS.activePollCount = 0;
	}

	return true;
}
