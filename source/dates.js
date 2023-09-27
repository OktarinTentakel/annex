/*!
 * Module Dates
 */

/**
 * @namespace Dates
 */

const MODULE_NAME = 'Dates';



//###[ IMPORTS ]########################################################################################################

import {
	hasValue,
	assert,
	orDefault,
	isArray,
	isDate,
	isString,
	isNumber,
	isInt,
	isNaN,
	isObject,
	isPlainObject,
	isFunction
} from './basic.js';

import {pad} from './strings.js';



//###[ DATA ]###########################################################################################################

const DATE_PART_SETTERS_AND_GETTERS = {
	local : {
		year : {
			setter : 'setFullYear',
			getter : 'getFullYear'
		},
		month : {
			setter : 'setMonth',
			getter : 'getMonth',
		},
		date : {
			setter : 'setDate',
			getter : 'getDate',
		},
		hours : {
			setter : 'setHours',
			getter : 'getHours',
		},
		minutes : {
			setter : 'setMinutes',
			getter : 'getMinutes',
		},
		seconds : {
			setter : 'setSeconds',
			getter : 'getSeconds',
		},
		milliseconds : {
			setter : 'setMilliseconds',
			getter : 'getMilliseconds',
		},
	},
	utc : {
		year : {
			setter : 'setUTCFullYear',
			getter : 'getUTCFullYear',
		},
		month : {
			setter : 'setUTCMonth',
			getter : 'getUTCMonth',
		},
		date : {
			setter : 'setUTCDate',
			getter : 'getUTCDate',
		},
		hours : {
			setter : 'setUTCHours',
			getter : 'getUTCHours',
		},
		minutes : {
			setter : 'setUTCMinutes',
			getter : 'getUTCMinutes',
		},
		seconds : {
			setter : 'setUTCSeconds',
			getter : 'getUTCSeconds',
		},
		milliseconds : {
			setter : 'setUTCMilliseconds',
			getter : 'getUTCMilliseconds',
		},
	}
};



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Dates:format
 */

/**
 * Returns a formatted string, describing the date in a verbose, non-technical way.
 *
 * Under the hood, this uses Intl.DateTimeFormat, which is widely supported and conveniently to use
 * for most widely used locales.
 *
 * "definition" may be a format shortcut for "dateStyle" (and "timeStyle" if type is "datetime") or a format string,
 * for a custom format, using these tokens:
 *
 * YY      18         two-digit year;
 * YYYY    2018       four-digit year;
 * M       1-12       the month, beginning at 1;
 * MM      01-12      the month, 2-digits;
 * D       1-31       the day of the month;
 * DD      01-31      the day of the month, 2-digits;
 * H       0-23       the hour;
 * HH      00-23      the hour, 2-digits;
 * h       1-12       the hour, 12-hour clock;
 * hh      01-12      the hour, 12-hour clock, 2-digits;
 * m       0-59       the minute;
 * mm      00-59      the minute, 2-digits;
 * s       0-59       the second;
 * ss      00-59      the second, 2-digits;
 * SSS     000-999    the millisecond, 3-digits;
 * Z       +05:00     the offset from UTC, ±HH:mm;
 * ZZ      +0500      the offset from UTC, ±HHmm;
 * A       AM PM;
 * a       am pm;
 *
 * Using these, you could create your own ISO string like this:
 * "YYYY-MM-DDTHH:mm:ss.SSSZ"
 *
 * If you use "full", "long", "medium" or "short" instead, you'll use the DateTimeFormatters built-in, preset
 * format styles for localized dates, based on the given locale(s).
 *
 * @param {Date} date - the date to format
 * @param {?String} [definition='long'] - either a preset style to quickly define a format style, by setting shortcuts for dateStyle and timeStyle (if type is "datetime"), set to "none" or nullish value to skip quick format; alternatively, define this as a format string to use a custom format
 * @param {?String|Array<String>} [locale='en-US'] - locale to use for date format and text generation, use array to define fallback; always falls back to en-US if nothing else works
 * @param {?String} [type='datetime'] - set to 'datetime', 'date' or 'time' to define which parts should be rendered
 * @param {?Object} [options=null] - options to pass to the Intl.DateTimeFormat constructor, is applied last, so should override anything predefined, if key is reset
 * @returns {String} - the formatted date/time string
 *
 * @memberof Dates:format
 * @alias format
 * @variation Dates
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#style_shortcuts
 * @example
 * format(new Date(), 'de-DE', 'long', 'datetime', {timeZone : 'UTC'})
 * => '12. Dezember 2023 um 02:00:00 UTC'
 * format(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSZ')
 * => '2023-12-12T02:00:00'
 */
