<?php
    defined('ABSPATH') || exit;

    if (!defined('COSTERED_THINGS_TABLE') && isset($wpdb)) {
        define('COSTERED_THINGS_TABLE', $wpdb->prefix . 'costered_things');
    }

    /*
    * Notes about database access in this repository for reviewers:
    *
    * - All dynamic values in queries go through $wpdb->prepare() with placeholders.
    * - COSTERED_THINGS_TABLE is a plugin defined constant based on $wpdb->prefix.
    *   User input never influences this table name.
    * - WordPress placeholders do not support identifiers such as table names. Using
    *   a placeholder for the table name would produce invalid SQL.
    *
    * Some WPCS/PCP sniffs treat any dynamic table name as "NotPrepared", so targeted
    * phpcs disables are used around those queries to avoid false positives without
    * weakening the actual safety guarantees.
    */

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

            /** @var \wpdb $wpdb */
            $wpdb = $this->wpdb;


            /* We disable the WPCS/PCP sniffs around this line to keep the linter quiet without
            * rewriting the query into something less clear or less correct. See note at top. */
            
            // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->prepare(
                    "SELECT thing_data FROM " . COSTERED_THINGS_TABLE . "
                     WHERE thing_type = %s 
                     AND thing_key = %s 
                     LIMIT 1",
                    $thingType,
                    $thingKey
                ),
                ARRAY_A
            );
            // phpcs:enable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared

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
        public function getByCosteredId(string $thingType, string $costeredId, mixed $default = null): mixed {

            /** @var \wpdb $wpdb */
            $wpdb = $this->wpdb;            

            /* We disable the WPCS/PCP sniffs around this line to keep the linter quiet without
            * rewriting the query into something less clear or less correct. See note at top. */

            // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->prepare(
                    "SELECT thing_data FROM " . COSTERED_THINGS_TABLE . " 
                     WHERE thing_type = %s 
                     AND thing_costered_id = %s 
                     LIMIT 1",
                    $thingType,
                    $costeredId
                ),
                ARRAY_A
            );
            // phpcs:enable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared

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

            /** @var \wpdb $wpdb */
            $wpdb = $this->wpdb;

            /* This is our own table, so we HAVE to interact with it directly. No choice here
             * as WP does not provide an abstraction for custom tables. */
            $updated = $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
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

                /* This is our own table, so we HAVE to interact with it directly. No choice here
                 * as WP does not provide an abstraction for custom tables. */
                $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
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

            /** @var \wpdb $wpdb */
            $wpdb = $this->wpdb;
            
            /* This is our own table, so we HAVE to interact with it directly. No choice here
             * as WP does not provide an abstraction for custom tables. */
            $deleted = $wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                COSTERED_THINGS_TABLE,
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

            /** @var \wpdb $wpdb */
            $wpdb = $this->wpdb;

            /* We disable the WPCS/PCP sniffs around this line to keep the linter quiet without
            * rewriting the query into something less clear or less correct. See note at top. */

            // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->prepare(
                    "SELECT thing_key, thing_costered_id, thing_data FROM " . COSTERED_THINGS_TABLE . " 
                     WHERE thing_type = %s 
                     ORDER BY thing_key 
                     ASC",
                    $thingType
                ),
                ARRAY_A
            );
            // phpcs:enable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared

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

        /**
         * List all things of a given type and costered id. Each result should have a unitque thing_key.
         */
        public function listByTypeAndCosteredId(string $thingType, string $costeredId): array {

            /** @var \wpdb $wpdb */
            $wpdb = $this->wpdb;

            /* We disable the WPCS/PCP sniffs around this line to keep the linter quiet without
            * rewriting the query into something less clear or less correct. See note at top. */
            
            // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->prepare(
                    "SELECT thing_key, thing_data FROM " . COSTERED_THINGS_TABLE . " 
                     WHERE thing_type = %s 
                     AND thing_costered_id = %s 
                     ORDER BY thing_key 
                     ASC",
                    $thingType,
                    $costeredId
                ),
                ARRAY_A
            );
            // phpcs:enable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared

            $items = [];

            foreach ($rows as $row) {
                $decoded = json_decode($row['thing_data'], true);

                if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
                    continue;
                }

                $items[$row['thing_key']] = $decoded;
            }

            return $items;
        }
    }