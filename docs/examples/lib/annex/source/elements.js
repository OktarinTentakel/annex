/*!
 * Module Elements
 */

/**
 * @namespace Elements
 */

const MODULE_NAME = 'Elements';



//###[ IMPORTS ]########################################################################################################

import {orDefault, isA, isPlainObject, hasValue, assert, size} from './basic.js';



//###[ DATA ]###########################################################################################################

const NOT_AN_HTMLELEMENT_ERROR = 'given node/target is not an HTMLElement';



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
 * @throws error if target is not an HTMLElement
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

	assert(isA(target, 'htmlelement'), `${MODULE_NAME}.${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

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
 * @throws error if target is not an HTMLElement or does not have a parent
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

	assert(isA(target, 'htmlelement'), `${MODULE_NAME}.${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

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
	const __methodName__ = 'getTextContent';

	onlyFirstLevel = orDefault(onlyFirstLevel, false, 'bool');

	if( isA(target, 'string') ){
		target = createNode(target);
	}

	assert(isA(target, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | target is neither node nor markup`);

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



/**
 * @namespace Elements:isInDom
 */

/**
 * Returns if an element is currently part of the DOM or in a detached state.
 *
 * @param {HTMLElement} node - the element to check, whether it is currently in the dom or detached
 * @throws error if node is not a usable HTML element
 * @returns {Boolean} true if the element is part of the DOM at the moment
 *
 * @memberof Elements:isInDom
 * @alias isInDom
 * @example
 * if( !isInDom(el) ){
 *     elementMetaInformation.delete(el);
 * }
 */
export function isInDom(node){
	const __methodName__ = 'isInDom';

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	return isA(document.contains, 'function') ? document.contains(node) : document.body.contains(node);
}



/**
 * @namespace Elements:getData
 */

/**
 * Returns the element's currently set data attribute value(s).
 *
 * This method has two major differences from the standard browser dataset-implementations:
 * 1. Property names are _not_ handled camel-cased in any way.
 *    The data attribute `data-my-naughty-dog` property does _not_ magically become `myNaughtyDog` on access,
 *    but keeps the original notation, just losing the prefix, so access it, by using `my-naughty-dog`
 * 2. All property values are treated as JSON first and foremost, falling back to string values, if the
 *    value is not parsable. This means, that `{"foo" : "bar"}` becomes an object, `[1, 2, 3]` becomes an array,
 *    `42` becomes a number, `true` becomes a boolean and `null` becomes a null-value. But `foobar` actually becomes
 *    the string "foobar". JSON-style double quotes are removed, when handling a single string.
 *
 * Keep in mind that things like `new Date()` will not work out of the box, since this is not included in the JSON
 * standard, but has to be serialized/deserialized.
 *
 * @param {HTMLElement} node - the element to read data from
 * @param {?String|Array<String>} [properties=null] - if set, returns value(s) of that specific property/properties (single value for exactly one property, dictionary for multiple), if left out, all properties are returned as a dictionary object
 * @throws error if node is not a usable HTML element
 * @returns {*|Object|null} JSON-parsed attribute value(s) with string fallback; either a single value for exactly one property, a dictionary of values for multiple or a call without properties (meaning all) or null, in case no data was found
 *
 * @memberof Elements:getData
 * @alias getData
 * @see setData
 * @see removeData
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
 * @example
 * getData(createNode('<div data-my-naughty-dog="42"></div>'), 'my-naughty-dog')
 * => 42
 * getData(createNode('<div data-my-naughty-dog='{"foo" : [1, "two", true]}'></div>'), 'my-naughty-dog')
 * => {"foo" : [1, "two", true]}
 * getData(createNode('<div data-my-naughty-dog='1, "two", true'></div>'), 'my-naughty-dog')
 * => '1, "two", true'
 * getData(createNode('<div data-my-naughty-dog="42" data-foo="true" data-bar="test"></div>'), ['foo', 'bar'])
 * => {"foo" : true, "bar" : "test"}
 * getData(createNode('<div data-my-naughty-dog="42" data-foo="true" data-bar="test"></div>'))
 * => {"my-naughty-dog" : 42,"foo" : true, "bar" : "test"}
 */
export function getData(node, properties=null){
	const __methodName__ = 'getData';

	properties = orDefault(properties, null, 'arr');

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	let data = {};

	if( hasValue(properties) ){
		properties.forEach(property => {
			let attributeValue = node.getAttribute(`data-${property}`);
			if( hasValue(attributeValue) ){
				try {
					data[property] = JSON.parse(attributeValue);
				} catch(ex){
					data[property] = attributeValue;
				}
			}
		});
	} else {
		Array.from(node.attributes).forEach(attribute => {
			if( attribute.name.startsWith('data-') ){
				const property = attribute.name.replace(/^data-/, '');
				try {
					data[property] = JSON.parse(attribute.value);
				} catch(ex){
					data[property] = attribute.value;
				}
			}
		});
	}

	if( size(data) === 0 ){
		data = null;
	} else if( (properties?.length === 1) ){
		data = data[properties[0]] ?? null;
	}

	return data;
}



/**
 * @namespace Elements:setData
 */

/**
 * Writes data to an element, by setting data-attributes.
 *
 * Setting a value of `undefined` or an empty string removes the attribute.
 *
 * This method has two major differences from the standard browser dataset-implementations:
 * 1. Property names are _not_ handled camel-cased in any way.
 *    The data attribute `my-naughty-dog` property is _not_ magically created from `myNaughtyDog`,
 *    but the original notation will be kept, just adding the prefix, so set `data-my-naughty-dog`
 *    by using `my-naughty-dog`
 * 2. All property values are treated as JSON first and foremost, falling back to basic string values, if the
 *    value is not stringifiable as JSON. If the top-level value ends up to be a simple JSON string like '"foo"'
 *    or "'foo'", the double quotes are removed before writing the value.
 *
 * Keep in mind that things like `new Date()` will not work out of the box, since this is not included in the JSON
 * standard, but has to be serialized/deserialized.
 *
 * @param {HTMLElement} node - the element to write data to
 * @param {Object<String,*>|String} dataSet - the data to write to the element, properties have to be exact data-attribute names without the data-prefix, values are stringified (first with JSON.stringify and then as-is as a fallback), if value is a function it gets executed and the return value will be used from there on; if this is a string, this defines a single property to set, with the singleValue being the value to set
 * @param {?*} [singleValue=null] - if you only want to set exactly one property, you may set dataSet to the property name as a string and provide the value via this parameter instead
 * @throws error if node is not a usable HTML element or if dataSet is not a plain object if no single value has been given
 * @returns {Object<String,*>|*|null} the value(s) actually written to the element's data-attributes as they would be returned by getData (removed attributes are marked with `undefined`); null will be returned if nothing was changed; if only a single value was set, only that value will be returned
 *
 * @memberof Elements:setData
 * @alias setData
 * @see getData
 * @see removeData
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
 * @example
 * setData(element, {foobar : 'hello kittens!'});
 * => {foobar : 'hello kittens!'}
 * setData(element, 'foobar', 'hello kittens!');
 * => 'hello kittens!'
 * setData(element, {foobar : {a : 'foo', b : [1, 2, 3], c : {d : true}}});
 * => {foobar : {a : 'foo', b : [1, 2, 3], c : {d : true}}}
 * setData(element, 'foobar', {a : 'foo', b : [1, 2, 3], c : {d : true}});
 * => {a : 'foo', b : [1, 2, 3], c : {d : true}}
 * setData(element, {foobar : () => { return 'hello kittens!'; }});
 * => {foobar : 'hello kittens!'}
 * setData(element, {foobar : undefined});
 * => {foobar : undefined}
 * setData(element, boofar, '');
 * => undefined
 */
export function setData(node, dataSet, singleValue=null){
	const __methodName__ = 'setData';

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	let singleKey = null;
	if( hasValue(singleValue) ){
		singleKey = `${dataSet}`;
		dataSet = {
			[singleKey] : singleValue
		};
	}

	assert(isPlainObject(dataSet), `${MODULE_NAME}:${__methodName__} | dataSet is not a plain object`);

	const appliedValues = {};

	Object.entries(dataSet).forEach(([property, value]) => {
		if( isA(value, 'function') ){
			value = value();
		}

		if( value !== undefined ){
			let stringifiedValue, getValue;
			try {
				stringifiedValue = JSON.stringify(value);
				getValue = JSON.parse(stringifiedValue);
			} catch(ex){
				stringifiedValue = `${value}`;
				getValue = stringifiedValue;
			}
			stringifiedValue = stringifiedValue.replace(/^['"]/, '').replace(/['"]$/, '').trim();

			if( stringifiedValue !== '' ){
				appliedValues[property] = getValue;
				node.setAttribute(`data-${property}`, stringifiedValue);
			} else if( node.hasAttribute(`data-${property}`) ){
				appliedValues[property] = undefined;
				node.removeAttribute(`data-${property}`);
			}
		} else if( node.hasAttribute(`data-${property}`) ){
			appliedValues[property] = undefined;
			node.removeAttribute(`data-${property}`);
		}
	});

	if( hasValue(singleKey) ){
		return (singleKey in appliedValues) ?  appliedValues[singleKey] : null;
	} else {
		return (size(appliedValues) > 0) ? appliedValues : null;
	}
}



/**
 * @namespace Elements:removeData
 */

/**
 * Removes data from an element, by removing corresponding data-attributes.
 *
 * This method has a major difference from the standard browser dataset-implementations:
 * Property names are _not_ handled camel-cased in any way.
 * The data attribute's `my-naughty-dog` property is _not_ magically created from `myNaughtyDog`,
 * but the original notation will be kept, just adding the prefix,
 * so use `my-naughty-dog` to remove `data-my-naughty-dog`
 *
 * @param {HTMLElement} node - the element to remove data from
 * @param {?String|Array<String>} [properties=null] - if set, removes specified property/properties, if left out, all data properties are removed
 * @throws error if node is not a usable HTML element
 * @returns {*|Object<String,*>|null} the removed data values as they would be returned from getData (single value for one property, dictionaries for multiple or all) or null if nothing was removed
 *
 * @memberof Elements:removeData
 * @alias removeData
 * @see getData
 * @see setData
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
 * @example
 * const testNode = createNode(`<span data-foobar="test" data-boofar="null" data-baz='{"a" : ["1", 2, 3.3], "b" : true}'></span>`)
 * removeData(testNode, 'foobar')
 * => 'test' (testNode.outerHTML === `<span data-boofar="null" data-baz='{"a" : ["1", 2, 3.3], "b" : true}'></span>`)
 * removeData(testNode, ['foobar', 'baz', 'test'])
 * => {foobar : 'test', baz : {"a" : ["1", 2, 3.3], "b" : true}} (testNode.outerHTML === `<span data-boofar="null"></span>`)
 * removeData(testNode)
 * => {foobar : 'test', boofar : null, baz : {"a" : ["1", 2, 3.3], "b" : true}} (testNode.outerHTML === `<span></span>`)
 * removeData(testNode, 'test')
 * => null
 */
export function removeData(node, properties=null){
	const __methodName__ = 'removeData';

	properties = orDefault(properties, null, 'arr');

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	let data = getData(node, properties);
	if( hasValue(data) ){
		if( properties?.length === 1 ){
			setData(node, {[properties[0]] : undefined});
		} else {
			setData(node, Object.keys(data).reduce((removalDataSet, property) => {
				removalDataSet[property] = undefined;
				return removalDataSet;
			}, {}));
		}
	} else {
		data = null;
	}

	return data;
}
