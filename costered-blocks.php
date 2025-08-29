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

require_once COSTERED_BLOCKS_PATH . 'php/render-blocks.php';

/**
 * Register scripts for custom blocks and functionality. These are all first-party.
 */
add_action('enqueue_block_editor_assets', function () {

    $files = [
        'costered-blocks--hooks' => ['file' => 'js/hooks/index.js', 'dependencies' => ['wp-hooks', 'wp-element']],
        'costered-blocks--editor--plugin-sidebar' => ['file' => 'js/editor/plugin-sidebar.js', 'dependencies' => ['wp-editor', 'wp-plugins', 'wp-i18n', 'costered-blocks--hooks']],
        'costered-blocks--blocks-core-button--innerblocks-support' => ['file' => 'js/blocks/core-button--innerblocks-support.js', 'dependencies' => ['wp-hooks', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-element']],
        'costered-blocks--blocks-core-cover--restrict-align-toolbar' => ['file' => 'js/blocks/core-cover--restrict-align-toolbar.js', 'dependencies' => ['wp-hooks', 'wp-element']],
        'costered-blocks--blocks-core-group--disable-default-layout' => ['file' => 'js/blocks/core-group--disable-default-layout.js', 'dependencies' => ['wp-blocks', 'wp-hooks', 'wp-dom-ready']],
        'costered-blocks--filters-editor-style-mirror' => ['file' => 'js/filters/editor-style-mirror.js', 'dependencies' => ['wp-blocks', 'wp-hooks', 'wp-element', 'wp-data']],
        'costered-blocks--filters-setup-data-scheme' => ['file' => 'js/filters/setup-data-scheme.js', 'dependencies' => ['wp-hooks']],
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

// Block specific. They could be their own files, but this is simpler for now.

// core/image
add_filter('render_block_core/image', function ($block_content, $block) {
    // Defensive: only modify if 'align' exists
    if (!empty($block['attrs']['align'])) {
        unset($block['attrs']['align']);
        // Re-render the block using updated attributes
        return render_block([
            'blockName' => 'core/image',
            'attrs'     => $block['attrs'],
            'innerBlocks' => $block['innerBlocks'] ?? [],
            'innerContent' => $block['innerContent'] ?? [],
            'innerHTML' => $block['innerHTML'] ?? '',
        ]);
    }
    return $block_content;
}, 10, 2);