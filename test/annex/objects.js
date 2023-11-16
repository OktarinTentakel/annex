import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.objects;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/objects.js`);
}

const {
	clone,
	merge
} = pkg;



const exampleSVG = '<svg enable-background="new 0 0 396 99.3" height="99.3" viewBox="0 0 396 99.3" width="396" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><path d="m22.5 60.2 48.7-3.9v-8.1l-48.7 4.9z"/><path d="m22.5 91.3h48.7v-10.1l-48.7.9z"/><path d="m22.5 75.1 48.7-1.9v-9.4l-48.7 2.9z"/><path d="m.3 30 70.9-14.1v-5.7l-70.9 15.5z"/><path d="m.3 18.6v3.5l70.9-16.9v-4.9z"/><path d="m.3 39.2 70.9-11.3v-6.3l-70.9 12.8z"/><path d="m.3 49.8 70.9-8.5v-7.2l-70.9 10z"/><path d="m141.9 65.6v2.8s-2.6-2.3-8.7-2.3c-6.7 0-10.6 4.4-10.6 11.3s3.7 11.6 11.2 11.6c3.8 0 6-.6 6-.6v-6.3h-7.3v-2.4h10.1v9.3s-2.9 2.9-9.3 2.9c-9.1 0-13.7-6.2-13.7-14.3 0-8.4 5.4-14.2 13.5-14.2 6.2-.2 8.8 2.2 8.8 2.2z"/><path d="m159.3 72v2.5h-1.4c-4.2 0-6.5 2.9-6.5 6.6v10.2h-2.9v-18.9l2.9-.7v4.2c1.2-2.5 3.5-4.2 6.3-4.2.8 0 1.6.3 1.6.3z"/><path d="m179.6 81.4c0 6-3.8 10.4-9.5 10.4-5.5 0-9.2-4.1-9.2-9.9 0-6 3.7-10.4 9.4-10.4 5.7.1 9.3 4.1 9.3 9.9zm-15.8.4c0 4.5 2.4 7.4 6.3 7.4 4.5 0 6.6-3.5 6.6-7.8 0-4.4-2.5-7.4-6.4-7.4-4.5 0-6.5 3.5-6.5 7.8z"/><path d="m199.9 71.8v19.6h-2.8v-3.4c-1.4 2.4-3.6 3.7-6.2 3.7-4.5 0-6.5-2.8-6.5-7.1v-12.2l2.9-.7v12.7c0 3.2 1.4 4.7 4.1 4.7 3.3 0 5.8-2.6 5.8-7.6v-9.2z"/><path d="m222.5 81.1c0 5.9-3.8 10.6-9.6 10.6-2.2 0-4-.9-4.5-1.1v8.7h-2.8v-26.9l2.8-.7v3.6c1.3-2.3 3.6-3.7 6.4-3.7 5.1.1 7.7 4 7.7 9.5zm-2.8.1c0-4.7-2.2-6.9-5.3-6.9-3.7 0-5.9 2.8-5.9 6.8v7.2c.4.2 2 .9 4.5.9 4.3-.1 6.7-3.3 6.7-8z"/><path d="m147.3 24.4v21.6h-8v-4.6c-2.4 3.3-6.5 5.2-10.8 5.2-5.1 0-8.5-2.8-8.5-7.7 0-7.6 8.2-11.9 19.3-11.9v-1.2c0-3.1-1.7-5-6.2-5-7 0-11.8 4-11.8 4v-7.4s4-4 13.1-4c8.8.2 12.9 4 12.9 11zm-8 8.9v-1.5c-7.4 0-10.9 2.9-10.9 6.1 0 1.7 1.2 2.9 3.3 2.9 3.7-.1 7.6-3.1 7.6-7.5z"/><path d="m162.6 46h-9.1v-43.9l9.1-1.8z"/><path d="m178.1 46h-9.1v-43.9l9.1-1.8z"/><path d="m211.6 11.9v2.3h9.9v6.3h-9.9v25.5h-9v-25.5h-4.5v-6.3h4.5v-2.3c0-7.5 4.5-11.9 12.1-11.9 5.4 0 7.4 1.7 7.4 1.7v5.8s-2.2-1-5.2-1c-3.6 0-5.3 2-5.3 5.4z"/><path d="m253.9 29.7c0 10.4-6.4 17.1-16.1 17.1-9.9 0-15.8-6.4-15.8-16.4 0-10.4 6.5-16.9 16-16.9 9.9 0 15.9 6.3 15.9 16.2zm-23.1.7c0 6.1 2.6 9.7 7 9.7 5.1 0 7.3-4.2 7.3-10.1 0-6-2.7-9.8-7.1-9.8-5 0-7.2 4.3-7.2 10.2z"/><path d="m280.5 14.1v7.8h-2.4c-6.5 0-10 4.5-10 10v14.1h-8.8v-30.7l8.8-1.7v7.8c1.9-4.6 5.2-7.8 9.7-7.8 1.9 0 2.7.5 2.7.5z"/><path d="m329.5 29.7c0 10.4-6.4 17.1-16.1 17.1-9.9 0-15.8-6.4-15.8-16.4 0-10.4 6.5-16.9 16-16.9 9.9 0 15.9 6.3 15.9 16.2zm-23.1.7c0 6.1 2.6 9.7 7 9.7 5.1 0 7.3-4.2 7.3-10.1 0-6-2.7-9.8-7.1-9.8-4.9 0-7.2 4.3-7.2 10.2z"/><path d="m363.2 24.7v21.3h-8.9v-19.5c0-3.5-1.5-5.4-4.5-5.4-3.7-.1-6.2 3-6.2 8.8v16h-8.7v-30.5l8.7-1.8v5.7c2.2-3.7 5.7-5.8 9.8-5.8 7 .1 9.8 4.6 9.8 11.2z"/><path d="m386.6 39.6c5.8 0 9.3-2.6 9.3-2.6v6.2s-3.5 3.5-11.3 3.5c-10.8 0-16.4-6.5-16.4-16.1 0-9.8 5.8-17 15.3-17 7.9 0 12.8 4.7 12.8 12.3 0 3.3-1.1 5.6-1.1 5.6h-18.7c.7 5.3 4 8.1 10.1 8.1zm-10-12.9h12c-.1-4.5-1.9-6.7-5.3-6.7-3.6-.1-6 2.4-6.7 6.7z"/></g></svg>';



class Foobar {
	constructor(a, b, c){
		this.a = a;
		this.b = {
			a,
			c : [c, c, c]
		};
		this.c = `${5 * a}${c}${c}${c}`;
	}

	barfoo(){
		return [this.a, this.b, this.c];
	}
}

test('clone', assert => {
	const outerNode = document.createElement('div');
	outerNode.innerHTML = exampleSVG;

	const
		foo = [1, true, new Set([new Date('2021-03-09'), new RegExp('^foobar$')]), {a : 'b', c : {d : 5.5}}, [1, 2, 3], 4],
		bar = {foo : 'bar', bar : [new Foobar(1, 2, 3), [false]], uwu : {u : new URL('https://google.com'), usp : new URLSearchParams('foo=bar&bar=foo')}},
		foobar = new Map(),
		main = document.createElement('main'),
		barfoo = document.createElement('div'),
		baz = document.createElement('p'),
		svg = outerNode.firstChild
	;

	foobar.set(foo, bar);
	foobar.set(bar, foo);

	main.appendChild(barfoo);
	main.appendChild(baz);
	baz.classList.add('test');
	const
		loolaa = main.childNodes,
		laaloo = {loolaa, laaloo : [barfoo, baz]}
	;

	const clonedFoo = clone(foo);
	assert.deepEqual(clonedFoo, foo);
	assert.not(clonedFoo, foo);
	assert.not(clonedFoo[2], foo[2]);
	assert.is(clonedFoo[2].size, foo[2].size);
	assert.not(clonedFoo[3].c, foo[3].c);
	assert.is(clonedFoo[5], foo[5]);
	const clonedBar = clone(bar);
	assert.deepEqual(clonedBar, bar);
	assert.not(clonedBar, bar);
	assert.not(clonedBar.bar, bar.bar);
	assert.not(clonedBar.bar[0], bar.bar[0]);
	assert.not(clonedBar.bar[1], bar.bar[1]);
	assert.is(clonedBar.bar[0].c, '5333');
	assert.is(clonedBar.bar[0].barfoo().length, 3);
	assert.not(clonedBar.bar[0].b, bar.bar[0].b);
	assert.is(clonedBar.bar[0].b.a, bar.bar[0].b.a);
	assert.not(clonedBar.bar[0].b.c, bar.bar[0].b.c);
	assert.is(clonedBar.foo, bar.foo);
	assert.is(clonedBar.uwu.u.origin, 'https://google.com');
	assert.is(clonedBar.uwu.u.username, '');
	assert.is(clonedBar.uwu.usp.get('bar'), 'foo');
	const clonedFoobar = clone(foobar);
	assert.deepEqual(clonedFoobar, foobar);
	assert.is(clonedFoobar.size, foobar.size);
	assert.not(clonedFoobar, foobar);
	assert.not(clonedFoobar.get(bar)[3].c, foo[3].c);
	const clonedBarfoo = clone(barfoo);
	assert.not(clonedBarfoo, barfoo);
	const clonedBaz = clone(baz);
	assert.true(clonedBaz.classList.contains('test'));
	const clonedLoolaa = clone(loolaa);
	assert.not(clonedLoolaa, loolaa);
	assert.is(clonedLoolaa.length, loolaa.length);
	assert.is(clonedLoolaa.item(1).nodeName, 'P');
	const clonedLaaloo = clone(laaloo);
	assert.not(clonedLaaloo.loolaa[0], laaloo.loolaa[0]);
	assert.not(clonedLaaloo.laaloo[1], laaloo.laaloo[1]);
	assert.true(clonedLaaloo.laaloo[1].classList.contains('test'));
	const clonedSvg = clone(svg);
	assert.deepEqual(clonedSvg.outerHTML, svg.outerHTML);
	assert.is(clonedSvg.querySelectorAll('path').length, svg.querySelectorAll('path').length);
	assert.not(clonedSvg, svg);

	const shallowClonedFoo = clone(foo, false);
	assert.deepEqual(shallowClonedFoo, foo);
	assert.not(shallowClonedFoo, foo);
	assert.is(shallowClonedFoo[2], foo[2]);
	assert.is(shallowClonedFoo[2].size, foo[2].size);
	assert.is(shallowClonedFoo[3].c, foo[3].c);
	assert.is(shallowClonedFoo[5], foo[5]);
	const shallowClonedBar = clone(bar, false);
	assert.deepEqual(shallowClonedBar, bar);
	assert.not(shallowClonedBar, bar);
	assert.is(shallowClonedBar.bar, bar.bar);
	assert.is(shallowClonedBar.bar[0], bar.bar[0]);
	assert.is(shallowClonedBar.bar[1], bar.bar[1]);
	assert.is(shallowClonedBar.bar[0].c, '5333');
	assert.is(shallowClonedBar.bar[0].barfoo().length, 3);
	assert.is(shallowClonedBar.bar[0].b, bar.bar[0].b);
	assert.is(shallowClonedBar.bar[0].b.a, bar.bar[0].b.a);
	assert.is(shallowClonedBar.bar[0].b.c, bar.bar[0].b.c);
	assert.is(shallowClonedBar.foo, bar.foo);
	assert.is(shallowClonedBar.uwu.u, bar.uwu.u);
	assert.is(shallowClonedBar.uwu.usp, bar.uwu.usp);
	const shallowClonedFoobar = clone(foobar, false);
	assert.deepEqual(shallowClonedFoobar, foobar);
	assert.is(shallowClonedFoobar.size, foobar.size);
	assert.not(shallowClonedFoobar, foobar);
	assert.is(shallowClonedFoobar.get(bar)[3].c, foo[3].c);
	const shallowClonedBarfoo = clone(barfoo, false);
	assert.not(shallowClonedBarfoo, barfoo);
	const shallowClonedBaz = clone(baz, false);
	assert.true(shallowClonedBaz.classList.contains('test'));
	const shallowClonedLoolaa = clone(loolaa, false);
	laaloo.loolaa = shallowClonedLoolaa;
	assert.not(shallowClonedLoolaa, loolaa);
	assert.is(shallowClonedLoolaa.length, 2);
	assert.is(loolaa.length, 0);
	assert.is(shallowClonedLoolaa.item(0).nodeName, 'DIV');
	const shallowClonedLaaloo = clone(laaloo, false);
	assert.is(shallowClonedLaaloo.loolaa[0], laaloo.loolaa[0]);
	assert.is(shallowClonedLaaloo.laaloo[1], laaloo.laaloo[1]);
	assert.true(shallowClonedLaaloo.laaloo[1].classList.contains('test'));
});



test('merge', assert => {
	const
		foo = {
			name : 'Hagenbecks',
			animals : ['lion', 'zebra'],
			founded : new Date(),
			jobs : {
				boss : 'Mr. Hagenbeck',
				elephantWrangler : 'Hulk Hogan',
				it : {
					frontend : 'Sebastian Schlapkohl',
					backend : 'Bart Simpson',
					admin : 'Penny Lane'
				},
				open : ['lizardWrangler', 'chief twit']
			}
		},
		bar = {
			founded : '1899-01-01',
			jobs : {
				it : {
					admin : 'Montgomery Burns'
				},
				open : ['lizardWrangler']
			}
		},
		foobar = {
			name : 'Berlin Tiergarten',
			animals : ['ice bears'],
			jobs : {
				lizardWrangler : 'Mike Tyson',
				open : []
			}
		},
		boofar = {
			jobs : {},
			open : true
		}
	;

	let mergedFoo = merge(foo, bar);
	assert.not(mergedFoo, foo);
	assert.is(mergedFoo.founded, '1899-01-01');
	assert.is(mergedFoo.jobs.it.admin, 'Montgomery Burns');
	assert.is(mergedFoo.jobs.open.length, 1);

	mergedFoo = merge(foo, bar, foobar);
	assert.deepEqual(mergedFoo, {
		name : 'Berlin Tiergarten',
		animals : ['ice bears'],
		founded : '1899-01-01',
		jobs : {
			boss : 'Mr. Hagenbeck',
			elephantWrangler : 'Hulk Hogan',
			it : {
				frontend : 'Sebastian Schlapkohl',
				backend : 'Bart Simpson',
				admin : 'Montgomery Burns'
			},
			lizardWrangler : 'Mike Tyson',
			open : []
		}
	});

	mergedFoo = merge(foo, bar, foobar, boofar);
	assert.deepEqual(mergedFoo, {
		name : 'Berlin Tiergarten',
		animals : ['ice bears'],
		founded : '1899-01-01',
		jobs : {},
		open : true
	});
});
