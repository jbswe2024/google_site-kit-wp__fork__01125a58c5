/**
 * DashboardIdeasWidget component tests.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
import DashboardIdeasWidget from './index';
import { render, fireEvent, createTestRegistry, provideModules, WithTestRegistry } from '../../../../../../../tests/js/test-utils';

describe( 'Idea Hub', () => {
	let registry;

	beforeEach( () => {
		global.location.hash = '';
		registry = createTestRegistry();

		provideModules( registry, [ {
			slug: 'idea-hub',
			active: true,
			connected: true,
		} ] );
	} );

	it.each( [
		[
			'should change location hash & DOM correctly when the New ideas tab is clicked',
			'New',
			'#new-ideas',
		],
		[
			'should change location hash & DOM correctly when the Saved ideas tab is clicked',
			'Saved',
			'#saved-ideas',
		],
		[
			'should change location hash & DOM correctly when the Draft ideas tab is clicked',
			'Drafts',
			'#draft-ideas',
		],
	] )( '%s', async ( _, args, expected ) => {
		const { getByRole, findByRole } = render(
			<WithTestRegistry registry={ registry } features={ [ 'ideaHubModule' ] }>
				<DashboardIdeasWidget />
			</WithTestRegistry>
		);

		fireEvent.click( getByRole( 'tab', { name: args } ) );
		expect( global.location.hash ).toEqual( expected );

		const tabItem = await findByRole( 'tab', { selected: true } );
		expect( tabItem ).toHaveTextContent( args );
	} );
} );
