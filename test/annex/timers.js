import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.timers;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/timers.js`);
}

const {
	schedule,
	pschedule,
	reschedule,
	loop,
	ploop,
	countermand,
	requestAnimationFrame,
	cancelAnimationFrame,
	waitForRepaint
} = pkg;



test('schedule', assert => new Promise(resolve => {
	let
		finished = 0,
		i = 0,
		foo,
		bar
	;

	schedule('1000ms', () => {
		finished++;
	});

	for( i = 0; i < 100; i++ ){
		foo = schedule(42, () => {
			finished++;
		}, foo);
	}

	bar = false;
	try {
		schedule(666, 'I am not a function :(');
	} catch(ex){
		bar = true;
	}

	window.setTimeout(() => {
		assert.is(finished, 2);
		assert.true(bar);
		resolve();
	}, 2000);
}));



test('pschedule', assert => new Promise(resolve => {
	let
		finished = 0,
		i = 0,
		foo,
		bar
	;

	pschedule('1000ms', () => {
		finished++;
	});

	for( i = 0; i < 100; i++ ){
		foo = pschedule(42, () => {
			finished++;
		}, foo);
	}

	bar = false;
	try {
		pschedule(666, 'I am not a function :(');
	} catch(ex){
		bar = true;
	}

	window.setTimeout(() => {
		assert.is(finished, 2);
		assert.true(bar);
		resolve();
	}, 2000);
}));



test('reschedule', assert => new Promise(resolve => {
	let
		finished = 0,
		i = 0,
		foo,
		bar
	;

	reschedule(null, 1000, () => {
		finished++;
	});

	for( i = 0; i < 100; i++ ){
		foo = reschedule(foo, 42, () => {
			finished++;
		});
	}

	bar = false;
	try {
		reschedule(foo, 666, 'I am not a function :(');
	} catch(ex){
		bar = true;
	}

	window.setTimeout(() => {
		assert.is(finished, 2);
		assert.true(bar);
		resolve();
	}, 2000);
}));



test('loop', assert => new Promise(resolve => {
	let
		finished = 0,
		foo,
		bar
	;

	foo = loop(100, () => {
		finished++;
	});

	window.setTimeout(() => {
		foo = loop(100, () => {
			finished++;
		}, foo);
	}, 550);

	window.setTimeout(() => {
		countermand(foo);
	}, 1000);

	bar = false;
	try {
		loop(666, 'I am not a function :(');
	} catch(ex){
		bar = true;
	}

	window.setTimeout(() => {
		assert.true(finished >= 8 && finished <= 10);
		assert.true(bar);
		resolve();
	}, 2000);
}));



test('ploop', assert => new Promise(resolve => {
	let
		finished = 0,
		foo,
		bar
	;

	foo = ploop(100, () => {
		finished++;
	});

	window.setTimeout(() => {
		foo = ploop(100, () => {
			finished++;
		}, foo);
	}, 590);

	window.setTimeout(() => {
		countermand(foo);
	}, 1100);

	bar = false;
	try {
		loop(666, 'I am not a function :(');
	} catch(ex){
		bar = true;
	}

	window.setTimeout(() => {
		assert.true(finished >= 8 && finished <= 10);
		assert.true(bar);
		resolve();
	}, 2000);
}));



test('countermand', assert => new Promise(resolve => {
	let finished = 0,
		foo = schedule(1000, () => { finished++; }),
		bar = pschedule(1000, () => { finished++; }),
		foobar = window.setTimeout(() => { finished++; }, 1000),
		boo = loop(1000, () => { finished++; }),
		far = ploop(1000, () => { finished++; }),
		boofar = window.setInterval(() => { finished++; }, 1000),
		farfar = schedule(100, () => { finished++; }),
		booboo = true;

	countermand(foo);
	countermand(bar);
	countermand(foobar);
	countermand(boo);
	countermand(far);
	countermand(boofar);

	try {
		countermand(null);
	} catch(ex){
		booboo = false;
	}

	window.setTimeout(() => {
		countermand(farfar);
	}, 500);

	window.setTimeout(() => {
		assert.is(finished, 1);
		assert.true(booboo);
		resolve();
	}, 2000);
}));



test('requestAnimationFrame', assert => new Promise(resolve => {
	let finished = 0;

	requestAnimationFrame(() => {
		finished++;
	});

	requestAnimationFrame(() => {
		finished++;
	});

	requestAnimationFrame(() => {
		finished++;
		assert.is(finished, 3);
		resolve();
	});
}));



test('cancelAnimationFrame', assert => new Promise(resolve => {
	let
		finished = 0,
		foo,
		bar
	;

	foo = requestAnimationFrame(() => {
		finished++;
	});
	cancelAnimationFrame(foo);
	foo = requestAnimationFrame(() => {
		finished++;
	});

	bar = requestAnimationFrame(() => {
		finished++;
	});
	cancelAnimationFrame(bar);
	bar = requestAnimationFrame(() => {
		finished++;
	});

	requestAnimationFrame(() => {
		finished++;
		assert.is(finished, 3);
		resolve();
	});
}));



test('waitForRepaint', assert => new Promise(resolve => {
	let
		finished = 0,
		foo,
		bar
	;

	foo = waitForRepaint(() => {
		finished++;
	});

	bar = waitForRepaint(() => {
		finished++;
	});

	cancelAnimationFrame(bar.outer);
	if( bar.inner ){
		cancelAnimationFrame(bar.inner);
	}

	waitForRepaint(() => {
		finished++;
		assert.is(finished, 2);
		resolve();
	});
}));
