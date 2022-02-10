import test from 'ava';
import path from 'path';
import express from 'express';
import cors from 'cors';
import serveStatic from 'serve-static';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.dynamicLoading;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/dynamic-loading.js`);
}

const {
	createFetchRequest,
	createJsonRequest,
	createJsRequest,
	createCssRequest,
	createHtmlRequest
} = pkg;



test.before(assert => {
	return new Promise(resolve => {
		const server = express();
		server.use(cors());
		server.use(serveStatic(path.resolve(process.cwd(), './test/assets')));
		assert.context.server = server.listen(3000, () => { resolve(); });
	});
});



test.after(assert => {
	return new Promise(resolve => {
		assert.context.server.close(() => { resolve(); });
	});
});



test.serial('createFetchRequest', assert => {
	return new Promise(function(resolve, reject){
		let endCount = 0;
		function end(error){
			endCount++;

			if( error ){
				reject(error);
			} else if( endCount === 7 ){
				resolve();
			}
		}

		createFetchRequest('https://jsonplaceholder.typicode.com/posts/1').execute()
			.then(response => {
				return response.json();
			})
			.then(post => {
				assert.truthy(post.id);
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createFetchRequest('https://jsonplaceholder.typicode.com/posts', {
			method : 'POST',
			body : JSON.stringify({
				title : 'foo',
				body : 'bar',
				userId : 1,
			}),
			headers: {
				'Content-type' : 'application/json; charset=UTF-8',
			}
		}).execute()
			.then(function(response){
				return response.json();
			})
			.then(function(post){
				assert.is(post.title, 'foo');
				assert.is(post.userId, 1);
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createFetchRequest('https://jsonplaceholder.typicode.com/posts/1', {
			method : 'PATCH',
			body : JSON.stringify({
				title : 'foo',
			}),
			headers : {
				'Content-type' : 'application/json; charset=UTF-8',
			}
		}).execute()
			.then(function(response){
				return response.json();
			})
			.then(function(post){
				assert.is(post.title, 'foo');
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createFetchRequest('https://jsonplaceholder.typicode.com/posts/1', {
			method : 'DELETE'
		}).execute()
			.then(function(response){
				return response.json();
			})
			.then(function(post){
				assert.is(Object.keys(post).length, 0);
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createFetchRequest('https://jsonplaceholder.typicode.com/posts/1').execute()
			.then(function(response){
				return response.text();
			})
			.then(function(post){
				assert.true(post.length > 0);
				end();
			})
			.catch(error => {
				end(error);
			})
		;


		createFetchRequest('http://localhost:3000/img/annex.png').execute()
			.then(function(response){
				assert.true(response.ok);
				assert.is(response.status, 200);
				return response.blob();
			})
			.then(function(image){
				assert.true(image.type !== undefined);
				assert.true(image.size > 0);
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createFetchRequest('http://localhost:3000/img/404.png').execute()
			.then(function(response){
				assert.false(response.ok);
				assert.is(response.status, 404);
				return response.blob();
			})
			.then(function(image){
				assert.true(image.type !== undefined);
				end();
			})
			.catch(error => {
				end(error);
			})
		;
	});
});



test.serial('createJsonRequest', assert => {
	return new Promise(function(resolve, reject){
		let endCount = 0;
		function end(error){
			endCount++;

			if( error ){
				reject(error);
			} else if( endCount === 4 ){
				while( document.body.firstChild ){
					document.body.removeChild(document.body.firstChild);
				}
				resolve();
			}
		}

		createJsonRequest('https://jsonplaceholder.typicode.com/posts/1')
			.execute()
			.then(json => {
				assert.is(typeof json, 'object');
				assert.truthy(json.id);
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createJsonRequest('https://jsonplaceholder.typicode.com/posts/2')
			.execute('element', document.body, 'request-2')
			.then(jsonElement => {
				assert.is(jsonElement.type, 'application/json');
				assert.is(Object.prototype.toString.call(jsonElement).slice(8, -1), 'HTMLScriptElement');
				assert.true(document.body.querySelectorAll('[data-id="request-2"]').length > 0);

				createJsonRequest('https://jsonplaceholder.typicode.com/posts/3')
					.execute('raw', {element : document.body, position : 'prepend'}, 'request-3')
					.then(rawJson => {
						const element = document.body.querySelector('[data-id="request-3"]');

						assert.is(typeof rawJson, 'string');
						assert.true(document.body.querySelectorAll('[data-id="request-3"]').length > 0);
						assert.is(element.nextElementSibling.getAttribute('data-id'), 'request-2');

						createJsonRequest('https://jsonplaceholder.typicode.com/posts/4')
							.execute(null, {element, position : 'beforebegin'}, 'request-4')
							.then(json => {
								assert.is(typeof json, 'object');
								assert.true(document.body.querySelectorAll('[data-id="request-4"]').length > 0);
								assert.is(
									document.body.querySelector('[data-id="request-4"]').nextElementSibling.getAttribute('data-id'),
									'request-3'
								);
								end();
							})
							.catch(error => {
								end(error);
							})
						;

						end();
					})
					.catch(error => {
						end(error);
					})
				;

				end();
			})
			.catch(error => {
				end(error);
			})
		;
	});
});



test.serial('createJsRequest', assert => {
	return new Promise(function(resolve, reject){
		let endCount = 0;
		function end(error){
			endCount++;
			if( error ){
				reject(error);
			} else if( endCount === 4 ){
				while( document.body.firstChild ){
					document.body.removeChild(document.body.firstChild);
				}

				// we have to defer the end of the test since, for some reason resource requests are being run
				// after inserting sourced elements although nothing is really loaded and load handlers won't fire
				window.setTimeout(() => {
					resolve();
				}, 1000);
			}
		}

		let now = new Date();

		createJsRequest('http://localhost:3000/js/dynamic-loading-test.js')
			.execute()
			.then(function(jsElement){
				assert.is(jsElement.tagName.toLowerCase(), 'script');
				assert.is(Object.prototype.toString.call(jsElement).slice(8, -1), 'HTMLScriptElement');
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createJsRequest('http://localhost:3000/js/dynamic-loading-test.js')
			.execute(null, document.body, 'request-2')
			.then(jsElement => {
				assert.is(jsElement.tagName.toLowerCase(), 'script');
				assert.is(Object.prototype.toString.call(jsElement).slice(8, -1), 'HTMLScriptElement');
				assert.true(document.body.querySelectorAll('[data-id="request-2"]').length > 0);

				eval(jsElement.textContent);
				assert.true(now.getTime() < window.TEST_DYNAMIC_LOADING_LAST_EXECUTION.getTime());
				now = window.TEST_DYNAMIC_LOADING_LAST_EXECUTION;

				createJsRequest('http://localhost:3000/js/dynamic-loading-test.js')
					.execute('raw', {element : document.body, position : 'prepend'}, 'request-3')
					.then(rawJs => {
						const element = document.body.querySelector('[data-id="request-3"]');
						assert.is(typeof rawJs, 'string');
						assert.true(document.body.querySelectorAll('[data-id="request-3"]').length > 0);
						assert.is(element.nextElementSibling.getAttribute('data-id'), 'request-2');

						eval(rawJs);
						assert.true(now.getTime() < window.TEST_DYNAMIC_LOADING_LAST_EXECUTION.getTime());
						now = window.TEST_DYNAMIC_LOADING_LAST_EXECUTION;

						createJsRequest('http://localhost:3000/js/dynamic-loading-test.js')
							.execute('sourced-element', {element, position : 'beforebegin'}, 'request-4', true)
							.then(jsElement => {
								assert.is(jsElement.tagName.toLowerCase(), 'script');
								assert.is(Object.prototype.toString.call(jsElement).slice(8, -1), 'HTMLScriptElement');
								assert.true(document.body.querySelectorAll('[data-id="request-4"]').length > 0);
								assert.is(
									document.body.querySelector('[data-id="request-4"]').nextElementSibling.getAttribute('data-id'),
									'request-3'
								);

								end();
							})
							.catch(error => {
								end(error);
							})
						;

						end();
					})
					.catch(error => {
						end(error);
					})
				;

				end();
			})
			.catch(error => {
				end(error);
			})
		;
	});
});



test.serial('createCssRequest', assert => {
	return new Promise(function(resolve, reject){
		let endCount = 0;
		function end(error){
			endCount++;
			if( error ){
				reject(error);
			} else if( endCount === 4 ){
				while( document.body.firstChild ){
					document.body.removeChild(document.body.firstChild);
				}

				// we have to defer the end of the test since, for some reason resource requests are being run
				// after inserting sourced elements although nothing is really loaded and load handlers won't fire
				window.setTimeout(() => {
					resolve();
				}, 1000);
			}
		}

		createCssRequest('http://localhost:3000/css/dynamic-loading-test.css')
			.execute()
			.then(function(cssElement){
				assert.is(cssElement.tagName.toLowerCase(), 'style');
				assert.is(Object.prototype.toString.call(cssElement).slice(8, -1), 'HTMLStyleElement');
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createCssRequest('http://localhost:3000/css/dynamic-loading-test.css')
			.execute(null, document.body, 'request-2')
			.then(cssElement => {
				assert.is(cssElement.tagName.toLowerCase(), 'style');
				assert.is(Object.prototype.toString.call(cssElement).slice(8, -1), 'HTMLStyleElement');
				assert.true(document.body.querySelectorAll('[data-id="request-2"]').length > 0);
				assert.is(cssElement.textContent, 'h3 {color: pink;}\n');

				createCssRequest('http://localhost:3000/css/dynamic-loading-test.css')
					.execute('raw', {element : document.body, position : 'prepend'}, 'request-3')
					.then(rawCss => {
						const element = document.body.querySelector('[data-id="request-3"]');
						assert.is(typeof rawCss, 'string');
						assert.true(document.body.querySelectorAll('[data-id="request-3"]').length > 0);
						assert.is(element.nextElementSibling.getAttribute('data-id'), 'request-2');
						assert.is(rawCss, 'h3 {color: pink;}\n');

						createCssRequest('http://localhost:3000/css/dynamic-loading-test.css')
							.execute('sourced-element', {element, position : 'beforebegin'}, 'request-4', 'screen', true)
							.then(cssElement => {
								assert.is(cssElement.tagName.toLowerCase(), 'link');
								assert.is(Object.prototype.toString.call(cssElement).slice(8, -1), 'HTMLLinkElement');
								assert.is(cssElement.getAttribute('rel'), 'stylesheet');
								assert.is(cssElement.getAttribute('media'), 'screen');
								assert.true(document.body.querySelectorAll('[data-id="request-4"]').length > 0);
								assert.is(
									document.body.querySelector('[data-id="request-4"]').nextElementSibling.getAttribute('data-id'),
									'request-3'
								);

								end();
							})
							.catch(error => {
								end(error);
							})
						;

						end();
					})
					.catch(error => {
						end(error);
					})
				;

				end();
			})
			.catch(error => {
				end(error);
			})
		;
	});
});



test.serial('createHtmlRequest', assert => {
	return new Promise(function(resolve, reject){
		let endCount = 0;
		function end(error){
			endCount++;
			if( error ){
				reject(error);
			} else if( endCount === 5 ){
				while( document.body.firstChild ){
					document.body.removeChild(document.body.firstChild);
				}

				// we have to defer the end of the test since, for some reason resource requests are being run
				// after inserting sourced elements although nothing is really loaded and load handlers won't fire
				window.setTimeout(() => {
					resolve();
				}, 1000);
			}
		}

		createHtmlRequest('http://localhost:3000/html/dynamic-loading-test-1.html')
			.execute('raw', null, 'request-1')
			.then(function(rawHtml){
				assert.true(rawHtml.startsWith('<!DOCTYPE html>'));
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createHtmlRequest('http://localhost:3000/html/dynamic-loading-test-1.html')
			.execute()
			.then(function(htmlElement){
				assert.is(htmlElement.tagName.toLowerCase(), 'html');
				assert.is(Object.prototype.toString.call(htmlElement).slice(8, -1), 'HTMLHtmlElement');
				end();
			})
			.catch(error => {
				end(error);
			})
		;

		createHtmlRequest('http://localhost:3000/html/dynamic-loading-test-1.html')
			.execute(null, document.body, 'request-3', 'body > main > h1')
			.then(htmlElement => {
				assert.is(htmlElement.tagName.toLowerCase(), 'h1');
				assert.is(Object.prototype.toString.call(htmlElement).slice(8, -1), 'HTMLHeadingElement');
				assert.true(document.body.querySelectorAll('[data-id="request-3"]').length > 0);
				assert.is(htmlElement.outerHTML, '<h1 data-id="request-3">Lorem Ipsum</h1>');

				createHtmlRequest('http://localhost:3000/html/dynamic-loading-test-1.html')
					.execute('raw', {element : document.body, position : 'prepend'}, 'request-4', 'h1 ~ p', true)
					.then(rawHtml => {
						const element = document.body.querySelectorAll('[data-id="request-4"]')[1];
						assert.is(typeof rawHtml, 'string');
						assert.true(document.body.querySelectorAll('[data-id="request-4"]').length > 0);
						assert.is(element.nextElementSibling.getAttribute('data-id'), 'request-3');
						assert.is(rawHtml, '<p>dolor sit amet</p><p>foobar baz foo</p>');

						createHtmlRequest('http://localhost:3000/html/dynamic-loading-test-2.html')
							.execute('element', {element, position : 'beforebegin'}, 'request-5')
							.then(htmlElements => {
								assert.is(htmlElements[0].tagName.toLowerCase(), 'h1');
								assert.is(htmlElements[1].tagName.toLowerCase(), 'p');
								assert.is(Object.prototype.toString.call(htmlElements[0]).slice(8, -1), 'HTMLHeadingElement');
								assert.true(document.body.querySelectorAll('[data-id="request-5"]').length > 0);
								assert.is(
									document.body.querySelectorAll('[data-id="request-5"]')[2].nextElementSibling.getAttribute('data-id'),
									'request-4'
								);

								end();
							})
							.catch(error => {
								end(error);
							})
						;

						end();
					})
					.catch(error => {
						end(error);
					})
				;

				end();
			})
			.catch(error => {
				end(error);
			})
		;
	});
});
