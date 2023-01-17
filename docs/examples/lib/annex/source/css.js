/*!
 * Module CSS
 */

/**
 * @namespace CSS
 */

const MODULE_NAME = 'CSS';



//###[ IMPORTS ]########################################################################################################

import {assert, isA, orDefault, isPlainObject, hasValue, isNaN} from './basic.js';
import {maskForRegEx} from './strings.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace CSS:applyStyles
 */

/**
 * Applies CSS definitions to an HTMLElement, by providing a plain object of property-value-pairs.
 * Properties may be written as default CSS kebab-case properties such as "margin-left" or as JS
 * camel-cased versions such as "marginLeft".
 *
 * Providing a real JS number without a unit will be treated as a pixel value, so defining "'line-height' : 0" will
 * actually result in a 1px line-height. To actually set a unit-less value, just set the value as a string:
 * "'line-height' : '0'".
 *
 * Generally all CSS values are usually strings (this is also the way JS handles this),
 * treating plain numbers as pixels is just a convenience feature, since pixels are most likely to be
 * calculated values, where it is bothersome and error-prone to add the "px" all the time.
 *
 * To remove a property, just set the value to a nullish value. Deleting a property also tries to remove all
 * vendor prefixed variants.
 *
 * This function uses CSSStyleDeclaration.setProperty instead of direct style assignments. This means, that the
 * browser itself decides which value to apply, based on the support of the property. This means, the style object
 * will not be polluted with vendor stuff the browser does not support, but this also means, that all non-standard
 * properties might be refused. If you really need to set something out of spec, use direct style assignment instead.
 *
 * @param {HTMLElement} element - the element to apply the styles to, use null or undefined as value to remove a prop
 * @param {Object} styles - the styles to apply, provided as a plain object, defining property-value-pairs
 * @param {?Boolean} [crossBrowser=false] - set this to true, to automatically generate vendor-prefixed versions of all provided properties
 * @param {?Boolean} [returnCssStyleDeclaration=false] - set this to true, return the CSSStyleDeclaration of the element after the style application, rather than the plain object
 * @throws error if element is not an HTMLElement
 * @throws error if styles is not a plain object
 * @returns {Object|CSSStyleDeclaration} the applied/active styles
 *
 * @memberof CSS:applyStyles
 * @alias applyStyles
 * @example
 * applyStyles(document.body, {backgroundColor : red, transition : 'all 200ms'}, true);
 * applyStyles(document.querySelector('main'), {'font-family' : 'serif'}, false, true);
 */
