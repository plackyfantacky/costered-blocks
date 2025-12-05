<?php

    defined('ABSPATH') || exit;

    class Costered_Things_Controller extends WP_REST_Controller {

        public function __construct() {
            $this->namespace = 'costered/v1';
            $this->rest_base = 'things'; 
        }

        public function register_routes(): void {
            register_rest_route(
                $this->namespace,
                '/' . $this->rest_base,
                [
                    [
                        'methods' => WP_REST_Server::READABLE,
                        'callback' => [ $this, 'get_things' ],
                        'permission_callback' => [ $this, 'can_read' ],
                        'args' => [
                            'thing_type' => [
                                'type' => 'string',
                                'required' => true,
                            ],
                        ],
                    ],
                ]
            );

            register_rest_route(
                $this->namespace,
                '/' . $this->rest_base . '/(?P<thing_type>[^/]+)/(?P<thing_key>[^/]+)',
                [
                    [
                        'methods' => WP_REST_Server::READABLE,
                        'callback' => [ $this, 'get_thing' ],
                        'permission_callback' => [ $this, 'can_read'],
                    ],
                    [
                        'methods' => WP_REST_Server::CREATABLE,
                        'callback' => [ $this, 'create_or_update_thing' ],
                        'permission_callback' => [ $this, 'can_edit'],
                    ],
                    [
                        'methods' => WP_REST_Server::EDITABLE,
                        'callback' => [ $this, 'create_or_update_thing' ],
                        'permission_callback' => [ $this, 'can_edit'],
                    ],
                    [
                        'methods' => WP_REST_Server::DELETABLE,
                        'callback' => [ $this, 'delete_thing' ],
                        'permission_callback' => [ $this, 'can_edit'],
                    ],
                ]
            );    
        }

        public function can_read(): bool {
            return current_user_can('edit_posts');
        }

        public function can_edit(): bool {
            return current_user_can('edit_posts');
        }

        public function get_things(WP_REST_Request $request): WP_REST_Response {
            $thingType = (string) $request['thing_type'];
            $items = costered_things_list($thingType);

            $data = [];

            foreach($items as $thingKey => $item) {
                $costeredId = $item['costered_id'] ?? null;
                $thingData = $item['thing_data'] ?? null;

                $data[] = [
                    'thing_type' => $thingType,
                    'thing_key' => $thingKey,
                    'thing_costered_id' => $costeredId,
                    'thing_data' => $thingData,
                ];
            }

            return rest_ensure_response($data);
        }


        public function get_thing(WP_REST_Request $request): WP_REST_Response|WP_Error {
            $thingType = (string) $request['thing_type'];
            $thingKey = (string) $request['thing_key'];

            $items = costered_things_list($thingType);

            if (!isset($items[$thingKey])) {
                return new WP_Error('costered_thing_not_found', 'Thing not found', ['status' => 404]);
            }

            $item = $items[$thingKey];
            $value = $item['thing_data'] ?? null;
            $costeredId = $item['costered_id'] ?? null;
            
            return rest_ensure_response([
                'thing_type' => $thingType,
                'thing_key' => $thingKey,
                'thing_costered_id' => $costeredId,
                'thing_data' => $value,
            ]);
        }

        public function create_or_update_thing(WP_REST_Request $request): WP_REST_Response|WP_Error {
            $thingType = (string) $request['thing_type'];
            $thingKey = (string) $request['thing_key'];
            $thingData = $request->get_param('thing_data');
            $thingCosteredId = $request->get_param('thing_costered_id');

            $success = costered_things_set(
                $thingType,
                $thingKey,
                $thingData,
                is_string($thingCosteredId) && $thingCosteredId !== '' ? $thingCosteredId : null
            );

            if(!$success) {
                return new WP_Error('costered_thing_save_failed', 'Failed to save thing', ['status' => 500]);
            }

            // get latest version
            return $this->get_thing($request);
        }

        public function delete_thing(WP_REST_Request $request): WP_REST_Response|WP_Error {
            $thingType = (string) $request['thing_type'];
            $thingKey = (string) $request['thing_key'];

            $success = costered_things_delete($thingType, $thingKey);

            if(!$success) {
                return new WP_Error('costered_thing_delete_failed', 'Failed to delete thing', ['status' => 500]);
            }

            return rest_ensure_response([
                'deleted' => true,
            ]);
        }   
    }