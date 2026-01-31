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
		far:number = _.orDefault(42, 1.1, 'float') as number,
		baz:Date = _.orDefault(null, '1983-03-16', (val:string):Date => {
			return new Date(val);
		}) as Date
	;

	assert.is(foo, 'kittens!');

	assert.is(bar, 2);

	assert.is(foobar, 'fluffy');

	assert.false(barfoo);

	assert.deepEqual(boo, ['a']);

	assert.is(far, 42.0);

	assert.is(baz.getFullYear(), 1983);
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



test('isNumber', (assert:ExecutionContext):void => {
	const
		foo:number = 42,
		bar:number = 42.42,
		foobar:string = '13',
		boofar:boolean = true
	;

	assert.true(_.isNumber(foo));

	assert.true(_.isNumber(bar));

	assert.false(_.isNumber(foobar));

	assert.false(_.isNumber(boofar));
});



test('isBigInt', (assert:ExecutionContext):void => {
	const
		foo:bigint = BigInt('9007199254740991'),
		bar:bigint = BigInt('0x1fffffffffffff'),
		foobar:number = 9007199254740991,
		boofar:number = 0
	;

	assert.true(_.isBigInt(foo));

	assert.true(_.isBigInt(bar));

	assert.false(_.isBigInt(foobar));

	assert.false(_.isBigInt(boofar));
});



test('isInt', (assert:ExecutionContext):void => {
	const
		foo:number = 42,
		bar:number = 42.42,
		foobar:string = '42',
		boofar:boolean = true
	;

	assert.true(_.isInt(foo));

	assert.false(_.isInt(bar));

	assert.false(_.isInt(foobar));

	assert.false(_.isInt(boofar));
});



test('isFloat', (assert:ExecutionContext):void => {
	const
		foo:number = 42.42,
		bar:number = 42,
		foobar:string = '42.42',
		boofar:boolean = true
	;

	assert.true(_.isFloat(foo));

	assert.true(_.isFloat(bar));

	assert.false(_.isFloat(foobar));

	assert.false(_.isFloat(boofar));
});



test('isNaN', (assert:ExecutionContext):void => {
	const
		foo:number = NaN,
		bar:number = parseInt('abc', 10),
		foobar:string = 'abc',
		boo:string = '42',
		far:Date = new Date(),
		boofar:RegExp = /abc/g
	;

	assert.true(_.isNaN(foo));

	assert.true(_.isNaN(bar));

	// @ts-ignore
	assert.false(_.isNaN(foobar));

	// @ts-ignore
	assert.false(_.isNaN(boo));

	// @ts-ignore
	assert.false(_.isNaN(far));

	// @ts-ignore
	assert.false(_.isNaN(boofar));
});



test('isString', (assert:ExecutionContext):void => {
	const
		foo:string = 'foo',
		bar:string = Symbol('bar').toString(),
		foobar:Symbol = Symbol('foobar'),
		boofar:number = 0
	;

	assert.true(_.isString(foo));

	assert.true(_.isString(bar));

	assert.false(_.isString(foobar));

	assert.false(_.isString(boofar));
});



test('isSymbol', (assert:ExecutionContext):void => {
	const
		foo:Symbol = Symbol('foo'),
		bar:Symbol = Symbol(42),
		foobar:string = Symbol('foobar').description,
		boofar:number = 0
	;

	assert.true(_.isSymbol(foo));

	assert.true(_.isSymbol(bar));

	assert.false(_.isSymbol(foobar));

	assert.false(_.isSymbol(boofar));
});



test('isFunction', (assert:ExecutionContext):void => {
	function foo():boolean{
		return true;
	}

	const
		bar:Function = ():boolean => false,
		foobar:Function = Symbol().toString,
		boofar:string = 'function(){}'
	;

	assert.true(_.isFunction(foo));

	assert.true(_.isFunction(bar));

	assert.true(_.isFunction(foobar));

	assert.false(_.isFunction(boofar));
});



test('isObject', (assert:ExecutionContext):void => {
	const
		foo:Record<string,string> = {},
		bar:Object = new Object(42),
		foobar:Date = new Date(),
		boofar:number = 42
	;

	assert.true(_.isObject(foo));

	assert.true(_.isObject(bar));

	assert.false(_.isObject(foobar));

	assert.false(_.isObject(boofar));
});



