<?php
    defined('ABSPATH') || exit;

    class Costered_Things_Repository {
        /** @var \wpdb */
        private $wpdb;
        private string $table;

        public function __construct()
        {
            global $wpdb;

            $this->wpdb = $wpdb;
            $this->table = $this->wpdb->prefix . 'costered_things';
        }

        /**
         * Get a thing by type and key.
         * @return mixed The thing data, or $default if not found
         */
        public function getByKey(string $thingType, string $thingKey, mixed $default = null): mixed {
            $row = $this->wpdb->get_row(
                $this->wpdb->prepare(
                    "SELECT thing_data FROM {$this->table} WHERE thing_type = %s AND thing_key = %s LIMIT 1",
                    $thingType,
                    $thingKey
                ),
                ARRAY_A
            );

            if ($row === null) {
                return $default;
            }

            $decoded = json_decode($row['thing_data'], true);

            return $decoded === null && json_last_error() !== JSON_ERROR_NONE
                ? $default
                : $decoded;
        }

        /**
         * Get a thing by costered id
         */
        public function getByCosteredId(string $costeredId, mixed $default = null): mixed {
            $row = $this->wpdb->get_row(
                $this->wpdb->prepare(
                    "SELECT thing_data FROM {$this->table} WHERE thing_costered_id = %s LIMIT 1",
                    $costeredId
                ),
                ARRAY_A
            );

            if ($row === null) {
                return $default;
            }

            $decoded = json_decode($row['thing_data'], true);

            return $decoded === null && json_last_error() !== JSON_ERROR_NONE
                ? $default
                : $decoded;
        }

        /**
         * Set a thing by type and key.
         * @return bool Success
         */
        public function set(string $thingType, string $thingKey, mixed $data, ?string $costeredId = null): bool {
            $json = json_encode($data);
            
            if ($json === false) {
                return false;
            }

            $now = current_time('mysql');
            $updateData = [
                'thing_data' => $json,
                'updated_at' => $now,
            ];

            if ($costeredId !== null) {
                $updateData['thing_costered_id'] = $costeredId;
            }

            $updated = $this->wpdb->update(
                $this->table,
                $updateData,
                [
                    'thing_type' => $thingType,
                    'thing_key' => $thingKey,
                ],
                array_fill(0, count($updateData), '%s'),
                [ '%s', '%s' ]
            );
            
            if ($updated === 0) {
                $insertData = [
                    'thing_type' => $thingType,
                    'thing_key' => $thingKey,
                    'thing_costered_id' => $costeredId,
                    'thing_data' => $json,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $this->wpdb->insert(
                    $this->table,
                    $insertData,
                    [ '%s', '%s', '%s', '%s', '%s', '%s' ]
                );

                return $this->wpdb->insert_id !== 0;
            }

            return $updated !== false;
        }

        /**
         * Delete a thing by type and key.
         * @return bool Success
         */
        public function deleteByKey(string $thingType, string $thingKey): bool {
            $deleted = $this->wpdb->delete(
                $this->table,
                [
                    'thing_type' => $thingType,
                    'thing_key' => $thingKey,
                ],
                [ '%s', '%s' ]
            );

            return $deleted !== false;
        }

        /**
         * List all things of a given type.
         * @return array<string, array{costered_id: ?string, data: mixed}>
         */
        public function listByType(string $thingType): array {
            $rows = $this->wpdb->get_results(
                $this->wpdb->prepare(
                    "SELECT thing_key, thing_costered_id, thing_data FROM {$this->table} WHERE thing_type = %s ORDER BY thing_key ASC",
                    $thingType
                ),
                ARRAY_A
            );

            $items = [];

            foreach ($rows as $row) {
                $decoded = json_decode($row['thing_data'], true);

                if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
                    continue;
                }

                $items[$row['thing_key']] = [
                    'costered_id' => $row['thing_costered_id'],
                    'thing_data' => $decoded,
                ];
            }

            return $items;
        }
    }