import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import tailwind from 'eslint-plugin-tailwindcss'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import nextVitals from 'eslint-config-next/core-web-vitals' // Для Next.js
import nextTs from 'eslint-config-next/typescript' // Для TS

export default defineConfig(
	{ ignores: ['dist', '.next', 'node_modules', 'build'] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	...tailwind.configs['flat/recommended'],
	...nextVitals,
	...nextTs,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parser: tseslint.parser,
			sourceType: 'module'
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			prettier: prettierPlugin
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true }
			],
			'prettier/prettier': 'error',
			'tailwindcss/classnames-order': 'off', // Избежать конфликта с Prettier
			'tailwindcss/no-custom-classname': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	prettierRecommended,
	eslintConfigPrettier
)
