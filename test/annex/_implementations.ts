import * as _arrays from '../../source/arrays.js';
import * as __arrays from '../../dist/arrays.js';

import * as _basic from '../../source/basic.js';
import * as __basic from '../../dist/basic.js';

import * as _conversion from '../../source/conversion.js';
import * as __conversion from '../../dist/conversion.js';

import * as _cookies from '../../source/cookies.js';
import * as __cookies from '../../dist/cookies.js';



let
	arrays:typeof _arrays,
	basic:typeof _basic,
	conversion:typeof _conversion,
	cookies:typeof _cookies
;

if (process.env.SOURCE === 'es5-monolith') {
	await import('../../dist/es5-monolith.js');
	arrays = global.annex.arrays;
	basic = global.annex.basic;
	conversion = global.annex.conversion;
	cookies = global.annex.cookies;
} else if (process.env.SOURCE === 'dist') {
	// @ts-ignore
	arrays = __arrays;
	// @ts-ignore
	basic = __basic;
	// @ts-ignore
	conversion = __conversion;
	// @ts-ignore
	cookies = __cookies;
} else {
	arrays = _arrays;
	basic = _basic;
	conversion = _conversion;
	cookies = _cookies;
}



export {
	arrays,
	basic,
	conversion,
	cookies,
};
