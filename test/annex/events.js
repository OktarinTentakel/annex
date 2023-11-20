import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.events;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/events.js`);
}

const {
	EVENT_MAP,
	on,
	off,
	once,
	pause,
	resume,
	fire,
	emit,
	offDetachedElements,
	POST_MESSAGE_MAP,
	onPostMessage,
	offPostMessage,
	emitPostMessage
} = pkg;



let foo, bar, baz;

test.beforeEach(() => {
	foo = document.createElement('div');
	bar = document.createElement('a');
	baz = document.createElement('button');

	baz.classList.add('btn');
	baz.setAttribute('data-foobar', 'test');

	foo.appendChild(bar);
	foo.appendChild(baz);
	document.body.appendChild(foo);
});

test.afterEach(() => {
	try {
		document.body.removeChild(foo);
	} catch(ex){}

	foo = null;
	bar = null;
	baz = null;
});



test.serial('on', assert => {
	let
		eventsFiredCount = 0,
		removers = []
	;

	// 1 execution
	removers = removers.concat(on(foo, 'crash.test', () => {
		eventsFiredCount++;
	}, true));

	// 2 executions
	removers = removers.concat(on(bar, 'click', e => {
		e.stopPropagation();
		eventsFiredCount++;
	}, {capture : true}));

	// 0 executions (since click on bar stops propagation)
	removers = removers.concat(on([foo, 'a'], 'click', () => {
		eventsFiredCount++;
	}));

	// 1 execution (handler is set to "once")
	removers = removers.concat(on(baz, 'click', () => {
		eventsFiredCount++;
	}, {passive : true, once : true}));

	// 1 execution (handler is set to "once")
	removers = removers.concat(on([foo, '.btn[data-foobar="test"]'], 'click', () => {
		eventsFiredCount++;
	}, null, true));

	// 2 executions (synthetic CustomEvent does not bubble, two clicks have stopped propagations)
	const documentBodyRemover = on(document.body, ['click', 'crash'], () => {
		eventsFiredCount++;
	});
	removers = removers.concat(documentBodyRemover);

	// 7 executions (two clicks should not bubble, due to stopPropagation)
	removers = removers.concat(on([foo, foo, 'button', bar], ['click', 'crash'], () => {
		eventsFiredCount++;
	}));

	// before baz is clicked, we should have one entry more, since the only handler for baz should self-destroy
	// and clean up the path up to the map afterwards as well
	assert.is(EVENT_MAP.size, 4);

	foo.dispatchEvent(new CustomEvent('crash'));
	bar.click();
	baz.click();
	bar.click();
	baz.click();

	assert.is(eventsFiredCount, 1 + 2 + 0 + 1 + 1 + 2 + 7);

	assert.is(EVENT_MAP.size, 3);
	documentBodyRemover();
	assert.is(EVENT_MAP.size, 2);
	removers.forEach(remover => { remover(); });
	assert.is(EVENT_MAP.size, 0);
});



test.serial('once', assert => {
	let
		eventsFiredCount = 0,
		removers = []
	;

	// 1 execution
	removers = removers.concat(once(foo, 'crash.test', () => {
		eventsFiredCount++;
	}));

	// 1 execution
	removers = removers.concat(once(bar, 'click', e => {
		e.stopPropagation();
		eventsFiredCount++;
	}));

	// 1 execution (should execute on second click, since stopPropagation handle should have self-destroyed on first)
	removers = removers.concat(once([foo, 'a'], 'click', () => {
		eventsFiredCount++;
	}));

	// 1 execution
	removers = removers.concat(once(baz, 'click', () => {
		eventsFiredCount++;
	}, {passive : true}));

	// 1 execution
	removers = removers.concat(once([foo, '.btn[data-foobar="test"]'], 'click', () => {
		eventsFiredCount++;
	}));

	// 1 execution (crash does not bubble)
	removers = removers.concat(once(document.body, ['click', 'crash'], () => {
		eventsFiredCount++;
	}));

	// 4 executions (crash on bar and baz never fire)
	removers = removers.concat(once([foo, foo, 'button', bar], ['click', 'crash'], () => {
		eventsFiredCount++;
	}));

	assert.is(EVENT_MAP.size, 4);

	foo.dispatchEvent(new CustomEvent('crash'));
	bar.click();
	baz.click();
	bar.click();
	baz.click();

	assert.is(eventsFiredCount, 1 + 1 + 1 + 1 + 1 + 1 + 4);

	// there should be trailing crash registrations for bar and baz
	// since the link and the button never receive the events
	assert.is(EVENT_MAP.size, 3);
	bar.dispatchEvent(new CustomEvent('crash'));
	baz.dispatchEvent(new CustomEvent('crash'));
	document.body.dispatchEvent(new CustomEvent('crash'));
	// last crash registration should be on the div as a delegation, since CustomEvent does not bubble
	// and therefore the dispatch on baz, should never reach the handler
	assert.is(EVENT_MAP.size, 1);
	removers.forEach(remover => { remover(); });
	assert.is(EVENT_MAP.size, 0);

	let failed = false;
	window.onerror = () => { failed = true; };
	once(foo, 'burn', () => {
		off(foo, 'burn');
	});
	foo.dispatchEvent(new CustomEvent('burn'));
	assert.false(failed);
	window.onerror = null;
	assert.is(EVENT_MAP.size, 0);
});



test.serial('off', assert => {
	let	eventsFiredCount, handlersRemoved;
	const
		handler1 = () => { eventsFiredCount++; },
		handler2 = () => { eventsFiredCount++; },
		createScenario = () => {
			eventsFiredCount = 0;
			handlersRemoved = 0;
			on(foo, 'Cra_:_sh.test.dûmmy', handler1);
			on(foo, ['CRA_:_SH.test', 'crA_:_sh.site', 'cra_:_sh.dÚmmy'], handler1);
			on([foo, 'a', foo, '.btn[data-foobar="test"]'], 'click.delegated', handler2);
			on([bar, baz], 'click', handler2);
		}
	;

	createScenario();
	assert.is(EVENT_MAP.size, 3);
	handlersRemoved += off(baz, 'click');
	assert.is(EVENT_MAP.size, 2);
	handlersRemoved += off(bar, '*.__default');
	assert.is(EVENT_MAP.size, 1);
	handlersRemoved += off(foo, 'cra_:_sh');
	assert.is(EVENT_MAP.size, 1);
	handlersRemoved += off([foo, 'a'], 'click');
	handlersRemoved += off([foo, '.btn[data-foobar="test"]'], '*.delegated', handler2);
console.log(EVENT_MAP);
	assert.is(EVENT_MAP.size, 0);
	assert.is(handlersRemoved, 8);
	foo.dispatchEvent(new CustomEvent('cra_:_sh'));
	bar.click();
	baz.click();
	assert.is(eventsFiredCount, 0);

	createScenario();
	assert.is(EVENT_MAP.size, 3);
	assert.is(off(bar, '*', handler1), 0);
	assert.is(EVENT_MAP.size, 3);
	assert.is(off(bar, '*', handler2), 1);
	assert.is(EVENT_MAP.size, 2);
	assert.is(off(foo, ['*.test', '*.site', '*.dummy', '*.test.dummy']), 4);
	assert.is(off([foo, 'a', foo, '.btn[data-foobar="test"]'], '*.*', handler2), 2);
	assert.is(EVENT_MAP.size, 1);
	assert.is(off(baz, '*.*'), 1);
	assert.is(EVENT_MAP.size, 0);

	assert.is(off(bar, '*'), 0);
});



test.serial('pause', assert => {
	let	eventsFiredCount, handlersPaused;
	const
		handler1 = () => { eventsFiredCount++; },
		handler2 = () => { eventsFiredCount++; },
		createScenario = () => {
			eventsFiredCount = 0;
			handlersPaused = 0;
			on(foo, 'Crash.test.dûmmy', handler1);
			on(foo, ['CRASH.test', 'crAsh.site', 'crash.dÚmmy'], handler1);
			on([foo, 'a', foo, '.btn[data-foobar="test"]'], 'click.delegated', handler2);
			on([bar, baz], 'click', handler2);
		}
	;

	createScenario();
	handlersPaused += pause(baz, 'click');
	handlersPaused += pause(bar, '*.__default');
	handlersPaused += pause(foo, 'crash');
	handlersPaused += pause([foo, 'a'], 'click');
	handlersPaused += pause([foo, '.btn[data-foobar="test"]'], '*.delegated', handler2);
	assert.is(handlersPaused, 8);
	foo.dispatchEvent(new CustomEvent('crash'));
	bar.click();
	baz.click();
	assert.is(eventsFiredCount, 0);

	assert.is(pause(baz, 'foobar'), 0);

	off([foo, foo, 'a', foo, '.btn[data-foobar="test"]', bar, baz], '*');
	assert.is(EVENT_MAP.size, 0);
});



test.serial('resume', assert => {
	let	eventsFiredCount, handlersPaused;
	const
		handler1 = () => { eventsFiredCount++; },
		handler2 = () => { eventsFiredCount++; },
		createScenario = () => {
			eventsFiredCount = 0;
			handlersPaused = 0;
			on(foo, 'Crash.test.dûmmy', handler1);
			on(foo, ['CRASH.test', 'crAsh.site', 'crash.dÚmmy'], handler1);
			on([foo, 'a', foo, '.btn[data-foobar="test"]'], 'click.delegated', handler2);
			on([bar, baz], 'click', handler2);
		}
	;

	createScenario();
	handlersPaused += pause(baz, 'click');
	handlersPaused += pause(bar, '*.__default');
	handlersPaused += pause(foo, 'crash');
	handlersPaused += pause([foo, 'a'], 'click');
	handlersPaused += pause([foo, '.btn[data-foobar="test"]'], '*.delegated', handler2);
	assert.is(handlersPaused, 8);
	foo.dispatchEvent(new CustomEvent('crash'));
	bar.click();
	baz.click();
	assert.is(eventsFiredCount, 0);

	assert.is(resume(bar, '*', handler1), 0);
	assert.is(resume(bar, '*', handler2), 1);
	assert.is(resume(foo, ['*.test', '*.site']), 2);
	assert.is(resume([foo, 'a', foo, '.btn[data-foobar="test"]'], '*.*', handler2), 2);
	assert.is(resume(baz, '*.*'), 1);
	foo.dispatchEvent(new CustomEvent('crash'));
	bar.click();
	baz.click();
	assert.is(eventsFiredCount, 6);

	assert.is(resume(baz, 'foobar'), 0);

	off([foo, foo, 'a', foo, '.btn[data-foobar="test"]', bar, baz], '*');
	assert.is(EVENT_MAP.size, 0);
});



test.serial('fire', assert => {
	let	eventsFiredCount, handlersFired, payloadsReceived;
	const
		handler1 = e => {
			eventsFiredCount++;
			if( e.detail?.foo )	payloadsReceived++;
		},
		handler2 = e => {
			eventsFiredCount++;
			if( e.detail?.foo )	payloadsReceived++;
		},
		payload1 = {foo : 1, bar : 2},
		payload2 = {foo : new Date()},
		createScenario = () => {
			eventsFiredCount = 0;
			handlersFired = 0;
			payloadsReceived = 0;
			on(foo, 'Crash.test.dûmmy', handler1);
			on(foo, ['CRASH.test', 'crAsh.site', 'crash.dÚmmy'], handler1);
			on([foo, 'a', foo, '.btn[data-foobar="test"]'], 'click.delegated', handler2);
			on([bar, baz], 'click', handler2);
			on(document.body, ['click', 'crash'], handler2);
		}
	;

	createScenario();
	handlersFired += fire(baz, 'click');
	handlersFired += fire(bar, '*.__default', payload1);
	handlersFired += fire(foo, 'crash');
	handlersFired += fire([foo, 'a'], 'click', payload1);
	handlersFired += fire([foo, '.btn[data-foobar="test"]'], '*.delegated');
	assert.is(handlersFired, 8);
	assert.is(eventsFiredCount, 8);
	assert.is(payloadsReceived, 2);

	eventsFiredCount = 0;
	payloadsReceived = 0;
	assert.is(fire(bar, '*'), 1);
	assert.is(fire(foo, ['*.test', '*.site'], payload2), 2);
	assert.is(fire([foo, 'a', foo, '.btn[data-foobar="test"]'], '*.*'), 2);
	assert.is(fire(baz, '*.*', payload2), 1);
	assert.is(eventsFiredCount, 6);
	assert.is(payloadsReceived, 3);

	assert.is(fire(baz, 'foobar'), 0);

	off([document.body, foo, foo, 'a', foo, '.btn[data-foobar="test"]', bar, baz], '*');
	assert.is(EVENT_MAP.size, 0);
});



test.serial('emit', assert => {
	let	eventsFiredCount, eventsEmitted, payloadsReceived;
	const
		handler1 = e => {
			eventsFiredCount++;
			if( e.detail?.foo )	payloadsReceived++;
		},
		handler2 = e => {
			eventsFiredCount++;
			if( e.detail?.foo )	payloadsReceived++;
		},
		payload1 = {foo : 1, bar : 2},
		payload2 = {foo : new Date()},
		createScenario = () => {
			eventsFiredCount = 0;
			eventsEmitted = 0;
			payloadsReceived = 0;
			on(foo, 'Crash.test.dümmy', handler1);
			on(foo, ['CRASH.test', 'crAsh.site', 'crash.dÚmmy'], handler1);
			on([foo, 'a', foo, '.btn[data-foobar="test"]'], 'click.delegated', handler2);
			on([bar, baz], 'click', handler2);
			on(document.body, ['click', 'crash'], handler2);
			on(foo, 'click.test', handler1);
		}
	;

	createScenario();
	eventsEmitted += emit([baz, foo, 'a'], 'click');
	eventsEmitted += emit(bar, 'click.__default', payload1);
	eventsEmitted += emit([foo, document.body], 'crash');
	eventsEmitted += emit([foo, 'a'], 'click', payload1);
	eventsEmitted += emit([foo, '.btn[data-foobar="test"]'], 'click.delegated');
	assert.is(eventsEmitted, 7);
	assert.is(eventsFiredCount, 8 + 4 + 6 + 4 + 4);
	assert.is(payloadsReceived, 4 + 4);

	eventsFiredCount = 0;
	payloadsReceived = 0;
	assert.is(emit(bar, 'click'), 1);
	assert.is(emit(foo, ['crash.test', 'crash.site'], payload2), 2);
	assert.is(emit([foo, 'a', foo, '.btn[data-foobar="test"]'], 'click.delegated', null, null, {bubbles : false}), 2);
	assert.is(emit(baz, 'click.*', payload2, MouseEvent, {bubbles : false}), 1);
	assert.is(eventsFiredCount, 4 + 10 + 2 + 1);
	assert.is(payloadsReceived, 10);
	assert.throws(() => { emit(bar, '*.__default'); });

	assert.is(emit(baz, 'foobar'), 1);

	off([document.body, foo, foo, 'a', foo, '.btn[data-foobar="test"]', bar, baz], '*');
	assert.is(EVENT_MAP.size, 0);
});



test.serial('offDetachedElements', assert => {
	let eventsFiredCount = 0;
	const
		handler = () => {
			eventsFiredCount++;
		},
		createScenario = () => {
			on(foo, 'Crash.test.dümmy', handler);
			on(foo, ['CRASH.test', 'crAsh.site', 'crash.dÚmmy'], handler);
			on([foo, 'a', foo, '.btn[data-foobar="test"]'], 'click.delegated', handler);
			on([bar, baz], 'click', handler);
			on(document.body, ['click', 'crash'], handler);
			on(foo, 'click.test', handler);
		}
	;

	createScenario();
	assert.is(offDetachedElements(), 0);
	foo.removeChild(baz);
	assert.is(offDetachedElements([foo, bar, baz]), 1);
	document.body.removeChild(foo);
	assert.is(offDetachedElements(bar), 1);
	bar.dispatchEvent(new CustomEvent('click'));
	foo.dispatchEvent(new CustomEvent('click'));
	assert.is(eventsFiredCount, 1);
	document.body.appendChild(foo);
	foo.dispatchEvent(new CustomEvent('click'));
	assert.is(eventsFiredCount, 2);
	assert.is(offDetachedElements(foo), 0);
	foo.dispatchEvent(new CustomEvent('click'));
	assert.is(eventsFiredCount, 3);
	document.body.removeChild(foo);
	assert.is(offDetachedElements(), 1);
	foo.dispatchEvent(new CustomEvent('click'));
	baz.dispatchEvent(new CustomEvent('click'));
	assert.is(eventsFiredCount, 3);

	off([document.body, foo, foo, 'a', foo, '.btn[data-foobar="test"]', bar, baz], '*', null, false);
	assert.is(EVENT_MAP.size, 0);

	foo.appendChild(bar);
	foo.appendChild(baz);
	document.body.appendChild(foo);
	createScenario();
	document.body.removeChild(foo);
	assert.is(offDetachedElements(), 3);

	off([document.body, foo, foo, 'a', foo, '.btn[data-foobar="test"]', bar, baz], '*', null, false);
	assert.is(EVENT_MAP.size, 0);
});



test.serial('onPostMessage & offPostMessage & emitPostMessage', assert => {
	assert.throws(() => {
		onPostMessage({}, '*', 'foobar', () => {});
	});

	assert.throws(() => {
		offPostMessage({});
	});

	assert.throws(() => {
		emitPostMessage({}, '*', 'foobar');
	});

	let foobar2remover, boofar3Handler, foobar5Handler1, foobar5Handler2;

	return Promise.all([
		new Promise(resolve => {
			onPostMessage(window, '*', 'foobar-1', resolve);
			window.postMessage({type : 'foobar-1'}, '*');
		}),
		new Promise(resolve => {
			foobar2remover = onPostMessage(window, 'https://devtest.ifschleife.de/', 'foobar-2', resolve);
			window.postMessage({type : 'foobar-2'}, window.location.origin);
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(resolve, 250);
			boofar3Handler = reject;
			onPostMessage(window, '*', 'boofar-3', boofar3Handler);
			window.postMessage({type : 'foobar-3'}, '*');
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(resolve, 250);
			onPostMessage(window, 'https://devtest.ifschleife.com/', 'boofar-4', reject);
			window.postMessage({type : 'foobar-4'}, window.location.origin);
		}),
		new Promise(resolve => {
			foobar5Handler1 = e => {
				if(
					(e.data.type === 'foobar-5')
					&& e.data.payload.timestamp
					&& (typeof e.data.payload.timestamp.getTime === 'function')
					&& (e.data.payload.list[2] === true)
				){
					resolve();
				}
			};
			onPostMessage(window, '*', 'foobar-5', foobar5Handler1);
			emitPostMessage(window, '*', 'foobar-5', {
				timestamp : new Date(),
				list : [1, 2, true]
			});
		}),
		new Promise(resolve => {
			foobar5Handler2 = e => {
				if(
					(e.data.type === 'foobar-5')
					&& e.data.payload.a
					&& (e.data.payload.a.b.c === 'd')
				){
					resolve();
				}
			};
			onPostMessage(window, 'https://devtest.ifschleife.de/', 'foobar-5', foobar5Handler2);
			emitPostMessage(window, window.location.origin, 'foobar-5', {a : {b : {c : 'd'}}});
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(() => {
				const
					expectedSize = 1,
					size = POST_MESSAGE_MAP.size
				;
				if( size === expectedSize ){
					resolve();
				} else {
					reject(new Error(`wrong size ${size}, should be ${expectedSize}`));
				}
			}, 1);
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(() => {
				const
					expectedSize = 5,
					size = Object.keys(POST_MESSAGE_MAP.get(window)).length
				;
				if( size === expectedSize ){
					resolve();
				} else {
					reject(new Error(`wrong size ${size}, should be ${expectedSize}`));
				}
			}, 1);
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(() => {
				const
					expectedSize = 2,
					size = POST_MESSAGE_MAP.get(window)['foobar-5'].length
				;
				if( size === expectedSize ){
					resolve();
				} else {
					reject(new Error(`wrong size ${size}, should be ${expectedSize}`));
				}
			}, 1);
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(() => {
				let offCount = 0;
				offCount += offPostMessage(window, '*', 'foobar-1');
				offCount += 1; foobar2remover();
				offCount += offPostMessage(window, 'nope', 'boofar-3');
				offCount += offPostMessage(window, null, 'boofar-4');
				offCount += offPostMessage(window, null, null, foobar5Handler1);

				const
					expectedSize = 2,
					expectedOffCount = 4,
					size = Object.keys(POST_MESSAGE_MAP.get(window)).length
				;
				if( (size === expectedSize) && (offCount === expectedOffCount) ){
					resolve();
				} else if( size !== expectedSize ){
					reject(new Error(`wrong size ${size}, should be ${expectedSize}`));
				} else if( offCount !== expectedOffCount ){
					reject(new Error(`wrong offCount ${offCount}, should be ${expectedOffCount}`));
				}
			}, 100);
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(() => {
				const
					expectedSize = 1,
					size = POST_MESSAGE_MAP.get(window)['foobar-5'].length
				;
				if( size === expectedSize ){
					resolve();
				} else {
					reject(new Error(`wrong size ${size}, should be ${expectedSize}`));
				}
			}, 200);
		}),
		new Promise((resolve, reject) => {
			window.setTimeout(() => {
				offPostMessage(window, 'https://devtest.ifschleife.de/', null, foobar5Handler2);
				offPostMessage(window, '*', 'boofar-3', boofar3Handler);

				if( POST_MESSAGE_MAP.get(window) === undefined ){
					resolve();
				} else {
					reject(new Error('POST_MESSAGE_MAP not cleared after handler removal'));
				}
			}, 300);
		}),
	]);
});
