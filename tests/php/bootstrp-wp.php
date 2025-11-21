<?php

require dirname(__DIR__) . '/vendor/autoload.php';

$_tests_dir = getenv('WP_TESTS_DIR') ?: '/tmp/wordpress-tests-lib';

if (!file_exists($_tests_dir . '/includes/functions.php')) {
    fwrite(STDERR, "Could not find WordPress tests in {$_tests_dir}\n");
    exit(1);
}

require $_tests_dir . '/includes/functions.php';

/**
 * Load the plugin once WordPress is loaded.
 */
tests_add_filter('muplugins_loaded', function () {
    require dirname(__DIR__) . '/costered-blocks.php';
});

require $_tests_dir . '/includes/bootstrap.php';
