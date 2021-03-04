import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.arrays;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/arrays.js`);
}

const {
	remove
} = pkg;



test('remove', assert => {
	const
		foo = [1, 2, {a : 'b'}, [1, 2, 3], 4],
		bar = {foo : 'bar'}
	;

	assert.deepEqual(remove(foo, 0, 2), [[1, 2, 3], 4]);
	assert.deepEqual(remove(foo, -3, -2), [1, 2, 4]);
	assert.deepEqual(remove(foo, -1), [1, 2, {a : 'b'}, [1, 2, 3]]);
	assert.deepEqual(remove(foo, 3), [1, 2, {a : 'b'}, 4]);
	assert.deepEqual(remove(foo, 3, -1), [1, 2, {a : 'b'}]);
	assert.throws(function(){ remove({a : 1}, -1); });
	assert.deepEqual(remove([{a : 'bar', toString(){ return this.a; }}, 'bar', bar, 1], 'bar'), [bar, 1]);
	assert.deepEqual(remove([{a : 'bar'}, 'bar', bar, 1], bar), [{a : 'bar'}, 'bar', 1]);
	assert.deepEqual(remove([true, true, false, true, true], true), [false]);
	assert.deepEqual(remove([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], ['bar', bar, 2], true), [1]);
	assert.deepEqual(remove([{a : 'bar', toString(){ return 'bar'; }}, 'bar', bar, 1, 2], {a : 'bar', b : bar, c : 2}, true), [1]);
	assert.deepEqual(remove([1, 2, 3, 4, 5, 'a', true, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], true), ['a', true]);
});
