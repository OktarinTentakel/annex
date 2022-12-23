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
	urlAnchor
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