test('isPlainObject', (assert:ExecutionContext):void => {
	assert.true(_.isPlainObject({}));

	assert.true(_.isPlainObject({a : 1, b : new Date()}));

	assert.true(_.isPlainObject(new Object()));

	assert.false(_.isPlainObject(document.createElement('div')));

	assert.false(_.isPlainObject(null));

	assert.false(_.isPlainObject(Object.create(null)));

	assert.false(_.isPlainObject(Object.create(null)));

	assert.false(_.isPlainObject(new (function Foo():void{})()));

	assert.false(_.isPlainObject(42));

	assert.false(_.isPlainObject('42'));

	assert.false(_.isPlainObject(new Number(42)));

	assert.false(_.isPlainObject(Math));
});



test('isArray', (assert:ExecutionContext):void => {
	const
		foo:Array<any> = [1, 2, {}, []],
		bar:Array<any> = Array.from(new Set([1, 2, 3, {}, []])),
		foobar:Set<any> = new Set([1, 2, 3, {}, []]),
		boofar:SetIterator<any> = new Set([1, 2, 3, {}, []]).values()
	;

	assert.true(_.isArray(foo));

	assert.true(_.isArray(bar));

	assert.false(_.isArray(foobar));

	assert.false(_.isArray(boofar));
});



test('isDate', (assert:ExecutionContext):void => {
	const
		foo:Date = new Date(),
		bar:Date = new Date('1983-03-16'),
		foobar:number = Date.now(),
		boofar:string = '1983-03-16'
	;

	assert.true(_.isDate(foo));

	assert.true(_.isDate(bar));

	assert.false(_.isDate(foobar));

	assert.false(_.isDate(boofar));
});



test('isError', (assert:ExecutionContext):void => {
	class FooError extends Error {
		constructor(props:any){
			super(props);
		}
	}

	let foobar:Error;
	try {
		throw 'foobar';
	} catch(ex){
		foobar = ex;
	}

	const
		foo:Error = new Error(),
		bar:FooError = new FooError('foo'),
		boofar:string = 'error'
	;

	assert.true(_.isError(foo));

	assert.true(_.isError(bar));

	assert.false(_.isError(foobar));

	assert.false(_.isError(boofar));
});



test('isGenerator', (assert:ExecutionContext):void => {
	function* finiteGen():Generator<number>{
		yield 1;
		yield 2;
		yield 3;
	}

	const infiniteGen:Function = function*():Generator<number>{
		let i:number = 0;

		while(true){
			yield i++;
		}
	}

	const
		foo:Generator<number> = finiteGen(),
		bar:Generator<number> = infiniteGen(),
		foobar:IteratorResult<number> = finiteGen().return(finiteGen().next().value),
		boofar:IteratorResult<number> = infiniteGen().next()
	;

	assert.true(_.isGenerator(foo));

	assert.true(_.isGenerator(bar));

	assert.false(_.isGenerator(foobar));

	assert.false(_.isGenerator(boofar));
});



test('isIterator', (assert:ExecutionContext):void => {
	function* finiteGen():Generator<number>{
		yield 1;
		yield 2;
		yield 3;
	}

	const
		foo:ArrayIterator<number> = Array.from(finiteGen()).values(),
		bar:RegExpStringIterator<RegExpExecArray> = 'bar'.matchAll(/bar/g),
		foobar:Set<any> = new Set([1, 2, 3, {}, []]),
		boofar:string = 'boofar'
	;

	assert.true(_.isIterator(foo));

	assert.true(_.isIterator(bar));

	assert.false(_.isIterator(foobar));

	assert.false(_.isIterator(boofar));
});



test('isRegExp', (assert:ExecutionContext):void => {
	const
		foo:RegExp = /^foo$/,
		bar:RegExp = new RegExp('^bar$'),
		foobar:string = '^foobar$',
		boofar:number = 42
	;

	assert.true(_.isRegExp(foo));

	assert.true(_.isRegExp(bar));

	assert.false(_.isRegExp(foobar));

	assert.false(_.isRegExp(boofar));
});



test('isSet', (assert:ExecutionContext):void => {
	const
		foo:Set<any> = new Set([1, 2, 3, {}, []]),
		bar:Set<any> = new Set(Array.from(new Set([1, 2, 3, {}, []]))),
		foobar:Array<any> = [1, 2, 3, {}, []],
		boofar:WeakSet<Date> = new WeakSet()
	;
	boofar.add(new Date());

	assert.true(_.isSet(foo));

	assert.true(_.isSet(bar));

	assert.false(_.isSet(foobar));

	assert.false(_.isSet(boofar));
});



