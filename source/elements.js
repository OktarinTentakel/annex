/*!
 * Module Elements
 */

/**
 * @namespace Elements
 */

const MODULE_NAME = 'Elements';



//###[ IMPORTS ]########################################################################################################

import {orDefault, isA, isPlainObject, hasValue, assert, size, Deferred} from './basic.js';
import {randomUuid} from './random.js';
import {clone} from './objects.js';
import {onDomReady} from './events.js';
import {applyStyles} from './css.js';



//###[ DATA ]###########################################################################################################

const NOT_AN_HTMLELEMENT_ERROR = 'given node/target is not an HTMLElement';
let BROWSER_HAS_CSS_SCOPE_SUPPORT;
try {
	document.querySelector(':scope *');
} catch(ex){
	BROWSER_HAS_CSS_SCOPE_SUPPORT = false;
}



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
 * @namespace Elements:defineNode
 */

/**
 * Creates element attributes for an (existing) element, providing the possibility to declare another
 * element as a boilerplate element to inherit attributes from.
 *
 * The basic premise is this: Define all attributes in a plain object, where the key is the attribute name and the
 * value is the attribute value. `class` may be provided as an array of class definitions and `style` may be provided
 * as a plain object (defining styles as key/value pairs, just as is `applyStyles`). You may even define `style` as an
 * array of plain objects. In both arrays, the last entries have precedence. Everything else has to be a string.
 *
 * You can declare a `boilerplateNode` to use another element as source to inherit attributes from. To inherit an
 * attribute (if it exists), declare the attribute with a value of "<-".
 *
 * Normally all attributes of the target element will be overwritten with provided/inherited values, but you may declare
 * attributes with a preceding "+" to just add to anything already there. `class` as `+class` and `style` as `+style`
 * for example. In these cases, classes and styles would be added to anything already declared. Normal string values
 * would simply be concatenated.
 *
 * If you want to inherit all data-attributes or on-handlers from an element you may declare the fields `data*` and
 * `on*` as "<-" to inherit all attributes starting with data- or on. This would even work as `+data*` and `+on*`.
 *
 * Keep in mind that explicit definitions always have precedence over inherited values, so `data*` being "<-" and an
 * additionally declared data value will result in the element getting the declared value on the field and not having
 * the inherited value.
 *
 * @param {HTMLElement} node - the pre-existing node to (re)define
 * @param {Object} definition - a plain object declaring attributes to set or inherit from another object of the form {attributeName : attributeValue|true}
 * @param {?HTMLElement} [boilerplateNode=null] - a node to take the definition from, all values set to true in definition are inherited from here
 * @throws error if target is not an HTMLElement
 * @throws error if definition is not a plain object
 * @returns {HTMLElement} the (re)defined node
 *
 * @memberof Elements:defineNode
 * @alias defineNode
 * @see applyStyles
 * @example
 * defineNode(existingElement, {'id' : 'kitten', '+class' : ['cute', 'fluffy'], '+style' : ['display:none;', {position : 'absolute'}]});
 * defineNode(existingElement, {'+class' : '<-', 'data*' : '<-', 'data-foo' : 'this will have precedence over data*'}, anotherElement);
 */
