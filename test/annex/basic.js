import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.basic;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/basic.js`);
}

const {
	assert,
	attempt,
	hasValue,
	isEmpty,
	hasMembers,
	orDefault,
	getType,
	isA,
	isInt,
	isFloat,
	isPlainObject,
	isNaN,
	minMax,
	Deferred
} = pkg;




// name parameter _assert instead of assert here, to avoid collision with annex method name
test('assert', _assert => {
	const
		foo = 'bar',
		bar = [],
		foobar = {a : 1}
	;

	_assert.notThrows(function(){
		assert(foo.length === 3, 'not the right length');
	});

	_assert.throws(function(){
		assert(function(){ return foo.length < 3; }(), 'not the right length');
	}, null, 'not the right length');

	_assert.throws(function(){
		assert(Array.isArray(foobar), 'this is not an array dude');
	}, null, 'this is not an array dude');

	_assert.notThrows(function(){
		assert(Array.isArray(bar), 'this is not an array dude');
	});
});



test('attempt', assert => {
	const
		noJsonString = '{a : new Date()}',
		jsonString = '[{"a" : {"b" : "c"}}]'
	;
	let json;

	if( !attempt(function(){ json = JSON.parse(noJsonString) }) ){
		json = {};
	}
	assert.deepEqual(json, {});

	if( !attempt(function(){ json = JSON.parse(jsonString) }) ){
		json = {};
	}
	assert.deepEqual(json, [{a : {b : 'c'}}]);

	assert.true(attempt(function(){ json = 42 * 42; }));
	assert.false(attempt(function(){ return foo + bar; }));
});



test('hasValue', assert => {
	const
		bar = 1,
		foobar = 'abc'
	;
	let foo;

	assert.false(hasValue(foo));
	assert.false(hasValue(null));
	assert.false(hasValue(undefined));
	assert.false(hasValue(foo, bar, foobar));
	assert.true(hasValue(bar));
	assert.true(hasValue(bar, foobar));
});



test('isEmpty', assert => {
	const
		bar = 0,
		foobar = '',
		boofar = {},
		farbar = [],
		barfoo = new Set(),
		boo = 'none',
		far = 1
	;
	let foo;

	assert.true(isEmpty(foo));
	assert.true(isEmpty(foo, bar, foobar, boofar, farbar, barfoo));
	assert.true(isEmpty(foo, bar, foobar, {__additionalEmptyValues__ : [false]}, farbar, boofar, barfoo, boo, false, {__additionalEmptyValues__ : ['none']}));
	assert.false(isEmpty(bar, foobar, far));

	boofar.a = 'a';
	barfoo.add(42);
	farbar.push(true);

	assert.false(isEmpty(boofar));
	assert.false(isEmpty(barfoo));
	assert.false(isEmpty(farbar));
});



test('hasMembers', assert => {
	const foo = {
		a : 1,
		b : 2,
		c : 3
	};

	assert.true(hasMembers(foo, ['a', 'b', 'c']));
	assert.false(hasMembers(foo, ['a', 'b', 'd']));
	assert.true(hasMembers(console, ['log']));
	assert.true(hasMembers(window, ['location', 'parent']));
	assert.false(hasMembers(window, ['foobar']));
});



test('orDefault', assert => {
	const
		foo = orDefault('none', 'kittens!', 'string', ['', 'none']),
		bar = orDefault('2', 42, 'int'),
		foobar = orDefault(null, 'fluffy', 'str'),
		barfoo = orDefault(0, true, 'bool'),
		boo = orDefault('a', [1, 2, 3], 'array'),
		far = orDefault(42, 1.1, 'float')
	;

	assert.is(foo, 'kittens!');
	assert.is(bar, 2);
	assert.is(foobar, 'fluffy');
	assert.false(barfoo);
	assert.deepEqual(boo, ['a']);
	assert.is(far, 42.0);
});



test('getType', assert => {
	const
		foo = true,
		bar = {a : 'b'},
		foobar = function(){ return 42.42; },
		boo = new Date(),
		far = [1, 2, 3],
		boofar = /[a-z0-9]/g,
		lala = new Set([1, 2, 3, 4, 5]),
		wm = new WeakMap()
	;

	wm.set(foobar, 'foobar');

	assert.is((getType(foo) === 'boolean' && foo) ? 'true' : 'false', 'true');
	assert.is(getType(bar), 'object');
	assert.is(getType(bar.a), 'string');
	assert.is(getType(foobar), 'function');
	assert.is(getType(foobar()), 'number');
	assert.is(getType(boo), 'date');
	assert.is(getType(far), 'array');
	assert.is(getType(far[1]), 'number');
	assert.is(getType(boofar), 'regexp');
	assert.not(getType(boofar), 'boofar');
	assert.not(getType(bar.a), 'date');
	assert.is(getType(lala), 'set');
	assert.is(getType(wm), 'weakmap');
	assert.is(getType(document.querySelectorAll('.test')), 'nodelist');
	assert.is(getType(document), 'htmldocument');
	assert.is(getType(document.createElement('div')), 'htmlelement');
	assert.is(getType(document.createElement('p')), 'htmlelement');
	assert.is(getType(document.createElement('body')), 'htmlelement');
});



test('isA', assert => {
	const
		foo = true,
		bar = {a : 'b'},
		foobar = function(){ return 42.42; },
		boo = new Date(),
		far = [1, 2, 3],
		boofar = /[a-z0-9]/g,
		lala = new Set([1, 2, 3, 4, 5]),
		wm = new WeakMap()
	;

	wm.set(foobar, 'foobar');

	assert.is((isA(foo, 'boolean') && foo) ? 'true' : 'false', 'true');
	assert.true(isA(bar, 'object'));
	assert.true(isA(bar.a, 'string'));
	assert.true(isA(foobar, 'function'));
	assert.true(isA(foobar(), 'number'));
	assert.true(isA(boo, 'date'));
	assert.true(isA(far, 'array'));
	assert.true(isA(far[1], 'number'));
	assert.true(isA(boofar, 'regexp'));
	assert.false(isA(boofar, 'boofar'));
	assert.false(isA(bar.a, 'date'));
	assert.true(isA(lala, 'set'));
	assert.true(isA(wm, 'weakmap'));
	assert.true(isA(document.querySelectorAll('.test'), 'nodelist'));
	assert.true(isA(document, 'htmldocument'));
	assert.true(isA(document.createElement('div'), 'htmlelement'));
	assert.true(isA(document.createElement('p'), 'htmlelement'));
	assert.true(isA(document.createElement('body'), 'htmlelement'));
});



test('isInt', assert => {
	const
		foo = 42,
		bar = 42.42,
		foobar = '42'
	;

	assert.true(isInt(foo));
	assert.false(isInt(bar));
	assert.false(isInt(foobar));
});



test('isFloat', assert => {
	const
		foo = 42.42,
		bar = 42,
		foobar = '42.42'
	;

	assert.true(isFloat(foo));
	assert.true(isFloat(bar));
	assert.false(isFloat(foobar));
});



test('isPlainObject', assert => {
	assert.true(isPlainObject({}));
	assert.false(isPlainObject(document.createElement('div')));
	assert.false(isPlainObject(null));
	assert.false(isPlainObject(Object.create(null)));
	assert.false(isPlainObject(Object.create(null)));
	assert.false(isPlainObject(new (function Foo(){})()));
	assert.false(isPlainObject(42));
	assert.false(isPlainObject('42'));
	assert.false(isPlainObject(new Number(42)));
	assert.false(isPlainObject(Math));
});



test('isNaN', assert => {
	const
		foo = NaN,
		bar = parseInt('abc', 10),
		foobar = 'abc',
		boo = '42',
		far = new Date(),
		boofar = /abc/g
	;

	assert.true(isNaN(foo));
	assert.true(isNaN(bar));
	assert.false(isNaN(foobar));
	assert.false(isNaN(boo));
	assert.false(isNaN(far));
	assert.false(isNaN(boofar));
});



test('minMax', assert => {
	const
		foo = minMax(1, 5, 10),
		bar = minMax(42.42, 100000000000, 666.66),
		foobar = minMax('a', 'zzz', 'b'),
		boo = [-100, -150, -200],
		far = minMax(-150.5, -200, -3),
		boofar = minMax(13, 13, 13),
		brafoo = minMax(-42.42, 666, -42.42)
	;

	assert.is(foo, 5);
	assert.is(bar, 666.66);
	assert.is(foobar, 'b');
	assert.throws(function(){ minMax(boo[0], boo[1], boo[2]); });
	assert.is(far, -150.5);
	assert.is(boofar, 13);
	assert.is(brafoo, -42.42);
});



test('Deferred', assert => {
	return new Promise(function(resolve, reject){
		const
			foo = new Deferred(),
			bar = new Deferred()
		;

		let endCount = 0;
		function end(success){
			endCount++;

			if( !success ){
				reject();
			} else if( endCount === 3 ){
				resolve();
			}
		}

		foo
			.then(value => {
				assert.is(value.result, 42);
				end(value.result === 42);
			})
			.catch(err => { end(false); })
		;

		bar
			.then(value => { end(false); })
			.catch(err => {
				assert.is(err.message, 'blimey!');
				end(err.message === 'blimey!');
			})
		;

		Promise.all([foo.promise]).then(() => { end(true); });

		foo.resolve({result : 42});
		bar.reject(new Error('blimey!'));
	});
});
