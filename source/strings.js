/*!
 * Module Strings
 */

/**
 * @namespace Strings
 */

const MODULE_NAME = 'Strings';



//###[ IMPORTS ]########################################################################################################

import {isFunction, isArray, orDefault, isNaN, hasValue, isPlainObject, round} from './basic.js';



//###[ DATA ]###########################################################################################################

const SLUGIFY_LATINMAP = {
	'Á':'A','Ă':'A','Ắ':'A','Ặ':'A','Ằ':'A','Ẳ':'A','Ẵ':'A','Ǎ':'A','Â':'A','Ấ':'A','Ậ':'A','Ầ':'A','Ẩ':'A','Ẫ':'A',
	'Ä':'A','Ǟ':'A','Ȧ':'A','Ǡ':'A','Ạ':'A','Ȁ':'A','À':'A','Ả':'A','Ȃ':'A','Ā':'A','Ą':'A','Å':'A','Ǻ':'A','Ḁ':'A',
	'Ⱥ':'A','Ã':'A','Ꜳ':'AA','Æ':'AE','Ǽ':'AE','Ǣ':'AE','Ꜵ':'AO','Ꜷ':'AU','Ꜹ':'AV','Ꜻ':'AV','Ꜽ':'AY','Ḃ':'B',
	'Ḅ':'B','Ɓ':'B','Ḇ':'B','Ƀ':'B','Ƃ':'B','Ć':'C','Č':'C','Ç':'C','Ḉ':'C','Ĉ':'C','Ċ':'C','Ƈ':'C','Ȼ':'C','Ď':'D',
	'Ḑ':'D','Ḓ':'D','Ḋ':'D','Ḍ':'D','Ɗ':'D','Ḏ':'D','ǲ':'D','ǅ':'D','Đ':'D','Ƌ':'D','Ǳ':'DZ','Ǆ':'DZ','É':'E','Ĕ':'E',
	'Ě':'E','Ȩ':'E','Ḝ':'E','Ê':'E','Ế':'E','Ệ':'E','Ề':'E','Ể':'E','Ễ':'E','Ḙ':'E','Ë':'E','Ė':'E','Ẹ':'E','Ȅ':'E',
	'È':'E','Ẻ':'E','Ȇ':'E','Ē':'E','Ḗ':'E','Ḕ':'E','Ę':'E','Ɇ':'E','Ẽ':'E','Ḛ':'E','Ꝫ':'ET','Ḟ':'F','Ƒ':'F','Ǵ':'G',
	'Ğ':'G','Ǧ':'G','Ģ':'G','Ĝ':'G','Ġ':'G','Ɠ':'G','Ḡ':'G','Ǥ':'G','Ḫ':'H','Ȟ':'H','Ḩ':'H','Ĥ':'H','Ⱨ':'H','Ḧ':'H',
	'Ḣ':'H','Ḥ':'H','Ħ':'H','Í':'I','Ĭ':'I','Ǐ':'I','Î':'I','Ï':'I','Ḯ':'I','İ':'I','Ị':'I','Ȉ':'I','Ì':'I','Ỉ':'I',
	'Ȋ':'I','Ī':'I','Į':'I','Ɨ':'I','Ĩ':'I','Ḭ':'I','Ꝺ':'D','Ꝼ':'F','Ᵹ':'G','Ꞃ':'R','Ꞅ':'S','Ꞇ':'T','Ꝭ':'IS','Ĵ':'J',
	'Ɉ':'J','Ḱ':'K','Ǩ':'K','Ķ':'K','Ⱪ':'K','Ꝃ':'K','Ḳ':'K','Ƙ':'K','Ḵ':'K','Ꝁ':'K','Ꝅ':'K','Ĺ':'L','Ƚ':'L','Ľ':'L',
	'Ļ':'L','Ḽ':'L','Ḷ':'L','Ḹ':'L','Ⱡ':'L','Ꝉ':'L','Ḻ':'L','Ŀ':'L','Ɫ':'L','ǈ':'L','Ł':'L','Ǉ':'LJ','Ḿ':'M','Ṁ':'M',
	'Ṃ':'M','Ɱ':'M','Ń':'N','Ň':'N','Ņ':'N','Ṋ':'N','Ṅ':'N','Ṇ':'N','Ǹ':'N','Ɲ':'N','Ṉ':'N','Ƞ':'N','ǋ':'N','Ñ':'N',
	'Ǌ':'NJ','Ó':'O','Ŏ':'O','Ǒ':'O','Ô':'O','Ố':'O','Ộ':'O','Ồ':'O','Ổ':'O','Ỗ':'O','Ö':'O','Ȫ':'O','Ȯ':'O','Ȱ':'O',
	'Ọ':'O','Ő':'O','Ȍ':'O','Ò':'O','Ỏ':'O','Ơ':'O','Ớ':'O','Ợ':'O','Ờ':'O','Ở':'O','Ỡ':'O','Ȏ':'O','Ꝋ':'O','Ꝍ':'O',
	'Ō':'O','Ṓ':'O','Ṑ':'O','Ɵ':'O','Ǫ':'O','Ǭ':'O','Ø':'O','Ǿ':'O','Õ':'O','Ṍ':'O','Ṏ':'O','Ȭ':'O','Ƣ':'OI','Ꝏ':'OO',
	'Ɛ':'E','Ɔ':'O','Ȣ':'OU','Ṕ':'P','Ṗ':'P','Ꝓ':'P','Ƥ':'P','Ꝕ':'P','Ᵽ':'P','Ꝑ':'P','Ꝙ':'Q','Ꝗ':'Q','Ŕ':'R','Ř':'R',
	'Ŗ':'R','Ṙ':'R','Ṛ':'R','Ṝ':'R','Ȑ':'R','Ȓ':'R','Ṟ':'R','Ɍ':'R','Ɽ':'R','Ꜿ':'C','Ǝ':'E','Ś':'S','Ṥ':'S','Š':'S',
	'Ṧ':'S','Ş':'S','Ŝ':'S','Ș':'S','Ṡ':'S','Ṣ':'S','Ṩ':'S','ẞ':'SS','Ť':'T','Ţ':'T','Ṱ':'T','Ț':'T','Ⱦ':'T','Ṫ':'T',
	'Ṭ':'T','Ƭ':'T','Ṯ':'T','Ʈ':'T','Ŧ':'T','Ɐ':'A','Ꞁ':'L','Ɯ':'M','Ʌ':'V','Ꜩ':'TZ','Ú':'U','Ŭ':'U','Ǔ':'U','Û':'U',
	'Ṷ':'U','Ü':'U','Ǘ':'U','Ǚ':'U','Ǜ':'U','Ǖ':'U','Ṳ':'U','Ụ':'U','Ű':'U','Ȕ':'U','Ù':'U','Ủ':'U','Ư':'U','Ứ':'U',
	'Ự':'U','Ừ':'U','Ử':'U','Ữ':'U','Ȗ':'U','Ū':'U','Ṻ':'U','Ų':'U','Ů':'U','Ũ':'U','Ṹ':'U','Ṵ':'U','Ꝟ':'V','Ṿ':'V',
	'Ʋ':'V','Ṽ':'V','Ꝡ':'VY','Ẃ':'W','Ŵ':'W','Ẅ':'W','Ẇ':'W','Ẉ':'W','Ẁ':'W','Ⱳ':'W','Ẍ':'X','Ẋ':'X','Ý':'Y','Ŷ':'Y',
	'Ÿ':'Y','Ẏ':'Y','Ỵ':'Y','Ỳ':'Y','Ƴ':'Y','Ỷ':'Y','Ỿ':'Y','Ȳ':'Y','Ɏ':'Y','Ỹ':'Y','Ź':'Z','Ž':'Z','Ẑ':'Z','Ⱬ':'Z',
	'Ż':'Z','Ẓ':'Z','Ȥ':'Z','Ẕ':'Z','Ƶ':'Z','Ĳ':'IJ','Œ':'OE','ᴀ':'A','ᴁ':'AE','ʙ':'B','ᴃ':'B','ᴄ':'C','ᴅ':'D','ᴇ':'E',
	'ꜰ':'F','ɢ':'G','ʛ':'G','ʜ':'H','ɪ':'I','ʁ':'R','ᴊ':'J','ᴋ':'K','ʟ':'L','ᴌ':'L','ᴍ':'M','ɴ':'N','ᴏ':'O','ɶ':'OE',
	'ᴐ':'O','ᴕ':'OU','ᴘ':'P','ʀ':'R','ᴎ':'N','ᴙ':'R','ꜱ':'S','ᴛ':'T','ⱻ':'E','ᴚ':'R','ᴜ':'U','ᴠ':'V','ᴡ':'W','ʏ':'Y',
	'ᴢ':'Z','á':'a','ă':'a','ắ':'a','ặ':'a','ằ':'a','ẳ':'a','ẵ':'a','ǎ':'a','â':'a','ấ':'a','ậ':'a','ầ':'a','ẩ':'a',
	'ẫ':'a','ä':'a','ǟ':'a','ȧ':'a','ǡ':'a','ạ':'a','ȁ':'a','à':'a','ả':'a','ȃ':'a','ā':'a','ą':'a','ᶏ':'a','ẚ':'a',
	'å':'a','ǻ':'a','ḁ':'a','ⱥ':'a','ã':'a','ꜳ':'aa','æ':'ae','ǽ':'ae','ǣ':'ae','ꜵ':'ao','ꜷ':'au','ꜹ':'av','ꜻ':'av',
	'ꜽ':'ay','ḃ':'b','ḅ':'b','ɓ':'b','ḇ':'b','ᵬ':'b','ᶀ':'b','ƀ':'b','ƃ':'b','ɵ':'o','ć':'c','č':'c','ç':'c','ḉ':'c',
	'ĉ':'c','ɕ':'c','ċ':'c','ƈ':'c','ȼ':'c','ď':'d','ḑ':'d','ḓ':'d','ȡ':'d','ḋ':'d','ḍ':'d','ɗ':'d','ᶑ':'d','ḏ':'d',
	'ᵭ':'d','ᶁ':'d','đ':'d','ɖ':'d','ƌ':'d','ı':'i','ȷ':'j','ɟ':'j','ʄ':'j','ǳ':'dz','ǆ':'dz','é':'e','ĕ':'e','ě':'e',
	'ȩ':'e','ḝ':'e','ê':'e','ế':'e','ệ':'e','ề':'e','ể':'e','ễ':'e','ḙ':'e','ë':'e','ė':'e','ẹ':'e','ȅ':'e','è':'e',
	'ẻ':'e','ȇ':'e','ē':'e','ḗ':'e','ḕ':'e','ⱸ':'e','ę':'e','ᶒ':'e','ɇ':'e','ẽ':'e','ḛ':'e','ꝫ':'et','ḟ':'f','ƒ':'f',
	'ᵮ':'f','ᶂ':'f','ǵ':'g','ğ':'g','ǧ':'g','ģ':'g','ĝ':'g','ġ':'g','ɠ':'g','ḡ':'g','ᶃ':'g','ǥ':'g','ḫ':'h','ȟ':'h',
	'ḩ':'h','ĥ':'h','ⱨ':'h','ḧ':'h','ḣ':'h','ḥ':'h','ɦ':'h','ẖ':'h','ħ':'h','ƕ':'hv','í':'i','ĭ':'i','ǐ':'i','î':'i',
	'ï':'i','ḯ':'i','ị':'i','ȉ':'i','ì':'i','ỉ':'i','ȋ':'i','ī':'i','į':'i','ᶖ':'i','ɨ':'i','ĩ':'i','ḭ':'i','ꝺ':'d',
	'ꝼ':'f','ᵹ':'g','ꞃ':'r','ꞅ':'s','ꞇ':'t','ꝭ':'is','ǰ':'j','ĵ':'j','ʝ':'j','ɉ':'j','ḱ':'k','ǩ':'k','ķ':'k','ⱪ':'k',
	'ꝃ':'k','ḳ':'k','ƙ':'k','ḵ':'k','ᶄ':'k','ꝁ':'k','ꝅ':'k','ĺ':'l','ƚ':'l','ɬ':'l','ľ':'l','ļ':'l','ḽ':'l','ȴ':'l',
	'ḷ':'l','ḹ':'l','ⱡ':'l','ꝉ':'l','ḻ':'l','ŀ':'l','ɫ':'l','ᶅ':'l','ɭ':'l','ł':'l','ǉ':'lj','ſ':'s','ẜ':'s','ẛ':'s',
	'ẝ':'s','ḿ':'m','ṁ':'m','ṃ':'m','ɱ':'m','ᵯ':'m','ᶆ':'m','ń':'n','ň':'n','ņ':'n','ṋ':'n','ȵ':'n','ṅ':'n','ṇ':'n',
	'ǹ':'n','ɲ':'n','ṉ':'n','ƞ':'n','ᵰ':'n','ᶇ':'n','ɳ':'n','ñ':'n','ǌ':'nj','ó':'o','ŏ':'o','ǒ':'o','ô':'o','ố':'o',
	'ộ':'o','ồ':'o','ổ':'o','ỗ':'o','ö':'o','ȫ':'o','ȯ':'o','ȱ':'o','ọ':'o','ő':'o','ȍ':'o','ò':'o','ỏ':'o','ơ':'o',
	'ớ':'o','ợ':'o','ờ':'o','ở':'o','ỡ':'o','ȏ':'o','ꝋ':'o','ꝍ':'o','ⱺ':'o','ō':'o','ṓ':'o','ṑ':'o','ǫ':'o','ǭ':'o',
	'ø':'o','ǿ':'o','õ':'o','ṍ':'o','ṏ':'o','ȭ':'o','ƣ':'oi','ꝏ':'oo','ɛ':'e','ᶓ':'e','ɔ':'o','ᶗ':'o','ȣ':'ou','ṕ':'p',
	'ṗ':'p','ꝓ':'p','ƥ':'p','ᵱ':'p','ᶈ':'p','ꝕ':'p','ᵽ':'p','ꝑ':'p','ꝙ':'q','ʠ':'q','ɋ':'q','ꝗ':'q','ŕ':'r','ř':'r',
	'ŗ':'r','ṙ':'r','ṛ':'r','ṝ':'r','ȑ':'r','ɾ':'r','ᵳ':'r','ȓ':'r','ṟ':'r','ɼ':'r','ᵲ':'r','ᶉ':'r','ɍ':'r','ɽ':'r',
	'ↄ':'c','ꜿ':'c','ɘ':'e','ɿ':'r','ś':'s','ṥ':'s','š':'s','ṧ':'s','ş':'s','ŝ':'s','ș':'s','ṡ':'s','ṣ':'s','ṩ':'s',
	'ʂ':'s','ᵴ':'s','ᶊ':'s','ȿ':'s','ɡ':'g','ß':'ss','ᴑ':'o','ᴓ':'o','ᴝ':'u','ť':'t','ţ':'t','ṱ':'t','ț':'t','ȶ':'t',
	'ẗ':'t','ⱦ':'t','ṫ':'t','ṭ':'t','ƭ':'t','ṯ':'t','ᵵ':'t','ƫ':'t','ʈ':'t','ŧ':'t','ᵺ':'th','ɐ':'a','ᴂ':'ae','ǝ':'e',
	'ᵷ':'g','ɥ':'h','ʮ':'h','ʯ':'h','ᴉ':'i','ʞ':'k','ꞁ':'l','ɯ':'m','ɰ':'m','ᴔ':'oe','ɹ':'r','ɻ':'r','ɺ':'r','ⱹ':'r',
	'ʇ':'t','ʌ':'v','ʍ':'w','ʎ':'y','ꜩ':'tz','ú':'u','ŭ':'u','ǔ':'u','û':'u','ṷ':'u','ü':'u','ǘ':'u','ǚ':'u','ǜ':'u',
	'ǖ':'u','ṳ':'u','ụ':'u','ű':'u','ȕ':'u','ù':'u','ủ':'u','ư':'u','ứ':'u','ự':'u','ừ':'u','ử':'u','ữ':'u','ȗ':'u',
	'ū':'u','ṻ':'u','ų':'u','ᶙ':'u','ů':'u','ũ':'u','ṹ':'u','ṵ':'u','ᵫ':'ue','ꝸ':'um','ⱴ':'v','ꝟ':'v','ṿ':'v','ʋ':'v',
	'ᶌ':'v','ⱱ':'v','ṽ':'v','ꝡ':'vy','ẃ':'w','ŵ':'w','ẅ':'w','ẇ':'w','ẉ':'w','ẁ':'w','ⱳ':'w','ẘ':'w','ẍ':'x','ẋ':'x',
	'ᶍ':'x','ý':'y','ŷ':'y','ÿ':'y','ẏ':'y','ỵ':'y','ỳ':'y','ƴ':'y','ỷ':'y','ỿ':'y','ȳ':'y','ẙ':'y','ɏ':'y','ỹ':'y',
	'ź':'z','ž':'z','ẑ':'z','ʑ':'z','ⱬ':'z','ż':'z','ẓ':'z','ȥ':'z','ẕ':'z','ᵶ':'z','ᶎ':'z','ʐ':'z','ƶ':'z','ɀ':'z',
	'ﬀ':'ff','ﬃ':'ffi','ﬄ':'ffl','ﬁ':'fi','ﬂ':'fl','ĳ':'ij','œ':'oe','ﬆ':'st','ₐ':'a','ₑ':'e','ᵢ':'i','ⱼ':'j','ₒ':'o',
	'ᵣ':'r','ᵤ':'u','ᵥ':'v','ₓ':'x'
};



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Strings:replace
 */

