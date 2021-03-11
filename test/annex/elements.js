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
	assert.is(bar.outerHTML, '<div id="content" style="display:none;">loading...</div>');
	assert.is(baz.outerHTML, '<div id="content" style="display:none;">loading...</div>');
	assert.is(foobar.outerHTML, '<div id="content" style="display:none;">loading...</div>');
});



test('getTextContent', assert => {
	const source = '<p onlick="destroyWorld();">red button <a>meow<span>woof</span></a></p>';

	assert.is(getTextContent(source), 'red button meowwoof');
	assert.is(getTextContent(createNode(source)), 'red button meowwoof');
	assert.is(getTextContent(createNode(source), true), 'red button ');
});
