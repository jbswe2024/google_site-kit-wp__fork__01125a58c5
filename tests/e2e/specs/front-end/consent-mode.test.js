/**
 * Consent Mode test.
 *
 * Site Kit by Google, Copyright 2024 Google LLC
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
 * WordPress dependencies
 */
import { activatePlugin, createURL } from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	setSiteVerification,
	setSearchConsoleProperty,
	enableFeature,
	wpApiFetch,
} from '../../utils';

const eeaRegions = [
	'AT',
	'BE',
	'BG',
	'CH',
	'CY',
	'CZ',
	'DE',
	'DK',
	'EE',
	'ES',
	'FI',
	'FR',
	'GR',
	'HR',
	'HU',
	'IE',
	'IS',
	'IT',
	'LI',
	'LT',
	'LU',
	'LV',
	'MT',
	'NL',
	'NO',
	'PL',
	'PT',
	'RO',
	'SE',
	'SI',
	'SK',
	'UK',
];

describe( 'Consent Mode snippet', () => {
	beforeAll( async () => {
		await activatePlugin( 'e2e-tests-proxy-auth-plugin' );
		await setSiteVerification();
		await setSearchConsoleProperty();
		await enableFeature( 'consentMode' );
		await wpApiFetch( {
			path: 'google-site-kit/v1/core/site/data/consent-mode',
			method: 'post',
			data: { data: { settings: { enabled: true } } },
		} );
	} );

	beforeEach( async () => {
		await page.goto( createURL( '/hello-world' ), { waitUntil: 'load' } );
	} );

	it( 'configures the Consent Mode defaults', async () => {
		const dataLayer = await page.evaluate( () => window.dataLayer );

		expect( dataLayer ).toEqual( [
			{
				0: 'consent',
				1: 'default',
				2: {
					ad_personalization: 'denied',
					ad_storage: 'denied',
					ad_user_data: 'denied',
					analytics_storage: 'denied',
					regions: eeaRegions,
				},
			},
		] );
	} );
} );