/**
 * Offers similar functionality to PHP's str_replace or ES2021's replaceAll and avoids RegExps for this task.
 * Replaces occurrences of search in subject with replace. search and replace may be arrays.
 * If search is an array and replace is a string, all phrases in the array will be replaced with one string.
 * If replace is an array itself, phrases and replacements are matched by index.
 * Missing replacements are treated as an empty string (for example: if your array lengths do not match).
 *
 * Uses String.prototype.replaceAll internally, if available.
 *
 * @param {String} subject - the string to replace in
 * @param {(String|String[])} search - the string(s) to replace
 * @param {String|String[]} replace - the string(s) to replace the search string(s)
 * @returns {String} the modified string
 *
 * @memberof Strings:replace
 * @alias replace
 * @example
 * const sanitizedString = replace([':', '#', '-'], '_', exampleString);
 */
export function replace(subject, search, replace){
	subject = `${subject}`;
	search = [].concat(search);
	replace = [].concat(replace);

	let tmp = '';

	search.forEach((searchTerm, index) => {
		tmp = (replace.length > 1) ? ((replace[index] !== undefined) ? replace[index] : '') : replace[0];

		if( isFunction(String.prototype.replaceAll) ){
			subject = subject.replaceAll(`${searchTerm}`, `${tmp}`);
		} else {
			subject = subject.split(`${searchTerm}`).join(`${tmp}`);
		}
	});

	return subject;
}