export function defineNode(node, definition, boilerplateNode=null){
	const __methodName__ = 'defineNode';

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);
	assert(isPlainObject(definition), `${MODULE_NAME}:${__methodName__} | definitions is not a plain object`);

	const inheritValue = '<-';

	if( isA(boilerplateNode, 'htmlelement') ){
		Array.from(boilerplateNode.attributes).forEach(attribute => {
			if(
				(definition[attribute.name] === inheritValue)
				|| (
					!hasValue(definition[attribute.name])
					&& (
						((definition['data*'] === inheritValue) && attribute.name.startsWith('data-'))
						|| ((definition['on*'] === inheritValue) && attribute.name.startsWith('on'))
					)
				)
			){
				definition[attribute.name] = attribute.value;
			}

			if(
				(definition[`+${attribute.name}`] === inheritValue)
				|| (
					!hasValue(definition[`+${attribute.name}`])
					&& (
						((definition['+data*'] === inheritValue) && attribute.name.startsWith('data-'))
						|| ((definition['+on*'] === inheritValue) && attribute.name.startsWith('on'))
					)
				)
			){
				if(
					!hasValue(definition[`+${attribute.name}`])
					|| (definition[`+${attribute.name}`] === inheritValue)
				){
					definition[`+${attribute.name}`] = '';
				}

				definition[`+${attribute.name}`] += attribute.value;
			}
		});
	}

	delete definition['data*'];
	delete definition['+data*'];
	delete definition['on*'];
	delete definition['+on*'];
	Object.keys(definition).forEach(name => {
		if( definition[name] === inheritValue ){
			delete definition[name];
		}
	});

	Object.keys(definition).sort().reverse().forEach(name => {
		const
			value = definition[name],
			addValue = name.startsWith('+')
		;

		if( addValue ){
			name = name.slice(1);
		}

		if( name.endsWith('*') ){
			name = name.slice(0, -1);
		}

		if( (name === 'class') ){
			if( !addValue ){
				node.setAttribute('class', '');
			}

			[].concat(value).forEach(value => {
				`${value}`.split(' ').forEach(value => {
					node.classList.add(`${value.trim()}`);
				});
			});
		} else if( (name === 'style') ){
			if( !addValue ){
				node.setAttribute('style', '');
			}

			[].concat(value).forEach(value => {
				if( !isPlainObject(value) ){
					const
						rules = `${value}`.split(';'),
						valueObj = {}
					;

					rules.forEach(rule => {
						let [key, prop] = rule.split(':');
						key = key.trim();

						if( hasValue(prop) ){
							prop = prop.trim();
							prop = prop.endsWith(';') ? prop.slice(0, -1) : prop;
							valueObj[key] = prop;
						}
					});

					value = valueObj;
				}

				if( hasValue(value) ){
					applyStyles(node, value);
				}
			});
		} else {
			if( !addValue ){
				node.setAttribute(name, `${value}`);
			} else {
				node.setAttribute(name, `${node.getAttribute(name) ?? ''}${value}`);
			}
		}
	});

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



/**
 * @namespace Elements:find
 */

/**
 * Searches for and returns descendant nodes of a given node matching a CSS selector, just as querySelector(All).
 *
 * The main difference to querySelector(All) is, that this method automatically scopes the query, making sure, that the
 * given selector is actually fulfilled _inside_ the scope of the base element and not always regarding the whole
 * document. So, basically this implementation always automatically adds `:scope` to the beginning of the selector
 * if no scope has been defined (as soon as a scope is defined anywhere in the selector, no auto-handling will be done).
 * The function always takes care of handling browsers, that do no support `:scope` yet, by using a randomized query
 * attribute approach.
 *
 * The second (minor) difference is, that this function actually returns an array and does not return a NodeList. The
 * reason being quite simple: Arrays have far better support for basic list operations than NodeList. An example:
 * Getting the first found node is straightforward in both cases (item(0) vs. at(0)), but getting the last node becomes
 * hairy pretty quickly since, item() does not accept negative indices, whereas at() does. So, with an array, we can get
 * the last node simple by using at(-1). Arrays simply have the better API nowadays and since the NodeList would be
 * static here anyway ...
 *
 * The last little difference is, that the base node for this function may not be the document itself, since
 * attribute-based scoping fallback does not work on the document, since we cannot define attributes on the document
 * itself. Just use document.body instead.
 *
 * @param {HTMLElement} node - the element to search in
 * @param {?String} [selector='*'] - the element query selector to apply to node, to find fitting elements
 * @param {?Boolean} [onlyOne=false] - if true, uses querySelector instead of querySelectorAll and therefore returns a single node or null instead of an array
 * @throws error if node is not a usable HTML element
 * @return {Array<Node>|Node|null} descendant nodes matching the selector, a single node or null if onlyOne is true
 *
 * @memberof Elements:find
 * @alias find
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll#user_notes
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * @example
 * find(document.body, 'section ul > li a[href*="#"]');
 * find(element, '> aside img[src]');
 * find(element, '> aside img[src]', true);
 * find(element, 'aside > :scope figcaption');
 * find(element, '*');
 * find(element, '[data-test="foobar"] ~ li a[href]'));
 * find(element, 'a[href]').at(-1);
 */
