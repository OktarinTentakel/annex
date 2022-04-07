import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.css;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/css.js`);
}

const {
	applyStyles,
	cssValueToNumber,
	cssUrlValueToUrl,
	remByPx
} = pkg;



test('applyStyles', assert => {
	const foo = document.createElement('div');

	assert.throws(() => { applyStyles('foo'); }, {message : /not an html element/});
	assert.throws(() => { applyStyles(foo, 'foo'); }, {message : /must be a plain object/});

	let styles = applyStyles(foo, {
		color : 'red',
		lineHeight : '1',
		'font-family' : 'arial, sans-serif',
		width : 100,
		height : '100vh'
	});

	assert.is(styles.lineHeight, '1');
	assert.is(styles.width, '100px');
	assert.is(styles['font-family'], 'arial, sans-serif');

	styles = applyStyles(foo, {
		width : 1000,
		height : '100vh',
		'font-family' : 'arial, sans-serif',
		transition : 'width 200ms, transform 1s'
	}, true);

	assert.is(styles.width, '1000px');
	assert.is(styles.height, '100vh');
	assert.is(styles['-webkit-height'], '100vh');
	assert.is(styles['font-family'], 'arial, sans-serif');
	assert.is(styles.transition, 'width 200ms, transform 1s');
	assert.is(styles['-moz-transition'], 'width 200ms, -moz-transform 1s');

	styles = applyStyles(foo, {
		width : 1000,
		height : '100vh',
		'font-family' : 'arial, sans-serif',
		transition : 'width 200ms, transform 1s'
	}, true, true);

	assert.is(styles.getPropertyValue('width'), '1000px');
	assert.is(styles.getPropertyValue('height'), '100vh');
	assert.is(styles.getPropertyValue('-webkit-height'), '');
	assert.is(styles.getPropertyValue('font-family'), 'arial, sans-serif');
	assert.is(styles.getPropertyValue('transition'), 'width 200ms, transform 1s');
	assert.is(styles.getPropertyValue('-moz-transition'), '');

	styles = applyStyles(foo, {
		width : null,
		'font-family' : null,
		transition : undefined
	}, false, true);

	assert.is(styles.getPropertyValue('width'), '');
	assert.is(styles.getPropertyValue('font-family'), '');
	assert.is(styles.getPropertyValue('transition'), '');

	styles = applyStyles(foo, {
		width : null,
		height : '100vh',
		'font-family' : null,
		transition : undefined
	});

	assert.is(Object.values(styles).length, 1);
	assert.is(styles.width, undefined);
	assert.is(styles.height, '100vh');
});



test('cssValueToNumber', assert => {
	function isNaN(number){
		return number !== number;
	}

	assert.is(cssValueToNumber(123), 123);
	assert.is(cssValueToNumber('0123a'), 123);
	assert.is(cssValueToNumber('5000px'), 5000);
	assert.is(cssValueToNumber('1.5'), 1.5);
	assert.is(cssValueToNumber('5em'), 5);
	assert.is(cssValueToNumber('1.5ex'), 1.5);
	assert.is(cssValueToNumber('1000%'), 1000);
	assert.is(cssValueToNumber('42.42em'), 42.42);
	assert.is(cssValueToNumber('0.1cm'), 0.1);
	assert.true(isNaN(cssValueToNumber('EINSWEIcm')));
	assert.true(isNaN(cssValueToNumber('color 200ms, width 1s')));
	assert.true(isNaN(cssValueToNumber('color 200ms ease-out, width 1s linear')));
});



test('cssUrlValueToUrl', assert => {
	assert.is(cssUrlValueToUrl('url("../img/foo/bar/foobar.jpg")'), '../img/foo/bar/foobar.jpg');
	assert.is(cssUrlValueToUrl('url(../img/foo/bar/foobar.jpg)', '..', ''), '/img/foo/bar/foobar.jpg');
	assert.is(
		cssUrlValueToUrl('linear-gradient(whatever), something url(\'https://foobar.com/foo/bar/foobar.jpg\'), 1px solid red'),
		'https://foobar.com/foo/bar/foobar.jpg'
	);
	assert.is(
		cssUrlValueToUrl('url(\'../img/foo/bar/foobar.jpg\')', '../img/foo', 'https://foobar.com'),
		'https://foobar.com/bar/foobar.jpg'
	);
	assert.is(cssUrlValueToUrl('../img/foo/bar/foobar.jpg', '../img/foo', 'bar'), null);
	assert.deepEqual(
		cssUrlValueToUrl(`url(/foo/bar),
			url('https://google.com') url("test.jpg"),url(omg.svg)
			url(http://lol.com)`
		),
		['/foo/bar', 'https://google.com', 'test.jpg', 'omg.svg', 'http://lol.com']
	);
	assert.deepEqual(
		cssUrlValueToUrl(`
			url(/foo/bar),
			url('https://google.com') url("test.jpg"),url(omg.svg)
			url(http://lol.com)
		`, 'http:', 'https:'),
		['/foo/bar', 'https://google.com', 'test.jpg', 'omg.svg', 'https://lol.com']
	);
});



test('remByPx', assert => {
	document.querySelectorAll('html, body').forEach(element => {
		element.style.setProperty('font-size', '16px');
	});

	assert.is(remByPx(10, 20), '0.5rem');
	assert.is(remByPx('10px', '20px'), '0.5rem');
	assert.is(remByPx(32), '2rem');
	assert.is(remByPx(42, document.body), '2.625rem');
	assert.throws(() => { remByPx(10, 'div.foobar'); });

	document.querySelectorAll('html, body').forEach(element => {
		element.style.setProperty('font-size', '');
	});
});