/**
 * @namespace Strings:truncate
 */

/**
 * Truncates a given string after a certain number of characters to enforce length restrictions.
 *
 * @param {String} subject - the string to check and truncate
 * @param {?Number} [maxLength=30] - the maximum allowed character length for the string
 * @param {?String} [suffix='...'] - the trailing string to end a truncated string with
 * @throws error if suffix length is bigger than defined maxLength
 * @returns {String} the (truncated) subject
 *
 * @memberof Strings:truncate
 * @alias truncate
 * @example
 * const truncatedString = truncate(string, 10, '...');
 */
export function truncate(subject, maxLength=30, suffix='...'){
	subject = `${subject}`;
	maxLength = orDefault(maxLength, 30, 'int');
	suffix = orDefault(suffix, '...', 'str');

	if( suffix.length > maxLength ){
		throw new Error(`${MODULE_NAME}:truncate | suffix cannot be longer than maxLength`);
	}

	if( subject.length > maxLength ){
		subject = `${subject.slice(0, maxLength - suffix.length)}${suffix}`;
	}

	return subject;
}



/**
 * @namespace Strings:concat
 */

/**
 * Simply concatenates strings with a glue part using array.join in a handy notation.
 * You can also provide arguments to glue as a prepared array as the second parameter,
 * in that case other parameters will be ignored.
 *
 * @param {?String} [glue=''] - the separator to use between single strings
 * @param {?String[]} strings - list of strings to concatenate, either comma-separated or as single array
 * @returns {String} the concatenated string
 *
 * @memberof Strings:concat
 * @alias concat
 * @example
 * const finalCountdown = concat(' ... ', 10, 9, 8, 7, 6, '5', '4', '3', '2', '1', 'ZERO!');
 * const finalCountdown = concat(' ... ', [10, 9, 8, 7, 6, '5', '4', '3', '2', '1', 'ZERO!']);
 */
