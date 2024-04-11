// @ts-check
import prettier from 'eslint-config-prettier';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		rules: {
			'@typescript-eslint/no-use-before-define': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			quotes: ['warn', 'single'],
			'max-len': ['warn', { code: 120, tabWidth: 4, ignoreUrls: true, ignorePattern: '^import|^export' }],
			'newline-per-chained-call': [2, { ignoreChainWithDepth: 3 }],
		},
	},
	{
		files: ['test/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
);