export function format(date, definition='long', locale='en-US', type='datetime', options=null){
	const
		utc = (options?.timeZone === 'UTC'),
		settersAndGetters = utc
			? DATE_PART_SETTERS_AND_GETTERS.utc
			: DATE_PART_SETTERS_AND_GETTERS.local
		,
		predefinedStyles = ['full', 'long', 'medium', 'short', 'none']
	;

	if( hasValue(definition) && !predefinedStyles.includes(definition) ){
		let timezone = '';
		const offset = date.getTimezoneOffset();
		if( !utc && (offset !== 0) ){
			const
				hours = pad(Math.floor(Math.abs(offset) / 60), '0', 2),
				minutes = pad(Math.abs(offset) - (hours * 60), '0', 2)
			;
			timezone = `${(offset < 0) ? '+' : '-'}${hours}:${minutes}`;
		}

		const tokenMap = new Map();
		tokenMap.set('YYYY', `${date[settersAndGetters.year.getter]()}`);
		tokenMap.set('YY', `${date[settersAndGetters.year.getter]()}`.slice(-2));
		tokenMap.set('MM', pad(`${date[settersAndGetters.month.getter]() + 1}`, '0', 2));
		tokenMap.set('M', `${date[settersAndGetters.month.getter]() + 1}`);
		tokenMap.set('DD', pad(`${date[settersAndGetters.date.getter]()}`, '0', 2));
		tokenMap.set('D', `${date[settersAndGetters.date.getter]()}`);
		tokenMap.set('HH', pad(`${date[settersAndGetters.hours.getter]()}`, '0', 2));
		tokenMap.set('H', `${date[settersAndGetters.hours.getter]()}`);
		tokenMap.set('hh', pad(`${
			(date[settersAndGetters.hours.getter]() === 0)
			? 12
			: (
				(date[settersAndGetters.hours.getter]() > 12)
				? date[settersAndGetters.hours.getter]() - 12
				: date[settersAndGetters.hours.getter]()
			)
		}`, '0', 2));
		tokenMap.set('h', `${
			(date[settersAndGetters.hours.getter]() === 0)
			? 12
			: (
				(date[settersAndGetters.hours.getter]() > 12)
				? date[settersAndGetters.hours.getter]() - 12
				: date[settersAndGetters.hours.getter]()
			)
		}`);
		tokenMap.set('mm', pad(`${date[settersAndGetters.minutes.getter]()}`, '0', 2));
		tokenMap.set('m', `${date[settersAndGetters.minutes.getter]()}`);
		tokenMap.set('ss', pad(`${date[settersAndGetters.seconds.getter]()}`, '0', 2));
		tokenMap.set('s', `${date[settersAndGetters.seconds.getter]()}`);
		tokenMap.set('SSS', pad(`${date[settersAndGetters.milliseconds.getter]()}`, '0', 3));
		tokenMap.set('ZZ', timezone.replaceAll(':', ''));
		tokenMap.set('Z', timezone);
		tokenMap.set('A', `${(date[settersAndGetters.hours.getter]() >= 12) ? 'PM' : 'AM'}`);
		tokenMap.set('a', `${(date[settersAndGetters.hours.getter]() >= 12) ? 'pm' : 'am'}`);

		let formattedDate = definition;
		tokenMap.forEach((value, token) => {
			formattedDate = formattedDate.replaceAll(token, value);
		});

		return formattedDate;
	} else {
		let formatterOptions = {};

		if( predefinedStyles.includes(definition) ){
			if( ['datetime', 'date'].includes(type) ){
				formatterOptions.dateStyle = definition;
			}
			if( ['datetime', 'time'].includes(type) ){
				formatterOptions.timeStyle = definition;
			}
		}

		locale = orDefault(locale, 'en-US', 'str');
		if(
			(!isArray(locale) && (locale !== 'en-US'))
			|| (isArray(locale) && !locale.includes('en-US'))
		){
			locale = [].concat(locale).concat('en-US');
		}

		formatterOptions = {
			...formatterOptions,
			...(options ?? {})
		};

		return Intl.DateTimeFormat(locale, formatterOptions).format(date);
	}

}



/**
 * @namespace Dates:SaneDate
 **/

/**
 * SaneDate is a reimplementation of JavaScript date objects, trying to iron out all the small fails
 * which make you want to pull your hair while keeping the cool stuff in a streamlined manner.
 *
 * SaneDates operate between the years 0 and 9999.
 * If you create a new SaneDate, it starts off in local mode, always working and returning local information, but
 * you may activate UTC mode by defining `.utc = true;`.
 *
 * Parsing an ISO string creates a local SaneDate if no timezone is defined, if you define "Z" or an offset, the
 * given string is interpreted as UTC info, so "2012-12-12T12:00:00" will set all parts as local information,
 * meaning, that the UTC representation may differ according to your timezone, while "2012-12-12T12:00:00Z" will
 * set all parts as UTC information, meaning that this is exactly what you get as the UTC representation, but your local
 * info will differ according to your timezone. "2012-12-12T12:00:00+02:00" on the other hand, will create UTC
 * information, with a negative offset of two hours, since this says: this datetime is two hours in the UTC future,
 * so the resulting UTC info will be at 10 o'clock, while your local info will behave according to your timezone in
 * regard to that info.
 *
 * The relevant date parts of a SaneDate, which are also available as attributes to get and set are:
 * "year", "month", "date" (not day!), "hours", "minutes", "seconds" and "milliseconds".
 *
 * Additionally, set UTC mode, using the "utc" property.
 *
 * SaneDates are very exception-happy and won't allow anything, that changes or produces a date in an unexpected
 * manner. All automagic behaviour of JS dates is an error here, so setting a month to 13 and expecting a year jump
 * will not work. Dates are very sensitive information and often used for contractual stuff, so anything coming out
 * differently than you defined it in the first place is very problematic. Every change to any single property triggers
 * a check, if any side effects occurred at all and if the change exactly results in the exact info being represented.
 * Any side effect or misrepresentation results in an exception, since something happened we did not expect or define.
 *
 * Months and week days are not zero based in SaneDates but begin with 1. Week days are not an attribute
 * (and not settable), but accessible via .getWeekDay().
 *
 * This whole implementation is heavily built around iso strings, so building a date with one and getting one
 * to transfer should be forgiving, easy and robust. Something like '1-2-3 4:5:6.7' is a usable iso string
 * for SaneDate, but getIsoString() will return correctly formatted '0001-02-03T04:05:06.700'.
 *
 * See class documentation below for details.
 *
 * @memberof Dates:SaneDate
 * @name SaneDate
 *
 * @see SaneDate
 * @example
 * let date = new SaneDate('1-2-3 4:5:6.7');
 * date = new SaneDate('2016-4-7');
 * date = new SaneDate('2016-04-07 13:37:00');
 * date = new SaneDate(2016, 4, 7);
 * date = new SaneDate(2016, 4, 7, 13, 37, 0, 999);
 * date.year = 2000;
 * date.forward('hours', 42);
 */
class SaneDate {

	#__className__ = 'SaneDate';
	#invalidDateMessage = 'invalid date, please check parameters - SaneDate only accepts values that result in a valid date, where the given value is reflected exactly (e.g.: setting hours to 25 will not work)';
	#paramInvalidOrOutOfRangeMessage = 'invalid or out of range';
	#date = null;
	#utc = false;

