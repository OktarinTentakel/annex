import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.cookies;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/cookies.js`);
}

const {
	setCookie,
	getCookie,
	getCookies,
	removeCookie
} = pkg;



test('setCookie & getCookie(s) & removeCookie', assert => {
	assert.is(setCookie('kittencookie', 'fluffy', {HttpOnly : true}), null);
	assert.is(getCookie('kittencookie'), null);
	assert.is(setCookie('kittencookie', 'fluffy', {expires : 7, path : 'auto', secure : true, SameSite : 'strict', fooBar : 'test'}), 'fluffy');
	assert.is(getCookie('kittencookie'), 'fluffy');
	assert.is(setCookie('foobarcookie([ #ü ])', 'üäöÜÄÖß:::///___abc123', {expires : new Date()}), null);
	assert.is(getCookie('foobarcookie([ #ü ])'), null);
	assert.is(setCookie('foobarcookie([ #ü ])', 'üäöÜÄÖß:::///___abc123', {expires : 1}), 'üäöÜÄÖß:::///___abc123');
	assert.is(getCookie('foobarcookie([ #ü ])'), 'üäöÜÄÖß:::///___abc123');
	assert.deepEqual(getCookie(), {
		kittencookie : 'fluffy',
		'foobarcookie([ #ü ])' : 'üäöÜÄÖß:::///___abc123'
	});
	assert.deepEqual(getCookies(), {
		kittencookie : 'fluffy',
		'foobarcookie([ #ü ])' : 'üäöÜÄÖß:::///___abc123'
	});
	assert.is(setCookie('boofarcookie', '{"json" : [true, false, "test"]}'), '{"json" : [true, false, "test"]}');
	assert.deepEqual(getCookies(['foobarcookie([ #ü ])'], 'boofarcookie'), {
		'foobarcookie([ #ü ])' : 'üäöÜÄÖß:::///___abc123',
		boofarcookie : '{"json" : [true, false, "test"]}'
	});
	assert.is(setCookie('foobarcookie([ #ü ])', null), null);
	assert.is(getCookie('foobarcookie([ #ü ])'), null);
	assert.true(removeCookie('kittencookie'));
	assert.true(removeCookie('foobarcookie([ #ü ])'));
	assert.true(removeCookie('boofarcookie'));
	assert.is(getCookie('foobarcookie([ #ü ])'), null);
	assert.deepEqual(getCookies(), {});
});
