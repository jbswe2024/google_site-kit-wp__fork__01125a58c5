<?php
/**
 * Class Google\Site_Kit\Core\Tracking\REST_Tracking_Consent_Controller
 *
 * @package   Google\Site_Kit
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\Tracking;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Permissions\Permissions;
use Google\Site_Kit\Core\REST_API\REST_Route;
use Google\Site_Kit\Core\REST_API\REST_Routes;
use Google\Site_Kit\Core\Storage\User_Options;
use Google\Site_Kit\Core\Util\Method_Proxy_Trait;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Class managing admin tracking.
 *
 * @since  n.e.x.t
 * @access private
 * @ignore
 */
class REST_Tracking_Consent_Controller {
	use Method_Proxy_Trait;

	/**
	 * Tracking_Consent instance.
	 *
	 * @since n.e.x.t
	 *
	 * @var Tracking_Consent
	 */
	protected $consent;

	/**
	 * Constructor.
	 *
	 * @@since n.e.x.t
	 *
	 * @param Context      $context      Context instance.
	 * @param User_Options $user_options Optional. User_Options instance. Default is a new instance.
	 */
	public function __construct(
		Context $context,
		User_Options $user_options = null
	) {
		$user_options  = $user_options ?: new User_Options( $context );
		$this->consent = new Tracking_Consent( $user_options );
	}

	/**
	 * Registers functionality through WordPress hooks.
	 *
	 * @since n.e.x.t
	 */
	public function register() {
		add_filter( 'googlesitekit_rest_routes', $this->get_method_proxy( 'get_rest_routes' ) );

		add_filter(
			'googlesitekit_apifetch_preload_paths',
			function ( $routes ) {
				return array_merge(
					$routes,
					array(
						'/' . REST_Routes::REST_ROOT . '/core/user/data/tracking',
					)
				);
			}
		);
	}

	/**
	 * Is tracking active for the current user?
	 *
	 * @since n.e.x.t
	 * @return bool True if tracking enabled, and False if not.
	 */
	public function is_active() {
		return (bool) $this->consent->get();
	}

	/**
	 * Gets tracking routes.
	 *
	 * @since n.e.x.t
	 *
	 * @param array $routes Array of routes.
	 *
	 * @return array Modified array of routes that contains tracking related routes.
	 */
	private function get_rest_routes( $routes ) {
		$can_authenticate = function () {
			return current_user_can( Permissions::AUTHENTICATE );
		};

		$tracking_callback = function ( WP_REST_Request $request ) {
			return new WP_REST_Response(
				array(
					'enabled' => $this->is_active(),
				)
			);
		};

		return array_merge(
			$routes,
			array(
				new REST_Route(
					'core/user/data/tracking',
					array(
						array(
							'methods'             => WP_REST_Server::READABLE,
							'callback'            => $tracking_callback,
							'permission_callback' => $can_authenticate,
						),
						array(
							'methods'             => WP_REST_Server::CREATABLE,
							'callback'            => function ( WP_REST_Request $request ) use ( $tracking_callback ) {
								$data    = $request->get_param( 'data' );
								$enabled = ! empty( $data['enabled'] );

								$this->consent->set( $enabled );

								return $tracking_callback( $request );
							},
							'permission_callback' => $can_authenticate,
							'args'                => array(
								'data' => array(
									'type'       => 'object',
									'required'   => true,
									'properties' => array(
										'enabled' => array(
											'type'     => 'boolean',
											'required' => true,
										),
									),
								),
							),
						),
					)
				),
			)
		);
	}
}
