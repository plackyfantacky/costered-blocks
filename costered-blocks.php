<?php

/**
 * Plugin Name:       Costered Blocks
 * Description:       A small collection of deliberate, developer-focused middle fingers to some of Gutenberg's most irritating decisions.
 * Version:           0.1.0
 * Author:            Adam Trickett
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * License:           MIT
 * Text Domain:       costered-blocks
 */

add_action('enqueue_block_editor_assets', function () {

    $base_url = plugin_dir_url(__FILE__);
    $base_path = plugin_dir_path(__FILE__);

    $files = [
        'costered--hide-inner-blocks' => ['file' => 'js/admin/hide-inner-blocks-use-content-width.js', 'dependencies' => []],
        'costered--blocks-core-cover--restrict-align-toolbar' => ['file' => 'js/blocks/core-cover--restrict-align-toolbar.js', 'dependencies' => ['wp-hooks', 'wp-element']],
        'costered--blocks-core-group--spacing-controls' => ['file' => 'js/blocks/core-group--spacing-controls.js', 'dependencies' => ['wp-dom-ready', 'wp-hooks', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-element']],
        'costered--blocks-core-group--preview-spacing' => ['file' => 'js/blocks/core-group--preview-spacing.js', 'dependencies' => ['wp-hooks', 'wp-block-editor', 'wp-compose', 'wp-element']],
    ];

    foreach ($files as $handle => $data) {
        wp_enqueue_script(
            $handle,
            $base_url . $data['file'],
            $data['dependencies'],
            filemtime($base_path . $data['file']),
            true
        );
    }
});
