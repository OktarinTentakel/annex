import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.arrays;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/arrays.js`);
}

const {
	removeFrom,
	generateRange
} = pkg;



test('removeFrom', assert => {
	const
		oneTwoThree = [1, 2, 3],
		foo = [1, 2, {a : 'b'}, oneTwoThree, 4],
		bar = {foo : 'bar'}
	;

	assert.deepEqual(removeFrom(foo, 0, 2), [[1, 2, 3], 4]);
	assert.deepEqual(removeFrom(foo, -3, -2), [1, 2, 4]);
	assert.deepEqual(removeFrom(foo, -1), [1, 2, {a : 'b'}, [1, 2, 3]]);
	assert.deepEqual(removeFrom(foo, 3), [1, 2, {a : 'b'}, 4]);
	assert.deepEqual(removeFrom(foo, 3, -1), [1, 2, {a : 'b'}]);
	assert.deepEqual(removeFrom(foo, oneTwoThree, true), [1, 2, {a : 'b'}, 4]);
	assert.throws(() => { removeFrom({a : 1}, -1); });
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return this.a; }}, 'bar', bar, 1], 'bar'), [bar, 1]);
	assert.deepEqual(removeFrom([{a : 'bar'}, 'bar', bar, 1], bar, true), [{a : 'bar'}, 'bar', 1]);
	assert.deepEqual(removeFrom([true, true, false, true, true], true), [false]);
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], ['bar', bar, 2]), [1]);
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], {a : 'bar', b : bar, c : 2}), [1]);
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], new Set(['bar', bar, 2])), [1]);
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], new Map([['a', 'bar'], ['b', bar], ['c', 2]])), [1]);
	assert.deepEqual(removeFrom([1, 2, 3, 4, 5, 'a', true, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), ['a', true]);
});



test('generateRange', assert => {
	assert.deepEqual(generateRange(0, 10, 2), [0, 2, 4, 6, 8, 10]);
	assert.deepEqual(generateRange(5, -5, 3.5), [5, 1.5, -2]);
	assert.deepEqual(generateRange('a', 'g', 3), ['a', 'd', 'g']);
	assert.deepEqual(generateRange(105, 'ggg'), ['i', 'h', 'g']);
	assert.throws(() => { generateRange('a', '', 3) });
});
