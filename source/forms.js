/*!
 * Module Forms
 */

/**
 * @namespace Forms
 */

const MODULE_NAME = 'Forms';



//###[ IMPORTS ]########################################################################################################

import {isFunction, isPlainObject, hasValue} from './basic.js';



//###[ EXPORTS ]########################################################################################################

/**
 * @namespace Forms:formDataToObject
 */

/**
 * Constructs a plain object from an existing FormData object or a given form element.
 *
 * The idea of this function is, to make working with form data easier in programmatic contexts by allowing operations
 * like optional chaining and "in" operators. This might especially come in handy if you need to do programmatic
 * validations.
 *
 * Additionally, this function streamlines field names, by discarding PHP-style array field name conventions like
 * "files[]", by removing the brackets. So, if you have a field named "files[]" and another field named "files",
 * both will just end up in one "files"-field, having an array as a value containing all combined values.
 *
 * Keep in mind, that the status of form fields in a form matters when retrieving FormData from a form element.
 * Disabled fields will not be included for example. Make sure to handle this before using the data.
 *
 * On Internet Explorers, this function needs a polyfill, which is not included in annex, due to its size and
 * complexity, since IEs, while supporting FormData basically, are lacking all functions to access values of an existing
 * FormData object, thereby making it impossible to iterate its values.
 *
 * @param {FormData|HTMLFormElement} formDataOrForm - either an existing FormData object or a form, from which we can retrieve formdata
 * @returns {Object} plain object, containing all form values based on the exisiting fields as key/value-pairs
 *
 * @memberof Forms:formDataToObject
 * @alias formDataToObject
 * @see objectToFormData
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
 * @see https://github.com/jimmywarting/FormData
 * @example
 * const formData = new FormData();
 * formData.append('secrethash', 123456789);
 * formData.append('firstname', 'Paul');
 * formData.append('lastname', 'Atreides');
 * formData.append('houses', 'Atreides');
 * formData.append('houses', 'Fremen');
 * formData.append('houses', 'Corrino');
 * formData.append('diary', new File(['Dear Diary, ...'], 'diary.txt', {type : 'text/plain', lastModified : new Date()}));
 * formData.append('instagramPage', new Blob(['<html>...</html>'], {type : 'text/html'}));
 * formDataToObject(formData)
 * =>
 * {
 *   secrethash : '123456789',
 * 	 firstname : 'Paul',
 * 	 lastname : 'Atreides',
 * 	 houses : ['Atreides', 'Fremen', 'Corrino'],
 * 	 diary : File,
 * 	 instagramPage : Blob
 * }
 */
export function formDataToObject(formDataOrForm){
	let formData;

	// let's do duck-typing to allow polyfills
	if(
		isFunction(formDataOrForm.append)
		&& isFunction(formDataOrForm.getAll)
		&& isFunction(formDataOrForm.entries)
	){
		formData = formDataOrForm;
	} else {
		try {
			formData = new FormData(formDataOrForm);
		} catch(ex){
			formData = null;
		}
	}

	if( !hasValue(formData) ) return null;

	const formDataObject = {};

	Array.from(formData.entries()).forEach(([key, values]) => {
		if( key.endsWith('[]') ){
			key = key.slice(0, -2);
		}
		values = [].concat(values);

		if( !hasValue(formDataObject[key]) ){
			formDataObject[key] = (values.length === 1) ? values[0] : values;
		} else {
			formDataObject[key] = [].concat(formDataObject[key], values);
		}
	});

	return formDataObject;
}



/**
 * @namespace Forms:objectToFormData
 */

/**
 * Constructs a FormData object, to be used in requests, from a given (plain) object, iterating its entries.
 *
 * Additionally, this function streamlines field names, by discarding PHP-style array field name conventions like
 * "files[]", by removing the brackets. So, if you have a field named "files[]" and another field named "files",
 * both will just end up in one "files"-field.
 *
 * Files and Blobs can be provided as-is (constructed programmatically of retrieved from file inputs via `.files`).
 * Alternatively (and if you manually want to define the filename), you can provide plain objects to describe a File or
 * Blob to add to the FormData:
 * - use {file : File, ?name : String} to add "file" as a File and optionally set "name" to define a filename, taking
 *   precedence over what is already defined in the File object itself
 * - use {blob : Blob|String, ?name : String, ?mimeType : String} to add "blob" as a Blob (if this is a string, it
 *   will be treated as the content of a new Blob), optionally using "name" as the filename (I'd recommend to set this)
 *   and optionally setting the file type via the MIME type defined in "mimeType".
 *
 * In contrast to `formDataToObject`, this function does not need a polyfill in Internet Explorer, since it only uses
 * the FormData constructor and the `.append()` method, which are both supported.
 *
 * @param {Object} formDataObject - object to iterate, to create FormData based on its entries
 * @returns {FormData} FormData object to be used in a request
 *
 * @memberof Forms:objectToFormData
 * @alias objectToFormData
 * @see formDataToObject
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 * @example
 * const formData = objectToFormData({
 *   secrethash : 123456789,
 * 	 firstname : 'Paul',
 * 	 lastname : 'Atreides',
 * 	 houses : ['Atreides', 'Fremen', 'Corrino'],
 * 	 diary : {file : new File(['Dear Diary, ...'], 'diary.txt', {type : 'text/plain', lastModified : new Date()})},
 * 	 instagramPage : {blob : '<html>...</html>', name : 'instagram.html', mimeType : 'text/html'},
 * }).getAll('houses');
 * => ['Atreides', 'Fremen', 'Corrino']
 */
export function objectToFormData(formDataObject){
	const formData = new FormData();

	Object.entries(formDataObject).forEach(([fieldName, fieldValue]) => {
		if( fieldName.endsWith('[]') ){
			fieldName = fieldName.slice(0, -2);
		}

		[].concat(fieldValue).forEach(fieldValue => {
			if( isPlainObject(fieldValue) ){
				if( hasValue(fieldValue.file) && (fieldValue.file instanceof File) ){
					formData.append(
						fieldName,
						fieldValue.file,
						hasValue(fieldValue.name) ? `${fieldValue.name}` : undefined
					);
				} else if( hasValue(fieldValue.blob) ){
					const blob = (fieldValue.blob instanceof Blob)
						? fieldValue.blob
						: new Blob(
							[`${fieldValue.blob}`],
							hasValue(fieldValue.mimeType) ? {type : `${fieldValue.mimeType}`} : undefined
						)
					;

					formData.append(
						fieldName,
						blob,
						hasValue(fieldValue.name) ? `${fieldValue.name}` : undefined
					);
				} else {
					formData.append(fieldName, `${fieldValue}`);
				}
			} else {
				formData.append(fieldName, fieldValue);
			}
		});
	});

	return formData;
}
