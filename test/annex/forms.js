import test from 'ava';

let pkg;

if( global.__AVA_SOURCE__ === 'es5-monolith' ){
	await import(`../../dist/es5-monolith.js`);
	pkg = global.annex.forms;
} else {
	pkg = await import(`../../${global.__AVA_SOURCE__}/forms.js`);
}

const {
	formDataToObject,
	objectToFormData
} = pkg;



test('formDataToObject', assert => {
	const eForm = document.createElement('form');
	eForm.innerHTML = `
		<div>
			<input type="hidden" name="secret" value="666"/>
		</div>
		<fieldset>
			<legend>Legend</legend>
			<label>Label <input type="text" name="foo" value="oof"/></label>
			<label>Label <input type="checkbox" name="boo" value="1" checked/></label>
			<label><input type="checkbox" name="boo" value="2"/> Label</label>
			<label><input type="checkbox" name="boo[]" value="3"/></label>
			<label><input type="checkbox" name="far[]" value="4"/> Label</label>
			<label><input type="checkbox" name="far[]" value="5"/> Label</label>
			<label>Label <input type="checkbox" name="far" value="6" checked/></label>
			<div>
				<label>
					Label
					<select name="bar">
						<option value=""></option>
						<option value="7">Seven</option>
						<option value="8">Eight</option>
						<option value="9">Nine</option>
					</select>
				</label>
			</div>
			<div>
				<label><input type="radio" name="fooboo" value="10"/> Label</label>
				<label><input type="radio" name="fooboo" value="11"/> Label</label>
				<label>Label <input type="radio" name="fooboo" value="12" checked/></label>
			</div>
		</fieldset>
		<input type="file" name="testfile1"/>
		<input type="file" name="testfile2[]" multiple/>
	`;

	assert.deepEqual(formDataToObject(eForm), {
		secret : '666',
		foo : 'oof',
		boo : '1',
		far : '6',
		bar : '',
		fooboo : '12',
		testfile1 : '',
		testfile2 : ''
	});

	eForm.querySelector('[name="foo"]').value = 'boom';
	eForm.querySelector('[name="boo"][value="1"]').checked = false;
	eForm.querySelector('[name="boo"][value="2"]').checked = true;
	eForm.querySelector('[name="boo[]"][value="3"]').checked = true;
	eForm.querySelector('[name="far[]"][value="4"]').checked = true;
	eForm.querySelector('[name="far"][value="6"]').checked = true;
	eForm.querySelector('[name="bar"]').value = 8;
	eForm.querySelector('[name="fooboo"][value="11"]').checked = true;

	assert.deepEqual(formDataToObject(eForm), {
		secret : '666',
		foo : 'boom',
		boo : ['2', '3'],
		far : ['4', '6'],
		bar : '8',
		fooboo : '11',
		testfile1 : '',
		testfile2 : ''
	});
});



test('objectToFormData', assert => {
	const formData = objectToFormData({
		secret : 666,
		foo : 'oof',
		boo : '1',
		'boo[]' : '2',
		far : '6',
		bar : '',
		fooboo : '12',
		'fooboo[]' : [13, 14],
		htmlblobs : {blob : '<em>IMPORTANT!</em>', name : 'index.html', mimeType : 'text/html'},
		'htmlblobs[]' : {blob : new Blob(['<em>IMPORTANT!</em>'], {type : 'text/html'})},
		txtfile : {file : new File(['Hello World!'], 'hello-world.txt', {type : 'text/plain', lastModified : new Date()})},
		htmlfile : {file : new File(['<em>IMPORTANT!</em>'], 'index.html', {type : 'text/html', lastModified : new Date()}), name : 'important.html'}
	});

	assert.is(formData.get('secret'), '666');
	assert.is(formData.get('foo'), 'oof');
	assert.is(formData.get('boo'), '1');
	assert.deepEqual(formData.getAll('boo'), ['1', '2']);
	assert.is(formData.get('far'), '6');
	assert.deepEqual(formData.getAll('far'), ['6']);
	assert.is(formData.get('bar'), '');
	assert.is(formData.get('fooboo'), '12');
	assert.deepEqual(formData.getAll('fooboo'), ['12', '13', '14']);
	assert.is(formData.get('htmlblobs').type, 'text/html');
	assert.is(formData.get('htmlblobs').name, 'index.html');
	assert.is(formData.getAll('htmlblobs')[1].type, 'text/html');
	assert.is(formData.get('txtfile').name, 'hello-world.txt');
	assert.is(formData.get('txtfile').type, 'text/plain');
	assert.is(formData.get('htmlfile').name, 'important.html');
	assert.is(formData.get('htmlfile').type, 'text/html');

	const formDataObject = formDataToObject(formData);
	assert.is(formDataObject.secret, '666');
	assert.is(formDataObject.foo, 'oof');
	assert.deepEqual(formDataObject.boo, ['1', '2']);
	assert.is(formDataObject.far, '6');
	assert.is(formDataObject.bar, '');
	assert.deepEqual(formDataObject.fooboo, ['12', '13', '14']);
	assert.is(formDataObject.htmlblobs[0].name, 'index.html');
	assert.is(formDataObject.htmlblobs[0].type, 'text/html');
	assert.is(formDataObject.htmlblobs[1].name, 'blob');
	assert.is(formDataObject.htmlblobs[1].type, 'text/html');
	assert.is(formDataObject.txtfile.name, 'hello-world.txt');
	assert.is(formDataObject.txtfile.type, 'text/plain');
	assert.is(formDataObject.htmlfile.name, 'important.html');
	assert.is(formDataObject.htmlfile.type, 'text/html');
});
