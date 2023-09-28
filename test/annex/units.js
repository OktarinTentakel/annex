import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.units;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/units.js`);
}

const {
	asFileSize,
	asCurrency,
	asDecimal
} = pkg;



test('asFileSize', assert => {
	assert.is(asFileSize(1_500_000, ','), '1,5 MB');
	assert.is(asFileSize(1024, '.', 0, true), '1 KiB');
	assert.is(asFileSize(123456789, null, 2), '123.46 MB');
});



test('asCurrency', assert => {
	assert.is(asCurrency(42.666), '$42.67');
	assert.is(asCurrency(42.666, 'de-DE', 'EUR'), '42,67 €');
	assert.is(asCurrency(42666, 'ja-JP', 'JPY', 'name'), '42,666円');
});



test('asDecimal', assert => {
	assert.is(asDecimal(42.666), '42.67');
	assert.is(asDecimal(42.666, 'de-DE', 1), '42,7');
	assert.is(asDecimal(42, 'en-GB', 0, 3), '42');
	assert.is(asDecimal(42.66666, 'en-GB', 0, 3), '42.667');
});
