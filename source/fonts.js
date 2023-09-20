/*!
 * Module Fonts
 */

/**
 * @namespace Fonts
 */

const MODULE_NAME = 'Fonts';



//###[ IMPORTS ]########################################################################################################

import {hasValue, orDefault, Deferred} from './basic.js';
import {createNode} from './elements.js';
import {applyStyles} from './css.js';
import {loop, countermand} from  './timers.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Fonts:waitForWebfonts
 */

/**
 * Waits for a list of webfonts to load. This includes the fact, that the font is ready to display and renders in the
 * browser's rendering engine and not just a completed request or a loaded resource.
 *
 * Also works for fonts, that have already been loaded.
 *
 * @param {String|String[]} fonts - the CSS-names of the fonts to wait for
 * @param {?String} [fallbackFontName=sans-serif] - the system font which the page falls back on if the webfont is not loaded
 * @param {?Number} [timeout=5000] - timeout in ms after which the call fails and the return value rejects
 * @returns {Basic.Deferred<Array<String>|String>} a Deferred, that resolves once all webfonts are available and rejects when the timeout is reached
 *
 * @memberof Fonts:waitForWebfonts
 * @alias waitForWebfonts
 * @example
 * waitForWebfonts(['purr-regular', 'scratch-light'], 'helvetica, sans-serif')
 *   .then(fonts => {
 *     document.body.classList.add('webfonts-loaded');
 *     alert(`${fonts.length} webfonts ready to render`);
 *   })
 *   .catch(error => {
 *     if( error.message === 'timeout' ){
 *       document.body.classList.add('webfonts-timeout');
 *     }
 *   })
 * ;
 */
export function waitForWebfonts(fonts, fallbackFontName='sans-serif', timeout=5000){
	fonts = orDefault(fonts, [], 'arr').map(font => `${font}`);
	fallbackFontName = orDefault(fallbackFontName, 'sans-serif', 'string');
	timeout = orDefault(timeout, 5000, 'int');

	const
		deferred = new Deferred(),
		start = Date.now(),
		fDimsAreIdentical = (dims1, dims2) => ((dims1.width === dims2.width) && (dims1.height === dims2.height))
	;
	let	loadedFonts = 0;

	fonts.forEach(font => {
		let node = createNode('span', null, 'giItT1WQy@!-/#');
		applyStyles(node, {
			'position' : 'absolute',
			'visibility' : 'hidden',
			'left' : '-10000px',
			'top' : '-10000px',
			'font-size' : '300px',
			'font-family' : fallbackFontName,
			'font-variant' : 'normal',
			'font-style' : 'normal',
			'font-weight' : 'normal',
			'letter-spacing' : '0',
			'white-space' : 'pre',
			'line-height' : 1
		});
		document.body.appendChild(node);

		const systemFontDims = {
			width : node.offsetWidth,
			height : node.offsetHeight
		};
		applyStyles(node, {'font-family' : `${font}, ${fallbackFontName}`});

		let fontLoadedCheckTimer = null;
		const fCheckFont = () => {
			if( (Date.now() - start) >= timeout ){
				countermand(fontLoadedCheckTimer);
				if( hasValue(node) ){
					document.body.removeChild(node);
					node = null;
				}
				deferred.reject(new Error('timeout'));
				return true;
			}

			if(
				hasValue(node)
				&& !fDimsAreIdentical({width : node.offsetWidth, height : node.offsetHeight}, systemFontDims)
			){
				countermand(fontLoadedCheckTimer);
				document.body.removeChild(node);
				node = null;
				loadedFonts++;
			}

			if( loadedFonts >= fonts.length ){
				deferred.resolve((fonts.length === 1) ? fonts[0] : fonts);
				return true;
			}

			return false;
		}
		if( !fCheckFont() ){
			fontLoadedCheckTimer = loop(100, fCheckFont);
		}
	});

	return deferred;
}
