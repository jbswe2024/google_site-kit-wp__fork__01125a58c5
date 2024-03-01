/**
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
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import { MODULES_ANALYTICS } from '../../modules/analytics/datastore/constants';
import { Grid, Cell, Row } from '../../material-components';
import Badge from '../../components/Badge';
import ConsentModeSwitch from '../consent-mode/ConsentModeSwitch';
import WPConsentAPIRequirements from '../consent-mode/WPConsentAPIRequirements';
import Layout from '../layout/Layout';
import SettingsNotice, { TYPE_INFO } from '../SettingsNotice';

const { useSelect } = Data;

export default function SettingsCardConsentMode() {
	const isAdsConnected = useSelect( ( select ) =>
		// TODO: Replace this with the `analytics-4` or `ads` version of the `getAdsConversionID()` selector once it's migrated.
		select( MODULES_ANALYTICS ).getAdsConversionID()
	);

	const consentAPIInfo = useSelect( ( select ) =>
		select( CORE_SITE ).getConsentAPIInfo()
	);

	return (
		<Layout
			title={ __( 'Consent Mode', 'google-site-kit' ) }
			badge={
				isAdsConnected ? (
					<Badge
						className="googlesitekit-badge--primary"
						label={ __( 'Recommended', 'google-site-kit' ) }
					/>
				) : null
			}
			header
			rounded
		>
			<div className="googlesitekit-settings-module googlesitekit-settings-module--active googlesitekit-settings-consent-mode">
				<Grid>
					<Row>
						<Cell size={ 12 }>
							<ConsentModeSwitch />
						</Cell>
					</Row>
					{ consentAPIInfo?.hasConsentAPI && isAdsConnected && (
						<Row>
							<Cell size={ 12 }>
								<SettingsNotice
									className="googlesitekit-settings-consent-mode__recommendation-notice"
									type={ TYPE_INFO }
									notice={ __(
										'If you have Google Ads campaigns for this site, it’s highly recommended to enable Consent mode - otherwise you won’t be able to collect any metrics on the effectiveness of your campaigns in regions like the European Economic Area.',
										'google-site-kit'
									) }
								/>
							</Cell>
						</Row>
					) }
					{ !! consentAPIInfo && ! consentAPIInfo.hasConsentAPI && (
						<Row>
							<Cell size={ 12 }>
								<WPConsentAPIRequirements />
							</Cell>
						</Row>
					) }
				</Grid>
			</div>
		</Layout>
	);
}