export function concat(glue='', ...strings){
	glue = orDefault(glue, '', 'str');

	if( (strings.length > 0) && isArray(strings[0]) ){
		return strings[0].join(glue);
	} else {
		return strings.join(glue);
	}
}



/**
 * @namespace Strings:format
 */

/**
 * This is a pythonesque string format implementation.
 * Apply formatted values to a string template, in which replacements are marked with curly braces.
 *
 * Display literal curly brace with {{ and }}.
 *
 * Unknown keys/indexes will be ignored.
 *
 * This solution is adapted from:
 * https://github.com/davidchambers/string-format
 *
 * @param {String} template -
 * @param {(String[]|Object)} replacements - arguments to insert into template, either as a dictionary, an array or a parameter sequence
 * @throws general exception on syntax errors
 * @returns {String} the formatted string
 *
 * @memberof Strings:format
 * @alias format
 * @example
 * format('An elephant is {times:float(0.00)} times smarter than a {animal}', {times : 5.5555, animal : 'lion'})
 * => 'An elephant is 5.56 times smarter than a lion'
 * format('{0}{0}{0} ... {{BATMAN!}}', 'Nana')
 * => 'NanaNanaNana ... {BATMAN!}'
 * format('{} {} {} starts the alphabet.', 'A', 'B', 'C')
 * => 'A B C starts the alphabet.'
 * format('{0:int}, {1:int}, {2:int}: details are for wankers', '1a', 2.222, 3)
 * => '1, 2, 3: details are for wankers'
 */
