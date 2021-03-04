import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.strings;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/strings.js`);
}

const {
	strReplace,
	strTruncate,
	strConcat,
	strFormat,
	slugify,
	maskForSelector,
	maskForRegEx,
	maskForHtml,
	unmaskFromHtml
} = pkg;



test('strReplace', assert => {
	const
		foo = 'this:is#a-very:unclean-string',
		bar = '<\'transform\' ; <\'me\' ; \'to json\'>>',
		foobar = 'ßßß'
	;

	assert.is(strReplace([':', '#', '-'], '_', foo), 'this_is_a_very_unclean_string');
	assert.is(strReplace(['<', '>', ';', '\''], ['{', '}', ':', '"'], bar), '{"transform" : {"me" : "to json"}}');
	assert.is(strReplace('ß', 'sz', foobar), 'szszsz');
});



test('strTruncate', assert => {
	const
		foo = 'abc',
		bar = 'abcdefghijklmnopqrstuvwxyz',
		foobar = 'üäöÜÄÖß'
	;

	assert.is(strTruncate(foo), foo);
	assert.is(strTruncate(bar), bar);
	assert.is(strTruncate(bar, 6), 'abc...');
	assert.is(strTruncate(bar, 3, '---'), '---');
	assert.throws(function(){ strTruncate(bar, 1, '---'); });
	assert.is(strTruncate(foobar, 6, '.'), 'üäöÜÄ.');
	assert.is(strTruncate(foobar, 7), foobar);
});



test('strConcat', assert => {
	const foo = [10, 9, 8, 7, 6, '5', '4', '3', '2', '1', 'ZERO!'];

	assert.is(
		strConcat(' ... ', 10, 9, 8.8, 7, 6.6, '5', '4', '3', '2', '1', 'ZERO!'),
		'10 ... 9 ... 8.8 ... 7 ... 6.6 ... 5 ... 4 ... 3 ... 2 ... 1 ... ZERO!'
	);
	assert.is(
		strConcat('...', foo),
		'10...9...8...7...6...5...4...3...2...1...ZERO!'
	);
	assert.is(
		strConcat('...', ...foo),
		'10...9...8...7...6...5...4...3...2...1...ZERO!'
	);
	assert.is(strConcat(null, 1, ['2', 3.3], {a : 1, b : 2}), '12,3.3[object Object]');
	assert.is(strConcat(null, [1,'2', 3.3], 1, 2, 3), '123.3');
	assert.is(strConcat('_'), '');
	assert.is(strConcat('_', []), '');
});



test('strFormat', assert => {
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
		strFormat(
			'An elephant is {times:float(0.00)} times smarter than a {animal}',
			{times : 5.5555, animal : 'lion'}
		),
		'An elephant is 5.56 times smarter than a lion'
	);
	assert.is(
		strFormat('{0}{0}{0} ... {{BATMAN!}}', 'Nana'),
		'NanaNanaNana ... {BATMAN!}'
	);
	assert.is(
		strFormat('{} {} {} starts the alphabet.', 'A', 'B', 'C'),
		'A B C starts the alphabet.'
	);
	assert.is(
		strFormat('{0:int}, {1:int}, {2:int}: details are for pussies', '1a', 2.222, 3),
		'1, 2, 3: details are for pussies'
	);
	assert.is(
		strFormat(
			'This is {4}: We need just {1.2:int} {foo} {3} kill {1.0} humans {2:float(0.0)} times over.',
			{foo : 'ape'}, [function(){ return 3; }, 2, 1.1], 42.45, 'to', function(){ return true; }
		),
		'This is true: We need just 1 ape to kill 3 humans 42.5 times over.'
	);
	assert.throws(function(){ strFormat('{0} {1} {2} {}', 1, 2, 3, 4); });
	assert.throws(function(){ strFormat('{} {1} {2} {3}', 1, 2, 3, 4); });
	assert.is(
		strFormat(
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
