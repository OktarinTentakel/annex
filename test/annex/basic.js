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
	size,
	hasMembers,
	orDefault,
	getType,
	isA,
	isBoolean,
	isNumber,
	isBigInt,
	isInt,
	isFloat,
	isNaN,
	isString,
	isSymbol,
	isFunction,
	isObject,
	isPlainObject,
	isArray,
	isDate,
	isError,
	isGenerator,
	isIterator,
	isRegExp,
	isSet,
	isWeakSet,
	isMap,
	isWeakMap,
	isDocument,
	isElement,
	isSvg,
	isCollection,
	isNodeList,
	isWindow,
	isUrl,
	isUrlSearchParams,
	isEventTarget,
	isSelector,
	isPotentialId,
	min,
	max,
	minMax,
	round,
	Deferred,
	Observable
} = pkg;



const exampleSVG = '<svg enable-background="new 0 0 396 99.3" height="99.3" viewBox="0 0 396 99.3" width="396" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><path d="m22.5 60.2 48.7-3.9v-8.1l-48.7 4.9z"/><path d="m22.5 91.3h48.7v-10.1l-48.7.9z"/><path d="m22.5 75.1 48.7-1.9v-9.4l-48.7 2.9z"/><path d="m.3 30 70.9-14.1v-5.7l-70.9 15.5z"/><path d="m.3 18.6v3.5l70.9-16.9v-4.9z"/><path d="m.3 39.2 70.9-11.3v-6.3l-70.9 12.8z"/><path d="m.3 49.8 70.9-8.5v-7.2l-70.9 10z"/><path d="m141.9 65.6v2.8s-2.6-2.3-8.7-2.3c-6.7 0-10.6 4.4-10.6 11.3s3.7 11.6 11.2 11.6c3.8 0 6-.6 6-.6v-6.3h-7.3v-2.4h10.1v9.3s-2.9 2.9-9.3 2.9c-9.1 0-13.7-6.2-13.7-14.3 0-8.4 5.4-14.2 13.5-14.2 6.2-.2 8.8 2.2 8.8 2.2z"/><path d="m159.3 72v2.5h-1.4c-4.2 0-6.5 2.9-6.5 6.6v10.2h-2.9v-18.9l2.9-.7v4.2c1.2-2.5 3.5-4.2 6.3-4.2.8 0 1.6.3 1.6.3z"/><path d="m179.6 81.4c0 6-3.8 10.4-9.5 10.4-5.5 0-9.2-4.1-9.2-9.9 0-6 3.7-10.4 9.4-10.4 5.7.1 9.3 4.1 9.3 9.9zm-15.8.4c0 4.5 2.4 7.4 6.3 7.4 4.5 0 6.6-3.5 6.6-7.8 0-4.4-2.5-7.4-6.4-7.4-4.5 0-6.5 3.5-6.5 7.8z"/><path d="m199.9 71.8v19.6h-2.8v-3.4c-1.4 2.4-3.6 3.7-6.2 3.7-4.5 0-6.5-2.8-6.5-7.1v-12.2l2.9-.7v12.7c0 3.2 1.4 4.7 4.1 4.7 3.3 0 5.8-2.6 5.8-7.6v-9.2z"/><path d="m222.5 81.1c0 5.9-3.8 10.6-9.6 10.6-2.2 0-4-.9-4.5-1.1v8.7h-2.8v-26.9l2.8-.7v3.6c1.3-2.3 3.6-3.7 6.4-3.7 5.1.1 7.7 4 7.7 9.5zm-2.8.1c0-4.7-2.2-6.9-5.3-6.9-3.7 0-5.9 2.8-5.9 6.8v7.2c.4.2 2 .9 4.5.9 4.3-.1 6.7-3.3 6.7-8z"/><path d="m147.3 24.4v21.6h-8v-4.6c-2.4 3.3-6.5 5.2-10.8 5.2-5.1 0-8.5-2.8-8.5-7.7 0-7.6 8.2-11.9 19.3-11.9v-1.2c0-3.1-1.7-5-6.2-5-7 0-11.8 4-11.8 4v-7.4s4-4 13.1-4c8.8.2 12.9 4 12.9 11zm-8 8.9v-1.5c-7.4 0-10.9 2.9-10.9 6.1 0 1.7 1.2 2.9 3.3 2.9 3.7-.1 7.6-3.1 7.6-7.5z"/><path d="m162.6 46h-9.1v-43.9l9.1-1.8z"/><path d="m178.1 46h-9.1v-43.9l9.1-1.8z"/><path d="m211.6 11.9v2.3h9.9v6.3h-9.9v25.5h-9v-25.5h-4.5v-6.3h4.5v-2.3c0-7.5 4.5-11.9 12.1-11.9 5.4 0 7.4 1.7 7.4 1.7v5.8s-2.2-1-5.2-1c-3.6 0-5.3 2-5.3 5.4z"/><path d="m253.9 29.7c0 10.4-6.4 17.1-16.1 17.1-9.9 0-15.8-6.4-15.8-16.4 0-10.4 6.5-16.9 16-16.9 9.9 0 15.9 6.3 15.9 16.2zm-23.1.7c0 6.1 2.6 9.7 7 9.7 5.1 0 7.3-4.2 7.3-10.1 0-6-2.7-9.8-7.1-9.8-5 0-7.2 4.3-7.2 10.2z"/><path d="m280.5 14.1v7.8h-2.4c-6.5 0-10 4.5-10 10v14.1h-8.8v-30.7l8.8-1.7v7.8c1.9-4.6 5.2-7.8 9.7-7.8 1.9 0 2.7.5 2.7.5z"/><path d="m329.5 29.7c0 10.4-6.4 17.1-16.1 17.1-9.9 0-15.8-6.4-15.8-16.4 0-10.4 6.5-16.9 16-16.9 9.9 0 15.9 6.3 15.9 16.2zm-23.1.7c0 6.1 2.6 9.7 7 9.7 5.1 0 7.3-4.2 7.3-10.1 0-6-2.7-9.8-7.1-9.8-4.9 0-7.2 4.3-7.2 10.2z"/><path d="m363.2 24.7v21.3h-8.9v-19.5c0-3.5-1.5-5.4-4.5-5.4-3.7-.1-6.2 3-6.2 8.8v16h-8.7v-30.5l8.7-1.8v5.7c2.2-3.7 5.7-5.8 9.8-5.8 7 .1 9.8 4.6 9.8 11.2z"/><path d="m386.6 39.6c5.8 0 9.3-2.6 9.3-2.6v6.2s-3.5 3.5-11.3 3.5c-10.8 0-16.4-6.5-16.4-16.1 0-9.8 5.8-17 15.3-17 7.9 0 12.8 4.7 12.8 12.3 0 3.3-1.1 5.6-1.1 5.6h-18.7c.7 5.3 4 8.1 10.1 8.1zm-10-12.9h12c-.1-4.5-1.9-6.7-5.3-6.7-3.6-.1-6 2.4-6.7 6.7z"/></g></svg>';



