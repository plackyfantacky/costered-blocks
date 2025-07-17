<?php

/**
 * Plugin Name:       Costered Blocks
 * Description:       A small collection of deliberate, developer-focused middle fingers to some of Gutenberg's most irritating decisions.
 * Version:           0.1.4
 * Author:            Adam Trickett
 * Requires at least: 6.5
 * Requires PHP:      8.2
 * License:           MIT
 * Text Domain:       costered-blocks
 */

define('COSTERED_BLOCKS_URL', plugin_dir_url(__FILE__));
define('COSTERED_BLOCKS_PATH', plugin_dir_path(__FILE__));

require_once COSTERED_BLOCKS_PATH . 'php/render-core-group.php';

/**
 * Register scripts for custom blocks and functionality. These are all first-party.
 */
add_action('enqueue_block_editor_assets', function () {

    $files = [
        'costered--blocks-core-button--innerblocks-support' => ['file' => 'js/blocks/core-button--innerblocks-support.js', 'dependencies' => ['wp-hooks', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-element']],
        'costered--blocks-core-button--spacing-controls' => ['file' => 'js/blocks/core-button--spacing-controls.js', 'dependencies' => ['wp-hooks', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-element']],
        'costered--blocks-core-cover--restrict-align-toolbar' => ['file' => 'js/blocks/core-cover--restrict-align-toolbar.js', 'dependencies' => ['wp-hooks', 'wp-element']],
        'costered--blocks-core-group--spacing-controls' => ['file' => 'js/blocks/core-group--spacing-controls.js', 'dependencies' => ['wp-dom-ready', 'wp-hooks', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-element']],
        'costered--blocks-core-group--preview-spacing' => ['file' => 'js/blocks/core-group--preview-spacing.js', 'dependencies' => ['wp-hooks', 'wp-block-editor', 'wp-compose', 'wp-element']],
        'costered--hide-core-ui-elements' => ['file' => 'js/common/hide-core-ui-elements.js', 'dependencies' => []],
        'costered--inject-margin-styles' => ['file' => 'js/common/inject-margin-styles.js', 'dependencies' => ['wp-hooks', 'wp-element']],
    ];

    foreach ($files as $handle => $data) {
        wp_enqueue_script(
            $handle,
            COSTERED_BLOCKS_URL . $data['file'],
            $data['dependencies'],
            filemtime(COSTERED_BLOCKS_PATH . $data['file']),
            true
        );
    }

    wp_enqueue_style('costered--blocks-style-resets', COSTERED_BLOCKS_URL . 'css/resets.css', ['wp-editor'], filemtime(COSTERED_BLOCKS_PATH . 'css/resets.css'));
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('costered--blocks-style-resets', COSTERED_BLOCKS_URL . 'css/resets.css', ['wp-editor'], filemtime(COSTERED_BLOCKS_PATH . 'css/resets.css'));
});