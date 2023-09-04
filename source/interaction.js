/*!
 * Module Interaction
 */

/**
 * @namespace Interaction
 */

const MODULE_NAME = 'Interaction';



//###[ IMPORTS ]########################################################################################################

import {assert, isFunction, isElement, orDefault, hasValue, Deferred} from './basic.js';
import {findTextNodes} from './elements.js';
import {applyStyles} from './css.js';



//###[ DATA ]###########################################################################################################

export const TAPPABLE_ELEMENTS_SELECTOR = 'a, button, .button, input[type=button], input[type=submit]';
const NOT_AN_HTMLELEMENT_ERROR = 'given node/target is not an HTMLElement';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Interaction:createSelection
 */

/**
 * Programmatically create a text selection inside a node, possibly reaching across several child nodes,
 * but virtually only working with the raw text content. Can also be used to create a selection in text
 * inputs for example.
 *
 * Be aware that the endOffset is neither the length to select nor the last index, but the offset starting
 * from the last character in the node counting backwards (like a reverse startOffset). The reason for this wonkyness
 * is the fact that we have to implement three different ways of creating selections in this function, this
 * notation being the most compatible one. We assume the default use case for this method is to select all content
 * of a node with the possibility to skip one or two unwanted characters on each side of the content.
 *
 * Hint: You cannot create a selection spanning normal inline text into an input, ending there. To create a selection in
 * a text input, please target that element specifically or make sure the selection spans the whole input.
 * Furthermore, on mobile/iOS devices creation of selection ranges might only be possible in text inputs.
 *
 * @param  {HTMLElement} node - the element to create a selection inside
 * @param  {?Number} [startOffset=0] - characters to leave out at the beginning of the text content
 * @param  {?Number} [endOffset=0] - characters to leave out at the end of the text content
 * @return {String} the selected text
 *
 * @memberof Interaction:createSelection
 * @alias createSelection
 * @see removeSelections
 * @example
 * const selectedText = createSelection(copytextElement, 12, 6);
 */
