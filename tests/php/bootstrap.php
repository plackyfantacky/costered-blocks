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