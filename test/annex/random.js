import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.random;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/random.js`);
}

const {
	randomNumber,
	randomUuid,
	randomUserCode
} = pkg;



test('randomNumber', assert => {
	let
		i, j, check, foo,
		bar = []
	;

	const epsilon = 100 * 2;

	const fFormatFloat = function(float, precision){
		const
			numberParts = `${float}`.split('.'),
			base = numberParts[0],
			fraction = (numberParts.length > 1) ? `.${numberParts[1].substr(0, precision)}` : ''
		;
		return `${base}${fraction}`;
	};

	check = true;
	for( i = 0; i < 10000; i++ ){
		foo = randomNumber(42, 6666);
		check = check && (foo >= 42 && foo <= 6666);
		if( !check ){
			break;
		}
	}
	assert.true(check);

	check = true;
	for( i = 0; i < 10000; i++ ){
		foo = randomNumber(42.333, 6666.12345, true, 3);
		check = check && (foo >= 42.333 && foo <= 6666.12345) && (`${foo}` === fFormatFloat(foo, 3));
		if( !check ){
			break;
		}
	}
	assert.true(check);

	check = true;
	for( i = 0; i < 100; i++ ){
		foo = randomNumber(42, 42);
		check = check && (foo === 42);
		if( !check ){
			break;
		}
	}
	assert.true(check);

	check = true;
	for( i = 0; i < 100; i++ ){
		foo = randomNumber(42.12345, 42.12345, true, 5);
		check = check && (foo === 42.12345) && (`${foo}` === fFormatFloat(foo, 5));
		if( !check ){
			break;
		}
	}
	assert.true(check);

	check = true;
	for( i = 0; i < 10000; i++ ){
		foo = randomNumber(0, 9);
		bar[foo] = bar[foo] ? bar[foo]+1 : 1;
	}
	for( i = 0; i < 10; i++ ){
		for( j = 0; j < 10; j++ ){
			check = check && Math.abs(bar[i] - bar[j]) <= epsilon;
			if( !check ){
				break;
			}
		}
		if( !check ){
			break;
		}
	}
	assert.true(check);

	check = true;
	bar = [];
	for( i = 0; i < 10000; i++ ){
		foo = randomNumber(0.0, 9.999, true);
		bar[Math.floor(foo)] = bar[Math.floor(foo)] ? bar[Math.floor(foo)] + 1 : 1;
	}
	for( i = 0; i < 10; i++ ){
		for( j = 0; j < 10; j++ ){
			check = check && Math.abs(bar[i] - bar[j]) <= epsilon;
			if( !check ){
				break;
			}
		}
		if( !check ){
			break;
		}
	}
	assert.true(check);

	assert.throws(() => { randomNumber(10, 1); });
	assert.throws(() => { randomNumber(10.555, 1.01, true); });
});



import crypto from 'crypto';
function getRandomValues(buf){
	if( !(buf instanceof Uint8Array) && !(buf instanceof Uint16Array) ){
		throw new TypeError('expected Uint8Array/Uint16Array');
	}

	if( buf.length > 65536 ){
		const e = new Error();
		e.code = 22;
		e.message = `Failed to execute 'getRandomValues' on 'Crypto': The ArrayBufferView's byte length (${buf.length}) exceeds the number of bytes of entropy available via this API (65536).`;
		e.name = 'QuotaExceededError';
		throw e;
	}

	const bytes = crypto.randomBytes(buf.length);
	buf.set(bytes);

	return buf;
}

test('randomUuid', assert => {
	let implementations, i;

	for( implementations = 0; implementations < 2; implementations++ ){
		for( i = 0; i < 100; i++ ){
			assert.regex(randomUuid(), /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/);
		}

		for( i = 0; i < 100; i++ ){
			assert.regex(randomUuid(false), /[0-9a-f]{32}/);
		}

		window.crypto = {getRandomValues};
	}

	window.crypto = undefined;
});



test('randomUserCode', assert => {
	let implementations, i;

	for( implementations = 0; implementations < 2; implementations++ ){
		for( i = 0; i < 100; i++ ){
			assert.regex(randomUserCode(), /[ACDEFGHKLMNPQRSTUVWXYZ23456789]{8,12}/);
		}

		for( i = 0; i < 100; i++ ){
			assert.regex(randomUserCode('0123456789ABCDEF', 10, 10, '='), /[0-9A-F=]{10}/);
		}

		window.crypto = {getRandomValues};
	}

	window.crypto = undefined;
});
