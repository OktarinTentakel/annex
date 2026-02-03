import type {ExecutionContext} from 'ava';

import test from 'ava';

import {cookies as _} from './_implementations.ts';



test('setCookie & getCookie(s) & removeCookie', (assert:ExecutionContext):void => {
	assert.is(
		_.setCookie('kittencookie', 'fluffy', {httponly : true}),
		null
	);

	assert.is(
		_.getCookie('kittencookie'),
		null
	);

	assert.is(
		_.setCookie(
			'kittencookie',
			'fluffy',
			{expires : 7, path : 'auto', secure : true, samesite : 'strict'}
		),
		'fluffy'
	);

	assert.is(
		_.getCookie('kittencookie'),
		'fluffy'
	);

	assert.is(
		_.setCookie(
			'foobarcookie([ #ü ])',
			'üäöÜÄÖß:::///___abc123',
			{expires : new Date()}
		),
		null
	);

	assert.is(
		_.getCookie('foobarcookie([ #ü ])'),
		null
	);

	assert.is(
		_.setCookie(
			'foobarcookie([ #ü ])',
			'üäöÜÄÖß:::///___abc123',
			{expires : 1}
		),
		'üäöÜÄÖß:::///___abc123'
	);

	assert.is(
		_.getCookie('foobarcookie([ #ü ])'),
		'üäöÜÄÖß:::///___abc123'
	);

	assert.deepEqual(_.getCookie(), {
		kittencookie : 'fluffy',
		'foobarcookie([ #ü ])' : 'üäöÜÄÖß:::///___abc123'
	});

	assert.deepEqual(_.getCookies(), {
		kittencookie : 'fluffy',
		'foobarcookie([ #ü ])' : 'üäöÜÄÖß:::///___abc123'
	});

	assert.is(
		_.setCookie('boofarcookie', '{"json" : [true, false, "test"]}'),
		'{"json" : [true, false, "test"]}'
	);

	assert.deepEqual(_.getCookies('foobarcookie([ #ü ])', 'boofarcookie'), {
		'foobarcookie([ #ü ])' : 'üäöÜÄÖß:::///___abc123',
		boofarcookie : '{"json" : [true, false, "test"]}'
	});

	assert.is(
		_.setCookie('foobarcookie([ #ü ])', null),
		null
	);

	assert.is(
		_.getCookie('foobarcookie([ #ü ])'),
		null
	);

	assert.true(_.removeCookie('kittencookie'));

	assert.true(_.removeCookie('foobarcookie([ #ü ])'));

	assert.true(_.removeCookie('boofarcookie'));

	assert.is(
		_.getCookie('foobarcookie([ #ü ])'),
		null
	);

	assert.deepEqual(_.getCookies(), {});
});
