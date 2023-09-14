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
	const
		foo = [1, true, new Set([new Date('2021-03-09'), new RegExp('^foobar$')]), {a : 'b', c : {d : 5.5}}, [1, 2, 3], 4],
		bar = {foo : 'bar', bar : [new Foobar(1, 2, 3), [false]], uwu : {u : new URL('https://google.com'), usp : new URLSearchParams('foo=bar&bar=foo')}},
		foobar = new Map(),
		main = document.createElement('main'),
		barfoo = document.createElement('div'),
		baz = document.createElement('p')
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
