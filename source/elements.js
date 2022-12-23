/*!
 * Module Elements
 */

/**
 * @namespace Elements
 */

const MODULE_NAME = 'Elements';



//###[ IMPORTS ]########################################################################################################

import {orDefault, isA, isPlainObject, hasValue, assert} from './basic.js'



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Elements:createNode
 */

/**
 * Creates an element on the fly programmatically, based on provided name, attributes and content or markup,
 * without inserting it into the DOM.
 *
 * If you provide markup as "tag", make sure that there is one single root element, this method returns exactly one
 * element, not a NodeList. Also be sure to _not_ just pass HTML source from an unsecure source, since this
 * method does not deal with potential security risks.
 *
 * One thing about dynamically creating script tags with this: if you want the script is javascript and you want to
 * actually execute the script upon adding it to the dom, you cannot provide the complete tag as a source string,
 * since scripts created with innerHTML will not execute.
 * (see: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations)
 * Instead, just provide the tag name and define attributes and source via the parameters instead.
 *
 * @param {?String} [tag='span'] - tag of the element to create or markup for root element
 * @param {?Object} [attributes=null] - tag attributes as key/value-pairs, will also be added to provided markup
 * @param {?String} [content=null] - content to insert into the element as textContent, be aware, that this will replace other content in provided markup
 * @returns {HTMLElement} the created DOM-node
 *
 * @memberof Elements:createNode
 * @alias createNode
 * @example
 * document.body.appendChild(
 *   createNode('div', {id : 'content', style : 'display:none;'}, 'loading...')
 * );
 * document.body.appendChild(
 *   createNode('<div id="content" style="display:none;">loading...</div>')
 * );
 * document.body.appendChild(
 *   createNode('script', {type : 'text/javascript'}, 'alert("Hello World");');
 * );
 */
export function createNode(tag, attributes=null, content=null){
	tag = orDefault(tag, 'span', 'str').trim();
	attributes = isPlainObject(attributes) ? attributes : null;
	content = orDefault(content, null, 'str');

	// using anything more generic like template results in non-standard nodes like
	// <script type="text/json"> not being creatable
	const outerNode = document.createElement('div');

	if(
		/^<[^\/][^<>]*>/.test(tag)
		&& /<\/[^<>\/]+>$/.test(tag)
	){
		// using DOMParser results in non-standard nodes like
		// <script type="text/json"> not being creatable
		outerNode.innerHTML = tag;
	} else {
		outerNode.appendChild(document.createElement(tag));
	}

	const node = outerNode.firstChild;
	outerNode.removeChild(node);

	if( hasValue(attributes) ){
		for( let attribute in attributes ){
			node.setAttribute(attribute, `${attributes[attribute]}`);
		}
	}

	if( hasValue(content) ){
		node.textContent = content;
	}

	return node;
}



/**
 * @namespace Elements:insertNode
 */

/**
 * Inserts a node into the DOM in relation to a target element.
 *
 * If the node is not an element, the parameter is treated as source and a node is created
 * automatically based on that.
 *
 * The position can be determined with the same values as in "insertAdjacentElement"
 * (see: https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement),
 * but we also added the more intuitive jQuery aliases for positions:
 *
 * - "beforebegin" can also be described as "before"
 * - "afterbegin" can also be described as "prepend"
 * - "beforeend" can also be described as "append"
 * - "afterend" can also be descrived as "after"
 *
 * @param {HTMLElement} target - the element to which the node will be inserted in relation to
 * @param {HTMLElement|String} node - the node to insert, either as element or source string
 * @param {?String} [position='beforeend'] - the position to insert the node in relation to target, the default value appends the node as the last child in target
 * @throws error if target is not a node
 * @returns {HTMLElement} the inserted DOM-node
 *
 * @memberof Elements:insertNode
 * @alias insertNode
 * @example
 * insertNode(document.querySelector('.list-container'), listItemElement);
 * insertNode(document.querySelector('.list-container'), '<li>Item 42</li>', 'prepend');
 */
export function insertNode(target, node, position='beforeend'){
	const __methodName__ = 'insertNode';

	assert(isA(target, 'htmlelement'), `${MODULE_NAME}.${__methodName__} | given target is not an HTMLElement`);

	if( !isA(node, 'htmlelement') ){
		node = createNode(`${node}`);
	}

	switch( position ){
		case 'beforebegin':
		case 'before':
			position = 'beforebegin';
		break;
		case 'afterend':
		case 'after':
			position = 'afterend';
		break;
		case 'afterbegin':
		case 'prepend':
			position = 'afterbegin';
		break;
		case 'beforeend':
		case 'append':
			position = 'beforeend';
		break;
		default:
			position = 'beforeend';
		break;
	}

	target.insertAdjacentElement(position, node);

	return node;
}



/**
 * @namespace Elements:replaceNode
 */

/**
 * Replaces a node with another one.
 *
 * If the node is not an element, the parameter is treated as source and a node is created
 * automatically based on that.
 *
 * The target node needs a parent node for this function to work.
 *
 * @param {HTMLElement} target - the element to replace
 * @param {HTMLElement|String} node - the node to replace the target with
 * @throws error if target is not a node or does not have a parent node
 * @returns {HTMLElement} the replacement node
 *
 * @memberof Elements:replaceNode
 * @alias replaceNode
 * @example
 * replaceNode(document.querySelector('.hint'), newHintElement);
 * replaceNode(document.querySelector('.hint'), '<p class="hint">Sale tomorrow!</p>');
 */
export function replaceNode(target, node){
	const __methodName__ = 'replaceNode';

	assert(isA(target, 'htmlelement'), `${MODULE_NAME}.${__methodName__} | given target is not an HTMLElement`);

	if( !isA(node, 'htmlelement') ){
		node = createNode(`${node}`);
	}

	assert(isA(target.parentNode, 'htmlelement'), `${MODULE_NAME}.${__methodName__} | given target does not have a parent)`);

	insertNode(target, node, 'after');
	target.parentNode.removeChild(target);

	return node;
}



/**
 * @namespace Elements:getTextContent
 */

/**
 * Return the de-nodified text content of a node-ridden string or a DOM-node.
 * Returns the raw text content, with all markup cleanly removed.
 * Can also be used to return only the concatenated child text nodes.
 *
 * @param {(String|Node)} target - the node-ridden string or DOM-node to "clean"
 * @param {?Boolean} [onlyFirstLevel=false] - true if only the text of direct child text nodes is to be returned
 * @throws error if target is neither markup nor node
 * @returns {String} the text content of the provided markup or node
 *
 * @memberof Elements:getTextContent
 * @alias getTextContent
 * @example
 * someElement.textContent = getTextContent('<p onlick="destroyWorld();">red button <a>meow<span>woof</span></a></p>');
 */
export function getTextContent(target, onlyFirstLevel=false){
	onlyFirstLevel = orDefault(onlyFirstLevel, false, 'bool');

	if( isA(target, 'string') ){
		target = createNode(target);
	}

	assert(isA(target, 'htmlelement'), `${MODULE_NAME}:getTextContent | target is neither node nor markup`);

	if( onlyFirstLevel ){
		let textContent = '';

		target.childNodes.forEach(node => {
			if( node.nodeType === 3 ){
				textContent += node.textContent;
			}
		});

		return textContent;
	} else {
		return target.textContent;
	}
}
