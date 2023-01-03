import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.elements;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/elements.js`);
}

const {
	createNode,
	insertNode,
	replaceNode,
	getTextContent,
	isInDom,
	getData,
	setData,
	removeData
} = pkg;



test('createNode', assert => {
	const
		foo = createNode('div', {id : 'content', style : 'display:none;'}, 'loading...'),
		bar = createNode('<div id="content" style="display:none;">loading...</div>'),
		baz = createNode('<div>loading...</div>', {id : 'content', style : 'display:none;'}),
		foobar = createNode('<div id="content" style="display:block;">nope</div>', {style : 'display:none;'}, 'loading...')
	;

	assert.is(foo.outerHTML, '<div id="content" style="display:none;">loading...</div>');
	assert.is(foo.parentNode, null);
	assert.is(bar.outerHTML, '<div id="content" style="display:none;">loading...</div>');
	assert.is(baz.outerHTML, '<div id="content" style="display:none;">loading...</div>');
	assert.is(foobar.outerHTML, '<div id="content" style="display:none;">loading...</div>');
});



test('insertNode', assert => {
	const
		outer = createNode('article'),
		inner = createNode('section'),
		innerMost = createNode('p')
	;
	inner.appendChild(innerMost);
	outer.appendChild(inner);

	insertNode(innerMost, '<span>text2</span>');
	assert.true(insertNode(innerMost, '<span>text1</span>', 'prepend').matches('span'));
	assert.is(innerMost.textContent, 'text1text2');

	insertNode(innerMost, createNode('p', null, 'text3'), 'beforebegin');
	insertNode(innerMost, createNode('p', null, 'text4'), 'afterend');
	assert.is(inner.children.length, 3);
	assert.is(inner.textContent, 'text3text1text2text4');

	insertNode(inner, '<section>section1</section>', 'before');
	insertNode(inner, '<section>section2</section>', 'beforebegin');
	insertNode(inner, '<section>section3</section>', 'after');
	insertNode(inner, '<section>section4</section>', 'afterend');
	assert.is(outer.children.length, 5);
	assert.is(outer.textContent, 'section1section2text3text1text2text4section4section3');

	insertNode(outer, createNode('section', null, 'section5'), 'afterbegin');
	insertNode(outer, createNode('section', null, 'section6'), 'append');
	insertNode(outer, createNode('section', null, 'section7'), 'beforeend');
	assert.is(outer.children.length, 8);
	assert.is(outer.textContent, 'section5section1section2text3text1text2text4section4section3section6section7');

	assert.is(outer.querySelectorAll('p > span').length, 2);
	assert.is(Array.from(outer.children).filter(node => node.matches('section')).length, 8);

	assert.throws(() => { insertNode('test', createNode('section', null, 'section7'), 'beforeend'); });
});



test('replaceNode', assert => {
	const
		outer = createNode('article'),
		inner = createNode('section'),
		innerMost = createNode('p')
	;
	inner.appendChild(innerMost);
	outer.appendChild(inner);

	const
		text2 = insertNode(innerMost, '<span>text2</span>'),
		text1 = insertNode(innerMost, '<span>text1</span>', 'prepend'),
		text3 = insertNode(innerMost, createNode('p', null, 'text3'), 'beforebegin'),
		text4 = insertNode(innerMost, createNode('p', null, 'text4'), 'afterend'),
		section1 = insertNode(inner, '<section>section1</section>', 'before')
	;

	assert.is(outer.textContent, 'section1text3text1text2text4');

	const
		section2 = replaceNode(section1, '<section>section2</section>'),
		text5 = replaceNode(text1, createNode('span', null, 'text5')),
		text6 = replaceNode(text4, text2)
	;

	assert.is(text6, text2);
	assert.is(outer.textContent, 'section2text3text5text2');

	assert.throws(() => { replaceNode('test', text5); });
	assert.throws(() => { replaceNode(outer, section2); });
});



test('getTextContent', assert => {
	const source = '<p onlick="destroyWorld();">red button <a>meow<span>woof</span></a></p>';

	assert.is(getTextContent(source), 'red button meowwoof');
	assert.is(getTextContent(createNode(source)), 'red button meowwoof');
	assert.is(getTextContent(createNode(source), true), 'red button ');
});



test('isInDom', assert => {
	const
		outer = createNode('article'),
		inner = createNode('section'),
		innerMost = createNode('p')
	;
	inner.appendChild(innerMost);
	outer.appendChild(inner);

	assert.false(isInDom(outer));
	assert.false(isInDom(inner));
	assert.false(isInDom(innerMost));

	document.body.appendChild(outer);

	assert.true(isInDom(outer));
	assert.true(isInDom(inner));
	assert.true(isInDom(innerMost));

	outer.removeChild(inner);

	assert.true(isInDom(outer));
	assert.false(isInDom(inner));
	assert.false(isInDom(innerMost));

	assert.throws(() => { isInDom('not an element'); });
});



test('getData', assert => {
	const
		eFoo = createNode(`<div data-foobar='[{"a" : "abc", "b" : true}, {"c" : {"d" : [1, 2, 3]}}, {"e" : 42.42}]'></div>`),
		eBar = createNode(`<span data-foobar='{a : new Date()}'></span>`),
		eBaz = createNode(`<span data-foobar="test" data-boofar="null" data-baz='{"a" : ["1", 2, 3.3], "b" : true}'></span>`)
	;

	assert.deepEqual(getData(eFoo, 'foobar'), [{a : 'abc', b : true}, {c : {d : [1, 2, 3]}}, {e : 42.42}]);
	assert.deepEqual(getData(eBar, ['foobar', 'boofar']), {foobar : '{a : new Date()}'});
	assert.is(getData(eFoo, 'boofar'), null);
	assert.is(getData(eFoo, ['boofar', 'booboo']), null);
	assert.deepEqual(getData(eBaz, ['foobar', 'boofar', 'baz']), {foobar : 'test', boofar : null, baz : {a : ['1', 2, 3.3], b : true}});
	assert.deepEqual(getData(eBaz, 'baz'), {a : ['1', 2, 3.3], b : true});
	assert.deepEqual(getData(eBaz), {foobar : 'test', boofar : null, baz : {"a" : ["1", 2, 3.3], "b" : true}});
});



test('setData', assert => {
	const
		eFoo = createNode(`<div data-foobar='[{"a" : "abc", "b" : true}, {"c" : {"d" : [1, 2, 3]}}, {"e" : 42.42}]'></div>`),
		eBar = createNode(`<span data-boofar='{a : new Date()}'></span>`),
		timeStamp = new Date()
	;

	assert.deepEqual(setData(eFoo, {foobar : () => { return 'hello kittens!'; }}), {foobar : 'hello kittens!'});
	assert.is(getData(eFoo, 'foobar'), 'hello kittens!');
	assert.is(eFoo.getAttribute('data-foobar'), 'hello kittens!');
	assert.deepEqual(setData(eFoo, {foobar : undefined}), {'foobar' : undefined});
	assert.is(setData(eFoo, {baz : undefined}), null);
	assert.is(getData(eFoo, 'foobar'), null);
	assert.is(eFoo.getAttribute('data-foobar'), null);
	assert.is(setData(eFoo, {foobar : undefined}), null);
	assert.deepEqual(setData(eFoo, {'foobar' : 'hello kittens!'}), {foobar : 'hello kittens!'});
	assert.deepEqual(setData(eFoo, 'foobar', 'hello kittens!'), 'hello kittens!');
	assert.is(getData(eFoo, 'foobar'), 'hello kittens!');
	assert.is(eFoo.getAttribute('data-foobar'), 'hello kittens!');

	assert.deepEqual(setData(eFoo, 'foobar', {a : 'foo', b : [1, 2, 3], c : {d : true}}), {a : 'foo', b : [1, 2, 3], c : {d : true}});
	assert.deepEqual(setData(eFoo, {'foobar' : {a : 'foo', b : [1, 2, 3], c : {d : true}}}), {'foobar' : {a : 'foo', b : [1, 2, 3], c : {d : true}}});
	assert.deepEqual(getData(eFoo, 'foobar'), {a : 'foo', b : [1, 2, 3], c : {d : true}});
	assert.is(eFoo.getAttribute('data-foobar'), '{\"a\":\"foo\",\"b\":[1,2,3],\"c\":{\"d\":true}}');
	assert.is(setData(eFoo, 'foobar', ''), undefined);
	assert.deepEqual(setData(eFoo, {}), null);
	assert.is(eFoo.getAttribute('data-foobar'), null);

	assert.deepEqual(setData(eBar, {boofar : '', baz : 42}), {boofar : undefined, baz : 42});
	assert.is(getData(eBar, 'boofar'), null);
	assert.deepEqual(setData(eBar, {'boofar' : [timeStamp, 1, true]}), {'boofar' : [timeStamp.toISOString(), 1, true]});
	assert.deepEqual(getData(eBar, 'boofar'), [timeStamp.toISOString(), 1, true]);
	assert.is(eBar.getAttribute('data-boofar'), `["${timeStamp.toISOString()}",1,true]`);

	assert.is(getData(eBar, 'abcd'), null);
});



test('removeData', assert => {
	const
		eFoo = createNode(`<div data-foobar='[{"a" : "abc", "b" : true}, {"c" : {"d" : [1, 2, 3]}}, {"e" : 42.42}]'></div>`),
		eBar = createNode(`<span data-boofar='{a : new Date()}'></span>`),
		eBaz = createNode(`<span data-foobar="test" data-boofar="null" data-baz='{"a" : ["1", 2, 3.3], "b" : true}'></span>`)
	;

	assert.deepEqual(removeData(eFoo), {foobar : [{"a" : "abc", "b" : true}, {"c" : {"d" : [1, 2, 3]}}, {"e" : 42.42}]});
	assert.is(removeData(eFoo, 'test'), null);

	assert.is(removeData(eBar, 'boofar'), '{a : new Date()}');
	assert.is(removeData(eBar, 'boofar'), null);
	assert.is(eBar.dataset.boofar, undefined);
	assert.deepEqual(Object.keys(eBar.dataset), []);
	assert.is(eBar.outerHTML, '<span></span>');

	assert.deepEqual(removeData(eBaz, ['baz', 'boofar', 'batman']), {boofar : null, baz : {"a" : ["1", 2, 3.3], "b" : true}});
	assert.is(eBaz.dataset.baz, undefined);
	assert.is(eBaz.dataset.foobar, 'test');
	assert.deepEqual(Object.keys(eBaz.dataset), ['foobar']);
	assert.is(eBaz.outerHTML, '<span data-foobar="test"></span>');
	assert.deepEqual(removeData(eBaz), {foobar : 'test'});
	assert.is(removeData(eBar, 'foobar'), null);
	assert.is(eBar.dataset.foobar, undefined);
	assert.deepEqual(Object.keys(eBar.dataset), []);
	assert.is(eBar.outerHTML, '<span></span>');
	assert.is(removeData(eBaz), null);
});
