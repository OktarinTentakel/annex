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
	getTextContent
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