export function find(node, selector='*', onlyOne=false){
	const
		__methodName__ = 'find',
		scopeRex = /:scope(?![\w-])/gi
	;

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	selector = orDefault(selector, '*', 'str').trim();
	if( !(scopeRex.test(selector)) ){
		selector = `:scope ${selector}`;
	}
	onlyOne = orDefault(onlyOne, false, 'bool');

	if( BROWSER_HAS_CSS_SCOPE_SUPPORT ){
		return onlyOne ? node.querySelector(selector) : Array.from(node.querySelectorAll(selector));
	} else {
		const fallbackScopeAttribute = `find-scope-${randomUuid()}`;
		selector = selector.replace(scopeRex, `[${fallbackScopeAttribute}]`);

		node.setAttribute(fallbackScopeAttribute, '');
		const found = onlyOne ? node.querySelector(selector) : Array.from(node.querySelectorAll(selector));
		node.removeAttribute(fallbackScopeAttribute);

		return found;
	}
}



/**
 * @namespace Elements:findOne
 */

/**
 * Searches for and returns one descendant node of a given node matching a CSS selector, just as querySelector.
 *
 * The main difference to querySelector is, that this method automatically scopes the query, making sure, that the
 * given selector is actually fulfilled _inside_ the scope of the base element and not always regarding the whole
 * document. So, basically this implementation always automatically adds `:scope` to the beginning of the selector
 * if no scope has been defined (as soon as a scope is defined anywhere in the selector, no auto-handling will be done).
 * The function always takes care of handling browsers, that do no support `:scope` yet, by using a randomized query
 * attribute approach.
 *
 * The function is a shorthand for `find()` with `onlyOne` being true. The main reason this method existing, is, that
 * querySelector has a 2:1 performance advantage over querySelectorAll and nullish coalescing is easier using a
 * possible null result.
 *
 * @param {HTMLElement} node - the element to search in
 * @param {?String} [selector='*'] - the element query selector to apply to node, to find fitting element
 * @throws error if node is not a usable HTML element
 * @return {Node|null} descendant nodes matching the selector
 *
 * @memberof Elements:findOne
 * @alias findOne
 * @see find
 * @example
 * findOne(document.body, 'section ul > li a[href*="#"]');
 * findOne(element, '> aside img[src]');
 * findOne(element, 'aside > :scope figcaption');
 * findOne(element, '*');
 * findOne(element, '[data-test="foobar"] ~ li a[href]'));
 */
export function findOne(node, selector='*'){
	return find(node, selector, true);
}



/**
 * @namespace Elements:findTextNodes
 */

/**
 * Extracts all pure text nodes from an Element, starting in the element itself.
 *
 * Think of this function as a sort of find() where the result are not nodes, that query selectors can find, but pure
 * text nodes. So you'll get a set of recursively discovered text nodes without tags, representing the pure text content
 * of an element.
 *
 * If you define to set onlyFirstLevel, you'll be able to retrieve all text on the first level of an element _not_
 * included in any tag (paragraph contents without special formats as b/i/em/strong for example).
 *
 * @param {HTMLElement} node - the element to search for text nodes inside
 * @param {?Function} [filter=null] - a filter function to restrict the returned set, gets called with the textNode (you can access the parent via .parentNode)
 * @param {?Boolean} [onlyFirstLevel=false] - defines if the function should only return text nodes from the very first level of children
 * @throws error if node is not a usable HTML element
 * @return {Array<Node>} a list of text nodes
 *
 * @memberof Elements:findTextNodes
 * @alias findTextNodes
 * @example
 * const styledSentence = createElement('<div>arigatou <p>gozaimasu <span>deshita</span></p> mr. roboto<p>!<span>!!</span></p></div>');
 * findTextNodes(styledSentence).length;
 * => 6
 * findTextNodes(styledSentence, null, true).length;
 * => 2
 * findTextNodes(styledSentence, textNode => textNode.textContent.length < 9).length;
 * => 3
 * findTextNodes(styledSentence).map(node => node.textContent).join('');
 * 	=> 'arigatou gozaimasu deshita mr. roboto!!!';
 */
