/**
 * AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification component.
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
import { useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from 'googlesitekit-components';
import Data from 'googlesitekit-data';
import AnalyticsAdsenseLinkedGraphic from '../../../svg/graphics/analytics-adsense-linked.svg';
import { ANCHOR_ID_MONETIZATION } from '../../googlesitekit/constants';
import { CORE_UI } from '../../googlesitekit/datastore/ui/constants';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useFeature } from '../../hooks/useFeature';
import {
	DATE_RANGE_OFFSET,
	MODULES_ANALYTICS_4,
} from '../../modules/analytics-4/datastore/constants';
import { getContextScrollTop } from '../../util/scroll';
import OverlayNotification from './OverlayNotification';
import { MODULES_ADSENSE } from '../../modules/adsense/datastore/constants';

const { useSelect, useDispatch } = Data;

export const ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION =
	'AnalyticsAndAdSenseLinkedOverlayNotification';

export default function AnalyticsAndAdSenseAccountsDetectedAsLinkedOverlayNotification() {
	const ga4AdSenseIntegration = useFeature( 'ga4AdSenseIntegration' );
	const breakpoint = useBreakpoint();

	const isShowingNotification = useSelect( ( select ) =>
		select( CORE_UI ).isShowingOverlayNotification(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		)
	);

	const { setOverlayNotificationToShow, dismissOverlayNotification } =
		useDispatch( CORE_UI );

	const isDismissed = useSelect( ( select ) =>
		select( CORE_USER ).isItemDismissed(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		)
	);

	const isDismissing = useSelect( ( select ) =>
		select( CORE_USER ).isDismissingItem(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		)
	);

	const analyticsModuleConnected = useSelect( ( select ) => {
		if ( isDismissed ) {
			return null;
		}
		return select( CORE_MODULES ).isModuleConnected( 'analytics-4' );
	} );

	const adSenseModuleConnected = useSelect( ( select ) => {
		if ( isDismissed ) {
			return null;
		}
		return select( CORE_MODULES ).isModuleConnected( 'adsense' );
	} );

	const canViewSharedAnalytics = useSelect( ( select ) => {
		if ( isDismissed ) {
			return null;
		}
		return select( CORE_USER ).hasAccessToShareableModule( 'analytics-4' );
	} );
	const canViewSharedAdSense = useSelect( ( select ) => {
		if ( isDismissed ) {
			return null;
		}
		return select( CORE_USER ).hasAccessToShareableModule( 'adsense' );
	} );

	const isAdSenseLinked = useSelect( ( select ) => {
		if ( isDismissed ) {
			return null;
		}

		return select( MODULES_ANALYTICS_4 ).getAdSenseLinked();
	} );

	const adSenseAccountID = useSelect( ( select ) => {
		if ( adSenseModuleConnected ) {
			return select( MODULES_ADSENSE ).getAccountID();
		}

		return null;
	} );

	const { startDate, endDate } = useSelect( ( select ) =>
		select( CORE_USER ).getDateRangeDates( {
			offsetDays: DATE_RANGE_OFFSET,
		} )
	);

	const args = {
		startDate,
		endDate,
		dimensions: [ 'pagePath', 'adSourceName' ],
		metrics: [ { name: 'totalAdRevenue' } ],
		filter: {
			fieldName: 'adSourceName',
			stringFilter: {
				matchType: 'EXACT',
				value: `Google AdSense account (${ adSenseAccountID })`,
			},
		},
		orderby: [ { metric: { metricName: 'totalAdRevenue' }, desc: true } ],
		limit: 1,
	};

	const data = useSelect( ( select ) => {
		if (
			! isDismissed &&
			isAdSenseLinked &&
			adSenseModuleConnected &&
			analyticsModuleConnected &&
			canViewSharedAdSense &&
			canViewSharedAnalytics
		) {
			return select( MODULES_ANALYTICS_4 ).getReport( args );
		}

		return null;
	} );

	const dataAvailable = !! data?.rows?.length;

	const shouldShowNotification =
		isDismissed === false &&
		ga4AdSenseIntegration &&
		analyticsModuleConnected &&
		adSenseModuleConnected &&
		canViewSharedAnalytics &&
		canViewSharedAdSense &&
		isAdSenseLinked &&
		dataAvailable;

	const dismissNotification = useCallback( () => {
		// Dismiss the notification, which also dismisses it from
		// the current users profile with the `dismissItem` action.
		dismissOverlayNotification(
			ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
		);
	}, [ dismissOverlayNotification ] );

	const scrollToWidget = ( event ) => {
		event.preventDefault();

		const widgetClass = '.googlesitekit-widget--adsenseTopEarningPagesGA4';

		global.history.replaceState( {}, '', `#${ ANCHOR_ID_MONETIZATION }` );
		global.scrollTo( {
			top: getContextScrollTop( widgetClass, breakpoint ),
			behavior: 'smooth',
		} );
	};

	useEffect( () => {
		if ( shouldShowNotification && ! isShowingNotification ) {
			// If the conditions to show this notification are met AND no other
			// notifications are showing, show this notification.
			setOverlayNotificationToShow(
				ANALYTICS_ADSENSE_LINKED_OVERLAY_NOTIFICATION
			);
		}
	}, [
		shouldShowNotification,
		isShowingNotification,
		setOverlayNotificationToShow,
	] );

	if ( ! shouldShowNotification || ! isShowingNotification ) {
		return null;
	}

	return (
		<OverlayNotification animateNotification={ isShowingNotification }>
			<AnalyticsAdsenseLinkedGraphic />

			<div className="googlesitekit-overlay-notification__body">
				<h3>
					{ __( 'See your top earning content', 'google-site-kit' ) }
				</h3>
				<p>
					{ __(
						'Data is now available for the pages that earn the most AdSense revenue.',
						'google-site-kit'
					) }
				</p>
			</div>

			<div className="googlesitekit-overlay-notification__actions">
				<Button
					tertiary
					disabled={ isDismissing }
					onClick={ dismissNotification }
				>
					{ __( 'Maybe later', 'google-site-kit' ) }
				</Button>

				<Button disabled={ isDismissing } onClick={ scrollToWidget }>
					{ __( 'Show me', 'google-site-kit' ) }
				</Button>
			</div>
		</OverlayNotification>
	);
}
