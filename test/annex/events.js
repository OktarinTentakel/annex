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
	emit
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
	document.body.removeChild(foo);

	foo = null;
	bar = null;
	baz = null
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
});



test.serial('off', assert => {
	let	eventsFiredCount, handlersRemoved;
	const
		handler1 = () => { eventsFiredCount++; },
		handler2 = () => { eventsFiredCount++; },
		createScenario = () => {
			eventsFiredCount = 0;
			handlersRemoved = 0;
			on(foo, 'Crash.test.dümmy', handler1);
			on(foo, ['CRASH.test', 'crAsh.site', 'crash.dÚmmy'], handler1);
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
	handlersRemoved += off(foo, 'crash');
	assert.is(EVENT_MAP.size, 1);
	handlersRemoved += off([foo, 'a'], 'click');
	handlersRemoved += off([foo, '.btn[data-foobar="test"]'], '*.delegated', handler2);
	assert.is(EVENT_MAP.size, 0);
	assert.is(handlersRemoved, 8);
	foo.dispatchEvent(new CustomEvent('crash'));
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
			on(foo, 'Crash.test.dümmy', handler1);
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
});



test.serial('resume', assert => {
	let	eventsFiredCount, handlersPaused;
	const
		handler1 = () => { eventsFiredCount++; },
		handler2 = () => { eventsFiredCount++; },
		createScenario = () => {
			eventsFiredCount = 0;
			handlersPaused = 0;
			on(foo, 'Crash.test.dümmy', handler1);
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
			on(foo, 'Crash.test.dümmy', handler1);
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
			on(foo, 'click.test', handler1)
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
});