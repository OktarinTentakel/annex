import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.functions;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/functions.js`);
}

const {
	throttle,
	debounce,
	defer,
	kwargs
} = pkg;



test.cb('throttle', assert => {
	let
		foo = 0,
		bar = 0,
		baz = 0,
		foobar = 0
	;

	const fTestInc = throttle(100, function(inc){
		foo += inc;
	},true);

	const i = window.setInterval(() => {
		fTestInc(2);
	}, 30);

	const fTestInc2 = throttle(200, function(inc){
		bar += inc;
	}, true, true);

	const i2 = window.setInterval(() => {
		fTestInc2(4);
	}, 30);

	const fTestInc3 = throttle(200, function(inc){
		baz += inc;
	}, false, true);

	const i3 = window.setInterval(() => {
		fTestInc3(6);
	}, 180);

	const fTestInc4 = throttle(100, function(inc){
		foobar += inc;
	});

	const i4 = window.setInterval(() => {
		fTestInc4(1);
	}, 30);

	window.setTimeout(() => {
		window.clearInterval(i);
		window.clearInterval(i2);
		window.clearInterval(i3);
		window.clearInterval(i4);

		assert.true(foo >= 60 && foo <= 70);
		assert.true(bar >= 110 && bar <= 120);
		assert.true(baz >= 60 && baz <= 70);
		assert.true(foobar >= 15 && foobar <= 20);
		assert.end();
	}, 2020);
});



test.cb('debounce', assert => {
	let
		foo = 0,
		bar = 0
	;

	const fTestInc = debounce(500, function(inc){
		foo += inc;
	});

	const fTestInc2 = debounce(1000, function(inc){
		bar += inc;
	});

	window.setTimeout(() => {
		fTestInc(1);
		fTestInc2(2);
	}, 0);

	window.setTimeout(() => {
		fTestInc(3);
		fTestInc2(4);
	}, 600);

	window.setTimeout(() => {
		fTestInc(5);
		fTestInc2(6);
	}, 800);

	window.setTimeout(() => {
		fTestInc(7);
		fTestInc2(8);
	}, 990);

	window.setTimeout(() => {
		fTestInc(9);
		fTestInc2(10);
	}, 1998);

	window.setTimeout(() => {
		assert.is(foo, 8);
		assert.is(bar, 8);
		assert.end();
	}, 2000);
});



test.cb('defer', assert => {
	let foo = 0;

	let fTestInc = defer(function(inc){
		foo += inc;
	});

	fTestInc(2);
	assert.is(foo, 0);

	defer(() => {
		assert.is(foo, 2);
	})();

	defer(() => {
		foo += 10;
	}, 1990)();

	const bar = defer(() => {
		foo += 10;
	}, 1999)();

	window.setTimeout(() => {
		window.clearTimeout(bar);
	}, 1900);

	window.setTimeout(() => {
		assert.is(foo, 12);
		assert.end();
	}, 2000);
});



test('kwargs', assert => {
	let fTest = function(tick, trick, track){ return `${tick}, ${trick}, ${track}`; };

	assert.is(
		kwargs(fTest, {track : 'defaultTrack'})({tick : 'tiick', trick : 'trick'}),
		'tiick, trick, defaultTrack'
	);
	assert.is(
		kwargs(fTest, {track : 'defaultTrack'})('argumentTick', {trick : 'triick', track : 'trACK'}),
		'argumentTick, triick, trACK'
	);
	assert.is(
		kwargs(fTest, {track : 'defaultTrack'})('argumentTick', {trick : 'triick', track : 'track'}, 'trackkkk'),
		'argumentTick, triick, trackkkk'
	);
	assert.is(
		kwargs(fTest, {track : 'defaultTrack'})('argumentTick', {kwargs : false, trick : 'triick', track : 'track'}, 'trackkkk'),
		'argumentTick, [object Object], trackkkk'
	);
});