// name parameter _assert instead of assert here, to avoid collision with annex method name
test('assert', _assert => {
	const
		foo = 'bar',
		bar = [],
		foobar = {a : 1}
	;

	_assert.notThrows(() => {
		assert(foo.length === 3, 'not the right length');
	});

	_assert.throws(() => {
		assert((() => { return foo.length < 3; })(), 'not the right length');
	}, null, 'not the right length');

	_assert.throws(() => {
		assert(Array.isArray(foobar), 'this is not an array dude');
	}, null, 'this is not an array dude');

	_assert.notThrows(() => {
		assert(Array.isArray(bar), 'this is not an array dude');
	});
});



test('attempt', assert => {
	const
		noJsonString = '{a : new Date()}',
		jsonString = '[{"a" : {"b" : "c"}}]'
	;
	let json;

	if( !attempt(() => { json = JSON.parse(noJsonString) }) ){
		json = {};
	}
	assert.deepEqual(json, {});

	if( !attempt(() => { json = JSON.parse(jsonString) }) ){
		json = {};
	}
	assert.deepEqual(json, [{a : {b : 'c'}}]);

	assert.true(attempt(() => { json = 42 * 42; }));
	assert.false(attempt(() => { return foo + bar; }));
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



test('size', assert => {
	let
		bar = 0,
		foobar = '',
		boofar = {},
		farbar = [],
		barfoo = new Set(),
		zzz = new Map(),
		boo = 'none',
		far = 1,
		eBody = document.querySelectorAll('body')
	;

	assert.is(size(bar), null);
	assert.is(size(foobar), 0);
	assert.is(size(boofar), 0);
	assert.is(size(farbar), 0);
	assert.is(size(barfoo), 0);
	assert.is(size(zzz), 0);
	assert.is(size(boo), 4);
	assert.is(size(far), null);
	assert.is(size(eBody), 1);

	foobar = '日本国💩👻';
	boofar = {a : 1, b : new Date(), c : [1, 2, 3]};
	farbar.push('test', 'test', 'test');
	barfoo.add('test1').add('test2').add('test3');
	zzz.set(1, 1).set(new Date(), new Date()).set('foo', 'bar');

	assert.is(size(foobar), 5);
	assert.true(size(foobar, false) > 5);
	assert.is(size(boofar), 3);
	assert.is(size(farbar), 3);
	assert.is(size(barfoo), 3);
	assert.is(size(barfoo.values()), 3);
	assert.is(size(zzz), 3);
	assert.is(size(zzz.values()), 3);
	assert.is(size(null), null);
	assert.is(size(undefined), null);
});



test('isEmpty', assert => {
	const
		bar = 0,
		foobar = '',
		boofar = {},
		farbar = [],
		barfoo = new Set(),
		zzz = new Map(),
		boo = 'none',
		far = 1
	;
	let foo;

	assert.true(isEmpty(foo));
	assert.true(isEmpty(foo, bar, foobar, boofar, farbar, barfoo));
	assert.true(isEmpty(foo, bar, foobar, {__additionalEmptyValues__ : [false]}, farbar, boofar, barfoo, boo, false, {__additionalEmptyValues__ : ['none']}));
	assert.true(isEmpty(zzz));
	assert.false(isEmpty(bar, foobar, far));

	boofar.a = 'a';
	barfoo.add(42);
	zzz.set('a', 'b')
	farbar.push(true);

	assert.false(isEmpty(boofar));
	assert.false(isEmpty(barfoo));
	assert.false(isEmpty(farbar));
	assert.false(isEmpty(zzz));
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
	const outerNode = document.createElement('div');
	outerNode.innerHTML = exampleSVG;

	const
		foo = true,
		bar = {a : 'b'},
		foobar = () => 42.42,
		boo = new Date(),
		far = [1, 2, 3],
		boofar = /[a-z0-9]/g,
		lala = new Set([1, 2, 3, 4, 5]),
		wm = new Map(),
		u = new URL('', window.location.origin),
		usp = new URLSearchParams(),
		svg = outerNode.firstChild
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
	assert.is(getType(wm), 'map');
	assert.is(getType(wm.values()), 'iterator');
	assert.is(getType(u), 'url');
	assert.is(getType(usp), 'urlsearchparams');
	assert.is(getType(document.querySelectorAll('.test')), 'nodelist');
	assert.is(getType(document), 'htmldocument');
	assert.is(getType(document.createElement('div')), 'htmlelement');
	assert.is(getType(document.createElement('p')), 'htmlelement');
	assert.is(getType(document.createElement('body')), 'htmlelement');
	assert.is(getType(svg), 'svgelement');
});



test('isA', assert => {
	const outerNode = document.createElement('div');
	outerNode.innerHTML = exampleSVG;

	const
		foo = true,
		bar = {a : 'b'},
		foobar = () => 42.42,
		boo = new Date(),
		far = [1, 2, 3],
		boofar = /[a-z0-9]/g,
		lala = new Set([1, 2, 3, 4, 5]),
		wm = new Map(),
        u = new URL('', window.location.origin),
        usp = new URLSearchParams(),
		svg = outerNode.firstChild
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
	assert.true(isA(wm, 'map'));
	assert.true(isA(wm.values(), 'iterator'));
    assert.true(isA(u, 'url'));
    assert.true(isA(usp, 'urlsearchparams'));
	assert.true(isA(document.querySelectorAll('.test'), 'nodelist'));
	assert.true(isA(document, 'htmldocument'));
	assert.true(isA(document.createElement('div'), 'htmlelement'));
	assert.true(isA(document.createElement('p'), 'htmlelement'));
	assert.true(isA(document.createElement('body'), 'htmlelement'));
	assert.true(isA(svg, 'svgelement'));
});



test('isBoolean', assert => {
	const
		foo = true,
		bar = false,
		foobar = 'true',
		boofar = 5
	;

	assert.true(isBoolean(foo));
	assert.true(isBoolean(bar));
	assert.false(isBoolean(foobar));
	assert.false(isBoolean(boofar));
});



test('isNumber', assert => {
	const
		foo = 42,
		bar = 42.42,
		foobar = '13',
		boofar = true
	;

	assert.true(isNumber(foo));
	assert.true(isNumber(bar));
	assert.false(isNumber(foobar));
	assert.false(isNumber(boofar));
});



test('isBigInt', assert => {
	const
		foo = BigInt('9007199254740991'),
		bar = BigInt('0x1fffffffffffff'),
		foobar = 9007199254740991,
		boofar = 0
	;

	assert.true(isBigInt(foo));
	assert.true(isBigInt(bar));
	assert.false(isBigInt(foobar));
	assert.false(isBigInt(boofar));
});



test('isInt', assert => {
	const
		foo = 42,
		bar = 42.42,
		foobar = '42',
		boofar = true
	;

	assert.true(isInt(foo));
	assert.false(isInt(bar));
	assert.false(isInt(foobar));
	assert.false(isInt(boofar));
});



test('isFloat', assert => {
	const
		foo = 42.42,
		bar = 42,
		foobar = '42.42',
		boofar = true
	;

	assert.true(isFloat(foo));
	assert.true(isFloat(bar));
	assert.false(isFloat(foobar));
	assert.false(isFloat(boofar));
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



test('isString', assert => {
	const
		foo = 'foo',
		bar = Symbol('bar').toString(),
		foobar = Symbol('foobar'),
		boofar = 0
	;

	assert.true(isString(foo));
	assert.true(isString(bar));
	assert.false(isString(foobar));
	assert.false(isString(boofar));
});



test('isSymbol', assert => {
	const
		foo = Symbol('foo'),
		bar = Symbol(42),
		foobar = Symbol('foobar').description,
		boofar = 0
	;

	assert.true(isSymbol(foo));
	assert.true(isSymbol(bar));
	assert.false(isSymbol(foobar));
	assert.false(isSymbol(boofar));
});



test('isFunction', assert => {
	function foo(){
		return true;
	}

	const
		bar = () => false,
		foobar = Symbol().toString,
		boofar = 'function(){}'
	;

	assert.true(isFunction(foo));
	assert.true(isFunction(bar));
	assert.true(isFunction(foobar));
	assert.false(isFunction(boofar));
});



test('isObject', assert => {
	const
		foo = {},
		bar = new Object(42),
		foobar = new Date(),
		boofar = 42
	;

	assert.true(isObject(foo));
	assert.true(isObject(bar));
	assert.false(isObject(foobar));
	assert.false(isObject(boofar));
});



test('isPlainObject', assert => {
	assert.true(isPlainObject({}));
	assert.true(isPlainObject({a : 1, b : new Date()}));
	assert.true(isPlainObject(new Object()));
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



test('isArray', assert => {
	const
		foo = [1, 2, {}, []],
		bar = Array.from(new Set([1, 2, 3, {}, []])),
		foobar = new Set([1, 2, 3, {}, []]),
		boofar = new Set([1, 2, 3, {}, []]).values()
	;

	assert.true(isArray(foo));
	assert.true(isArray(bar));
	assert.false(isArray(foobar));
	assert.false(isArray(boofar));
});



test('isDate', assert => {
	const
		foo = new Date(),
		bar = new Date('1983-03-16'),
		foobar = Date.now(),
		boofar = '1983-03-16'
	;

	assert.true(isDate(foo));
	assert.true(isDate(bar));
	assert.false(isDate(foobar));
	assert.false(isDate(boofar));
});



test('isError', assert => {
	class FooError extends Error {
		constructor(props){
			super(props);

		}
	}

	let foobar;
	try {
		throw 'foobar';
	} catch(ex){
		foobar = ex;
	}

	const
		foo = new Error(),
		bar = new FooError('foo'),
		boofar = 'error'
	;

	assert.true(isError(foo));
	assert.true(isError(bar));
	assert.false(isError(foobar));
	assert.false(isError(boofar));
});



test('isGenerator', assert => {
	function* finiteGen(){
		yield 1;
		yield 2;
		yield 3;
	}

	const infiniteGen = function*(){
		let i = 0;

		while(true){
			yield i++;
		}
	}

	const
		foo = finiteGen(),
		bar = infiniteGen(),
		foobar = finiteGen().return(finiteGen().next().value),
		boofar = infiniteGen().next()
	;

	assert.true(isGenerator(foo));
	assert.true(isGenerator(bar));
	assert.false(isGenerator(foobar));
	assert.false(isGenerator(boofar));
});



test('isIterator', assert => {
	function* finiteGen(){
		yield 1;
		yield 2;
		yield 3;
	}

	const
		foo = Array.from(finiteGen()).values(),
		bar = 'bar'.matchAll(/bar/g),
		foobar = new Set([1, 2, 3, {}, []]),
		boofar = 'boofar'
	;

	assert.true(isIterator(foo));
	assert.true(isIterator(bar));
	assert.false(isIterator(foobar));
	assert.false(isIterator(boofar));
});



test('isRegExp', assert => {
	const
		foo = /^foo$/,
		bar = new RegExp('^bar$'),
		foobar = '^foobar$',
		boofar = 42
	;

	assert.true(isRegExp(foo));
	assert.true(isRegExp(bar));
	assert.false(isRegExp(foobar));
	assert.false(isRegExp(boofar));
});



test('isSet', assert => {
	const
		foo = new Set([1, 2, 3, {}, []]),
		bar = new Set(Array.from(new Set([1, 2, 3, {}, []]))),
		foobar = [1, 2, 3, {}, []],
		boofar = new WeakSet()
	;

	boofar.add(new Date())

	assert.true(isSet(foo));
	assert.true(isSet(bar));
	assert.false(isSet(foobar));
	assert.false(isSet(boofar));
});



test('isWeakSet', assert => {
	const
		foo = new WeakSet([{}, [], new Date()]),
		bar = new WeakSet(Array.from(new Set([{}, [], new Date()]))),
		foobar = [1, 2, 3, {}, []],
		boofar = new Set([1, 2, 3, {}, []])
	;

	assert.true(isWeakSet(foo));
	assert.true(isWeakSet(bar));
	assert.false(isWeakSet(foobar));
	assert.false(isWeakSet(boofar));
});



test('isMap', assert => {
	const
		foo = new Map(Object.entries({a : 'a', b : 'b', c : 'c'})),
		bar = new Map(),
		foobar = {a : 'a', b : 'b', c : 'c'},
		boofar = new WeakMap()
	;

	boofar.set({}, 'boofar');

	bar.set(Symbol('bar'), 'bar');

	assert.true(isMap(foo));
	assert.true(isMap(bar));
	assert.false(isMap(foobar));
	assert.false(isMap(boofar));
});



test('isWeakMap', assert => {
	const
		foo = new WeakMap(),
		bar = new WeakMap(),
		foobar = {a : 'a', b : 'b', c : 'c'},
		boofar = new Map(Object.entries({a : 'a', b : 'b', c : 'c'}))
	;

	foo.set({}, 'a');
	foo.set([], 'b');
	foo.set(new Date(), 'c');

	bar.set({}, 'bar');

	assert.true(isWeakMap(foo));
	assert.true(isWeakMap(bar));
	assert.false(isWeakMap(foobar));
	assert.false(isWeakMap(boofar));
});



test('isDocument', assert => {
	const
		foo = window.document,
		bar = window.parent.document,
		foobar = window,
		boofar = document.body
	;

	assert.true(isDocument(foo));
	assert.true(isDocument(bar));
	assert.false(isDocument(foobar));
	assert.false(isDocument(boofar));
});



test('isElement', assert => {
	const
		foo = document,
		bar = document.body,
		foobar = document.querySelector('body'),
		boo = document.createElement('div'),
		far = new CustomEvent('test'),
		boofar = {a : 1}
	;

	assert.false(isElement(foo));
	assert.true(isElement(bar));
	assert.true(isElement(foobar));
	assert.true(isElement(boo));
	assert.false(isElement(far));
	assert.false(isElement(boofar));
});



test('isSvg', assert => {
	const outerNode = document.createElement('div');
	outerNode.innerHTML = exampleSVG;

	const
		foo = document,
		foobar = document.querySelector('body'),
		svg = outerNode.firstChild
	;

	assert.false(isSvg(foo));
	assert.false(isSvg(foobar));
	assert.true(isSvg(svg));
});



test('isCollection', assert => {
	const
		foo = document.body.children,
		bar = document.body.appendChild(document.createElement('div')).parentNode.children,
		foobar = document.body.childNodes,
		boofar = [document.body]
	;

	assert.true(isCollection(foo));
	assert.true(isCollection(bar));
	assert.false(isCollection(foobar));
	assert.false(isCollection(boofar));
});



test('isNodeList', assert => {
	const
		foo = document.body.childNodes,
		bar = document.body.appendChild(document.createElement('div')).parentNode.childNodes,
		foobar = document.body.children,
		boofar = [document.body]
	;

	assert.true(isNodeList(foo));
	assert.true(isNodeList(bar));
	assert.false(isNodeList(foobar));
	assert.false(isNodeList(boofar));
});



test('isWindow', assert => {
	const
		foo = window,
		bar = window.parent,
		foobar = document,
		boofar = document.body
	;

	assert.true(isWindow(foo));
	assert.true(isWindow(bar));
	assert.false(isWindow(foobar));
	assert.false(isWindow(boofar));
});



test('isUrl', assert => {
    const
        foo = new URL('', window.location.origin),
        bar = new URL('https://google.com'),
        foobar = 'https://google.com',
        boofar = window.location.origin
    ;

    assert.true(isUrl(foo));
    assert.true(isUrl(bar));
    assert.false(isUrl(foobar));
    assert.false(isUrl(boofar));
});



test('isUrlSearchParams', assert => {
    const
        foo = new URLSearchParams(),
        bar = new URL('', window.location.origin).searchParams,
        foobar = '?foo=bar&bar=foo',
        boofar = {foo : 'bar', bar : 'foo'}
    ;

    assert.true(isUrlSearchParams(foo));
    assert.true(isUrlSearchParams(bar));
    assert.false(isUrlSearchParams(foobar));
    assert.false(isUrlSearchParams(boofar));
});



test('isEventTarget', assert => {
	const
		foo = document,
		bar = document.body,
		foobar = document.querySelector('body'),
		boo = document.createElement('div'),
		far = new CustomEvent('test'),
		boofar = {a : 1},
		zzz = {
			addEventListener(){},
			removeEventListener(){},
			dispatchEvent(){}
		}
	;

	assert.true(isEventTarget(foo));
	assert.true(isEventTarget(bar));
	assert.true(isEventTarget(foobar));
	assert.true(isEventTarget(boo));
	assert.false(isEventTarget(far));
	assert.false(isEventTarget(boofar));
	assert.true(isEventTarget(zzz));
});



test('isSelector', assert => {
	const
		foo = 'a',
		bar = '> body',
		foobar = 'button.btn[data-foobar][class*="test"]',
		boo = 'div ~ div',
		far = '#test',
		boofar = '$test',
		zzz = 42
	;

	assert.true(isSelector(foo));
	assert.false(isSelector(bar));
	assert.true(isSelector(foobar));
	assert.true(isSelector(boo));
	assert.true(isSelector(far));
	assert.false(isSelector(boofar));
	assert.false(isSelector(zzz));
});



test('isPotentialId', assert => {
	assert.true(!!isPotentialId('666'));
	assert.false(isPotentialId('0666'));
	assert.is(isPotentialId('prefix-42', 'prefix-'), '42');
	assert.true(!!isPotentialId('prefix-042', 'prefix-', '[0-9]+'));
	assert.is(isPotentialId('prefix-042_postfix', 'prefix-', '[0-9]+', '_postfix'), '042');
	assert.false(isPotentialId('prefix-042_postfix', 'prefix-', null, '_postfix'));
	assert.true(!!isPotentialId('42_postfix', null, null, '_postfix'));
});



test('min', assert => {
	const
		foo = min(1, 5),
		bar = min(42.42, 666.66),
		foobar = min('a', 'b'),
		far = min(-150.5, -200),
		boofar = min(13, 13),
		brafoo = min(-42.42, 666)
	;

	assert.is(foo, 5);
	assert.is(bar, 666.66);
	assert.is(foobar, 'b');
	assert.is(far, -150.5);
	assert.is(boofar, 13);
	assert.is(brafoo, 666);
});



test('max', assert => {
	const
		foo = max(10, 5),
		bar = max(100000000000, 666.66),
		foobar = max('zzz', 'b'),
		far = max(-150.5, -3),
		boofar = max(13, 13),
		brafoo = max(666, -42.42)
	;

	assert.is(foo, 5);
	assert.is(bar, 666.66);
	assert.is(foobar, 'b');
	assert.is(far, -150.5);
	assert.is(boofar, 13);
	assert.is(brafoo, -42.42);
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
	assert.throws(() => { minMax(boo[0], boo[1], boo[2]); });
	assert.is(far, -150.5);
	assert.is(boofar, 13);
	assert.is(brafoo, -42.42);
});



test('round', assert => {
	const
		foo = round(0.55555, 3),
		bar = round(42.42, 2),
		foobar = round(-42.42, 1),
		far = round(-666.66),
		boofar = round(0.55555, 10),
		brafoo = round(0.1)
	;

	assert.is(foo, 0.556);
	assert.is(bar, 42.42);
	assert.is(foobar, -42.4);
	assert.is(far, -667);
	assert.is(boofar, 0.55555);
	assert.is(brafoo, 0);
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
			} else if( endCount === 5 ){
				resolve();
			}
		}

		foo
			.then(value => {
				assert.is(value.result, 42);
				end(value.result === 42);
			})
			.catch(error => { end(false); })
			.finally(() => {
				end(foo.status === 'fulfilled');
			})
		;

		bar
			.then(value => { end(false); })
			.catch(error => {
				assert.is(error.message, 'blimey!');
				end(error.message === 'blimey!');
			})
			.finally(() => {
				end(bar.status === 'rejected');
			})
		;

		Promise.all([foo.promise]).then(() => { end(true); });

		assert.false(bar.isSettled());
		foo.resolve({result : 42});
		bar.reject(new Error('blimey!'));
		assert.true(bar.isSettled());
	});
});



test('Observable', assert => {
	let changeCount = 0;

	const
		foo = new Observable(42),
		fooSubscription = foo.subscribe(() => {
			changeCount++;
		})
	;

	assert.is(foo.getValue(), 42);
	foo.setValue(42);
	foo.setValue(42, true);
	foo.setValue(23);
	assert.is(foo.getValue(), 23);

	assert.throws(() => { foo.subscribe(42); }, {message : /must be function/});

	foo.setValue({bar : 42});
	assert.is(foo.getValue().bar, 42);

	foo.unsubscribe(fooSubscription);
	foo.setValue(1);
	foo.setValue(2);
	foo.setValue(3);

	assert.is(changeCount, 3);
});