export function findTextNodes(node, filter=null, onlyFirstLevel=false){
	const __methodName__ = 'findTextNodes';

	filter = isA(filter, 'function') ? filter : () => true;
	onlyFirstLevel = orDefault(onlyFirstLevel, false, 'bool');

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);

	const
		textNodeType = 3,
		isValidTextNode = node => {
			return (node.nodeType === textNodeType)
				&& (node.textContent.trim() !== '')
				&& !!filter(node)
			;
		},
		extractTextNodes = node => {
			if( isValidTextNode(node) ){
				return [].concat(node);
			} else {
				return Array.from(node.childNodes).reduce((textNodes, childNode) => {
					return isValidTextNode(childNode)
						? textNodes.concat(childNode)
						: (
							!!onlyFirstLevel
							? textNodes
							: textNodes.concat(extractTextNodes(childNode))
						)
					;
				}, []);
			}
		}
	;

	return extractTextNodes(node);
}



/**
 * @namespace Elements:prime
 */

/**
 * Offers an execution frame for element preparation like setting handlers and transforming dom.
 * Takes a function including the initialization code of an element and wraps it with
 * a check if this initialization was already executed (via data-attribute) as well
 * as a document ready handler to make sure no initializations are executed with a half-ready dom.
 *
 * If the initialization function returns a Promise or Deferred, the returned Deferred will resolve or reject
 * accordingly with the same result value or rejection. If `init` does not return a Promise or Deferred, the returned
 * Deferred will resolve as soon as document ready was reached. So, to be able to work with applied changes
 * on the element after calling `prime` you have three options:
 * 1. Either make sure document ready occurred before prime(), so `init` gets called synchronously right away.
 * 2. Wrap the code after prime a DOM-ready-check as well, to establish a synchronous event order.
 * 3. Use the returned Deferred's `.then()`.
 *
 * During priming, the node receives three data-attributes, stating the current step. The attribute name is built
 * according to the value of `markerAttributeNames` like this:
 * 1. data-${markerAttributeNames}="true" => as soon as prime is executed on the node
 * 2. data-${markerAttributeNames}-ready="true" => as soon as the init function has been executed and the dom is ready
 * 2. data-${markerAttributeNames}-resolved="true" => as soon as the returned Deferred has resolved
 *
 * @param {HTMLElement} node - the element to prime
 * @param {Function} init - the function containing all initialization code for the node, the return value may either also be a Promise or Deferred (probably resolving to a value), the return value will be used to resolve the returned Deferred of the function; if you need to detect repeated prime calls on the same element, it is a good idea to let init return something other than "undefined", since that value also signifies a repeated call
 * @param {?Object<String,String|Array<String>>} [classChanges=null] - if set, may contain the keys "add" and/or "remove" holding standard class strings or arrays of standard class strings, defining which classes to add and/or remove once priming is done, helpful to automatically remove visual cloaking or set ready markers; adding has precedence over removing
 * @param {?String} [markerAttributesName='primed'] - this function uses data-attributes to mark priming status, this is the name used to construct these attributes (default: data-primed*="...")
 * @throws error if node is not a usable HTML element
 * @throws error if init is not a function
 * @returns {Deferred} resolves to the return value of init function or to `undefined` if element was already primed
 *
 * @memberof Elements:prime
 * @alias prime
 * @example
 * prime(widget, () => { return Promise.resolve(); });
 * prime(anotherWidget, () => { return somethingLongRunningAsync(); })).then(function(){ ... })
 * prime(yetAnotherWidget, node => { magicallyTransform(node); }, {remove : 'cloaked'});
 */
