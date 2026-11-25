import type {ExecutionContext} from 'ava';

import test from 'ava';

import {css as _} from './_implementations.ts';



test('applyStyles', (assert:ExecutionContext):void => {
	const foo:HTMLDivElement = document.createElement('div');

	let styles:CSSStyleDeclaration|Record<string,string|number> = _.applyStyles(foo, {
		color : 'red',
		lineHeight : '1',
		'font-family' : 'arial, sans-serif',
		width : 100,
		height : '100vh'
	}) as Record<string,string|number>;

	assert.throws(
		// @ts-ignore
		():void => { _.applyStyles('foo'); },
		{message : /not an html element/}
	);

	assert.throws(
		// @ts-ignore
		():void => { _.applyStyles(foo, 'foo'); },
		{message : /must be a plain object/}
	);

	assert.is(styles.lineHeight, '1');

	assert.is(styles.width, '100px');

	assert.is(styles['font-family'], 'arial, sans-serif');

	styles = _.applyStyles(foo, {
		width : 1000,
		height : '100vh',
		'font-family' : 'arial, sans-serif',
		transition : 'width 200ms, transform 1s'
	}, true) as Record<string,string|number>;

	assert.is(styles.width, '1000px');

	assert.is(styles.height, '100vh');

	assert.is(styles['-webkit-height'], '100vh');

	assert.is(styles['font-family'], 'arial, sans-serif');

	assert.is(styles.transition, 'width 200ms, transform 1s');

	assert.is(styles['-moz-transition'], 'width 200ms, -moz-transform 1s');

	styles = _.applyStyles(foo, {
		width : 1000,
		height : '100vh',
		'font-family' : 'arial, sans-serif',
		transition : 'width 200ms, transform 1s'
	}, true, true) as CSSStyleDeclaration;

	assert.is(styles.getPropertyValue('width'), '1000px');

	assert.is(styles.getPropertyValue('height'), '100vh');

	assert.is(styles.getPropertyValue('-webkit-height'), '');

	assert.is(styles.getPropertyValue('font-family'), 'arial, sans-serif');

	assert.is(styles.getPropertyValue('transition'), 'width 200ms, transform 1s');

	assert.is(styles.getPropertyValue('-moz-transition'), '');

	styles = _.applyStyles(foo, {
		width : null,
		'font-family' : null,
		transition : undefined
	}, false, true) as CSSStyleDeclaration;

	assert.is(styles.getPropertyValue('width'), '');

	assert.is(styles.getPropertyValue('font-family'), '');

	assert.is(styles.getPropertyValue('transition'), '');

	styles = _.applyStyles(foo, {
		width : null,
		height : '100vh',
		'font-family' : null,
		transition : undefined
	}) as Record<string,string|number>;

	assert.is(Object.values(styles).length, 1);

	assert.is(styles.width, undefined);

	assert.is(styles.height, '100vh');
});



test('cssValueToNumber', (assert:ExecutionContext):void => {
	function isNaN(number:number):boolean{
		return number !== number;
	}

	assert.is(_.cssValueToNumber(123), 123);

	assert.is(_.cssValueToNumber('0123a'), 123);

	assert.is(_.cssValueToNumber('5000px'), 5000);

	assert.is(_.cssValueToNumber('1.5'), 1.5);

	assert.is(_.cssValueToNumber('5em'), 5);

	assert.is(_.cssValueToNumber('1.5ex'), 1.5);

	assert.is(_.cssValueToNumber('1000%'), 1000);

	assert.is(_.cssValueToNumber('42.42em'), 42.42);

	assert.is(_.cssValueToNumber('0.1cm'), 0.1);

	assert.true(isNaN(_.cssValueToNumber('EINSWEIcm')));

	assert.true(isNaN(_.cssValueToNumber('color 200ms, width 1s')));

	assert.true(isNaN(_.cssValueToNumber('color 200ms ease-out, width 1s linear')));
});



test('cssUrlValueToUrl', (assert:ExecutionContext):void => {
	assert.is(
		_.cssUrlValueToUrl('url("../img/foo/bar/foobar.jpg")'),
		'../img/foo/bar/foobar.jpg'
	);

	assert.is(
		_.cssUrlValueToUrl('url(../img/foo/bar/foobar.jpg)', '..', ''),
		'/img/foo/bar/foobar.jpg'
	);

	assert.is(
		_.cssUrlValueToUrl('linear-gradient(whatever), something url(\'https://foobar.com/foo/bar/foobar.jpg\'), 1px solid red'),
		'https://foobar.com/foo/bar/foobar.jpg'
	);

	assert.is(
		_.cssUrlValueToUrl('url(\'../img/foo/bar/foobar.jpg\')', '../img/foo', 'https://foobar.com'),
		'https://foobar.com/bar/foobar.jpg'
	);

	assert.is(
		_.cssUrlValueToUrl('../img/foo/bar/foobar.jpg', '../img/foo', 'bar'),
		null
	);

	assert.deepEqual(
		_.cssUrlValueToUrl(`url(/foo/bar),
			url('https://google.com') url("test.jpg"),url(omg.svg)
			url(http://lol.com)`
		),
		['/foo/bar', 'https://google.com', 'test.jpg', 'omg.svg', 'http://lol.com']
	);

	assert.deepEqual(
		_.cssUrlValueToUrl(`
			url(/foo/bar),
			url('https://google.com') url("test.jpg"),url(omg.svg)
			url(http://lol.com)
		`, 'http:', 'https:'),
		['/foo/bar', 'https://google.com', 'test.jpg', 'omg.svg', 'https://lol.com']
	);
});



test('remByPx', (assert:ExecutionContext):void => {
	document.querySelectorAll('html, body').forEach((element:HTMLElement):void => {
		element.style.setProperty('font-size', '16px');
	});

	assert.is(_.remByPx(10, 20), '0.5rem');

	assert.is(_.remByPx('10px', '20px'), '0.5rem');

	assert.is(_.remByPx(32), '2rem');

	assert.is(_.remByPx(42, document.body), '2.625rem');

	assert.throws(():void => { _.remByPx(10, 'div.foobar'); });

	document.querySelectorAll('html, body').forEach((element:HTMLElement):void => {
		element.style.setProperty('font-size', '');
	});
});