	/**
	 * Creates a new SaneDate, either based on Date.now(), a given initial value or given date parts.
	 *
	 * @param {?Date|SaneDate|String|Number|Object} [initialValueOrYear=null] - something, that can be used to construct an initial value, this may be a vanilla Date, a SaneDate, a parsable string, a unix timestamp or an object implementing a method toISOString/toIsoString/getISOString/getIsoString; if this is a number, it will be treated as the year, if any other parameter is set as well; if nullish and all other parameters are not set either, the initial value is Date.now()
	 * @param {?Number} [month=null] - month between 1 and 12, to set in initial value
	 * @param {?Number} [date=null] - date between 1 and 31, to set in initial value
	 * @param {?Number} [hours=null] - hours between 0 and 23, to set in initial value
	 * @param {?Number} [minutes=null] - minutes between 0 and 59, to set in initial value
	 * @param {?Number} [seconds=null] - seconds between 0 and 59, to set in initial value
	 * @param {?Number} [milliseconds=null] - milliseconds between 0 and 999, to set in initial value
	 * @throws error if created date is invalid
	 */
	constructor(initialValueOrYear=null, month=null, date=null, hours=null, minutes=null, seconds=null, milliseconds=null){
		const __methodName__ = 'constructor';

		let year = null;
		const definedIndividualDateParts = {year, month, date, hours, minutes, seconds, milliseconds};
		let hasDefinedIndividualDateParts = Object.values(definedIndividualDateParts).filter(part => isNumber(part)).length >= 1;

		if( initialValueOrYear instanceof SaneDate ){
			this.#date = initialValueOrYear.getVanillaDate();
		} else if( isDate(initialValueOrYear) ){
			this.#date = initialValueOrYear;
		} else if( isString(initialValueOrYear) ){
			this.#date = this.#parseIsoString(initialValueOrYear);
		} else if( isNumber(initialValueOrYear) ){
			if( hasDefinedIndividualDateParts ){
				year = parseInt(initialValueOrYear, 10);
				definedIndividualDateParts.year = year;
			} else {
				this.#date = new Date(initialValueOrYear);
			}
		} else if(
			isObject(initialValueOrYear)
			&& (
				isFunction(initialValueOrYear.toISOString)
				|| isFunction(initialValueOrYear.toIsoString)
				|| isFunction(initialValueOrYear.getISOString)
				|| isFunction(initialValueOrYear.getIsoString)
			)
		){
			this.#date = this.#parseIsoString(
				initialValueOrYear.toISOString?.()
				?? initialValueOrYear.toIsoString?.()
				?? initialValueOrYear.getISOString?.()
				?? initialValueOrYear.getIsoString?.()
			);
		}