test('isWeakSet', (assert:ExecutionContext):void => {
	const
		foo:WeakSet<any> = new WeakSet([{}, [], new Date()]),
		bar:WeakSet<any> = new WeakSet(Array.from(new Set([{}, [], new Date()]))),
		foobar:Array<any> = [1, 2, 3, {}, []],
		boofar:Set<any> = new Set([1, 2, 3, {}, []])
	;

	assert.true(_.isWeakSet(foo));

	assert.true(_.isWeakSet(bar));

	assert.false(_.isWeakSet(foobar));

	assert.false(_.isWeakSet(boofar));
});



test('isMap', (assert:ExecutionContext):void => {
	const
		foo:Map<string,string> = new Map(Object.entries({a : 'a', b : 'b', c : 'c'})),
		bar:Map<Symbol,string> = new Map(),
		foobar:Record<string,string> = {a : 'a', b : 'b', c : 'c'},
		boofar:WeakMap<object,string> = new WeakMap()
	;
	boofar.set({}, 'boofar');
	bar.set(Symbol('bar'), 'bar');

	assert.true(_.isMap(foo));

	assert.true(_.isMap(bar));

	assert.false(_.isMap(foobar));

	assert.false(_.isMap(boofar));
});



test('isWeakMap', (assert:ExecutionContext):void => {
	const
		foo:WeakMap<Object|Array<any>|Date,string> = new WeakMap(),
		bar:WeakMap<Object,string> = new WeakMap(),
		foobar:Record<string,string> = {a : 'a', b : 'b', c : 'c'},
		boofar:Map<string,string> = new Map(Object.entries({a : 'a', b : 'b', c : 'c'}))
	;
	foo.set({}, 'a');
	foo.set([], 'b');
	foo.set(new Date(), 'c');
	bar.set({}, 'bar');

	assert.true(_.isWeakMap(foo));

	assert.true(_.isWeakMap(bar));

	assert.false(_.isWeakMap(foobar));

	assert.false(_.isWeakMap(boofar));
});



test('isDocument', (assert:ExecutionContext):void => {
	const
		foo:Document = window.document,
		bar:Document = window.parent.document,
		foobar:Window = window,
		boofar:HTMLElement = document.body
	;

	assert.true(_.isDocument(foo));

	assert.true(_.isDocument(bar));

	assert.false(_.isDocument(foobar));

	assert.false(_.isDocument(boofar));
});



test('isElement', (assert:ExecutionContext):void => {
	const
		foo:Document = document,
		bar:HTMLElement = document.body,
		foobar:HTMLElement = document.querySelector('body'),
		boo:HTMLElement = document.createElement('div'),
		far:CustomEvent = new CustomEvent('test'),
		boofar:Record<string,number> = {a : 1}
	;

	assert.false(_.isElement(foo));

	assert.true(_.isElement(bar));

	assert.true(_.isElement(foobar));

	assert.true(_.isElement(boo));

	assert.false(_.isElement(far));

	assert.false(_.isElement(boofar));
});



test('isSvg', (assert:ExecutionContext):void => {
	const outerNode:HTMLElement = document.createElement('div');
	outerNode.innerHTML = exampleSVG;

	const
		foo:Document = document,
		foobar:HTMLElement = document.querySelector('body'),
		svg:Node = outerNode.firstChild
	;

	assert.false(_.isSvg(foo));

	assert.false(_.isSvg(foobar));

	assert.true(_.isSvg(svg));
});



test('isCollection', (assert:ExecutionContext):void => {
	const
		foo:HTMLCollection = document.body.children,
		bar:HTMLCollection = document.body.appendChild(document.createElement('div')).parentNode.children,
		foobar:NodeList = document.body.childNodes,
		boofar:Array<HTMLElement> = [document.body]
	;

	assert.true(_.isCollection(foo));

	assert.true(_.isCollection(bar));

	assert.false(_.isCollection(foobar));

	assert.false(_.isCollection(boofar));
});



test('isNodeList', (assert:ExecutionContext):void => {
	const
		foo:NodeList = document.body.childNodes,
		bar:NodeList = document.body.appendChild(document.createElement('div')).parentNode.childNodes,
		foobar:HTMLCollection = document.body.children,
		boofar:Array<HTMLElement> = [document.body]
	;

	assert.true(_.isNodeList(foo));

	assert.true(_.isNodeList(bar));

	assert.false(_.isNodeList(foobar));

	assert.false(_.isNodeList(boofar));
});



