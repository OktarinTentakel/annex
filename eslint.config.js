import js from '@eslint/js';
import html from 'eslint-plugin-html';



export default [
	js.configs.recommended,
	{
		languageOptions : {
			ecmaVersion : 2023,
			sourceType : 'module',
			globals : {
				globalThis : 'readonly',
				console : 'readonly',
				process : 'readonly',
			},
		},
		rules : {
			'no-var': 'error',
			'no-unused-vars' : 'warn',
			'no-useless-assignment' : 'warn',
			'no-eval' : 'off',
			'no-loop-func' : 'off',
			'no-console' : 'off',
			'no-extra-boolean-cast' : 'off',
		},
	},
	{
		files : ["**/*.html"],
		plugins : {html},
		languageOptions : {
			ecmaVersion : 2023,
			sourceType : 'script',
			globals : {
				window : 'readonly',
				console : 'readonly',
			},
		},
		rules : {
			'no-var': 'warn',
			'no-unused-vars' : 'warn',
			'no-useless-assignment' : 'warn',
			'no-console' : 'off',
		},
	},
];
