/**
 * SettingsEnhancedMeasurementSwitch tests.
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
import {
	act,
	createTestRegistry,
	render,
} from '../../../../../../tests/js/test-utils';
import * as fixtures from '../../../analytics/datastore/__fixtures__';
import * as ga4Fixtures from '../../datastore/__fixtures__';
import { MODULES_ANALYTICS } from '../../../analytics/datastore/constants';
import {
	MODULES_ANALYTICS_4,
	PROPERTY_CREATE,
	WEBDATASTREAM_CREATE,
} from '../../datastore/constants';
import SettingsEnhancedMeasurementSwitch from './SettingsEnhancedMeasurementSwitch';

describe( 'SettingsEnhancedMeasurementSwitch', () => {
	const { accounts } = fixtures.accountsPropertiesProfiles;
	const { properties, webDataStreams } = ga4Fixtures;
	const accountID = accounts[ 0 ].id;
	const propertyID = properties[ 0 ]._id;
	const webDataStreamID = webDataStreams[ 0 ]._id;

	const enhancedMeasurementSettingsMock = {
		fileDownloadsEnabled: null,
		name: `properties/${ propertyID }/dataStreams/${ webDataStreamID }/enhancedMeasurementSettings`,
		outboundClicksEnabled: null,
		pageChangesEnabled: null,
		scrollsEnabled: null,
		searchQueryParameter: 'q,s,search,query,keyword',
		siteSearchEnabled: null,
		streamEnabled: true,
		uriQueryParameter: null,
		videoEngagementEnabled: null,
	};

	let registry;

	function setupRegistry() {
		registry = createTestRegistry();

		registry.dispatch( MODULES_ANALYTICS ).receiveGetSettings( {
			accountID,
		} );

		registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {
			propertyID,
			webDataStreamID,
		} );

		registry.dispatch( MODULES_ANALYTICS ).receiveGetAccounts( accounts );
		registry
			.dispatch( MODULES_ANALYTICS )
			.finishResolution( 'getAccounts', [] );

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.receiveGetProperties( properties, { accountID } );
		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.finishResolution( 'getProperties', [ accountID ] );

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.receiveGetWebDataStreams( webDataStreams, {
				propertyID,
			} );
		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.finishResolution( 'getWebDataStreams', [ propertyID ] );
	}

	beforeEach( () => {
		setupRegistry();

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.receiveGetEnhancedMeasurementSettings(
				enhancedMeasurementSettingsMock,
				{ propertyID, webDataStreamID }
			);
		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.finishResolution( 'getEnhancedMeasurementSettings', [
				propertyID,
				webDataStreamID,
			] );
	} );

	describe.each( [
		[ 'enabled', true ],
		[ 'disabled', false ],
	] )(
		'when enhanced measurement is %s for the web data stream',
		( position, streamEnabled ) => {
			it( `should render correctly, with the switch defaulting to the ${ position } position`, async () => {
				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.setEnhancedMeasurementStreamEnabled(
						propertyID,
						webDataStreamID,
						streamEnabled
					);

				const { container, getByLabelText } = render(
					<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
					{
						registry,
					}
				);

				expect( container ).toMatchSnapshot();

				const switchControl = getByLabelText(
					'Enable enhanced measurement'
				);

				if ( streamEnabled ) {
					expect( switchControl ).toBeChecked();
				} else {
					expect( switchControl ).not.toBeChecked();
				}
			} );
		}
	);

	describe.each( [
		[ 'propertyID', PROPERTY_CREATE ],
		[ 'webDataStreamID', WEBDATASTREAM_CREATE ],
	] )( 'when %s is %s', ( _, settingID, settingCreate ) => {
		it( 'should render correctly, with the switch defaulting to the on position', () => {
			registry
				.dispatch( MODULES_ANALYTICS_4 )
				.setSettings( { [ settingID ]: settingCreate } );

			const { container, getByLabelText } = render(
				<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
				{
					registry,
				}
			);

			expect( container ).toMatchSnapshot();

			const switchControl = getByLabelText(
				'Enable enhanced measurement'
			);

			expect( switchControl ).toBeChecked();
		} );
	} );

	it.each( [
		[
			'enhanced measurement settings is loading',
			() => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.invalidateResolution( 'getEnhancedMeasurementSettings', [
						propertyID,
						webDataStreamID,
					] );
			},
		],
		[
			'properties are loading',
			() => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.invalidateResolution( 'getProperties', [ accountID ] );
			},
		],
		[
			'web data streams are loading',
			() => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.invalidateResolution( 'getWebDataStreams', [
						propertyID,
					] );
			},
		],
	] )(
		'should render correctly, with the switch in the loading state when %s',
		async ( _, setLoadingState ) => {
			setLoadingState();

			const { container, getByRole, waitForRegistry } = render(
				<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
				{
					registry,
				}
			);

			expect( container ).toMatchSnapshot();

			expect( getByRole( 'progressbar' ) ).toBeInTheDocument();

			await act( waitForRegistry );
		}
	);

	it( 'should render correctly, with the switch disabled when hasAnalytics4Access is false', () => {
		const { container, getByLabelText } = render(
			<SettingsEnhancedMeasurementSwitch hasAnalytics4Access={ false } />,
			{ registry }
		);

		expect( container ).toMatchSnapshot();

		expect(
			getByLabelText( 'Enable enhanced measurement' )
		).toHaveAttribute( 'disabled' );
	} );

	it( 'should toggle the switch on click', async () => {
		const { getByLabelText, waitForRegistry } = render(
			<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
			{
				registry,
			}
		);

		const switchControl = getByLabelText( 'Enable enhanced measurement' );

		expect( switchControl ).toBeChecked();

		switchControl.click();

		await act( waitForRegistry );

		expect( switchControl ).not.toBeChecked();
	} );

	it( 'should toggle the streamEnabled setting on click', async () => {
		const { getByLabelText, waitForRegistry } = render(
			<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
			{
				registry,
			}
		);

		const switchControl = getByLabelText( 'Enable enhanced measurement' );

		expect(
			registry
				.select( MODULES_ANALYTICS_4 )
				.isEnhancedMeasurementStreamEnabled(
					propertyID,
					webDataStreamID
				)
		).toBe( true );

		switchControl.click();

		await act( waitForRegistry );

		expect(
			registry
				.select( MODULES_ANALYTICS_4 )
				.isEnhancedMeasurementStreamEnabled(
					propertyID,
					webDataStreamID
				)
		).toBe( false );
	} );

	describe.each( [
		[ 'propertyID', PROPERTY_CREATE ],
		[ 'webDataStreamID', WEBDATASTREAM_CREATE ],
	] )( 'when the %s is changed to %s', ( settingID, settingCreate ) => {
		it( 'should revert the switch from off to on', async () => {
			const { getByLabelText, waitForRegistry } = render(
				<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
				{
					registry,
				}
			);

			const switchControl = getByLabelText(
				'Enable enhanced measurement'
			);

			switchControl.click();

			await act( waitForRegistry );

			expect( switchControl ).not.toBeChecked();

			act( () => {
				registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
					[ settingID ]: settingCreate,
				} );
			} );

			expect( switchControl ).toBeChecked();
		} );

		it( 'should not toggle the switch from on to off', () => {
			const { getByLabelText } = render(
				<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
				{
					registry,
				}
			);

			const switchControl = getByLabelText(
				'Enable enhanced measurement'
			);

			expect( switchControl ).toBeChecked();

			act( () => {
				registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
					[ settingID ]: settingCreate,
				} );
			} );

			expect( switchControl ).toBeChecked();
		} );
	} );

	it( "should set the switch according to the web data stream's streamEnabled value when changing propertyID", async () => {
		registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			propertyID: PROPERTY_CREATE,
		} );

		const { getByLabelText, waitForRegistry } = render(
			<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
			{
				registry,
			}
		);

		const switchControl = getByLabelText( 'Enable enhanced measurement' );

		switchControl.click();

		await act( waitForRegistry );

		expect( switchControl ).not.toBeChecked();

		act( () => {
			registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
				propertyID,
			} );
		} );

		await act( waitForRegistry );

		expect( switchControl ).toBeChecked();
	} );

	it( "should set the switch according to the web data stream's streamEnabled value when changing webDataStreamID", async () => {
		registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			webDataStreamID: WEBDATASTREAM_CREATE,
		} );

		const { getByLabelText, waitForRegistry } = render(
			<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
			{
				registry,
			}
		);

		const switchControl = getByLabelText( 'Enable enhanced measurement' );

		switchControl.click();

		await act( waitForRegistry );

		expect( switchControl ).not.toBeChecked();

		act( () => {
			registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
				webDataStreamID,
			} );
		} );

		await act( waitForRegistry );

		expect( switchControl ).toBeChecked();
	} );

	describe( 'synchronization of enhanced measurement settings retrieval with loading states', () => {
		beforeEach( () => {
			setupRegistry();

			const enhancedMeasurementSettingsEndpoint = new RegExp(
				'^/google-site-kit/v1/modules/analytics-4/data/enhanced-measurement-settings'
			);

			fetchMock.getOnce( enhancedMeasurementSettingsEndpoint, {
				status: 200,
				body: enhancedMeasurementSettingsMock,
			} );
		} );

		it( 'should not attempt to retrieve enhanced measurement settings when properties are loading', async () => {
			registry
				.dispatch( MODULES_ANALYTICS_4 )
				.invalidateResolution( 'getProperties', [ accountID ] );

			const { waitForRegistry } = render(
				<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
				{
					registry,
				}
			);

			await act( waitForRegistry );

			expect( fetchMock ).toHaveFetchedTimes( 0 );
		} );

		it( 'should not attempt to retrieve enhanced measurement settings when web data streams are loading', async () => {
			registry
				.dispatch( MODULES_ANALYTICS_4 )
				.invalidateResolution( 'getWebDataStreams', [ propertyID ] );

			const { waitForRegistry } = render(
				<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
				{
					registry,
				}
			);

			await act( waitForRegistry );

			expect( fetchMock ).toHaveFetchedTimes( 0 );
		} );

		it( 'should retrieve enhanced measurement settings when neither properties or web data streams are loading', async () => {
			const { waitForRegistry } = render(
				<SettingsEnhancedMeasurementSwitch hasAnalytics4Access />,
				{
					registry,
				}
			);

			await act( waitForRegistry );

			expect( fetchMock ).toHaveFetchedTimes( 1 );
		} );
	} );
} );
