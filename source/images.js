/*!
 * Module Images
 */

/**
 * @namespace Images
 */

const MODULE_NAME = 'Images';



//###[ IMPORTS ]########################################################################################################

import {orDefault, isA, isPlainObject, assert, isEmpty, hasValue, Deferred} from './basic.js';
import {waitForRepaint} from './timers.js';



//###[ DATA ]###########################################################################################################

const PRELOADED_IMAGES = {
	unnamed : [],
	named : {}
};



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Images:preload
 */

/**
 * Preloads images by URL, so that subsequent usages are served from browser cache.
 * Images can be preloaded anonymously or with a given name. So you can either just use the url again,
 * or, to be super-sure, call the method again, with just the image name to get the preloaded image itself.
 *
 * The function returns a Deferred, which resolves, after the images have loaded, with either an array of preloaded
 * images or a single image, if only one has been defined. The Deferred contains all images newly created for
 * preloading on the provision property before the Deferred resolves.
 *
 * @param {(String|String[]|Object.<String, String>)} images - a URL, an array of URLs or a plain object containing named URLs. In case the string is an already used name, the image object from the named preloaded images cache is returned.
 * @returns {Deferred<Image|Image[]>|Image} either a Deferred, resolving after images are preloaded, or a requested cached image
 *
 * @memberof Images:preload
 * @alias preload
 * @example
 * preload([url1, url2, url3]).then(images => { alert(`loaded ${images.length} images`); });
 * const provisionalImage preload({name1 : url1, name2 : url2}}).provision.name1;
 * const preloadedImage = preload('name1');
 */
export function preload(images){
	const
		preloadedImages = [],
		deferred = new Deferred()
	;
	let newImages;

	if( !isPlainObject(images) && !isA(images, 'array') ){
		images = `${images}`;

		if( hasValue(PRELOADED_IMAGES.named[images]) ){
			return PRELOADED_IMAGES.named[images];
		} else {
			images = [images];
		}
	}

	if( isPlainObject(images) ){
		newImages = {};

		Object.entries(images).forEach(([key, value]) => {
			key = `${key}`;
			value = `${value}`;

			if( !hasValue(PRELOADED_IMAGES.named[key]) ){
				newImages[key] = new Image();
				newImages[key].src = value;
				preloadedImages.push(newImages[key]);
			}
		});

		PRELOADED_IMAGES.named = {...PRELOADED_IMAGES.named, ...newImages};
	} else if( isA(images, 'array') ){
		newImages = [];

		images.forEach(value => {
			const newImage = new Image();
			newImage.src = `${value}`;
			newImages.push(newImage);
			preloadedImages.push(newImage);
		});

		PRELOADED_IMAGES.unnamed = Array.from(new Set(PRELOADED_IMAGES.unnamed.concat(newImages)));
	}

	deferred.provision = (isA(newImages, 'array') && (newImages.length === 1)) ? newImages[0] : newImages;
	loaded(preloadedImages)
		.then(deferred.resolve)
		.catch(deferred.reject)
	;

	return deferred;
}



/**
 * @namespace Images:loaded
 */

/**
 * Fixes problems with image "load" events and fires the event even in case the image is already loaded or served from
 * browser cache. So repeated calls to this method on the same loaded image will actually work.
 *
 * Also supports imgs inside picture elements, while automatically handling the polyfills respimage and picturefill if
 * present in window. Make sure to apply this method to the img _inside_ the picture and _not_ on the picture itself!
 *
 * Define "dimensionsNeeded" if your definition of "loaded" includes, that the loaded image should already have usable
 * image dimensions for layouting. Use this, if you need to do calculations based on image dimensions after load.
 * Dimensions are determined using the images "naturalWidth".
 *
 * The function returns a Deferred, which resolves, after the images have loaded, with either an array of loaded
 * images or a single image, if only one has been defined. The Deferred contains all initially given images on the
 * provision property before the Deferred resolves.
 *
 * @param {Image|Array<Image>} images - an image or an array of images
 * @param {?Boolean} [dimensionsNeeded=false] - tells the check if we expect the loaded image to have readable dimensions
 * @returns {Deferred<Image|Image[]>} a Deferred, resolving after all given images have loaded
 *
 * @memberof Images:loaded
 * @alias loaded
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalWidth
 * @example
 * loaded(image).then(image => { image.classList.remove('hidden'); });
 * loaded([image1, image2, image3]).then(images => { alert(`all ${images.length} images have loaded`); })
 */
export function loaded(images, dimensionsNeeded=false){
	const __methodName__ = 'loaded';

	images = orDefault(images, [], 'arr').filter(image => {
		return Object.prototype.toString.call(image).slice(8, -1).toLowerCase() === 'htmlimageelement';
	});
	dimensionsNeeded = orDefault(dimensionsNeeded, false, 'bool');

	function onLoad(e){
		const image = e.currentTarget;
		if( !dimensionsNeeded || (dimensionsNeeded && (image.naturalWidth > 0)) ){
			loadCount--;
			if( loadCount <= 0 ){
				images.map(image => {
					image.removeEventListener('load', onLoad);
					image.removeEventListener('error', onError);
				});
				loaderImages.map(image => {
					image.removeEventListener('load', onLoad);
					image.removeEventListener('error', onError);
				});
				deferred.resolve((images.length === 1) ? images[0] : images);
			}
		} else {
			waitForRepaint(() => { onLoad(e); });
		}
	}

	function onError(error){
		images.map(image => {
			image.removeEventListener('load', onLoad);
			image.removeEventListener('error', onError);
		});
		loaderImages.map(image => {
			image.removeEventListener('load', onLoad);
			image.removeEventListener('error', onError);
		});
		deferred.reject(error);
	}

	const
		deferred = new Deferred(),
		loaderImages = []
	;
	let loadCount = images.length;

	deferred.provision = (images.length === 1) ? images[0] : images;
	images.forEach(image => {
		image.removeEventListener('load', onLoad);
		image.addEventListener('load', onLoad);
		image.removeEventListener('error', onError);
		image.addEventListener('error', onError);

		const
			src = image.src,
			parent = image.parentNode,
			isPicture = isA(image.parentNode, 'htmlelement') ? (parent.nodeName.toLowerCase() === 'picture') : false
		;

		assert(!isEmpty(src), `${MODULE_NAME}:${__methodName__} | image has no src`);

		if( isPicture || !!image.complete ){
			let img;

			if( isPicture ){
				if( window.respimage ){
					window.respimage({elements : [parent]});
					img = parent.querySelector('img');
				} else if( window.picturefill ){
					window.picturefill({elements : [parent]});
					img = parent.querySelector('img');
				} else {
					img = image;
				}

				if( !!img.complete ){
					img = new Image();
					img.addEventListener('load', onLoad);
					img.addEventListener('error', onError);
					img.src = src;
					loaderImages.push(img);
				} else {
					img.removeEventListener('load', onLoad);
					img.addEventListener('load', onLoad);
					img.removeEventListener('error', onError);
					img.addEventListener('error', onError);
				}
			} else {
				img = new Image();
				img.addEventListener('load', onLoad);
				img.addEventListener('error', onError);
				img.src = src;
				loaderImages.push(img);
			}
		}
	});

	return deferred;
}