export function format(template, ...replacements){
	template = `${template}`;

	let
		idx = 0,
		explicit = false,
		implicit = false
	;

	const fResolve = function(object, key){
		const value = object[key];

		if( isFunction(value) ){
			return value.call(object);
		} else {
			return value;
		}
	};

	const fLookup = function(object, key){
		if( !/^(\d+)([.]|$)/.test(key) ){
			key = `0.${key}`;
		}

		let match = /(.+?)[.](.+)/.exec(key);
		while( match ){
			object = fResolve(object, match[1]);
			key = match[2];
			match = /(.+?)[.](.+)/.exec(key);
		}

		return fResolve(object, key);
	};

	const formatters = {
		int(value, radix){
			radix = orDefault(radix, 10, 'int');
			const res = parseInt(value, radix);
			return !isNaN(res) ? `${res}` : '';
		},
		float(value, format){
			format = orDefault(format, null, 'str');

			let res = null;

			if( hasValue(format) ){
				let precision = 0;

				try {
					precision = format.split('.')[1].length;
				} catch(ex) {
					throw new Error(`${MODULE_NAME}:format | float precision arg malformed`);
				}

				res = round(value, precision)
			} else {
				res = parseFloat(value);
			}

			return !isNaN(res) ? `${res}` : '';
		}
	};

	return template.replace(/([{}])\1|[{](.*?)(?:!(.+?))?[}]/g, function(match, literal, key){
		let
			ref = null,
			value = '',
			formatter = function(value){ return value; },
			formatterArg = null
		;

		if( literal ){
			return literal;
		}

		if( key.length ){
			const keyParts = key.split(':');

			if( keyParts.length > 1 ){
				key = keyParts[0];

				const
					formatterParts = keyParts[1].split('('),
					formatterName = formatterParts[0]
				;

				if( formatterParts.length > 1 ){
					formatterArg = formatterParts[1].replace(')', '');
				}

				try {
					formatter = formatters[formatterName];
				} catch(ex) {
					throw new Error(`${MODULE_NAME}:format | unknown formatter`);
				}
			}

			if( implicit ){
				throw new Error(`${MODULE_NAME}:format | cannot switch from implicit to explicit numbering`);
			} else {
				explicit = true;
			}

			ref = fLookup(replacements, key);
			value = orDefault(ref, '');
		} else {
			if( explicit ){
				throw new Error (`${MODULE_NAME}:format | cannot switch from explicit to implicit numbering`);
			} else {
				implicit = true;
			}

			ref = replacements[idx];
			value = orDefault(ref, '');
			idx++;
		}

		return formatter(value, formatterArg);
	});
}