test('isWindow', (assert:ExecutionContext):void => {
	const
		foo:Window = window,
		bar:Window = window.parent,
		foobar:Document = document,
		boofar:HTMLElement = document.body
	;

	assert.true(_.isWindow(foo));

	assert.true(_.isWindow(bar));

	assert.false(_.isWindow(foobar));

	assert.false(_.isWindow(boofar));
});



test('isUrl', (assert:ExecutionContext):void => {
	const
		foo:URL = new URL('', window.location.origin),
		bar:URL = new URL('https://google.com'),
		foobar:string = 'https://google.com',
		boofar:string = window.location.origin
	;

	assert.true(_.isUrl(foo));

	assert.true(_.isUrl(bar));

	assert.false(_.isUrl(foobar));

	assert.false(_.isUrl(boofar));
});



test('isUrlSearchParams', (assert:ExecutionContext):void => {
	const
		foo:URLSearchParams = new URLSearchParams(),
		bar:URLSearchParams = new URL('', window.location.origin).searchParams,
		foobar:string = '?foo=bar&bar=foo',
		boofar:Record<string,string> = {foo : 'bar', bar : 'foo'}
	;

	assert.true(_.isUrlSearchParams(foo));

	assert.true(_.isUrlSearchParams(bar));

	assert.false(_.isUrlSearchParams(foobar));

	assert.false(_.isUrlSearchParams(boofar));
});



test('isEventTarget', (assert:ExecutionContext):void => {
	const
		foo:Document = document,
		bar:HTMLElement = document.body,
		foobar:HTMLElement = document.querySelector('body'),
		boo:HTMLElement = document.createElement('div'),
		far:CustomEvent = new CustomEvent('test'),
		boofar:Record<string,number> = {a : 1},
		zzz:Record<string,Function> = {
			addEventListener():void{},
			removeEventListener():void{},
			dispatchEvent():void{}
		}
	;

	assert.true(_.isEventTarget(foo));

	assert.true(_.isEventTarget(bar));

	assert.true(_.isEventTarget(foobar));

	assert.true(_.isEventTarget(boo));

	assert.false(_.isEventTarget(far));

	assert.false(_.isEventTarget(boofar));

	assert.true(_.isEventTarget(zzz));
});



test('isSelector', (assert:ExecutionContext):void => {
	const
		foo:string = 'a',
		bar:string = '> body',
		foobar:string = 'button.btn[data-foobar][class*="test"]',
		boo:string = 'div ~ div',
		far:string = '#test',
		boofar:string = '$test',
		zzz:number = 42
	;

	assert.true(_.isSelector(foo));

	assert.false(_.isSelector(bar));

	assert.true(_.isSelector(foobar));

	assert.true(_.isSelector(boo));

	assert.true(_.isSelector(far));

	assert.false(_.isSelector(boofar));

	assert.false(_.isSelector(zzz));

	assert.false(_.isSelector(null));

	assert.false(_.isSelector(NaN));
});



test('getPotentialId', (assert:ExecutionContext):void => {
	assert.is(
		_.getPotentialId('0666'),
		null
	);

	assert.is(
		_.getPotentialId('prefix-42', 'prefix-'),
		'42'
	);

	assert.is(
		_.getPotentialId('prefix-042_postfix', 'prefix-', '[0-9]+', '_postfix'),
		'042'
	);

	assert.is(
		_.getPotentialId('prefix-042_postfix', 'prefix-', null, '_postfix'),
		null
	);
});



test('isPotentialId', (assert:ExecutionContext):void => {
	assert.true(!!_.isPotentialId('666'));

	assert.false(_.isPotentialId('0666'));

	assert.true(!!_.isPotentialId('prefix-042', 'prefix-', '[0-9]+'));

	assert.false(_.isPotentialId('prefix-042_postfix', 'prefix-', null, '_postfix'));

	assert.true(!!_.isPotentialId('42_postfix', null, null, '_postfix'));
});



test('min', (assert:ExecutionContext):void => {
	const
		foo:number = _.min(1, 5),
		bar:number = _.min(42.42, 666.66),
		foobar:string = _.min('a', 'b'),
		far:number = _.min(-150.5, -200),
		boofar:number = _.min(13, 13),
		brafoo:number = _.min(-42.42, 666)
	;

	assert.is(foo, 5);

	assert.is(bar, 666.66);

	assert.is(foobar, 'b');

	assert.is(far, -150.5);

	assert.is(boofar, 13);

	assert.is(brafoo, 666);
});



