/*!
 * Module Elements
 */

/**
 * @namespace Elements
 */

const MODULE_NAME = 'Elements';



import {orDefault, isA, hasValue, assert} from './basic.js'



/**
 * @namespace Elements:createNode
 */

/**
 * Creates an element on the fly programmatically, based on provided name, attributes and content or markup,
 * without inserting it into the DOM.
 *
 * If you provide markup as "tag", make sure that there is one single root element, this method returns exactly one
 * element, not a NodeList.
 *
 * @param {String} tag - tag of the element to create or markup for root element
 * @param {?Object} [attributes] - tag attributes as key/value-pairs, will also be added to provided markup
 * @param {?String} [content] - content to insert into the element as textContent, be aware, that this will replace other content in provided markup
 * @returns {HTMLElement} DOM-node
 *
 * @memberof Elements:createNode
 * @alias createNode
 * @example
 * window.body.appendChild(
 *  createNode('div', {id : 'content', style : 'display:none;'}, 'loading...')
 * );
 * window.body.appendChild(
 *  createNode('<div id="content" style="display:none;">loading...</div>')
 * );
 *
 */
export function createNode(tag, attributes, content){
	tag = orDefault(tag, '', 'string').trim();
	content = orDefault(content, null, 'string');

	const outerNode = document.createElement('main');

	if(
		/^<[^<>\/]+>/.test(tag)
		&& /<\/[^<>\/]+>$/.test(tag)
	){
		outerNode.innerHTML = tag.trim();
	} else {
		outerNode.innerHTML = `<${tag}/>`;
	}

	const node = outerNode.firstChild;

	if( isA(attributes, 'object') ){
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
export function getTextContent(target, onlyFirstLevel){
	onlyFirstLevel = orDefault(onlyFirstLevel, false, 'bool');

	if( isA(target, 'string') ){
		target = createNode(target);
	}

	assert(isA(target, 'htmlelement'), `${MODULE_NAME}:getTextContent | given target is neither node nor markup`);

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
