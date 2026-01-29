import type {ExecutionContext} from 'ava';

import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import test from 'ava';

import {basic as _} from './_implementations.ts';



const
	__filename:string = fileURLToPath(import.meta.url),
	__dirname:string = dirname(__filename),
	exampleSVG:string = readFileSync(
		join(__dirname, '..', 'assets', 'img', 'example.svg'),
		'utf8'
	)
;



test('assert', (assert:ExecutionContext):void => {
	const
		foo:string = 'bar',
		bar:Array<number> = [],
		foobar:Record<string,number> = {a : 1}
	;

	assert.notThrows(():void => {
		_.assert(foo.length === 3, 'not the right length');
	});

	assert.throws(():void => {
		_.assert((():boolean => { return foo.length < 3; })(), 'not the right length');
	}, undefined, 'not the right length');

	assert.throws(():void => {
		_.assert(Array.isArray(foobar), 'this is not an array dude');
	}, undefined, 'this is not an array dude');

	assert.notThrows(():void => {
		_.assert(Array.isArray(bar), 'this is not an array dude');
	});
});



test('attempt', (assert:ExecutionContext):void => {
	const
		noJsonString:string = '{a : new Date()}',
		jsonString:string = '[{"a" : {"b" : "c"}}]'
	;
	let json:any;

	if( !_.attempt(():void => { json = JSON.parse(noJsonString) }) ){
		json = {};
	}
	assert.deepEqual(json, {});

	if( !_.attempt(():void => { json = JSON.parse(jsonString) }) ){
		json = {};
	}
	assert.deepEqual(json, [{a : {b : 'c'}}]);

	assert.true(_.attempt(():void => { json = 42 * 42; }));

	// @ts-ignore
	assert.false(_.attempt(():void => { return foo + bar; }));
});



test('hasValue', (assert:ExecutionContext):void => {
	const
		bar:number = 1,
		foobar:string = 'abc'
	;
	let foo:undefined;

	assert.false(_.hasValue(foo));

	assert.false(_.hasValue(null));

	assert.false(_.hasValue(undefined));

	assert.false(_.hasValue(foo, bar, foobar));

	assert.false(_.hasValue());

	assert.true(_.hasValue(bar));

	assert.true(_.hasValue(bar, foobar));
});



test('size', (assert:ExecutionContext):void => {
	let
		bar:number = 0,
		foobar:string = '',
		boofar:Record<string, any> = {},
		farbar:Array<string> = [],
		barfoo:Set<string> = new Set(),
		zzz:Map<any,any> = new Map(),
		boo:string = 'none',
		far:number = 1,
		eBody:NodeListOf<HTMLElement> = document.querySelectorAll('body')
	;

	// @ts-ignore
	assert.is(_.size(bar), null);

	assert.is(_.size(foobar), 0);

	assert.is(_.size(boofar), 0);

	assert.is(_.size(farbar), 0);

	assert.is(_.size(barfoo), 0);

	assert.is(_.size(zzz), 0);

	assert.is(_.size(boo), 4);

	// @ts-ignore
	assert.is(_.size(far), null);

	assert.is(_.size(eBody), 1);


	foobar = '日本国💩👻';
	boofar = {a : 1, b : new Date(), c : [1, 2, 3]};
	farbar.push('test', 'test', 'test');
	barfoo.add('test1').add('test2').add('test3');
	zzz.set(1, 1).set(new Date(), new Date()).set('foo', 'bar');

	assert.is(_.size(foobar), 5);

	assert.true(_.size(foobar, false) > 5);

	assert.is(_.size(boofar), 3);

	assert.is(_.size(farbar), 3);

	assert.is(_.size(barfoo), 3);

	assert.is(_.size(barfoo.values()), 3);

	assert.is(_.size(zzz), 3);

	assert.is(_.size(zzz.values()), 3);

	assert.is(_.size(null), null);

	assert.is(_.size(undefined), null);
});



test('isEmpty', (assert:ExecutionContext):void => {
	const
		bar:number = 0,
		foobar:string = '',
		boofar:Record<string,string> = {},
		farbar:Array<boolean> = [],
		barfoo:Set<number> = new Set(),
		zzz:Map<string,string> = new Map(),
		boo:string = 'none',
		far:number = 1
	;
	let foo:undefined;

	assert.true(_.isEmpty(foo));

	assert.true(_.isEmpty(foo, bar, foobar, boofar, farbar, barfoo));

	assert.true(_.isEmpty(
		foo, bar, foobar,
		{__empty__ : [false]},
		farbar, boofar, barfoo, boo, false,
		{__empty__ : ['none']}
	));

	assert.true(_.isEmpty(zzz));

	assert.false(_.isEmpty(bar, foobar, far));


	boofar.a = 'a';
	barfoo.add(42);
	zzz.set('a', 'b')
	farbar.push(true);

	assert.false(_.isEmpty(boofar));

	assert.false(_.isEmpty(barfoo));

	assert.false(_.isEmpty(farbar));

	assert.false(_.isEmpty(zzz));
});



test('isNullish', (assert:ExecutionContext):void => {
	const
		foobar:string = '',
		boo:null = null,
		far:number = 1
	;
	let foo:undefined;

	assert.true(_.isNullish(foo));

	assert.true(_.isNullish(foo, boo));

	assert.true(_.isNullish(
		foo, boo, foobar,
		{__nullish__ : [false]},
		null, '', false,
		{__nullish__ : ['']}
	));

	assert.false(_.isNullish(foo, boo, far));
});



