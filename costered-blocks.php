<?php

/**
 * Plugin Name:       Costered Blocks
 * Description:       A small collection of deliberate, developer-focused middle fingers to some of Gutenberg's most irritating decisions.
 * Version:           1.3.4
 * Author:            Adam Trickett
 * Requires at least: 6.5
 * Requires PHP:      8.0
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       costered-blocks
 */

defined('ABSPATH') || exit;

define('COSTERED_DB_VERSION', '4');
define('COSTERED_BLOCKS_VERSION', '1.3.4');
define('COSTERED_BLOCKS_URL', plugin_dir_url(__FILE__));
defined('COSTERED_BLOCKS_PATH') || define('COSTERED_BLOCKS_PATH', plugin_dir_path(__FILE__));

// critical includes
if (file_exists(COSTERED_BLOCKS_PATH. '/vendor/autoload.php')) {
    require COSTERED_BLOCKS_PATH. '/vendor/autoload.php';
}
require_once COSTERED_BLOCKS_PATH . 'php/includes/bootstrap.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/i18n.php';

$costered_debug_tools_file = COSTERED_BLOCKS_PATH . 'php/includes/debug.php';

if (file_exists($costered_debug_tools_file)) {
    // We only load this in dev installs where the file is present.
    require_once $costered_debug_tools_file;
}


// main includes
require_once COSTERED_BLOCKS_PATH . 'php/includes/admin.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/blocks.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/enqueues.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/helpers.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/svg.php';
require_once COSTERED_BLOCKS_PATH . 'php/render-blocks.php';

// 'things' includes
require_once COSTERED_BLOCKS_PATH . 'php/includes/things-repository.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/things.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/rest-things.php';

add_action('rest_api_init', function() {
    $controller = new Costered_Things_Controller();
    $controller->register_routes();
});

register_activation_hook(__FILE__, function() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'costered_things';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        thing_type VARCHAR(100) NOT NULL,
        thing_costered_id VARCHAR(64) DEFAULT NULL,
        thing_key VARCHAR(191) NOT NULL,
        thing_data LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY `idx_costered_key` (`thing_key`,`thing_costered_id`),
        KEY `idx_thing_type` (`thing_type`),
        KEY `idx_thing_key` (`thing_key`),
        KEY `idx_thing_costered_id` (`thing_costered_id`)
    ) COLLATE {$charset_collate}";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);

    update_option('costered_db_version', COSTERED_DB_VERSION);
});

// Reset CSS buffer at start of the main query.
add_action('wp', 'costered_styles_reset', 1); // function in helpers.php

// Print collected styles once per page.
add_action('wp_footer', 'costered_print_collected_css_link', 999); // function in helpers.php