test('max', (assert:ExecutionContext):void => {
	const
		foo:number = _.max(10, 5),
		bar:number = _.max(100000000000, 666.66),
		foobar:string = _.max('zzz', 'b'),
		far:number = _.max(-150.5, -3),
		boofar:number = _.max(13, 13),
		brafoo:number = _.max(666, -42.42)
	;

	assert.is(foo, 5);

	assert.is(bar, 666.66);

	assert.is(foobar, 'b');

	assert.is(far, -150.5);

	assert.is(boofar, 13);

	assert.is(brafoo, -42.42);
});



test('minMax', (assert:ExecutionContext):void => {
	const
		foo:number = _.minMax(1, 5, 10),
		bar:number = _.minMax(42.42, 100000000000, 666.66),
		foobar:string = _.minMax('a', 'zzz', 'b'),
		boo:Array<number> = [-100, -150, -200],
		far:number = _.minMax(-150.5, -200, -3),
		boofar:number = _.minMax(13, 13, 13),
		brafoo:number = _.minMax(-42.42, 666, -42.42)
	;

	assert.is(foo, 5);

	assert.is(bar, 666.66);

	assert.is(foobar, 'b');

	assert.throws(():void => { _.minMax(boo[0], boo[1], boo[2]); });

	assert.is(far, -150.5);

	assert.is(boofar, 13);

	assert.is(brafoo, -42.42);
});



test('round', (assert:ExecutionContext):void => {
	const
		foo:number = _.round(0.55555, 3),
		bar:number = _.round(42.42, 2),
		foobar:number = _.round(-42.42, 1),
		far:number = _.round(-666.66),
		boofar:number = _.round(0.55555, 10),
		brafoo:number = _.round(0.1)
	;

	assert.is(foo, 0.556);

	assert.is(bar, 42.42);

	assert.is(foobar, -42.4);

	assert.is(far, -667);

	assert.is(boofar, 0.55555);

	assert.is(brafoo, 0);
});



class Deferred<T> extends _.Deferred<T> {}
test('Deferred', (assert:ExecutionContext):Promise<void> => {
	return new Promise(function(resolve:() => void, reject:() => void):void{
		const
			foo:Deferred<Record<string,number>> = new _.Deferred(),
			bar = new _.Deferred(),
			baz = new _.Deferred()
		;

		let endCount:number = 0;
		function end(success:boolean):void{
			endCount++;

			if( !success ){
				reject();
			} else if( endCount === 6 ){
				resolve();
			}
		}

		foo
			.then((value:Record<string,number>):void => {
				assert.is(value.result, 42);
				end(value.result === 42);
			})
			.catch(():void => { end(false); })
			.finally(():void => {
				end(foo.status === 'fulfilled');
			})
		;

		bar.catch((error:Error):void => {
			assert.is(error.message, 'blimey!');
			end(error.message === 'blimey!');
		});

		baz.then(
			():void => {
				end(false);
			},
			(reason:number):void => {
				assert.is(reason, 42);
				end(reason === 42);
			}
		);

		Promise.all([foo.promise]).then(():void => { end(true); });
		Promise.allSettled([foo.promise, baz.promise]).then(():void => { end(true); });

		assert.false(bar.isSettled());
		foo.resolve({result : 42});
		bar.reject(new Error('blimey!'));
		bar.resolve(true);
		baz.reject(42);
		assert.true(bar.isSettled());
	});
});



class Observable<T> extends _.Observable<T> {}
test('Observable', (assert:ExecutionContext):void => {
	let changeCount:number = 0;

	const
		foo:Observable<number> = new _.Observable(42),
		fooSubscription:(current?:number,old?:number) => void = foo.subscribe(():void => {
			changeCount++;
		}),
		bar = new _.Observable({bar : 13}),
		barSubscription:(current?:Record<string,number>,old?:Record<string,number>) => void = bar.subscribe(():void => {
			changeCount++;
		})
	;

	assert.is(foo.getValue(), 42);
	foo.setValue(42);
	foo.setValue(42, true);
	foo.setValue(23);
	assert.is(foo.getValue(), 23);

	assert.throws(
		// @ts-ignore
		():void => { foo.subscribe(42); },
		{message : /must be function/}
	);

	bar.setValue({bar : 42});
	assert.is(bar.getValue().bar, 42);

	foo.unsubscribe(fooSubscription);
	foo.setValue(1);
	foo.setValue(2);
	foo.setValue(3);

	// @ts-ignore
	bar.unsubscribe(fooSubscription);
	bar.setValue({bar : 1});

	assert.is(changeCount, 4);
});
