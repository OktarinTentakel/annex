import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.arrays;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/arrays.js`);
}

const {
	removeFrom
} = pkg;



test('removeFrom', assert => {
	const
		foo = [1, 2, {a : 'b'}, [1, 2, 3], 4],
		bar = {foo : 'bar'}
	;

	assert.deepEqual(removeFrom(foo, 0, 2), [[1, 2, 3], 4]);
	assert.deepEqual(removeFrom(foo, -3, -2), [1, 2, 4]);
	assert.deepEqual(removeFrom(foo, -1), [1, 2, {a : 'b'}, [1, 2, 3]]);
	assert.deepEqual(removeFrom(foo, 3), [1, 2, {a : 'b'}, 4]);
	assert.deepEqual(removeFrom(foo, 3, -1), [1, 2, {a : 'b'}]);
	assert.throws(function(){ removeFrom({a : 1}, -1); });
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return this.a; }}, 'bar', bar, 1], 'bar'), [bar, 1]);
	assert.deepEqual(removeFrom([{a : 'bar'}, 'bar', bar, 1], bar), [{a : 'bar'}, 'bar', 1]);
	assert.deepEqual(removeFrom([true, true, false, true, true], true), [false]);
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], ['bar', bar, 2], true), [1]);
	assert.deepEqual(removeFrom([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], {a : 'bar', b : bar, c : 2}, true), [1]);
	assert.deepEqual(removeFrom([1, 2, 3, 4, 5, 'a', true, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], true), ['a', true]);
});
