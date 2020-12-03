/**
 * ESLint rules: consecutive newline tests.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import { RuleTester } from 'eslint';

/**
 * Internal dependencies
 */
import rule from './jsdoc-newlines';

const ruleTester = new RuleTester( {
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 6,
	},
} );

ruleTester.run( 'jsdoc-newlines', rule, {
	valid: [
		{
			code: `
/**
 * A function that returns a string, to test out ESLint.
 *
 * @since 1.7.1
 * @private
 *
 * @param {?Object}   props          Component props.
 * @return {string} A test string.
 */
export function exampleTestFunction( props ) {
	return 'test';
}
      `,
		},
		{
			code: `
/**
 * A function without a second group, that ends with a "private" tag.
 *
 * @since 1.7.1
 * @private
 */
export function exampleTestFunction( props ) {
	return 'test';
}
      `,
		},
	],
	invalid: [
		{
			code: `
/**
 * A function that returns a string, to test out ESLint.
 *
 * @since 1.7.1
 * @private
 *
 *
 * @param {?Object}   props          Component props.
 * @return {string} A test string.
 */
export function exampleTestFunction( props ) {
	return 'test';
}
      `,
			errors: [
				{
					message:
						'There should not be more than one consecutive newline in a JSDoc block.',
				},
			],
		},
		{
			code: `
/**
 * A function that returns a string, to test out ESLint.
 *
 * @since 1.7.1
 * @private
 *
 *
 * @return {string} A test string.
 */
export function exampleTestFunction() {
	return 'test';
}
      `,
			errors: [
				{
					message:
						'There should not be more than one consecutive newline in a JSDoc block.',
				},
			],
		},
		{
			code: `
/**
 * A function that returns a string, to test out ESLint.
 *
 * @since 1.7.1
 *
 *
 * @private
 */
export function exampleTestFunction( props ) {
	return 'test';
}
      `,
			errors: [
				{
					message:
						'There should not be more than one consecutive newline in a JSDoc block.',
				},
			],
		},
		{
			code: `
/**
 * Test function for ESLint.
 *
 *
 * @since asdfsdf something happened
 * @since 1.9.2 Whatever times
 * @since 1.1.2 whatever times.
 * @since
 * @deprecated use at your own risk
 *
 *
 * @private
 *
 * @param {Object} buz A parameter.
 *
 *
 * @param {null}   qux Q stuff.
 *
 * @return {string} Something.
 */
export function isCoolFunctionDoingStuff( buz, qux ) {
	const foo = buz + qux;

	return foo;
}
      `,
			errors: [
				{
					message: 'There should not be an empty line between @param and @return.',
				},
				{
					message:
						'There should not be more than one consecutive newline in a JSDoc block.',
				},
			],
		},
		{
			code: `
/**
 * A function that returns a string, to test out ESLint.
 *
 * @since 1.7.1
 *
 * @private
 *
 * @param {?Object}   props          Component props.
 *
 * @return {string} A test string.
 */
export function exampleTestFunction( props ) {
	return 'test';
}
      `,
			errors: [
				{
					message:
						'There should not be an empty line between @since and @private.',
				},
				{
					message:
						'There should not be an empty line between @param and @return.',
				},
			],
		},
		{
			code: `
/**
 * A function that returns a string, to test out ESLint.
 *
 * @since 1.7.1
 * @private
 *
 * @param {?Object}   props          Component props.
 *
 * @param {?Object}   moreProps      Extra props.
 * @return {string} A test string.
 */
export function exampleTestFunction( props, moreProps ) {
	return 'test';
}
      `,
			errors: [
				{
					message:
						'There should not be an empty line between @param and @param.',
				},
			],
		},
	],
} );