/**
 * @namespace Strings:slugify
 */

/**
 * Slugifies a text for use in a URL or id/class/attribute.
 * Transforms accented characters to non-accented ones.
 * Throws out everything except basic A-Z characters and numbers after replacements have taken place.
 * Provide own replacements, supplementing or overriding the default replacement map to cover special cases
 * (will take precedence over the default map).
 *
 * @param {String} text - the text to slugify
 * @param {String?} [additionalMap=null] - optional character map to supplement/override the default map, having the form {'[search character]' : '[replacement]', ...}
 * @returns {String} the slugified string
 *
 * @memberof Strings:slugify
 * @alias slugify
 * @example
 * slugify('This is a cömplicated ßtring for URLs!')
 * => 'this-is-a-complicated-sstring-for-urls'
 */
export function slugify(text, additionalMap=null){
	if( !isPlainObject(additionalMap) ){
		additionalMap = {};
	}

	return `${text}`.toLowerCase()
		.replace(/\s+|_+/g, '-')        // replace spaces and underscores with "-"
		.replace(
			/[^\-]/g,                   // replace accented chars with plain ones via map and/or apply additionalMap
			char => additionalMap[char] ?? SLUGIFY_LATINMAP[char] ?? char
		)
		.replace(/[^\w\-]+/g, '')       // remove all non-word, non-dash chars
		.replace(/--+/g, '-')           // replace multiple "-" with single "-"
		.replace(/^-+/, '')             // trim "-" from start of text
		.replace(/-+$/, '')             // trim "-" from end of text
	;
}



