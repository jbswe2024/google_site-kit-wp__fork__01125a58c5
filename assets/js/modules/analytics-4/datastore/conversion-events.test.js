/**
 * `modules/analytics-4` data store: coversion events tests.
 *
 * Site Kit by Google, Copyright 2023 Google LLC
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
 * Internal dependencies
 */
import API from 'googlesitekit-api';
import { MODULES_ANALYTICS_4 } from './constants';
import {
	createTestRegistry,
	subscribeUntil,
	unsubscribeFromAll,
} from '../../../../../tests/js/utils';
import * as fixtures from './__fixtures__';

describe( 'modules/analytics-4 conversion-events', () => {
	let registry;

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		registry = createTestRegistry();
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	describe( 'selectors', () => {
		describe( 'getConversionEvents', () => {
			const propertyID = '567829876';

			it( 'uses a resolver to make a network request', async () => {
				fetchMock.getOnce(
					new RegExp(
						'^/google-site-kit/v1/modules/analytics-4/data/conversion-events'
					),
					{ body: fixtures.conversionEvents, status: 200 }
				);

				const initialConversionEvents = registry
					.select( MODULES_ANALYTICS_4 )
					.getConversionEvents( propertyID );

				expect( initialConversionEvents ).toBeUndefined();

				const conversionEvents = await registry
					.__experimentalResolveSelect( MODULES_ANALYTICS_4 )
					.getConversionEvents( propertyID );

				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( conversionEvents ).toEqual( fixtures.conversionEvents );
			} );

			it( 'does not make a network request if conversion events for the given propertyID are already present', async () => {
				// Load data into this store so there are matches for the data we're about to select,
				// even though the selector hasn't fulfilled yet.
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetConversionEvents( fixtures.conversionEvents, {
						propertyID,
					} );

				const conversionEvents = registry
					.select( MODULES_ANALYTICS_4 )
					.getConversionEvents( propertyID );

				await subscribeUntil( registry, () =>
					registry
						.select( MODULES_ANALYTICS_4 )
						.hasFinishedResolution( 'getConversionEvents', [
							propertyID,
						] )
				);

				expect( fetchMock ).not.toHaveFetched();
				expect( conversionEvents ).toEqual( fixtures.conversionEvents );
			} );

			it( 'dispatches an error if the request fails', async () => {
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};

				fetchMock.getOnce(
					new RegExp(
						'^/google-site-kit/v1/modules/analytics-4/data/conversion-events'
					),
					{ body: response, status: 500 }
				);

				await registry
					.__experimentalResolveSelect( MODULES_ANALYTICS_4 )
					.getConversionEvents( propertyID );

				expect( fetchMock ).toHaveFetchedTimes( 1 );

				const conversionEvents = registry
					.select( MODULES_ANALYTICS_4 )
					.getConversionEvents( propertyID );
				expect( conversionEvents ).toBeUndefined();
				expect( console ).toHaveErrored();
			} );
		} );
	} );
} );