export function createSelection(node, startOffset=0, endOffset=0){
	const __methodName__ = 'createSelection';

	startOffset = orDefault(startOffset, 0, 'int');
	endOffset = orDefault(endOffset, 0, 'int');

	assert(isElement(node), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	let	selectionText, range, selection, rangeText;

	if( hasValue(node.selectionStart, node.selectionEnd) ){
		node.focus();
		node.select();
		rangeText = node.value;
		node.selectionStart = startOffset;
		node.selectionEnd = rangeText.length - endOffset;
		selectionText = rangeText.substring(node.selectionStart, node.selectionEnd);
	} else if( isFunction(window.getSelection) ){
		range = document.createRange();
		range.selectNodeContents(node);

		if( hasValue(startOffset) || hasValue(endOffset) ){
			const textNodes = findTextNodes(node);
			if( textNodes.length > 0 ){
				let
					startNodeIndex = 0,
					startNode = textNodes[startNodeIndex],
					endNodeIndex = textNodes.length - 1,
					endNode = textNodes[endNodeIndex]
				;

				if( hasValue(startOffset) ){
					let
						remainingStartOffset = startOffset,
						startOffsetNodeFound = (remainingStartOffset <= startNode.length)
					;

					while( !startOffsetNodeFound && hasValue(startNode) ){
						startNodeIndex++;
						if( hasValue(textNodes[startNodeIndex]) ){
							remainingStartOffset -= startNode.length;
							startNode = textNodes[startNodeIndex];
							startOffsetNodeFound = (remainingStartOffset <= startNode.length);
						} else {
							remainingStartOffset = startNode.length;
							startOffsetNodeFound = true;
						}
					}

					range.setStart(startNode, remainingStartOffset);
				}

				if( hasValue(endOffset) ){
					let
						remainingEndOffset = endOffset,
						endOffsetNodeFound = (remainingEndOffset <= endNode.length)
					;

					while( !endOffsetNodeFound && hasValue(endNode) ){
						endNodeIndex--;
						if( hasValue(textNodes[endNodeIndex]) ){
							remainingEndOffset -= endNode.length;
							endNode = textNodes[endNodeIndex];
							endOffsetNodeFound = (remainingEndOffset <= endNode.length);
						} else {
							remainingEndOffset = endNode.length;
							endOffsetNodeFound = true;
						}
					}

					range.setEnd(endNode, endNode.length - remainingEndOffset);
				}
			}
		}

		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		selectionText = range.toString();
	} else if( isFunction(document.body.createTextRange) ){
		range = document.body.createTextRange();
		range.moveToElementText(node);

		if( hasValue(startOffset) ){
			range.moveStart('character', startOffset);
		}

		if( hasValue(endOffset) ){
			range.moveEnd('character', -endOffset);
		}

		range.select();

		selectionText = range.text;
	}

	return selectionText;
}



/**
 * @namespace Interaction:removeSelections
 */

/**
 * Removes all text selections from the current window if possible.
 * Certain mobile devices like iOS devices might block this behaviour actively.
 *
 * @memberof Interaction:removeSelections
 * @alias removeSelections
 * @see createSelection
 * @example
 * removeSelections();
 */
export function removeSelections(){
	if( isFunction(window.getSelection) ){
		window.getSelection().removeAllRanges();
	} else if( isFunction(document.getSelection) ){
		document.getSelection().removeAllRanges();
	}

	if( hasValue(document.selection) ){
		document.selection.empty();
	}
}



/**
 * @namespace Interaction:disableSelection
 */

/**
 * Disables the possibility to create a selection in an element.
 *
 * @param  {HTMLElement} node - the element to disable user selection for
 * @return {HTMLElement} the node with disabled selection
 *
 * @memberof Interaction:disableSelection
 * @alias disableSelection
 * @see enableSelection
 * @example
 * disableSelection(widget);
 */
export function disableSelection(node){
	const __methodName__ = 'disableSelection';

	assert(isElement(node), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	node.onselectstart = () => false;
	node.unselectable = 'on';
	applyStyles(node, {'user-select' : 'none'}, true);
	applyStyles(node, {'-webkit-touch-callout' : 'none'});

	return node;
}



/**
 * @namespace Interaction:enableSelection
 */

/**
 * (Re)enables the possibility to create a selection in an element. Most likely after having been disabled
 * using `disableSelection`.
 *
 * @param  {HTMLElement} node - the element to (re)enable user selection for
 * @return {HTMLElement} the node with (re)enabled selection
 *
 * @memberof Interaction:enableSelection
 * @alias enableSelection
 * @see disableSelection
 * @example
 * enableSelection(widget);
 */
export function enableSelection(node){
	const __methodName__ = 'disableSelection';

	assert(isElement(node), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	node.onselectstart = undefined;
	node.unselectable = 'off';
	applyStyles(node, {'user-select' : null}, true);
	applyStyles(node, {'-webkit-touch-callout' : null});

	return node;
}



/**
 * @namespace Interaction:obfuscatePrivateMailToLink
 */

/**
 * Augment a link element to hold an obfuscated private mailto link, to be able to contact people
 * via their own mail address, without the need to openly write the address into the DOM permanently,
 * in a way crawlers could identify easily.
 *
 * The method takes all parts of the address as (hopefully) unidentifiable parameters and then applies them internally,
 * to build an email string with mailto protocol dynamically on mouse or focus interaction in the link's href,
 * offering normal link functionality from here on. If the interaction ends, the href is removed again immediately,
 * so the link is only and exclusively readable and complete during user interaction.
 *
 * You may set the link text yourself or set `setAsContent` to true, to let the function fill the link text with
 * the completed address. Be aware, that this, although still being obfuscated, lowers the level of security for this
 * solution.
 *
 * Although most parameters are technically optional, this function still expects `beforeAt` and `afterAtWithoutTld` to
 * be filled. While these parts are strictly necessary here: I'd always suggest to use all parts, since, the more
 * of an address is written together, the easier the address can be parsed.
 *
 * @param {HTMLElement} link - the link to augment, has to be a node where we can set a "href" attribute
 * @param {?Boolean} [setAsContent=false] - define if the address should be used as link text (still uses string obfuscation, but weaker against bot with JS execution)
 * @param {?String} [tld=''] - the top level domain to use
 * @param {?String} [afterAtWithoutTld=''] - the address part after the @ but before the tld
 * @param {?String} [beforeAt=''] - the address part before the @
 * @param {?String} [subject=''] - the subject the mail should have, if you want to preset this
 * @param {?String} [body=''] - the body text the mail should have initially, if you want to preset this
 * @param {?String} [ccTld=''] - the top level domain to use for the cc address
 * @param {?String} [ccAfterAtWithoutTld=''] - the address part after the @ but before the tld for the cc address
 * @param {?String} [ccBeforeAt=''] - the address part before the @ for the cc address
 * @throws error if beforeAt or afterAtWithoutTld are empty
 * @return {HTMLElement} the augmented link
 *
 * @memberof Interaction:obfuscatePrivateMailToLink
 * @alias obfuscatePrivateMailToLink
 * @example
 * obfuscatePrivateMailToLink(document.querySelector('a'), true, 'de', 'gmail', 'recipient', 'Hello there!', 'How are you these days?');
 */
export function obfuscatePrivateMailToLink(
	link,
	setAsContent=false,
	tld='',
	afterAtWithoutTld='',
	beforeAt='',
	subject='',
	body='',
	ccTld='',
	ccAfterAtWithoutTld='',
	ccBeforeAt=''
){
	const __methodName__ = 'obfuscatePrivateMailToLink';

	setAsContent = orDefault(setAsContent, false, 'bool');
	subject = orDefault(subject, '', 'str');
	body = orDefault(body, '', 'str');
	beforeAt = orDefault(beforeAt, '', 'str');
	afterAtWithoutTld = orDefault(afterAtWithoutTld, '', 'str');
	tld = orDefault(tld, '', 'str');
	ccBeforeAt = orDefault(ccBeforeAt, '', 'str');
	ccAfterAtWithoutTld = orDefault(ccAfterAtWithoutTld, '', 'str');
	ccTld = orDefault(ccTld, '', 'str');

	assert((beforeAt !== '') && (afterAtWithoutTld !== ''), `${MODULE_NAME}:${__methodName__} | basic mail parts missing`);

	if( tld !== '' ){
		tld = `.${tld}`;
	}

	if( ccTld !== '' ){
		ccTld = `.${ccTld}`;
	}

	let optionParams = new URLSearchParams();
	if( subject !== '' ){
		optionParams.set('subject', subject);
	}
	if( body !== '' ){
		optionParams.set('body', body);
	}
	if( (ccBeforeAt !== '') && (ccAfterAtWithoutTld !== '') ){
		optionParams.set('cc', `${ccBeforeAt}@${ccAfterAtWithoutTld}${ccTld}`);
	}
	optionParams = optionParams.toString();
	if( optionParams !== '' ){
		optionParams = `?${optionParams.replaceAll('+', '%20')}`;
	}

	let interactionCount = 0;
	const fAddLinkUrl = () => {
		interactionCount++;
		link.setAttribute('href', `mailto:${beforeAt}@${afterAtWithoutTld}${tld}${optionParams}`);
	};
	link.addEventListener('mouseenter', fAddLinkUrl);
	link.addEventListener('focusin', fAddLinkUrl);
	const fRemoveLinkUrl = () => {
		interactionCount--;
		if( interactionCount <= 0 ){
			link.setAttribute('href', '');
		}
	};
	link.addEventListener('mouseleave', fRemoveLinkUrl);
	link.addEventListener('focusout', fRemoveLinkUrl);

	if( setAsContent ){
		link.innerHTML = (`${beforeAt}@${afterAtWithoutTld}${tld}`).replace(/(\w{1})/g, '$1&zwnj;');
	}

	return link;
}



/**
 * @namespace Interaction:obfuscatePrivateTelLink
 */

/**
 * Augment a link element to hold an obfuscated private tel link, to be able to contact people
 * via their own phone number, without the need to openly write the number into the DOM permanently,
 * in a way crawlers could identify easily.
 *
 * The method takes all parts of the number as (hopefully) unidentifiable parameters and then applies them internally,
 * to build a number string with tel protocol dynamically on mouse or focus interaction in the link's href,
 * offering normal link functionality from here on. If the interaction ends, the href is removed again immediately,
 * so the link is only and exclusively readable and complete during user interaction.
 *
 * You may set the link text yourself or set `setAsContent` to true, to let the function fill the link text with
 * the completed address. Be aware, that this, although still being obfuscated, lowers the level of security for this
 * solution.
 *
 * Although most parameters are technically optional, this function still expects `secondTelPart` or `firstTelPart` to
 * be filled. While only one part is strictly necessary here: I'd always suggest to use all parts, since, the more
 * of a number is written together, the easier the number can be parsed.
 *
 * @param {HTMLElement} link - the link to augment, has to be a node where we can set a "href" attribute
 * @param {?Boolean} [setAsContent=false] - define if the number should be used as link text, being formatted according to DIN 5008 (still uses string obfuscation, but weaker against bot with JS execution)
 * @param {?Number|String} [secondTelPart=''] - second half of the main number +49 04 123(4-56)<-this; add a dash to signify where a base number ends and the personal part starts
 * @param {?Number|String} [firstTelPart=''] - first half of the main number +49 04 (123)<-this 4-56
 * @param {?Number|String} [regionPart=''] - the local part of the number after the country part e.g. +49(04)<-this 1234-56
 * @param {?Number|String} [countryPart=''] - the country identifier with or without + this->(+49) 04 1234-56 (do not prefix with a local 0!)
 * @throws error if `secondTelPart` and `firstTelPart` are empty
 * @return {HTMLElement} the augmented link
 *
 * @memberof Interaction:obfuscatePrivateTelLink
 * @alias obfuscatePrivateTelLink
 * @example
 * obfuscatePrivateTelLink(document.querySelector('a'), true, 123, 439, 40, '+49');
 */
export function obfuscatePrivateTelLink(
	link,
	setAsContent=false,
	secondTelPart='',
	firstTelPart='',
	regionPart='',
	countryPart=''
){
	const __methodName__ = 'obfuscatePrivateTelLink';

	setAsContent = orDefault(setAsContent, false, 'bool');
	secondTelPart = orDefault(secondTelPart, '', 'str').replace(/[^0-9\-]/g, '');
	firstTelPart = orDefault(firstTelPart, '', 'str').replace(/[^0-9\-]/g, '');
	regionPart = orDefault(regionPart, '', 'str').replace(/[^0-9]/g, '');
	countryPart = orDefault(countryPart, '', 'str').replace(/[^0-9]/g, '');

	assert((firstTelPart !== '') || (secondTelPart !== ''), `${MODULE_NAME}:${__methodName__} | basic tel parts missing`);

	let interactionCount = 0;
	const fAddLinkUrl = () => {
		interactionCount++;
		link.setAttribute('href', `tel:+${countryPart}${regionPart}${firstTelPart.replace(/-/g, '')}${secondTelPart.replace(/-/g, '')}`);
	};
	link.addEventListener('mouseenter', fAddLinkUrl);
	link.addEventListener('focusin', fAddLinkUrl);
	const fRemoveLinkUrl = () => {
		interactionCount--;
		if( interactionCount <= 0 ){
			link.setAttribute('href', '');
		}
	};
	link.addEventListener('mouseleave', fRemoveLinkUrl);
	link.addEventListener('focusout', fRemoveLinkUrl);

	if( setAsContent ){
		link.innerHTML = (`+${countryPart} ${regionPart} ${firstTelPart}${secondTelPart}`).replace(/(\w{1})/g, '$1&zwnj;');
	}
}



/**
 * @namespace Interaction:setTappedState
 */

/**
 * Sets a "tapped" state on an element (via a CSS class), which removes itself again after a short time.
 *
 * The sole reason for doing this, is to be able to apply styling to a tap/click action across devices without
 * trailing styles, which would result by using something like `:focus`.
 *
 * @param {HTMLElement} element - the link to augment, has to be a node where we can set a "href" attribute
 * @param {?String} [tappedClass='tapped'] - the CSS class to set on the element to signify the "tapped" state
 * @param {?Number} [tappedDuration=200] - the duration in milliseconds, the "tapped" state should last
 * @throws error if element is not an HTMLElement
 * @return {Deferred} resolves with the element, when the tapped state ends
 *
 * @memberof Interaction:setTappedState
 * @alias setTappedState
 * @example
 * setTappedState(link);
 * setTappedState(link, 'clicked', 500);
 */
export function setTappedState(element, tappedClass='tapped', tappedDuration=200){
	const __methodName__ = 'setTappedState';

	tappedClass = orDefault(tappedClass, 'tapped', 'str');
	tappedDuration = orDefault(tappedDuration, 200, 'int');

	assert(isElement(element), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	const deferred = new Deferred();

	element.classList.add(tappedClass);
	window.setTimeout(() =>{
		element.classList.remove(tappedClass);
		element.blur();
		deferred.resolve(element);
	}, tappedDuration);

	return deferred;
}



/**
 * @namespace Interaction:setupAutoTappedStates
 */

/**
 * This function registers a global event handler on the document body, to automatically add "tapped" states (as a CSS
 * class) to "tappable" elements on "tap".
 *
 * What is a "tap" you ask? Well, it's either a pointer click or a finger touch or anything resembling these actions
 * on your current device.
 *
 * The idea behind that is this: usually, on pointer devices, we have a `:hover` state to signify user interaction
 * with an element, while on touch devices, we only know that an interaction took place after a user touched an element
 * with his/her finger, "tapped" it so to speak. Styling a touch with CSS would only be possible via `:focus`, which
 * has the problems, that focus has a different meaning on pointer devices and the focus state does not end
 * automatically, resulting in trailing visual states.
 *
 * So, what we do instead, is that we just generally observe taps (via "click" event, which works across devices as
 * expected) and set a class on the element, for a short time, which removes itself automatically again, to be able
 * to define a visual state or a short animation for that class. So, for example, let's say the function has been
 * executed. After that, you can define something like `a.tapped { color: orange; }`, which would result in orange
 * coloring for a short time, after clicking/touching the element. Combine this with `:hover`, `:focus` definitions
 * in CSS to define a complete effect setup.
 *
 * @param {?HTMLElement} [element=document.body] - the element to use as delegation parent for events, should contain the tappable elements you'd like to target
 * @param {?String} [tappableElementsSelector='a, button, .button, input[type=button], input[type=submit]'] - selector to identify a tappable element by in a delegated event handler
 * @param {?String|Array<String>} [tapEvents='click'] - the DOM event(s) to register for taps
 * @param {?String} [tappedClass='tapped'] - the CSS class to set on the element to signify the "tapped" state
 * @param {?Number} [tappedDuration=200] - the duration in milliseconds, the "tapped" state should last
 * @throws error if element is not an HTMLElement
 *
 * @memberof Interaction:setupAutoTappedStates
 * @alias setupAutoTappedStates
 * @example
 * setupAutoTappedStates();
 * setupAutoTappedStates(document.body, 'a, button', 'customevent');
 */
export function setupAutoTappedStates(
	element=null,
	tappableElementsSelector=TAPPABLE_ELEMENTS_SELECTOR,
	tapEvents='click',
	tappedClass='tapped',
	tappedDuration=200
){
	const __methodName__ = 'setupAutoTappedStates';

	// document.body not in function default to prevent errors on import in document-less contexts
	element = orDefault(element, document.body);
	tappableElementsSelector = orDefault(tappableElementsSelector, TAPPABLE_ELEMENTS_SELECTOR, 'str');
	tapEvents = orDefault(tapEvents, 'click', 'str');
	tapEvents = [].concat(tapEvents);

	assert(isElement(element), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	tapEvents.forEach(tapEvent => {
		element.addEventListener(tapEvent, e => {
			if(
				hasValue(e.target?.matches)
				&& e.target.matches(tappableElementsSelector)
			){
				setTappedState(e.target, tappedClass, tappedDuration);
			}
		});
	});
}
