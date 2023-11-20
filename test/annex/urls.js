import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.urls;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/urls.js`);
}

const {
	urlParameter,
	urlParameters,
	urlAnchor,
	addNextParameter,
	addCacheBuster,
	evaluateBaseDomain,
	Urison
} = pkg;



test('urlParameter & urlParameters', assert => {
	const
		url1 = 'foobar.com/foo',
		url2 = 'https://www.foo.bar',
		url3 = '//foo.bar/foo/bar/',
		qString1 = '?boofar&boo&foo=123&bar=%C3%BC%C3%A4%C3%B6%C3%9C%C3%84%C3%96%C3%9F%2B-%3C%3E%3F%26%3D&boo=boo&boo=oob&far[]=raf&far[]=%C3%BC%C3%A4%C3%B6%C3%9C%C3%84%C3%96%C3%9F%2B-%3C%3E%3F%26%3D',
		qString2 = '?boofar&boo&foo=123&bar=üäöÜÄÖß%2B-<>%3F%26%3D&boo=boo&boo=oob&far[]=raf&far[]=üäöÜÄÖß%2B-<>%3F%26%3D'
	;

	assert.true(urlParameter('?test', 'test'));
	assert.is(urlParameter('?test', 'testo'), null);

	[url1, url2, url3, ''].forEach(url => {
		if( url !== '' ){
			assert.is(urlParameter(url, 'test'), null);
			assert.is(urlParameter(url), null);
		}

		[qString1, qString2].forEach(qString => {
			assert.true(urlParameter(`${url}${qString}`, 'boofar'));
			assert.is(urlParameter(`${url}${qString}`, 'foo'), '123');
			assert.is(urlParameter(`${url}${qString}`, 'bar'), 'üäöÜÄÖß+-<>?&=');
			assert.deepEqual(urlParameter(`${url}${qString}`, 'boo'), [true, 'boo', 'oob']);
			assert.deepEqual(urlParameter(`${url}${qString}`, 'far[]'), ['raf', 'üäöÜÄÖß+-<>?&=']);
			assert.deepEqual(urlParameter(`${url}${qString}`), {
				'boofar' : true,
				'foo' : '123',
				'bar' : 'üäöÜÄÖß+-<>?&=',
				'boo' : [true, 'boo', 'oob'],
				'far[]' : ['raf', 'üäöÜÄÖß+-<>?&=']
			});
			assert.deepEqual(urlParameters(`${url}${qString}`), {
				'boofar' : true,
				'foo' : '123',
				'bar' : 'üäöÜÄÖß+-<>?&=',
				'boo' : [true, 'boo', 'oob'],
				'far[]' : ['raf', 'üäöÜÄÖß+-<>?&=']
			});
			assert.is(urlParameter(`${url}${qString}`, 'test'), null);
		});
	});
});



test('urlAnchor', assert => {
	const
		url1 = 'foobar.com/foo',
		url2 = 'https://www.foo.bar',
		url3 = '//foo.bar/foo/bar/',
		anchors = [
			{
				urlAnchor : '#foo',
				anchor : '#foo',
				rawAnchor : 'foo'
			},
			{
				urlAnchor : '#bar=foo',
				anchor : '#bar=foo',
				rawAnchor : 'bar=foo'
			},
			{
				urlAnchor : '#%C3%BC%C3%A4%C3%B6%C3%9C%C3%84%C3%96%C3%9F%2B-%3C%3E%3F%26%3D',
				anchor : '#üäöÜÄÖß+-<>?&=',
				rawAnchor : 'üäöÜÄÖß+-<>?&='
			},
			{
				urlAnchor : '',
				anchor : null,
				rawAnchor : null
			}
		]
	;

	[url1, url2, url3, ''].forEach(url => {
		anchors.forEach(anchor => {
			assert.is(urlAnchor(`${url}${anchor.urlAnchor}`), anchor.rawAnchor);
			assert.is(urlAnchor(`${url}${anchor.urlAnchor}`, true), anchor.anchor);
		});
	});
});



test('addNextParameter', assert => {
	assert.is(
		addNextParameter('https://foobar.com', 'https://foo.bar', 'redirect'),
		'https://foobar.com/?redirect=https%3A%2F%2Ffoo.bar%2F'
	);
	assert.throws(() => {
		addNextParameter('https://foobar.com', 'https://foo.bar', 'redirect', true);
	});
	assert.is(
		addNextParameter('https://lol.foobar.lol', 'https://rofl.foobar.lol', null, true, ['lol']),
		'https://lol.foobar.lol/?next=https%3A%2F%2Frofl.foobar.lol%2F'
	);
	assert.is(
		addNextParameter('https://foobar.com?next=https%3A%2F%2Ffoo.bar', 'https://kittens.com'),
		'https://foobar.com/?next=https%3A%2F%2Fkittens.com%2F'
	);
});



test('addCacheBuster', assert => {
	assert.regex(
		addCacheBuster('https://foobar.com'),
		/^https:\/\/foobar\.com\/\?_=[0-9]+$/
	);
	assert.regex(
		addCacheBuster('https://foobar.com?_=foobar'),
		/^https:\/\/foobar\.com\/\?_=[0-9]+$/
	);
	assert.regex(
		addCacheBuster('https://foobar.com?next=https%3A%2F%2Ffoo.bar', 'nocache'),
		/^https:\/\/foobar.com\/\?next=https%3A%2F%2Ffoo\.bar&nocache=[0-9]+$/
	);
});



test('evaluateBaseDomain', assert => {
	assert.is(evaluateBaseDomain('foobar.barfoo.co.uk'), 'barfoo.co.uk');
	assert.is(evaluateBaseDomain('foobar.barfoo.co.uk', ['barfoo']), 'foobar.barfoo.co.uk');
	assert.is(evaluateBaseDomain('https://foobar.barfoo.co.uk/?test=foobar', ['foobar', 'barfoo']), 'foobar.barfoo.co.uk');
	assert.is(evaluateBaseDomain('soft.kittens.ifschleife.de'), 'ifschleife.de');
	assert.is(evaluateBaseDomain('very.soft.kittens.ifschleife.de', ['kittens', 'ifschleife']), 'soft.kittens.ifschleife.de');
	assert.is(evaluateBaseDomain('http://very.soft.kittens.ifschleife.de?a=b&c=d', ['very', 'ifschleife']), 'kittens.ifschleife.de');
});



test('Urison', assert => {
	const
		urison = new Urison(),
		urisonRaw = new Urison(false)
	;

	const
		deeplyNested = {
			A : {
				B : {
					C : {
						D : 'E',
						F : 'G'
					}
				},
				H : {
					I : {
						J : 'K',
						L : 'M'
					}
				}
			}
		},
		realWorldObject = {
			firstname : 'Mäx',
			lastname : 'Müßtermann',
			job : 'Frontend Ape',
			address : {
				street : 'Blumenstraße',
				number : 13,
				zip : 12345,
				private : true,
				tags : ['has dog', 'unfriendly', {children : false}]
			},
			additional : null,
			separator : ',',
			bang : '!',
			brackets : ['(', ')'],
			whitespace : ''
		},
		syntaxArray = [
			"'", ',', '(', ')', '!', '', null, true, false, {
				separator : ',',
				bang : '!',
				brackets : ['(', ')'],
				whitespace : ''
			}
		]
	;

	assert.is(
		urison.encode({key3 : [false, 42, null], key : 'value', key2 : true}),
		'(key:value,key2:!t,key3:!(!f,42,!n))'
	);

	assert.deepEqual(
		urison.decode("(key:value,key2:!t,key3:!(!f,42,!n))"),
		{key : 'value', key2 : true, key3 : [false, 42, null]}
	);

	assert.is(
		urison.encodeObject({key3 : [false, +42, null], key : 'value', key2 : true}),
		'key:value,key2:!t,key3:!(!f,42,!n)'
	);

	assert.deepEqual(
		urison.decodeObject('key:value,key2:!t,key3:!(!f,42,!n)'),
		{key : 'value', key2 : true, key3 : [false, 42, null]}
	);

	assert.is(
		urison.encodeArray([false, -42, null]),
		'!f,-42,!n'
	);

	assert.deepEqual(
		urison.decodeArray('!f,42,!n'),
		[false, 42, null]
	);

	assert.is(
		urison.encode(42.42),
		'42.42'
	);

	assert.is(
		urison.decode('42.42'),
		42.42
	);

	assert.is(
		urison.encode(42),
		'42'
	);

	assert.is(
		urison.decode('42'),
		42
	);

	assert.is(
		urison.encode('foobar'),
		'foobar'
	);

	assert.is(
		urison.decode('foobar'),
		'foobar'
	);

	assert.is(
		urison.encode('test test'),
		"'test%20test'"
	);

	assert.is(
		urisonRaw.encode('test test'),
		"'test test'"
	);

	assert.is(
		urison.decode("'test%20test'"),
		'test test'
	);

	assert.is(
		urison.decode("'test test'"),
		'test test'
	);

	assert.is(
		urison.encode(null),
		'!n'
	);

	assert.is(
		urison.decode('!n'),
		null
	);

	assert.is(
		urison.encode(true),
		'!t'
	);

	assert.is(
		urison.decode('!t'),
		true
	);

	assert.is(
		urison.encode(false),
		'!f'
	);

	assert.is(
		urison.decode('!f'),
		false
	);

	assert.is(
		urison.encode(deeplyNested),
		'(A:(B:(C:(D:E,F:G)),H:(I:(J:K,L:M))))'
	);

	assert.deepEqual(
		urison.decode('(A:(B:(C:(D:E,F:G)),H:(I:(J:K,L:M))))'),
		deeplyNested
	);

	assert.is(
		urison.encodeObject({foobar : 'üäöÜÄÖß+-<>?&='}),
		'foobar:%C3%BC%C3%A4%C3%B6%C3%9C%C3%84%C3%96%C3%9F+-%3C%3E%3F%26%3D'
	);

	assert.is(
		urisonRaw.encodeObject({foobar : 'üäöÜÄÖß+-<>?&='}),
		'foobar:üäöÜÄÖß+-<>?&='
	);

	assert.deepEqual(
		urison.decodeObject('foobar:%C3%BC%C3%A4%C3%B6%C3%9C%C3%84%C3%96%C3%9F+-%3C%3E%3F%26%3D'),
		{foobar : 'üäöÜÄÖß+-<>?&='}
	);

	assert.deepEqual(
		urisonRaw.decodeObject('foobar:üäöÜÄÖß+-<>?&='),
		{foobar : 'üäöÜÄÖß+-<>?&='}
	);

	assert.throws(() => { urison.encodeObject([1, 2, 3]) });
	assert.throws(() => { urison.decode('test test') });
	assert.notThrows(() => { urison.decode("'test test'") });
	assert.throws(() => { urison.decode('(') });

	assert.is(
		urison.encode(realWorldObject),
		"(additional:!n,address:(number:13,private:!t,street:Blumenstra%C3%9Fe,tags:!('has%20dog',unfriendly,(children:!f)),zip:12345),bang:'!!',brackets:!('(',')'),firstname:M%C3%A4x,job:'Frontend%20Ape',lastname:M%C3%BC%C3%9Ftermann,separator:',',whitespace:'')"
	);

	assert.deepEqual(
		urison.decode("(additional:!n,address:(number:13,private:!t,street:Blumenstra%C3%9Fe,tags:!('has%20dog',unfriendly,(children:!f)),zip:12345),bang:'!!',brackets:!('(',')'),firstname:M%C3%A4x,job:'Frontend%20Ape',lastname:M%C3%BC%C3%9Ftermann,separator:',',whitespace:'')"),
		realWorldObject
	);

	assert.is(
		urisonRaw.encode(realWorldObject),
		"(additional:!n,address:(number:13,private:!t,street:Blumenstraße,tags:!('has dog',unfriendly,(children:!f)),zip:12345),bang:'!!',brackets:!('(',')'),firstname:Mäx,job:'Frontend Ape',lastname:Müßtermann,separator:',',whitespace:'')"
	);

	assert.deepEqual(
		urisonRaw.decode("(additional:!n,address:(number:13,private:!t,street:Blumenstraße,tags:!('has dog',unfriendly,(children:!f)),zip:12345),bang:'!!',brackets:!('(',')'),firstname:Mäx,job:'Frontend Ape',lastname:Müßtermann,separator:',',whitespace:'')"),
		realWorldObject
	);

	assert.is(
		urison.encode(syntaxArray),
		"!('!\'',',','(',')','!!','',!n,!t,!f,(bang:'!!',brackets:!('(',')'),separator:',',whitespace:''))"
	);

	assert.deepEqual(
		urison.decode("!('!\'',',','(',')','!!','',!n,!t,!f,(bang:'!!',brackets:!('(',')'),separator:',',whitespace:''))"),
		syntaxArray
	);
});