export function applyStyles(element, styles, crossBrowser=false, returnCssStyleDeclaration=false){
	const __methodName__ = 'applyStyles';

	crossBrowser = orDefault(crossBrowser, false, 'bool');
	returnCssStyleDeclaration = orDefault(returnCssStyleDeclaration, false, 'bool');

	assert(isA(element, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | element is not an html element`);
	assert(isPlainObject(styles), `${MODULE_NAME}:${__methodName__} | styles must be a plain object`);

	const vendorPrefixes = ['-webkit-', '-moz-', '-ms-', '-o-', '-khtml-'];

	if( crossBrowser ){
		Object.entries({...styles}).forEach(([cssKey, cssValue]) => {
			vendorPrefixes.forEach(vendorPrefix => {
				if(cssKey === 'transition'){
					styles[vendorPrefix+cssKey] = cssValue.replace('transform', `${vendorPrefix}transform`);
				} else {
					styles[vendorPrefix+cssKey] = cssValue;
				}
			});
		});
	}

	Object.entries({...styles}).forEach(([cssKey, cssValue]) => {
		if( isA(cssValue, 'number') && (cssValue !== 0) ){
			styles[cssKey] = `${cssValue}px`;
			element.style.setProperty(cssKey, styles[cssKey]);
		} else if( !hasValue(cssValue) ){
			vendorPrefixes.forEach(vendorPrefix => {
				delete styles[vendorPrefix+cssKey];
				element.style.removeProperty(vendorPrefix+cssKey);
			});
			delete styles[cssKey];
			element.style.removeProperty(cssKey);
		} else {
			styles[cssKey] = `${cssValue}`;
			element.style.setProperty(cssKey, styles[cssKey]);
		}
	});

	return returnCssStyleDeclaration ? element.style : styles;
}



/**
 * @namespace CSS:cssValueToNumber
 */

/**
 * Converts a CSS-value to a number without unit. If the base number is an integer the result will also
 * be an integer, float values will also be converted correctly.
 *
 * @param {String} value - the css-value to convert
 * @returns {Number|NaN} true number representation of the given value or NaN if the value is not parsable
 *
 * @memberof CSS:cssValueToNumber
 * @alias cssValueToNumber
 * @example
 * document.querySelector('main').style.setProperty('width', '99vh');
 * cssValueToNumber(document.querySelector('main').style.getPropertyValue('width'));
 * => 99
 */
export function cssValueToNumber(value){
	return parseFloat(orDefault(value, '', 'str'));
}



/**
 * @namespace CSS:cssUrlValueToUrl
 */

/**
 * Converts a CSS-URL-value ("url('/foo/bar/baz.jpg')") to a plain URL usable in requests or src-attributes.
 *
 * @param {String} urlValue - the URL-value from CSS
 * @param {?String} [baseUrl=null] - if you want to transform the URL by substituting the start of the path or URL with something fitting for your context, define what to replace here
 * @param {?String} [baseUrlSubstitution=null] - if you want to transform the URL by substituting the start of the path or URL with something fitting for your context, define what to replace the baseUrl with here
 * @returns {String|Array<String>|null} the extracted URL (or list of URLs if value contained several) with substitutions (if defined) or null if no URL-values were found
 *
 * @memberof CSS:cssUrlValueToUrl
 * @alias cssUrlValueToUrl
 * @example
 * cssUrlValueToUrl('url("https://foobar.com/test.jpg")', 'https://foobar.com', '..');
 * => '../test.jpg'
 * cssUrlValueToUrl(`url(/foo/bar),
 * url('https://google.de') url("test.jpg"),url(omg.svg)
 * url(http://lol.com)`)
 * => ['/foo/bar', 'https://google.com', 'test.jpg', 'omg.svg', 'http://lol.com']
 */
export function cssUrlValueToUrl(urlValue, baseUrl=null, baseUrlSubstitution=null){
	urlValue = orDefault(urlValue, '', 'str');
	baseUrl = orDefault(baseUrl, null, 'str');
	baseUrlSubstitution = orDefault(baseUrlSubstitution, null, 'str');

	const
		urlValueRex = new RegExp('(?:^|\\s|,)url\\((?:\'|")?([^\'"\\n\\r\\t]+)(?:\'|")?\\)', 'gmi'),
		matches = []
	;

	let match;
	while( (match = urlValueRex.exec(urlValue)) !== null ){
		match = match[1];
		if( hasValue(baseUrl, baseUrlSubstitution) ){
			match = match.replace(new RegExp(`^${maskForRegEx(baseUrl)}`), baseUrlSubstitution);
		}
		matches.push(match);
	}

	if( matches.length === 1 ){
		return matches[0];
	} else if( matches.length > 1 ){
		return matches;
	} else {
		return null;
	}
}



/**
 * @namespace CSS:remByPx
 */

/**
 * Calculates a rem value based on a given px value.
 * As a default this method takes the font-size (supposedly being in px) of the html-container.
 * You can overwrite this behaviour by setting initial to a number to use as a base px value or
 * to a string, which then defines a new selector for an element to get the initial font-size from.
 * You can also provide an HTMLElement directly, but keep in mind that the element's font size definition
 * has to be in pixels, to make this work.
 *
 * In most cases you will have to define the initial value via a constant or a selector to a container
 * with non-changing font-size, since you can never be sure which relative font-size applies atm, even on first
 * call, after dom ready, since responsive definitions might already be active, returning a viewport-specific
 * size.
 *
 * @param  {Number} px - the pixel value to convert to rem
 * @param  {?(Number|String|HTMLElement)} [initial='html'] - either a pixel value to use as a conversion base, a selector for an element to get the initial font-size from or the element itself; keep in mind, that the element's font-size definition has to be in px
 * @throws error if given selector in initial does not return an element
 * @returns {String|null} the rem value string to use in a css definition or null if the value could not be calculated
 *
 * @memberof CSS:remByPx
 * @alias remByPx
 * @example
 * remByPx(20, 16);
 * => '1.25rem'
 * remByPx('100px', 'p.has-base-fontsize');
 */
export function remByPx(px, initial='html'){
	px = cssValueToNumber(px);
	initial = orDefault(initial, 'html');

	if( isA(initial, 'htmlelement') ){
		initial = cssValueToNumber(initial.style.getPropertyValue('font-size'));
	} else {
		const value = cssValueToNumber(initial);
		if( isNaN(value) ){
			const element = document.querySelector(initial);
			assert(hasValue(element), `${MODULE_NAME}:remByPx | selector does not return element`);
			initial = cssValueToNumber(element.style.getPropertyValue('font-size'));
		} else {
			initial = value;
		}
	}

	const remVal = px / initial;

	if( (initial !== 0) && !isNaN(remVal) ){
		return `${remVal}rem`;
	} else {
		return null;
	}
}
