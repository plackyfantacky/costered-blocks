<?php

use Brain\Monkey;

// Use constants from the main plugin file.
// Define minimal WordPress / plugin constants used by helpers.
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(__DIR__, 2) . '/');
}

// Point this at the plugin root directory.
if (!defined('COSTERED_BLOCKS_PATH')) {
    define('COSTERED_BLOCKS_PATH', dirname(__DIR__, 2) . '/');
}

// If helpers or other code reference these, stub them too.
if (!defined('COSTERED_BLOCKS_URL')) {
    define('COSTERED_BLOCKS_URL', 'http://testbench.test/wp-content/plugins/costered-blocks/');
}

// 1. Composer autoload (PHPUnit, Brain Monkey, etc).
require dirname(__DIR__, 2) . '/vendor/autoload.php';

// 2. Minimal WordPress shims if needed.
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(__DIR__, 2) . '/');
}

// 3. Load the plugin helpers that contain costered_build_css_pretty_for_selectors().
require dirname(__DIR__, 2) . '/php/includes/helpers.php';

// 4. Global Brain Monkey setup.
//    (Alternative: move this into setUp/tearDown in each TestCase.)
Monkey\setUp();

register_shutdown_function(function () {
    Monkey\tearDown();
});