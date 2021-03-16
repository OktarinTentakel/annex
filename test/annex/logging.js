import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.logging;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/logging.js`);
}

const {
	log,
	warn,
	err,
	xlog,
	LOG_LEVEL,
	TRY_TO_LOG_TO_PARENT
} = pkg;



test('log', assert => {
	let excepted = false;

	try {
		const randomVar = 5;

		log(randomVar, 'string');
		log(false, true);
		log().group().log(1).log(2).log(3).groupEnd().error('ouch');
		log().setLogLevel('warn').warn('oh noez, but printed').log('not printed').setLogLevel('log');
		log('test', {test : 'test'}).clear();
		log().tryToLogToParent().log('hooray times two').tryToLogToParent(false);
		assert.is(LOG_LEVEL, 'log');
		assert.false(TRY_TO_LOG_TO_PARENT);
	} catch(ex){
		console.log(ex);
		excepted = true;
	}

	assert.false(excepted);
});



test('warn', assert => {
	let excepted = false;

	try {
		const randomVar = 5;

		warn('warning yo!');
		warn(randomVar, 'string');
		warn(false);
		warn(true);
	} catch(ex){
		console.log(ex);
		excepted = true;
	}

	assert.false(excepted);
});



test('err', assert => {
	let excepted = false;

	try {
		const randomVar = 5;

		err('error yo!');
		err(randomVar, 'string');
		err(false);
		err(true);
	} catch(ex){
		console.log(ex);
		excepted = true;
	}

	assert.false(excepted);
});



test('xlog', assert => {
	let excepted = false;

	function xlogTest(){
		xlog('nested, with message');
	}

	try {
		let i;

		for( i = 0; i < 3; i++ ){
			xlog();
		}

		for( i = 0; i < 3; i++ ){
			xlogTest();
		}
	} catch(ex){
		console.log(ex);
		excepted = true;
	}

	assert.false(excepted);
});