/**
 * @namespace Strings:maskForSelector
 */

/**
 * Masks all selector-special-characters, to allow selecting elements with special characters in selector using
 * querySelector and querySelectorAll (also works for jQuery and Cash).
 *
 * @param {String} str - the string to mask for use in a selector
 * @returns {String} the masked string
 *
 * @memberof Strings:maskForSelector
 * @alias maskForSelector
 * @example
 * document.querySelector(`#element_${maskForSelector(elementName)}`).classList.remove('test');
 */
export function maskForSelector(str){
	return `${str}`.replace(/([#;&,.+*~':"!^$\[\]()=>|\/@])/g, '\\$&');
}



/**
 * @namespace Strings:maskForRegEx
 */

/**
 * Masks all regex special characters, to test or match a string using a regex, that contains
 * characters used in regexes themselves.
 *
 * @param {String} str - the string to mask for use in a regexp
 * @returns {String} the masked string
 *
 * @memberof Strings:maskForRegEx
 * @alias maskForRegEx
 * @example
 * if( (new RegExp(`^${maskForRegEx(arbitraryString)}$')).test('abc') ){
 *   alert('are identical!');
 * }
 */
export function maskForRegEx(str){
	return `${str}`.replace(/([\-\[\]\/{}()*+?.\\^$|])/g, "\\$&");
}



/**
 * @namespace Strings:maskForHtml
 */

/**
 * Masks a string possibly containing reserved HTML chars for HTML output as is
 * (so a < actually reads on the page).
 *
 * Only replaces critical chars like <>& with entities, but
 * keeps non-critical unicode chars like »/.
 *
 * @param {String} text - the string to mask for use in HTML
 * @returns {String} the masked string
 *
 * @memberof Strings:maskForHtml
 * @alias maskForHtml
 * @see unmaskFromHtml
 * @example
 * maskForHtml('</>&;üäöÜÄÖß– »')
 * => '&lt;/&gt;&amp;;üäöÜÄÖß– »'
 */
export function maskForHtml(text){
	const escape = document.createElement('textarea');
	escape.textContent = `${text}`;
	return escape.innerHTML;
}



/**
 * @namespace Strings:unmaskFromHtml
 */

/**
 * Replaces entities in a html-masked string with the vanilla characters
 * thereby returning a real HTML string, which could, for example, be used
 * to construct new elements with tag markup.
 *
 * @param {String} html - the string to unmask entities in
 * @returns {String} the unmasked string
 *
 * @memberof Strings:unmaskFromHtml
 * @alias unmaskFromHtml
 * @see maskForHtml
 * @example
 * unmaskFromHtml('&lt;/&gt;&amp;;üäöÜÄÖß&ndash;&nbsp;&raquo;')
 * => '</>&;üäöÜÄÖß– »'
 */
export function unmaskFromHtml(html){
	const escape = document.createElement('textarea');
	escape.innerHTML = `${html}`;
	return escape.textContent;
}
