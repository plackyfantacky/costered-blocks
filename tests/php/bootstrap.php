<?php

// tests/php/bootstrap.php

// 1) Load Composer autoloader so the Polyfills (and everything else) are available.
require dirname(__DIR__, 2) . '/vendor/autoload.php';

// 2) Locate the WP test suite.
$tests_dir = getenv('WP_TESTS_DIR');

if (!$tests_dir) {
    // Default to Composer-installed wp-phpunit.
    $tests_dir = dirname(__DIR__, 2) . '/vendor/wp-phpunit/wp-phpunit';
}

if (!file_exists($tests_dir . '/includes/functions.php')) {
    fwrite(STDERR, "Could not find WordPress tests in {$tests_dir}\n");
    exit(1);
}


// 3) Load WP test helper functions (defines tests_add_filter, etc).
require $tests_dir . '/includes/functions.php';

// 4) Tell the WP test suite which plugin(s) to load.
tests_add_filter('muplugins_loaded', function () {
    // Adjust path if your main plugin file is named differently.
    require dirname(__DIR__, 2) . '/costered-blocks.php';
});

// 5) Boot the full WP testing environment.
require $tests_dir . '/includes/bootstrap.php';

// 6) Make sure our custom database table is created before tests run.
global $wpdb;

$table = $wpdb->prefix . 'costered_things';

// If it already exists, nothing to do.
$exists = $wpdb->get_var(
    $wpdb->prepare(
        "SHOW TABLES LIKE %s",
        $table
    )
);

if ($exists === $table) {
    return;
}

$charset_collate = $wpdb->get_charset_collate();

$sql = "
    CREATE TABLE {$table} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        thing_type VARCHAR(100) NOT NULL,
        thing_costered_id VARCHAR(64) DEFAULT NULL,
        thing_key VARCHAR(191) NOT NULL,
        thing_data LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY idx_costered_key (thing_key, thing_costered_id),
        KEY idx_thing_type (thing_type),
        KEY idx_thing_key (thing_key),
        KEY idx_thing_costered_id (thing_costered_id)
    ) {$charset_collate};
";

require_once ABSPATH . 'wp-admin/includes/upgrade.php';
dbDelta($sql);