		if( !isDate(this.#date) ){
			this.#date = hasDefinedIndividualDateParts ? new Date('1970-01-01T00:00:00.0') : new Date();
		}

		assert(
			!isNaN(this.#date.getTime()),
			`${MODULE_NAME}:${this.#__className__}.${__methodName__} | ${this.#invalidDateMessage}`
		);

		this.#createDatePartGettersAndSetters();

		if( hasDefinedIndividualDateParts ){
			Object.entries(definedIndividualDateParts)
				.filter(([_, value]) => isNumber(value))
				.forEach(([part, value]) => {
					this[part] = value;
				})
			;
		}
	}



	/**
	 * Creates getters and setters to leisurely access and change date properties by using property assignments
	 * instead of method calls. This method provides most of the public interface of every SaneDate object.
	 *
	 * @private
	 */
	#createDatePartGettersAndSetters(){
		const propertyConfig = {
			enumerable : true
		};

		/**
		 * @name SaneDate#utc
		 * @property {Boolean} - defines if the date should behave as a UTC date instead of a local date (which is the default)
		 */
		Object.defineProperty(this, 'utc', {
			...propertyConfig,
			set(utc){
				this.#utc = !!utc;
			},
			get(){
				return this.#utc;
			}
		});

		/**
		 * @name SaneDate#year
		 * @property {Number} - the date's year in the range of 0 to 9999
		 */
		Object.defineProperty(this, 'year', {
			...propertyConfig,
			set(year){
				const __methodName__ = 'set year';

				year = parseInt(year, 10);
				assert(
					isInt(year)
					&& (year >= 0 && year <= 9999),
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | year ${this.#paramInvalidOrOutOfRangeMessage} (0...9999)`
				);

				this.#tryDatePartChange('year', year);
			},
			get(){
				const settersAndGetters = this.#utc
					? DATE_PART_SETTERS_AND_GETTERS.utc
					: DATE_PART_SETTERS_AND_GETTERS.local
				;
				return this.#date[settersAndGetters.year.getter]();
			}
		});

		/**
		 * @name SaneDate#month
		 * @property {Number} - the date's month in the range of 1 to 12
		 */
		Object.defineProperty(this, 'month', {
			...propertyConfig,
			set(month){
				const __methodName__ = 'set month';

				month = parseInt(month, 10);
				assert(
					isInt(month)
					&& (month >= 1 && month <= 12),
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | month ${this.#paramInvalidOrOutOfRangeMessage} (1...12)`
				);

				this.#tryDatePartChange('month', month - 1);
			},
			get(){
				const settersAndGetters = this.#utc
					? DATE_PART_SETTERS_AND_GETTERS.utc
					: DATE_PART_SETTERS_AND_GETTERS.local
				;
				return this.#date[settersAndGetters.month.getter]() + 1;
			}
		});

		/**
		 * @name SaneDate#date
		 * @property {Number} - the date's day of the month in the range of 1 to 31
		 */
		Object.defineProperty(this, 'date', {
			...propertyConfig,
			set(date){
				const __methodName__ = 'set date';

				date = parseInt(date, 10);
				assert(
					isInt(date)
					&& (date >= 1 && date <= 31),
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | date ${this.#paramInvalidOrOutOfRangeMessage} (1...31)`
				);

				this.#tryDatePartChange('date', date);
			},
			get(){
				const settersAndGetters = this.#utc
					? DATE_PART_SETTERS_AND_GETTERS.utc
					: DATE_PART_SETTERS_AND_GETTERS.local
				;
				return this.#date[settersAndGetters.date.getter]();
			}
		});

		/**
		 * @name SaneDate#hours
		 * @property {Number} - the date's hours in the range of 0 to 23
		 */
		Object.defineProperty(this, 'hours',{
			set(hours){
				const __methodName__ = 'set hours';

				hours = parseInt(hours, 10);
				assert(
					isInt(hours)
					&& (hours >= 0 && hours <= 23),
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | hours ${this.#paramInvalidOrOutOfRangeMessage} (0...23)`
				);

				this.#tryDatePartChange('hours', hours);
			},
			get(){
				const settersAndGetters = this.#utc
					? DATE_PART_SETTERS_AND_GETTERS.utc
					: DATE_PART_SETTERS_AND_GETTERS.local
				;
				return this.#date[settersAndGetters.hours.getter]();
			}
		});

		/**
		 * @name SaneDate#minutes
		 * @property {Number} - the date's minutes in the range of 0 to 59
		 */
		Object.defineProperty(this, 'minutes', {
			set(minutes){
				const __methodName__ = 'set hours';

				minutes = parseInt(minutes, 10);
				assert(
					isInt(minutes)
					&& (minutes >= 0 && minutes <= 59),
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | minutes ${this.#paramInvalidOrOutOfRangeMessage} (0...59)`
				);

				this.#tryDatePartChange('minutes', minutes);
			},
			get(){
				const settersAndGetters = this.#utc
					? DATE_PART_SETTERS_AND_GETTERS.utc
					: DATE_PART_SETTERS_AND_GETTERS.local
				;
				return this.#date[settersAndGetters.minutes.getter]();
			}
		});

		/**
		 * @name SaneDate#seconds
		 * @property {Number} - the date's seconds in the range of 0 to 59
		 */
		Object.defineProperty(this, 'seconds', {
			set(seconds){
				const __methodName__ = 'set seconds';

				seconds = parseInt(seconds, 10);
				assert(
					isInt(seconds)
					&& (seconds >= 0 && seconds <= 59),
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | seconds ${this.#paramInvalidOrOutOfRangeMessage} (0...59)`
				);

				this.#tryDatePartChange('seconds', seconds);
			},
			get(){
				const settersAndGetters = this.#utc
					? DATE_PART_SETTERS_AND_GETTERS.utc
					: DATE_PART_SETTERS_AND_GETTERS.local
				;
				return this.#date[settersAndGetters.seconds.getter]();
			}
		});

		/**
		 * @name SaneDate#milliseconds
		 * @property {Number} - the date's milliseconds in the range of 0 to 999
		 */
		Object.defineProperty(this, 'milliseconds', {
			set(milliseconds){
				const __methodName__ = 'set milliseconds';

				milliseconds = parseInt(milliseconds, 10);
				assert(
					isInt(milliseconds)
					&& (milliseconds >= 0 && milliseconds <= 999),
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | milliseconds ${this.#paramInvalidOrOutOfRangeMessage} (0...999)`
				);

				this.#tryDatePartChange('milliseconds', milliseconds);
			},
			get(){
				const settersAndGetters = this.#utc
					? DATE_PART_SETTERS_AND_GETTERS.utc
					: DATE_PART_SETTERS_AND_GETTERS.local
				;
				return this.#date[settersAndGetters.milliseconds.getter]();
			}
		});
	}



	/**
	 * Returns the current day of the week as a number between 1 and 7 or an english day name.
	 * This method counts days the European way, starting with monday, but you can change this
	 * behaviour using the first parameter (if your week starts with sunday or friday for example).
	 *
	 * @param {?String} [startingWith='monday'] - set to the english day, which is the first day of the week (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
	 * @param {?Boolean} [asName=false] - set to true, if you'd like the method to return english day names instead of an index
	 * @returns {Number|String} weekday index between 1 and 7 or english name of the day
	 *
	 * @example
	 * const d = new SaneDate();
	 * if( d.getWeekDay() == 5 ){
	 *   alert(`Thank god it's ${d.getWeekday(null, true)}!`);
	 * }
	 */
	getWeekDay(startingWith='monday', asName=false){
		const __methodName__ = 'getWeekDay';

		const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
		startingWith = orDefault(startingWith, weekdays[1], 'str');
		assert(
			weekdays.includes(startingWith),
			`${MODULE_NAME}:${this.#__className__}.${__methodName__} | unknown weekday "${startingWith}"`
		);

		let day = this.#utc ? this.#date.getUTCDay() : this.#date.getDay();
		if( asName ) return weekdays[day];

		const offset = day - weekdays.indexOf(startingWith);
		if( offset < 0 ){
			day = 7 + offset;
		} else {
			day = offset;
		}

		return day + 1;
	}



	/**
	 * Returns the date's current timezone, like it would occur in an ISO-string ("Z", "+06:00", "-02:30").
	 *
	 * If you need the raw offset, use the vanilla date's getTimezoneOffset() method.
	 *
	 * @returns {String} - the timezone string
	 *
	 * @example
	 * const d = new SaneDate()
	 * d.getTimezone()
	 * => "+09:30"
	 */
	getTimezone(){
		if( this.#utc ) return 'Z';

		const offset = this.#date.getTimezoneOffset();

		if( offset === 0 ){
			return 'Z';
		} else {
			const
				hours = this.#padWithZero(Math.floor(Math.abs(offset) / 60), 2),
				minutes = this.#padWithZero(Math.abs(offset) - (hours * 60), 2)
			;
			return `${(offset < 0) ? '+' : '-'}${hours}:${minutes}`;
		}
	}



	/**
	 * Returns the representation of the date's current date parts (year, month, day) as an ISO-string.
	 *
	 * A difference to the vanilla implementation is, that this method respects UTC mode and does not always
	 * coerce the date to UTC automatically. So, this will return a local ISO representation if not in UTC mode
	 * and the UTC representation in UTC mode.
	 *
	 * @returns {String} date ISO-string of the format "2016-04-07"
	 *
	 * @example
	 * const d = new SaneDate();
	 * thatDatePicker.setValue(d.getIsoDateString());
	 */
	getIsoDateString(){
		const
			year = this.#padWithZero(this.year, 4),
			month = this.#padWithZero(this.month, 2),
			date = this.#padWithZero(this.date, 2)
		;

		return `${year}-${month}-${date}`;
	}



	/**
	 * Returns the representation of the date's current time parts (hours, minutes, seconds, milliseconds) as an
	 * ISO-string.
	 *
	 * A difference to the vanilla implementation is, that this method respects UTC mode and does not always
	 * coerce the date to UTC automatically. So, this will return a local ISO representation (optionally with
	 * timezone information in relation to UTC) if not in UTC mode and the UTC representation in UTC mode.
	 *
	 * @param {?Boolean} [withTimezone=true] - defines if the ISO string should end with timezone information, such as "Z" or "+02:00"
	 * @returns {String} time ISO-string of the format "12:59:00.123Z"
	 *
	 * @example
	 * const d = new SaneDate();
	 * thatDatePicker.setValue(`2023-12-12T${d.getIsoTimeString()}`);
	 */
	getIsoTimeString(withTimezone=true){
		withTimezone = orDefault(withTimezone, true, 'bool');

		const
			hours = this.#padWithZero(this.hours, 2),
			minutes = this.#padWithZero(this.minutes, 2),
			seconds = this.#padWithZero(this.seconds, 2),
			milliseconds = this.#padWithZero(this.milliseconds, 3),
			timezone = this.getTimezone()
		;

		return `${hours}:${minutes}:${seconds}${(milliseconds > 0) ? '.'+milliseconds : ''}${withTimezone ? timezone : ''}`;
	}



	/**
	 * Returns the date as an ISO-string.
	 *
	 * A difference to the vanilla implementation is, that this method respects UTC mode and does not always
	 * coerce the date to UTC automatically. So, this will return a local ISO representation (optionally with
	 * timezone information in relation to UTC) if not in UTC mode and the UTC representation in UTC mode.
	 *
	 * @param {?Boolean} [withSeparator=true] - defines if date and time should be separated with a "T"
	 * @param {?Boolean} [withTimezone=true] - defines if the ISO string should end with timezone information, such as "Z" or "+02:00"
	 * @returns {String} ISO-string of the format "2016-04-07T13:37:00.222Z"
	 *
	 * @example
	 * const d = new SaneDate();
	 * thatDateTimePicker.setValue(d.getIsoString());
	 */
	getIsoString(withSeparator=true, withTimezone=true){
		withSeparator = orDefault(withSeparator, true, 'bool');

		return `${this.getIsoDateString()}${withSeparator ? 'T' : ' '}${this.getIsoTimeString(withTimezone)}`;
	}



	/**
	 * Returns a formatted string, describing the current date in a verbose, human-readable, non-technical way.
	 *
	 * "definition" may be a format shortcut for "dateStyle" (and "timeStyle" if type is "datetime") or a format string,
	 * for a custom format, using these tokens:
	 *
	 * YY      18         two-digit year;
	 * YYYY    2018       four-digit year;
	 * M       1-12       the month, beginning at 1;
	 * MM      01-12      the month, 2-digits;
	 * D       1-31       the day of the month;
	 * DD      01-31      the day of the month, 2-digits;
	 * H       0-23       the hour;
	 * HH      00-23      the hour, 2-digits;
	 * h       1-12       the hour, 12-hour clock;
	 * hh      01-12      the hour, 12-hour clock, 2-digits;
	 * m       0-59       the minute;
	 * mm      00-59      the minute, 2-digits;
	 * s       0-59       the second;
	 * ss      00-59      the second, 2-digits;
	 * SSS     000-999    the millisecond, 3-digits;
	 * Z       +05:00     the offset from UTC, ±HH:mm;
	 * ZZ      +0500      the offset from UTC, ±HHmm;
	 * A       AM PM;
	 * a       am pm;
	 *
	 * Using these, you could create your own ISO string like this:
	 * "YYYY-MM-DDTHH:mm:ss.SSSZ"
	 *
	 * If you use "full", "long", "medium" or "short" instead, you'll use the DateTimeFormatters built-in, preset
	 * format styles for localized dates, based on the given locale(s).
	 *
	 * @param {?String} [definition='long'] - either a preset style to quickly define a format style, by setting shortcuts for dateStyle and timeStyle (if type is "datetime"), set to "none" or nullish value to skip quick format; alternatively, define this as a format string to use a custom format
	 * @param {?String|Array<String>} [locale='en-US'] - locale to use for date format and text generation, use array to define fallback; always falls back to en-US if nothing else works
	 * @param {?String} [type='datetime'] - set to 'datetime', 'date' or 'time' to define which parts should be rendered
	 * @param {?Object} [options=null] - options to pass to the Intl.DateTimeFormat constructor, is applied last, so should override anything predefined, if key is reset
	 * @returns {String} - the formatted date/time string
	 *
	 * @see format(Dates)
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#style_shortcuts
	 * @example
	 * const d = new SaneDate();
	 * d.format('de-DE', 'long', 'datetime', {timeZone : 'UTC'})
	 * => '12. Dezember 2023 um 02:00:00 UTC'
	 * d.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
	 * => '2023-12-12T02:00:00'
	 */
	format(definition='long', locale='en-US', type='datetime', options=null){
		options = orDefault(options, {});

		if( !hasValue(options.timeZone) && this.#utc ){
			options.timeZone = 'UTC';
		}

		return format(this.#date, definition, locale, type, options);
	}



	/**
	 * Return the current original JavaScript date object wrapped by SaneDate.
	 * Use this to do special things.
	 *
	 * @returns {Date} the original JavaScript date object
	 *
	 * @example
	 * const d = new SaneDate();
	 * const timezoneOffset = d.getVanillaDate().getTimezoneOffset();
	 */
	getVanillaDate(){
		return this.#date;
	}



	/**
	 * Compares the date to another date in terms of placement on the time axis.
	 *
	 * Returns a classical comparator value (-1/0/1), being -1 if the date is earlier than the parameter.
	 * Normally checks date and time. Set type to "date" to only check date.
	 *
	 * @param {?Date|SaneDate|String|Number|Object|SaneDate} initialValueOrSaneDate - anything compatible to the SaneDate constructor or a SaneDate instance
	 * @param {?String} [type='datetime'] - either "datetime" or "date", telling the method if time should be considered
	 * @param {?Boolean} [withMilliseconds=true] - tells the method if milliseconds should be considered if type is "datetime"
	 * @throws error if compare date is not usable
	 * @returns {Number} -1 if this date is smaller/earlier, 0 if identical, 1 if this date is bigger/later
	 *
	 * @example
	 * const d = new SaneDate();
	 * if( d.compareTo('2016-04-07', 'date') === 0 ){
	 *   alert('congratulations, that\'s the same date!');
	 * }
	 */
	compareTo(initialValueOrSaneDate, type='datetime', withMilliseconds=true){
		type = orDefault(type, 'datetime', 'string');
		withMilliseconds = orDefault(withMilliseconds, true, 'bool');

		const
			saneDate = new SaneDate(initialValueOrSaneDate),
			dateCompareGetters = [
				DATE_PART_SETTERS_AND_GETTERS.utc.year.getter,
				DATE_PART_SETTERS_AND_GETTERS.utc.month.getter,
				DATE_PART_SETTERS_AND_GETTERS.utc.date.getter,
			],
			timeCompareGetters = [
				DATE_PART_SETTERS_AND_GETTERS.utc.hours.getter,
				DATE_PART_SETTERS_AND_GETTERS.utc.minutes.getter,
				DATE_PART_SETTERS_AND_GETTERS.utc.seconds.getter,
			],
			millisecondsCompareGetter = DATE_PART_SETTERS_AND_GETTERS.utc.milliseconds.getter
		;

		let compareGetters = [].concat(dateCompareGetters);
		if( type === 'datetime' ){
			compareGetters = compareGetters.concat(timeCompareGetters);
			if( withMilliseconds ){
				compareGetters = compareGetters.concat(millisecondsCompareGetter);
			}
		}

		let ownValue, compareValue, comparator;
		for( const compareGetter of compareGetters ){
			ownValue = this.#date[compareGetter]();
			compareValue = saneDate.getVanillaDate()[compareGetter]();
			comparator = (ownValue < compareValue)
				? -1
				: ((ownValue > compareValue) ? 1 : 0)
			;

			if( comparator !== 0 ){
				break;
			}
		}

		return comparator;
	}



	/**
	 * Returns if the SaneDate is earlier on the time axis than the comparison value.
	 *
	 * @param {?Date|SaneDate|String|Number|Object|SaneDate} initialValueOrSaneDate - anything compatible to the SaneDate constructor or a SaneDate instance
	 * @param {?String} [type='datetime'] - either "datetime" or "date", telling the method if time should be considered
	 * @param {?Boolean} [withMilliseconds=true] - tells the method if milliseconds should be considered if type is "datetime"
	 * @throws error if compare date is not usable
	 * @returns {Boolean} true if SaneDate is earlier than compare value
	 *
	 * @example
	 * const now = new SaneDate();
	 * const theFuture = now.clone().forward({days : 1, hours : 2, minutes : 3, seconds : 4, milliseconds : 5});
	 * now.isBefore(theFuture)
	 * => true
	 * theFuture.isBefore(now)
	 * => false
	 */
	isBefore(initialValueOrSaneDate, type='datetime', withMilliseconds=true){
		return this.compareTo(initialValueOrSaneDate, type, withMilliseconds) === -1;
	}



	/**
	 * Returns if the SaneDate is later on the time axis than the comparison value.
	 *
	 * @param {?Date|SaneDate|String|Number|Object|SaneDate} initialValueOrSaneDate - anything compatible to the SaneDate constructor or a SaneDate instance
	 * @param {?String} [type='datetime'] - either "datetime" or "date", telling the method if time should be considered
	 * @param {?Boolean} [withMilliseconds=true] - tells the method if milliseconds should be considered if type is "datetime"
	 * @throws error if compare date is not usable
	 * @returns {Boolean} true if SaneDate is later than compare value
	 *
	 * @example
	 * const now = new SaneDate();
	 * const theFuture = now.clone().forward({days : 1, hours : 2, minutes : 3, seconds : 4, milliseconds : 5});
	 * now.isAfter(theFuture)
	 * => false
	 * theFuture.isAfter(now)
	 * => true
	 */
	isAfter(initialValueOrSaneDate, type='datetime', withMilliseconds=true){
		return this.compareTo(initialValueOrSaneDate, type, withMilliseconds) === 1;
	}



	/**
	 * Returns if the SaneDate is at the same time as comparison value.
	 *
	 * @param {?Date|SaneDate|String|Number|Object|SaneDate} initialValueOrSaneDate - anything compatible to the SaneDate constructor or a SaneDate instance
	 * @param {?String} [type='datetime'] - either "datetime" or "date", telling the method if time should be considered
	 * @param {?Boolean} [withMilliseconds=true] - tells the method if milliseconds should be considered if type is "datetime"
	 * @throws error if compare date is not usable
	 * @returns {Boolean} true if SaneDate is at the same time as compare value
	 *
	 * @example
	 * const now = new SaneDate();
	 * const theFuture = now.clone();
	 * now.isSame(theFuture)
	 * => true
	 * theFuture.forward({days : 1, hours : 2, minutes : 3, seconds : 4, milliseconds : 5});
	 * theFuture.isSame(now)
	 * => false
	 */
	isSame(initialValueOrSaneDate, type='datetime', withMilliseconds=true){
		return this.compareTo(initialValueOrSaneDate, type, withMilliseconds) === 0;
	}



	/**
	 * Move the date a defined offset to the past or the future.
	 *
	 * @param {String|Object} part - the name of the date part to change, one of "years", "months", "days", "hours", "minutes", "seconds" and "milliseconds" or a dictionary of part/amount pairs ({hours : -1, seconds : 30})
	 * @param {?Number} [amount=0] - negative or positive integer defining the offset from the current date
	 * @throws error on invalid part name
	 * @returns {SaneDate} the SaneDate instance
	 *
	 * @example
	 * let d = new SaneDate();
	 * d = d.move('years', 10).move('milliseconds', -1);
	 */
	move(part, amount=0){
		const __methodName__ = 'move;'

		amount = orDefault(amount, 0, 'int');

		const
			settersAndGetters = DATE_PART_SETTERS_AND_GETTERS.utc,
			parts = ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds']
		;
		let partDict = {};

		if( !isPlainObject(part) ){
			partDict[part] = amount;
		} else {
			partDict = part;
		}

		Object.keys(partDict).forEach(part => {
			assert(
				parts.includes(part),
				`${MODULE_NAME}:${this.#__className__}.${__methodName__} | part must be one of ${parts.join(', ')}, is "${part}"`
			);
		});

		Object.entries(partDict).forEach(([part, amount]) => {
			switch( part ){
				case 'years':
					this.#date[settersAndGetters.year.setter](this.#date[settersAndGetters.year.getter]() + amount);
				break;

				case 'months':
					this.#date[settersAndGetters.month.setter](this.#date[settersAndGetters.month.getter]() + amount);
				break;

				case 'days':
					this.#date[settersAndGetters.date.setter](this.#date[settersAndGetters.date.getter]() + amount);
				break;

				case 'hours':
					this.#date[settersAndGetters.hours.setter](this.#date[settersAndGetters.hours.getter]() + amount);
				break;

				case 'minutes':
					this.#date[settersAndGetters.minutes.setter](this.#date[settersAndGetters.minutes.getter]() + amount);
				break;

				case 'seconds':
					this.#date[settersAndGetters.seconds.setter](this.#date[settersAndGetters.seconds.getter]() + amount);
				break;

				case 'milliseconds':
					this.#date[settersAndGetters.milliseconds.setter](this.#date[settersAndGetters.milliseconds.getter]() + amount);
				break;
			}
		});

		return this;
	}



	/**
	 * Moves the date's time forward a certain offset.
	 *
	 * @param {String|Object} part - the name of the date part to change, one of "years", "months", "days", "hours", "minutes", "seconds" and "milliseconds" or a dictionary of part/amount pairs ({hours : 1, seconds : 30})
	 * @param {?Number} [amount=0] - integer defining the positive offset from the current date, negative value is treated as an error
	 * @throws error on invalid part name or negative amount
	 * @returns {SaneDate} the SaneDate instance
	 *
	 * @example
	 * let d = new SaneDate();
	 * d = d.forward('hours', 8);
	 */
	forward(part, amount=0){
		const
			__methodName__ = 'forward',
			amountMustBePositiveMessage = 'amount must be >= 0'
		;

		part = `${part}`;
		amount = orDefault(amount, 0, 'int');

		let partDict = {};
		if( !isPlainObject(part) ){
			assert(
				amount >= 0,
				`${MODULE_NAME}:${this.#__className__}.${__methodName__} | ${amountMustBePositiveMessage}`
			);
			partDict[part] = amount;
		} else {
			partDict = part;
			Object.entries(partDict).forEach(([part, amount]) => {
				amount = parseInt(amount, 10);
				assert(
					amount >= 0,
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | ${amountMustBePositiveMessage}`
				);
				partDict[part] = amount;
			});
		}

		return this.move(partDict);
	}



	/**
	 * Moves the date's time backward a certain offset.
	 *
	 * @param {String|Object} part - the name of the date part to change, one of "years", "months", "days", "hours", "minutes", "seconds" and "milliseconds" or a dictionary of part/amount pairs ({hours : 1, seconds : 30})
	 * @param {?Number} [amount=0] - integer defining the negative offset from the current date, negative value is treated as an error
	 * @throws error on invalid part name or negative amount
	 * @returns {SaneDate} the SaneDate instance
	 *
	 * @example
	 * let d = new SaneDate();
	 * d = d.backward('years', 1000);
	 */
	backward(part, amount=0){
		const
			__methodName__ = 'backward',
			amountMustBePositiveMessage = 'amount must be >= 0'
		;

		part = `${part}`;
		amount = orDefault(amount, 0, 'int');

		let partDict = {};
		if( !isPlainObject(part) ){
			assert(
				amount >= 0,
				`${MODULE_NAME}:${this.#__className__}.${__methodName__} | ${amountMustBePositiveMessage}`
			);
			partDict[part] = (amount === 0) ? 0 : -amount;
		} else {
			partDict = part;
			Object.entries(partDict).forEach(([part, amount]) => {
				assert(
					amount >= 0,
					`${MODULE_NAME}:${this.#__className__}.${__methodName__} | ${amountMustBePositiveMessage}`
				);
				partDict[part] = (amount === 0) ? 0 : -amount;
			});
		}

		return this.move(partDict);
	}



	/**
	 * Calculates a time delta between the SaneDate and a comparison value.
	 *
	 * The result is a plain object with the delta's units up to the defined "largestUnit". All values are integers.
	 * The largest unit is days, since above neither months nor years are calculable via a fixed divisor and therefore
	 * useless (since month vary from 28 to 31 days and years vary between 365 and 366 days, so both are not a fixed
	 * unit).
	 *
	 * By default, the order does not matter and only the absolute value is used, but you can change this
	 * through the parameter "relative", which by setting this to true, will include "-", if the comparison value
	 * is in the future.
	 *
	 * @param {?Date|SaneDate|String|Number|Object|SaneDate} initialValueOrSaneDate - anything compatible to the SaneDate constructor or a SaneDate instance
	 * @param {?String} [largestUnit='days'] - the largest time unit to differentiate in the result
	 * @param {?Boolean} [relative=false] - if true, returns negative values if first parameter is later than this date (this adheres to the order defined by compareTo)
	 * @throws error on unknown largestUnit or incompatible comparison value
	 * @returns {Object} time delta object in the format {days : 1, hours : 2, minutes : 3, seconds : 4, milliseconds : 5} (keys depending on largestUnit)
	 *
	 * @example
	 * const now = new SaneDate();
	 * const theFuture = now.clone().forward({days : 1, hours : 2, minutes : 3, seconds : 4, milliseconds : 5});
	 * now.getDelta(theFuture)
	 * => {days : 1, hours : 2, minutes : 3, seconds : 4, milliseconds : 5}
	 * now.getDelta(theFuture, 'hours', true)
	 * => {hours : -26, minutes : -3, seconds : -4, milliseconds : -5}
	 */
	getDelta(initialValueOrSaneDate, largestUnit='days', relative=false){
		const __methodName__ = 'getDelta';

		const saneDate = new SaneDate(initialValueOrSaneDate);
		largestUnit = orDefault(largestUnit, 'days', 'string');
		assert(
			['days', 'hours', 'minutes', 'seconds', 'milliseconds'].includes(largestUnit),
			`${MODULE_NAME}:${this.#__className__}.${__methodName__} | unknown largest unit`
		);
		relative = orDefault(relative, false, 'bool');

		const parts = {};
		let delta = relative
			? (this.#date.getTime() - saneDate.#date.getTime())
			: Math.abs(this.#date.getTime() - saneDate.#date.getTime())
		;
		const negativeDelta = delta < 0;
		delta = Math.abs(delta);

		if( largestUnit === 'days' ){
			parts.days = Math.floor(delta / 1000 / 60 / 60 / 24);
			delta -= parts.days * 1000 * 60 * 60 * 24;
			largestUnit = 'hours';
		}

		if( largestUnit === 'hours' ){
			parts.hours = Math.floor(delta / 1000 / 60 / 60);
			delta -= parts.hours * 1000 * 60 * 60;
			largestUnit = 'minutes';
		}

		if( largestUnit === 'minutes' ){
			parts.minutes = Math.floor(delta / 1000 / 60);
			delta -= parts.minutes * 1000 * 60;
			largestUnit = 'seconds';
		}

		if( largestUnit === 'seconds' ){
			parts.seconds = Math.floor(delta / 1000);
			delta -= parts.seconds * 1000;
			largestUnit = 'milliseconds';
		}

		if( largestUnit === 'milliseconds' ){
			parts.milliseconds = delta;
		}

		if( negativeDelta ){
			for( const partName in parts ){
				parts[partName] = (parts[partName] === 0) ? 0 : -parts[partName];
			}
		}

		return parts;
	}



	/**
	 * Returns a copy of the current SaneDate.
	 * Might be very handy for creating dates based on another with an offset for example.
	 * Keeps UTC mode.
	 *
	 * @returns {SaneDate} copy of current SaneDate instance
	 *
	 * @example
	 * const d = new SaneDate();
	 * const theFuture = d.clone().forward('hours', 8);
	 **/
	clone(){
		const clonedSaneDate = new SaneDate(new Date(this.getVanillaDate().getTime()));
		clonedSaneDate.utc = this.#utc;
		return clonedSaneDate;
	}



	/**
	 * Adds leading zeroes to values, which are not yet of a defined expected length.
	 *
	 * @param {*} value - the value to pad
	 * @param {?Number} [digitCount=2] - the number of digits, the result has to have at least
	 * @returns {String} the padded value, will always be cast to a string
	 *
	 * @private
	 * @example
	 * this.#padWithZero(1, 4)
	 * => '0001'
	 */
	#padWithZero(value, digitCount=2){
		return pad(value, '0', digitCount);
	}



	/**
	 * Tries to parse an ISO string (or at least, something resembling an ISO string) into a date.
	 *
	 * The basic idea of this method is, that it is supposed to be fairly forgiving, as long as the info is there,
	 * even in a little wonky notation, this should result in a successfully created SaneDate.
	 *
	 * @param {String} isoString - something resembling an ISO string, that we can create a date from
	 * @throws error if isoString is not usable
	 * @returns {Date} the date create from the given ISO string
	 *
	 * @private
	 * @example
	 * this.#parseIsoString('2018-02-28T13:37:00')
	 * this.#parseIsoString('1-2-3 4:5:6.7')
	 */
	#parseIsoString(isoString){
		const
			__methodName__ = '#parseIsoString',
			unparsableIsoStringMessage = 'ISO string not parsable'
		;

		isoString = `${isoString}`;

		let
			year = 1970,
			month = 1,
			date = 1,
			hours = 0,
			minutes = 0,
			seconds = 0,
			milliseconds = 0,
			timezoneOffset = 0,
			utc = false
		;

		let isoStringParts = isoString.split('T');
		if( isoStringParts.length === 1 ){
			isoStringParts = isoStringParts[0].split(' ');
		}


		// date parts

		const isoStringDateParts = isoStringParts[0].split('-');
		year = isoStringDateParts[0];
		if( isoStringDateParts.length >= 2 ){
			month = isoStringDateParts[1];
		}
		if( isoStringDateParts.length >= 3 ){
			date = isoStringDateParts[2];
		}


		// time parts

		if( isoStringParts.length >= 2 ){
			// timezone

			let	isoStringTimezoneParts = isoStringParts[1].split('Z');
			if( isoStringTimezoneParts.length >= 2 ){
				utc = true;
			} else {
				let offsetFactor = 0;
				if( isoStringTimezoneParts[0].includes('+') ){
					offsetFactor = -1;
					isoStringTimezoneParts = isoStringTimezoneParts[0].split('+');
				} else if( isoStringTimezoneParts[0].includes('-') ){
					offsetFactor = 1;
					isoStringTimezoneParts = isoStringTimezoneParts[0].split('-');
				}

				if( isoStringTimezoneParts.length >= 2 ){
					const isoStringTimezoneTimeParts = isoStringTimezoneParts[1].split(':');

					if( isoStringTimezoneTimeParts.length >= 2 ){
						timezoneOffset += parseInt(isoStringTimezoneTimeParts[0], 10) * 60;
						timezoneOffset += parseInt(isoStringTimezoneTimeParts[1], 10);
					} else if( isoStringTimezoneTimeParts[0].length >= 3 ){
						timezoneOffset += parseInt(isoStringTimezoneTimeParts[0].slice(0, 2), 10) * 60;
						timezoneOffset += parseInt(isoStringTimezoneTimeParts[1].slice(2), 10);
					} else {
						timezoneOffset += parseInt(isoStringTimezoneTimeParts[0], 10) * 60;
					}
					timezoneOffset *= offsetFactor;

					assert(
						!isNaN(timezoneOffset),
						`${MODULE_NAME}:${this.#__className__}.${__methodName__} | invalid timezone "${isoStringTimezoneParts[1]}"`
					);
				}
			}


			// hours and minutes
			const isoStringTimeParts = isoStringTimezoneParts[0].split(':');
			hours = isoStringTimeParts[0];
			if( isoStringTimeParts.length >= 2 ){
				minutes = isoStringTimeParts[1];
			}


			// seconds and milliseconds

			if( isoStringTimeParts.length >= 3 ){
				const isoStringSecondsParts = isoStringTimeParts[2].split('.');

				seconds = isoStringSecondsParts[0];

				if( isoStringSecondsParts.length >= 2 ){
					milliseconds = isoStringSecondsParts[1];

					if( milliseconds.length > 3 ){
						milliseconds = milliseconds.slice(0, 3);
					} else if( milliseconds.length === 2 ){
						milliseconds = `${parseInt(milliseconds, 10) * 10}`;
					} else if( milliseconds.length === 1 ){
						milliseconds = `${parseInt(milliseconds, 10) * 100}`;
					}
				}
			}
		}


		// date construction

		const saneDate = new SaneDate();
		saneDate.utc = utc || (timezoneOffset !== 0);
		try {
			saneDate.year = year;
			saneDate.month = month;
			saneDate.date = date;
			saneDate.hours = hours;
			saneDate.minutes = minutes;
			saneDate.seconds = seconds;
			saneDate.milliseconds = milliseconds;
		} catch(ex){
			throw Error(`${MODULE_NAME}:${this.#__className__}.${__methodName__} | ${unparsableIsoStringMessage} "${isoString}"`);
		}
		saneDate.move('minutes', timezoneOffset);

		return saneDate.getVanillaDate();
	}



	/**
	 * Tries to change a part of the date and makes sure, that this change does not trigger automagic and only
	 * leads to exactly the change, we wanted to do and nothing else.
	 *
	 * @param {String} part - the date part to change, one of: year, month, date, hours, minutes, seconds or milliseconds
	 * @param {Number} value - the new value to set
	 * @returns {SaneDate} the SaneDate instance
	 *
	 * @private
	 */
	#tryDatePartChange(part, value){
		const __methodName__ = '#tryDatePartChange';

		const
			newDate = this.clone().getVanillaDate(),
			settersAndGetters = this.#utc
				? DATE_PART_SETTERS_AND_GETTERS.utc
				: DATE_PART_SETTERS_AND_GETTERS.local
			,
			allDatePartGetters = Object.values(settersAndGetters).map(methods => methods.getter)
		;

		newDate[settersAndGetters[part].setter](value);

		let sideEffect = false;
		for( const datePartGetter of allDatePartGetters ){
			if( datePartGetter !== settersAndGetters[part].getter){
				sideEffect ||= this.#date[datePartGetter]() !== newDate[datePartGetter]();
			}

			if( sideEffect ){
				break;
			}
		}

		assert(
			(newDate[settersAndGetters[part].getter]() === value) && !sideEffect,
			`${MODULE_NAME}:${this.#__className__}.${__methodName__} | date part change "${part} = ${value}" is invalid or has side effects`
		);

		this.#date = newDate;

		return this;
	}

}

export {SaneDate};
