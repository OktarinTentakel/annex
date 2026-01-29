import type {ExecutionContext} from 'ava';

import test from 'ava';

import {arrays as _} from './_implementations.ts';



test('removeFrom', (assert:ExecutionContext):void => {
	const
		oneTwoThree:Array<number> = [1, 2, 3],
		foo:Array<any> = [1, 2, {a : 'b'}, oneTwoThree, 4],
		bar:Record<string,string> = {foo : 'bar'}
	;

	assert.deepEqual(
		_.removeFrom(foo, 0, 2),
		[[1, 2, 3], 4]
	);

	assert.deepEqual(
		_.removeFrom(foo, -3, -2),
		[1, 2, 4]
	);

	assert.deepEqual(
		_.removeFrom(foo, -1),
		[1, 2, {a : 'b'}, [1, 2, 3]]
	);

	assert.deepEqual(
		_.removeFrom(foo, 3),
		[1, 2, {a : 'b'}, 4]
	);

	assert.deepEqual(
		_.removeFrom(foo, 3, -1),
		[1, 2, {a : 'b'}]
	);

	assert.deepEqual(
		_.removeFrom(foo, oneTwoThree, true),
		[1, 2, {a : 'b'}, 4]
	);

	assert.throws(():void => {
		// @ts-ignore
		_.removeFrom({a : 1}, -1);
	});

	assert.deepEqual(
		_.removeFrom(
			[{a : 'bar', toString():string{ return this.a; }}, 'bar', bar, 1],
			'bar'
		),
		[bar, 1]
	);

	assert.deepEqual(
		_.removeFrom([{a : 'bar'}, 'bar', bar, 1], bar, true),
		[{a : 'bar'}, 'bar', 1]
	);

	assert.deepEqual(
		_.removeFrom([true, true, false, true, true], true),
		[false]
	);

	assert.deepEqual(
		_.removeFrom(
			[{a : 'bar', toString():string{ return 'bar'; }}, 'bar', bar, 1, 2],
			['bar', bar, 2]
		),
		[1]
	);

	assert.deepEqual(
		_.removeFrom(
			[{a : 'bar', toString():string{ return 'bar'; }}, 'bar', bar, 1, 2],
			{a : 'bar', b : bar, c : 2}
		),
		[1]
	);

	assert.deepEqual(
		_.removeFrom(
			[{a : 'bar', toString():string{ return 'bar'; }}, 'bar', bar, 1, 2],
			new Set(['bar', bar, 2])
		),
		[1]
	);

	assert.deepEqual(
		_.removeFrom(
			[{a : 'bar', toString():string{ return 'bar'; }}, 'bar', bar, 1, 2],
			new Map<string,any>([['b', bar], ['a', 'bar'], ['c', 2]])
		),
		[1]
	);

	assert.deepEqual(
		_.removeFrom(
			[1, 2, 3, 4, 5, 'a', true, 6, 7, 8, 9, 10],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		),
		['a', true]
	);
});



test('generateRange', (assert:ExecutionContext):void => {
	assert.deepEqual(
		_.generateRange(0, 10, 2),
		[0, 2, 4, 6, 8, 10]
	);

	assert.deepEqual(
		_.generateRange(5, -5, 3.5),
		[5, 1.5, -2]
	);

	assert.deepEqual(
		_.generateRange('a', 'g', 3),
		['a', 'd', 'g']
	);

	assert.deepEqual(
		_.generateRange(105, 'ggg'),
		['i', 'h', 'g']
	);

	assert.throws(():void => {
		_.generateRange('a', '', 3);
	});
});
