import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.polling;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/polling.js`);
}

const {
	poll,
	unpoll,
	POLLS
} = pkg;



test.cb('poll', assert => {
	let
		foo = 0,
		bar = 0,
		firedCounter = 0,
		changedCounter = 0,
		elseCounter = 0,
		elseChangedCounter = 0
	;

	const fooPoll = poll(
		'foo-poll',
		() => {
			return (foo > 0) && (foo < 3);
		},
		changed => {
			firedCounter++;
			if( changed ){
				changedCounter++;
			}
		},
		changed => {
			elseCounter++;
			if( changed ){
				elseChangedCounter++;
			}
		},
		240
	);

	const barPoll = poll(
		'bar-poll',
		() => {
			return foo > 0;
		},
		() => {
			bar++;
			if( foo > 1 ){
				return true;
			}
		},
		null,
		110,
		true
	);

	window.setTimeout(() => {
		foo++;
		fooPoll.fire();
		barPoll.fire();
	}, 250);

	window.setTimeout(() => {
		foo++;
		fooPoll.fire(true);
		barPoll.fire();
		assert.false(barPoll.isActive);
	}, 500);

	window.setTimeout(() => {
		foo++;
		fooPoll.fire(false);
	}, 750);

	window.setTimeout(() => {
		assert.true(fooPoll.isActive);
		assert.is(foo, 3);
		assert.is(firedCounter, 4);
		assert.is(changedCounter, 2);
		assert.is(elseCounter, 7);
		assert.is(elseChangedCounter, 0);
		assert.is(bar, 4);
		assert.end();
	}, 2000);
});



test.cb('unpoll', assert => {
	let
		foo = 0,
		bar = false,
		baz = false,
		foobar = false,
		boo = 0
	;

	const fooPoll2 = poll(
		'foo-poll2',
		() => {
			return (foo > 0) && (foo < 3);
		},
		() => {
			boo++;
		},
		null,
		240
	);

	window.setTimeout(() => {
		foo++;
		bar = unpoll('bar-poll2');
		assert.true(fooPoll2.isActive);
	}, 250);

	window.setTimeout(() => {
		foo++;
		foobar = unpoll(fooPoll2);
		assert.false(fooPoll2.isActive);
	}, 500);

	window.setTimeout(() => {
		foo++;
		assert.is(POLLS.activePollCount, 1);
		assert.is(Object.keys(POLLS.activePolls).length, 1);
		assert.deepEqual(Object.keys(POLLS.activePolls), ['foo-poll']);
	}, 750);

	window.setTimeout(() => {
		baz = unpoll('foo-poll');
		assert.is(foo, 3);
		assert.is(boo, 1);
		assert.true(baz);
		assert.false(bar);
		assert.true(foobar);
		assert.is(POLLS.activePollCount, 0);
		assert.is(Object.keys(POLLS.activePolls).length, 0);
		assert.end();
	}, 2000);
});
