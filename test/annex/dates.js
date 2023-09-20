import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.dates;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/dates.js`);
}

const {
	format,
	SaneDate
} = pkg;



test('format', assert => {
	const foo = new Date('2016-02-28T18:35:06.700Z');
	assert.is(format(foo, 'short', 'de-DE'), '29.02.16, 04:05');
	assert.is(format(foo), 'February 29, 2016 at 4:05:06 AM GMT+9:30');
	assert.is(format(foo, 'long', null, 'date'), 'February 29, 2016');
	assert.is(format(foo, 'full', 'xx-XX', 'datetime', {timeZone : 'Europe/Berlin'}), 'Sunday, February 28, 2016 at 7:35:06 PM Central European Standard Time');
	assert.is(format(foo, 'long', 'de-DE', 'datetime', {timeZone : 'UTC'}), '28. Februar 2016 um 18:35:06 UTC');
	assert.is(format(foo, 'YYYY-MM-DDTHH:mm:ss.SSSZ'), '2016-02-29T04:05:06.700+09:30');
	assert.is(format(foo, 'YYYY-MM-DDTHH:mm:ss.SSSZ', null, null, {timeZone : 'Australia/Darwin'}), '2016-02-29T04:05:06.700+09:30');
	assert.is(format(foo, 'YYMDHms', 'en-GB', 'date', {timeZone : 'Europe/Berlin'}), '16229456');
});



test('SaneDate', assert => {
	const
		foo = new SaneDate('1-2-3 4:5:6.7'),
		bar = new SaneDate('2018-02-28 13:37:00'),
		foobar = new SaneDate('2016-4-7'),
		boo = new SaneDate(2016, 4, 7),
		far = new SaneDate(bar, 7, 30, null, 38),
		boofar = new SaneDate(null, null, null, null, null, null, 999),
		barfoo = new SaneDate({toIsoString(){ return '1999T23-2'; }})
	;
	let tmp;

	assert.throws(() => new SaneDate(2016, 13, 33, 13, 37, 0, 999));
	assert.is(foo.year, 1);
	assert.is(foo.date, 3);
	assert.is(foo.milliseconds, 700);
	assert.throws(() => { foo.date = 32; });
	assert.throws(() => { foo.year = 10001; });

	assert.is(far.month, 7);
	assert.is(far.date, 30);
	assert.is(far.hours, 13);
	assert.is(far.minutes, 38);

	assert.is(boofar.year, 1970);
	assert.is(boofar.seconds, 0);
	assert.is(boofar.milliseconds, 999);

	assert.is(barfoo.year, 1999);
	assert.is(barfoo.month, 1);
	assert.is(barfoo.hours, 10);
	assert.is(barfoo.minutes, 30);
	assert.is(barfoo.seconds, 0);
	assert.is(barfoo.getTimezone(), '+09:30');
	assert.is(barfoo.getVanillaDate().getTimezoneOffset(), -570);
	barfoo.utc = true;
	assert.is(barfoo.hours, 1);
	assert.is(barfoo.minutes, 0);
	assert.is(barfoo.getTimezone(), 'Z');

	foo.year = 2012;
	foo.date = 29;
	assert.throws(() => { foo.year = 2013; });
	assert.notThrows(() => { foo.year = 2016; });
	assert.is(foo.year, 2016);
	assert.is(foo.date, 29);

	foo.forward('days', 3);
	foo.backward('hours', 12);
	foo.move('seconds', -30);
	assert.is(foo.getIsoDateString(), '2016-03-02');
	assert.is(foo.getIsoTimeString(), '16:04:36.700+09:30');
	assert.is(foo.getIsoTimeString(false), '16:04:36.700');
	assert.is(foo.getIsoString(), '2016-03-02T16:04:36.700+09:30');
	assert.is(foo.getIsoString(false, false), '2016-03-02 16:04:36.700');
	foo.move({
		days : -2,
		hours : -12,
		seconds : 30,
		milliseconds : 300
	});
	assert.is(foo.getIsoString(), '2016-02-29T04:05:07+09:30');
	assert.throws(() => {
		foo.move({
			days : 1,
			hours : 1,
			seconds : 1,
			foo : 1
		});
	});
	assert.is(foo.milliseconds, 0);
	assert.is(foo.seconds, 7);
	assert.throws(() => { foo.forward('milliseconds', -1); });
	assert.throws(() => { foo.backward('milliseconds', -1); });
	foo.backward('milliseconds', 300);
	assert.is(foo.milliseconds, 700);
	assert.is(foo.seconds, 6);

	assert.false(foo.utc);
	foo.utc = true;
	assert.true(foo.utc);
	foo.utc = false;
	assert.false(foo.utc);
	foo.utc = true;
	assert.is(foo.getIsoString(), '2016-02-28T18:35:06.700Z');

	assert.is(bar.getWeekDay(), 3);
	assert.is(bar.getWeekDay(null, true), 'wednesday');
	assert.is(bar.getWeekDay('friday'), 6);
	assert.is(bar.getWeekDay('friday', true), 'wednesday');

	assert.is(foo.compareTo(bar), -1);
	assert.true(foo.isBefore(bar));
	assert.false(foo.isAfter(bar));
	assert.false(foo.isSame(bar));
	foo.year = 2018;
	assert.is(foo.compareTo(bar, 'date'), 0);
	assert.true(foo.isSame(bar, 'date'));
	assert.false(foo.isBefore(bar, 'date'));
	assert.false(foo.isAfter(bar, 'date'));
	foo.year = 2016;
	assert.is(bar.compareTo(foobar), 1);
	assert.true(bar.isAfter(foobar));
	assert.false(bar.isBefore(foobar));
	assert.false(bar.isSame(foobar));
	assert.is(foobar.compareTo(boo), 0);
	assert.true(foobar.isSame(boo));
	assert.true(boo.isSame(foobar));
	assert.false(foobar.isBefore(boo));
	assert.false(foobar.isAfter(boo));
	tmp = foo.clone();
	assert.is(foo.compareTo(tmp), 0);
	assert.true(foo.isSame(tmp));
	assert.false(foo.isBefore(tmp));
	assert.false(foo.isAfter(tmp));
	tmp.milliseconds += 1;
	assert.is(foo.compareTo(tmp), -1);
	assert.is(foo.compareTo(tmp, 'datetime', false), 0);
	assert.true(foo.isSame(tmp, null, false));
	assert.false(foo.isBefore(tmp, 'date', true));
	assert.false(foo.isAfter(tmp, null, false));
	assert.true(tmp.utc);

	assert.deepEqual(bar.getDelta(foo), {days : 730, hours : 9, minutes : 31, seconds : 53, milliseconds : 300});
	assert.deepEqual(foo.getDelta(bar, 'hours', true), {hours : -(730 * 24 + 9), minutes : -31, seconds : -53, milliseconds : -300});
	assert.deepEqual(foo.getDelta(bar, 'seconds'), {seconds : 730 * 24 * 60 * 60 + 9 * 60 * 60 + 31 * 60 + 53, milliseconds : 300});
	assert.deepEqual(foo.getDelta(tmp, 'minutes'), {minutes : 0, seconds : 0, milliseconds : 1});
	assert.deepEqual(foo.getDelta(tmp, 'milliseconds'), {milliseconds : 1});

	assert.is(foo.format('short', 'de-DE'), '28.02.16, 18:35');
	assert.is(foo.format(), 'February 28, 2016 at 6:35:06 PM UTC');
	assert.is(foo.format('long', null, 'date'), 'February 28, 2016');
	assert.is(foo.format('full', 'xx-XX', 'datetime', {timeZone : 'Europe/Berlin'}), 'Sunday, February 28, 2016 at 7:35:06 PM Central European Standard Time');
	assert.is(foo.format('long', 'de-DE', 'datetime', {timeZone : 'UTC'}), '28. Februar 2016 um 18:35:06 UTC');
	assert.is(foo.format('YYYY-MM-DDTHH:mm:ss.SSSZ'), '2016-02-28T18:35:06.700');
	assert.is(foo.format('YYYY-MM-DDTHH:mm:ss.SSSZ', null, null, {timeZone : 'Australia/Darwin'}), '2016-02-29T04:05:06.700+09:30');
	assert.is(foo.format('YYMDHms', 'en-GB', 'date', {timeZone : 'Europe/Berlin'}), '16229456');
});