test('hasMembers', (assert:ExecutionContext):void => {
	const foo:Record<string,number> = {
		a : 1,
		b : 2,
		c : 3
	};

	assert.true(_.hasMembers(foo, ['a', 'b', 'c']));

	assert.false(_.hasMembers(foo, ['a', 'b', 'd']));

	assert.true(_.hasMembers(console, ['log']));

	assert.true(_.hasMembers(window, ['location', 'parent']));

	assert.false(_.hasMembers(window, ['foobar']));
});



test('orDefault', (assert:ExecutionContext):void => {
	const
		foo:string = _.orDefault('none', 'kittens!', 'string', ['', 'none']) as string,
		bar:number = _.orDefault('2', 42, 'int') as number,
		foobar:string = _.orDefault(null, 'fluffy', 'str') as string,
		barfoo:boolean = _.orDefault(0, true, 'bool') as boolean,
		boo:Array<string|number> = _.orDefault('a', [1, 2, 3], 'array') as Array<string|number>,
		far:number = _.orDefault(42, 1.1, 'float') as number
	;

	assert.is(foo, 'kittens!');

	assert.is(bar, 2);

	assert.is(foobar, 'fluffy');

	assert.false(barfoo);

	assert.deepEqual(boo, ['a']);

	assert.is(far, 42.0);
});



test('getType', (assert:ExecutionContext):void => {
	const outerNode:HTMLElement = document.createElement('div');
	outerNode.innerHTML = exampleSVG;

	const
		foo:boolean = true,
		bar:Record<string,string> = {a : 'b'},
		foobar:Function = ():number => 42.42,
		boo:Date = new Date(),
		far:Array<number> = [1, 2, 3],
		boofar:RegExp = /[a-z0-9]/g,
		lala:Set<number> = new Set([1, 2, 3, 4, 5]),
		wm:Map<Function,string> = new Map(),
		u:URL = new URL('', window.location.origin),
		usp:URLSearchParams = new URLSearchParams(),
		svg:Node = outerNode.firstChild
	;
	wm.set(foobar, 'foobar');

	assert.is((_.getType(foo) === 'boolean' && foo) ? 'true' : 'false', 'true');

	assert.is(_.getType(bar), 'object');

	assert.is(_.getType(bar.a), 'string');

	assert.is(_.getType(foobar), 'function');

	assert.is(_.getType(foobar()), 'number');

	assert.is(_.getType(boo), 'date');

	assert.is(_.getType(far), 'array');

	assert.is(_.getType(far[1]), 'number');

	assert.is(_.getType(boofar), 'regexp');

	assert.not(_.getType(boofar), 'boofar');

	assert.not(_.getType(bar.a), 'date');

	assert.is(_.getType(lala), 'set');

	assert.is(_.getType(wm), 'map');

	assert.is(_.getType(wm.values()), 'iterator');

	assert.is(_.getType(u), 'url');

	assert.is(_.getType(usp), 'urlsearchparams');

	assert.is(_.getType(document.querySelectorAll('.test')), 'nodelist');

	assert.is(_.getType(document), 'htmldocument');

	assert.is(_.getType(document.createElement('div')), 'htmlelement');

	assert.is(_.getType(document.createElement('p')), 'htmlelement');

	assert.is(_.getType(document.createElement('body')), 'htmlelement');

	assert.is(_.getType(svg), 'svgelement');
});



test('isA', (assert:ExecutionContext):void => {
	const outerNode:HTMLElement = document.createElement('div');
	outerNode.innerHTML = exampleSVG;

	const
		foo:boolean = true,
		bar:Record<string,string> = {a : 'b'},
		foobar:Function = ():number => 42.42,
		boo:Date = new Date(),
		far:Array<number> = [1, 2, 3],
		boofar:RegExp = /[a-z0-9]/g,
		lala:Set<number> = new Set([1, 2, 3, 4, 5]),
		wm:Map<Function,string> = new Map(),
		u:URL = new URL('', window.location.origin),
		usp:URLSearchParams = new URLSearchParams(),
		svg:Node = outerNode.firstChild
	;
	wm.set(foobar, 'foobar');

	assert.is((_.isA(foo, 'boolean') && foo) ? 'true' : 'false', 'true');

	assert.true(_.isA(bar, 'object'));

	assert.true(_.isA(bar.a, 'string'));

	assert.true(_.isA(foobar, 'function'));

	assert.true(_.isA(foobar(), 'number'));

	assert.true(_.isA(boo, 'date'));

	assert.true(_.isA(far, 'array'));

	assert.true(_.isA(far[1], 'number'));

	assert.true(_.isA(boofar, 'regexp'));

	// @ts-ignore
	assert.false(_.isA(boofar, 'boofar'));

	assert.false(_.isA(bar.a, 'date'));

	assert.true(_.isA(lala, 'set'));

	assert.true(_.isA(wm, 'map'));

	assert.true(_.isA(wm.values(), 'iterator'));

    assert.true(_.isA(u, 'url'));

    assert.true(_.isA(usp, 'urlsearchparams'));

	assert.true(_.isA(document.querySelectorAll('.test'), 'nodelist'));

	assert.true(_.isA(document, 'htmldocument'));

	assert.true(_.isA(document.createElement('div'), 'htmlelement'));

	assert.true(_.isA(document.createElement('p'), 'htmlelement'));

	assert.true(_.isA(document.createElement('body'), 'htmlelement'));

	assert.true(_.isA(svg, 'svgelement'));
});



test('isBoolean', (assert:ExecutionContext):void => {
	const
		foo:boolean = true,
		bar:boolean = false,
		foobar:string = 'true',
		boofar:number = 5
	;

	assert.true(_.isBoolean(foo));
	assert.true(_.isBoolean(bar));
	assert.false(_.isBoolean(foobar));
	assert.false(_.isBoolean(boofar));
});



/*test('isNumber', assert => {
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

	boofar.add(new Date());

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
});*/
