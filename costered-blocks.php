<?php

/**
 * Plugin Name:       Costered Blocks
 * Description:       A small collection of deliberate, developer-focused middle fingers to some of Gutenberg's most irritating decisions.
 * Version:           1.1.1
 * Author:            Adam Trickett
 * Requires at least: 6.5
 * Requires PHP:      8.2
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       costered-blocks
 */

define('COSTERED_BLOCKS_URL', plugin_dir_url(__FILE__));
define('COSTERED_BLOCKS_PATH', plugin_dir_path(__FILE__));

require_once COSTERED_BLOCKS_PATH . 'php/includes/blocks.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/enqueues.php';
require_once COSTERED_BLOCKS_PATH . 'php/includes/helpers.php';
require_once COSTERED_BLOCKS_PATH . 'php/render-blocks.php';

// Reset CSS buffer at start of the main query.
add_action('wp', 'costered_styles_reset', 1); // function in helpers.php

// Print collected styles once per page.
add_action('wp_footer', 'costered_styles_output', 999); // function in helpers.php