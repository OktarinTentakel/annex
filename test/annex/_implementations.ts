import * as _arrays from '../../source/arrays.js';
import * as __arrays from '../../dist/arrays.js';

import * as _basic from '../../source/basic.js';
import * as __basic from '../../dist/basic.js';



let
	arrays:typeof _arrays,
	basic:typeof _basic
;

if (process.env.SOURCE === 'es5-monolith') {
	await import('../../dist/es5-monolith.js');
	arrays = global.annex.arrays;
	basic = global.annex.basic;
} else if (process.env.SOURCE === 'dist') {
	arrays = __arrays;
	// @ts-ignore
	basic = __basic;
} else {
	arrays = _arrays;
	basic = _basic;
}



export {
	arrays,
	basic
};
