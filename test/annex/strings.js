import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.strings;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/strings.js`);
}

const {
	replace,
	truncate,
	pad,
	trim,
	concat,
	format,
	slugify,
	maskForSelector,
	maskForRegEx,
	maskForHtml,
	unmaskFromHtml
} = pkg;



test('replace', assert => {
	const
		foo = 'this:is#a-very:unclean-string',
		bar = '<\'transform\' ; <\'me\' ; \'to json\'>>',
		foobar = 'ßßß'
	;

	assert.is(replace(foo, [':', '#', '-'], '_'), 'this_is_a_very_unclean_string');
	assert.is(replace(bar, ['<', '>', ';', '\''], ['{', '}', ':', '"']), '{"transform" : {"me" : "to json"}}');
	assert.is(replace(foobar, 'ß', 'sz', ), 'szszsz');
});



test('truncate', assert => {
	const
		foo = 'abc',
		bar = 'abcdefghijklmnopqrstuvwxyz',
		foobar = 'üäöÜÄÖß'
	;

	assert.is(truncate(foo), foo);
	assert.is(truncate(bar), bar);
	assert.is(truncate(bar, 6), 'abc...');
	assert.is(truncate(bar, 3, '---'), '---');
	assert.throws(() => { truncate(bar, 1, '---'); });
	assert.is(truncate(foobar, 6, '.'), 'üäöÜÄ.');
	assert.is(truncate(foobar, 7), foobar);
});



test('pad', assert => {
	assert.is(pad(1, 0, 2), '01');
	assert.is(pad(1, '0', 4, 'right'), '1000');
	assert.is(pad('foo', '---', 10), '-------foo');
	assert.is(pad('', '##', -5), '');
	assert.is(pad('', '##', 5, 'right'), '#####');
});



test('trim', assert => {
	assert.is(trim('    foo  '), 'foo');
	assert.is(trim(`

	foo

	`), 'foo');
	assert.is(trim('  foo  ', null, 'right'), '  foo');
	assert.is(trim('//foo/bar/', '/'), 'foo/bar');
	assert.is(trim('-_ foo _-', [null, '-_', '_-']), 'foo');
	assert.is(trim('foo bar', '\\S', 'left'), ' bar');
	assert.is(trim('abcdefghijklmnopqrstuvwxyz', ['[a-f]', '[u-z]', 'l'], 'both'), 'ghijklmnopqrst');
});



test('concat', assert => {
	const foo = [10, 9, 8, 7, 6, '5', '4', '3', '2', '1', 'ZERO!'];

	assert.is(
		concat(' ... ', 10, 9, 8.8, 7, 6.6, '5', '4', '3', '2', '1', 'ZERO!'),
		'10 ... 9 ... 8.8 ... 7 ... 6.6 ... 5 ... 4 ... 3 ... 2 ... 1 ... ZERO!'
	);
	assert.is(
		concat('...', foo),
		'10...9...8...7...6...5...4...3...2...1...ZERO!'
	);
	assert.is(
		concat('...', ...foo),
		'10...9...8...7...6...5...4...3...2...1...ZERO!'
	);
	assert.is(concat(null, 1, ['2', 3.3], {a : 1, b : 2}), '12,3.3[object Object]');
	assert.is(concat(null, [1,'2', 3.3], 1, 2, 3), '123.3');
	assert.is(concat('_'), '');
	assert.is(concat('_', []), '');
});



test('format', assert => {
	const Person = function(firstName, lastName, age, favoriteFloat){
		this.names = {
			first : firstName,
			last : lastName
		};

		this.info = {
			personal : {age},
			favorites : {
				float : favoriteFloat
			}
		};
	};

	assert.is(
		format(
			'An elephant is {times:float(0.00)} times smarter than a {animal}',
			{times : 5.5555, animal : 'lion'}
		),
		'An elephant is 5.56 times smarter than a lion'
	);
	assert.is(
		format('{0}{0}{0} ... {{BATMAN!}}', 'Nana'),
		'NanaNanaNana ... {BATMAN!}'
	);
	assert.is(
		format('{} {} {} starts the alphabet.', 'A', 'B', 'C'),
		'A B C starts the alphabet.'
	);
	assert.is(
		format('{0:int}, {1:int}, {2:int}: details are for pussies', '1a', 2.222, 3),
		'1, 2, 3: details are for pussies'
	);
	assert.is(
		format(
			'This is {4}: We need just {1.2:int} {foo} {3} kill {1.0} humans {2:float(0.0)} times over.',
			{foo : 'ape'}, [() => 3, 2, 1.1], 42.45, 'to', () => true
		),
		'This is true: We need just 1 ape to kill 3 humans 42.5 times over.'
	);
	assert.throws(() => { format('{0} {1} {2} {}', 1, 2, 3, 4); });
	assert.throws(() => { format('{} {1} {2} {3}', 1, 2, 3, 4); });
	assert.is(
		format(
			'{names.first} {names.last} is {info.personal.age:int} years old and his/her favorite floating number is {info.favorites.float:float(0.00)}.',
			new Person('Darth', 'Vader', 88, 666.666)
		),
		'Darth Vader is 88 years old and his/her favorite floating number is 666.67.',
	)
});



test('slugify', assert => {
	assert.is(
		slugify('---This is a cömplicated ßtring for URLs!---'),
		'this-is-a-complicated-sstring-for-urls'
	);
	assert.is(
		slugify('Ꝼ__ __ꝽꞂ__ __Ꞅ'),
		'f-gr-s'
	);
	assert.is(
		slugify(
			'__Önly_jüüü [test foobar 123]-666-999__',
			{
				'ä' : 'ae',
				'ö' : 'oe',
				'ü' : 'ue',
				'0' : '',
				'1' : '',
				'2' : '',
				'3' : '',
				'4' : '',
				'5' : '',
				'6' : '',
				'7' : '',
				'8' : '',
				'9' : '',
			}
		),
		'oenly-jueueue-test-foobar'
	);
});



test('maskForSelector', assert => {
	assert.is(
		maskForSelector('#cmsValueWithProblematicChars([1*1])'),
		'\\#cmsValueWithProblematicChars\\(\\[1\\*1\\]\\)'
	);
	assert.is(
		maskForSelector('&cms,Value,With.Problematic,Chars;++'),
		'\\&cms\\,Value\\,With\\.Problematic\\,Chars\\;\\+\\+'
	);
	assert.is(
		maskForSelector('~:cms"ValueWith***Problematic"Chars:~'),
		'\\~\\:cms\\"ValueWith\\*\\*\\*Problematic\\"Chars\\:\\~'
	);
	assert.is(
		maskForSelector('cmsValueWithProblematicChars'),
		'cmsValueWithProblematicChars'
	);
});



test('maskForRegEx', assert => {
	assert.is(
		maskForRegEx('/(string-With+Regex-Chars[{*}])/?'),
		'\\/\\(string\\-With\\+Regex\\-Chars\\[\\{\\*\\}\\]\\)\\/\\?'
	);
	assert.is(
		maskForRegEx('^\\stringWith|...|RegexChars\\$'),
		'\\^\\\\stringWith\\|\\.\\.\\.\\|RegexChars\\\\\\$'
	);
	assert.is(
		maskForRegEx('stringWithRegexChars'),
		'stringWithRegexChars'
	);
});



test('maskForHtml', assert => {
	assert.is(maskForHtml('</>&;üäöÜÄÖß– »'), '&lt;/&gt;&amp;;üäöÜÄÖß– »');
});



test('unmaskFromHtml', assert => {
	assert.is(unmaskFromHtml('&lt;/&gt;&amp;;üäöÜÄÖß&ndash;&nbsp;&raquo;'), '</>&;üäöÜÄÖß– »');
});