export function prime(node, init, classChanges=null, markerAttributesName='primed'){
	const __methodName__ = 'prime';

	classChanges = orDefault(classChanges, {});
	markerAttributesName = orDefault(markerAttributesName, 'primed', 'str');

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);
	assert(isA(init, 'function'), `${MODULE_NAME}:${__methodName__} | init is not a function`);

	const deferred = new Deferred();

	if( getData(node, markerAttributesName) !== true ){
		setData(node, markerAttributesName, true);

		onDomReady(() => {
			const initResult = init(node);

			if(
				hasValue(initResult)
				&& isA(initResult.then, 'function')
				&& isA(initResult.catch, 'function')
			){
				initResult
					.then(resolution => { deferred.resolve(resolution); })
					.catch(error => { deferred.reject(error); })
				;
			} else {
				deferred.resolve(initResult);
			}

			setData(node, `${markerAttributesName}-ready`, true);
		});
	} else {
		deferred.resolve(undefined);
	}

	deferred.then(() => {
		if( hasValue(classChanges.remove) ){
			[].concat(classChanges.remove).forEach(removeClass => {
				`${removeClass}`.split(' ').forEach(removeClass => {
					node.classList.remove(removeClass.trim());
				});
			});
		}

		if( hasValue(classChanges.add) ){
			[].concat(classChanges.add).forEach(addClass => {
				`${addClass}`.split(' ').forEach(addClass => {
					node.classList.add(addClass.trim());
				});
			});
		}

		setData(node, `${markerAttributesName}-resolved`, true);
	});

	return deferred;
}



/**
 * @namespace Elements:measureHiddenDimensions
 */

/**
 * Measures hidden elements by using a sandbox div. In some layout situations you may not be able to measure hidden
 * or especially detached elements correctly, sometimes simply because they are not rendered, other times because
 * they are rendered in a context where the browser does not keep correct styling information due to optimizations
 * considering visibility of the element.
 *
 * This method works by cloning a node and inserting it in a well hidden sandbox element for the time of the measurement,
 * after which the sandbox is immediately removed again. This method allows you to measure "hidden" elements inside the
 * DOM without the need to actually move elements around or show them visibly.
 *
 * Keep in mind, that only measurements inherent to the element itself are measurable if sandbox is inserted into the
 * body. Layout information from surrounding containers is, of course, not available. You can remedy this by setting the
 * context correctly. Keep in mind, that direct child selectors may not work in the context since the sandbox itself
 * constitutes a new level between context and element. In these cases you might have to adapt you selectors.
 *
 * @param {HTMLElement} node - the element to measure
 * @param {?String} [method='outer'] - the kind of measurement to take, allowed values are "outer"/"offset", "inner"/"client" or "scroll"
 * @param {?String} [selector=null] - selector to apply to element to find target
 * @param {?HTMLElement} [context=document.body] - context to use as container for measurement
 * @throws error if node is not a usable HTML element
 * @returns {Object<String,Number>} a plain object holding width and height measured according to the defined method
 *
 * @memberof Elements:measureHiddenDimensions
 * @alias measureHiddenDimensions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements#how_big_is_the_content
 * @example
 * measureHiddenDimensions(document.body.querySelector('div.hidden:first'), 'inner');
 * measureHiddenDimensions(document.body, 'outer, 'div.hidden:first', document.body.querySelector('main'));
 */
export function measureHiddenDimensions(node, method='outer', selector=null, context=document.body){
	const __methodName__ = 'measureHidden';

	const methods = {
		offset : {width : 'offsetWidth', height : 'offsetHeight'},
		outer : {width : 'offsetWidth', height : 'offsetHeight'},
		client : {width : 'clientWidth', height : 'clientHeight'},
		inner : {width : 'clientWidth', height : 'clientHeight'},
		scroll : {width : 'scrollWidth', height : 'scrollHeight'}
	};
	method = methods[orDefault(method, 'outer', 'str')] ?? methods.outer;

	assert(isA(node, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | ${NOT_AN_HTMLELEMENT_ERROR}`);
	assert(isA(context, 'htmlelement'), `${MODULE_NAME}:${__methodName__} | context is no an htmlelement`);

	const
		sandbox = createNode('div', {
			'id' : `sandbox-${randomUuid()}`,
			'class' : 'sandbox',
			'style' : 'display:block; opacity:0; visibility:hidden; pointer-events:none; position:absolute; top:-10000px; left:-10000px;'
		}),
		measureClone = clone(node)
	;

	context.appendChild(sandbox);
	sandbox.appendChild(measureClone);

	const
		target = hasValue(selector) ? measureClone.querySelector(selector) : measureClone,
		width = target?.[method.width] ?? 0,
		height = target?.[method.height] ?? 0,
		dimensions = {
			width,
			height,
			toString(){ return `${width}x${height}`; }
		}
	;

	context.removeChild(sandbox);

	return dimensions;
}
