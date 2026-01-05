<?php

/**
 * Register scripts for custom blocks and functionality. These are all first-party.
 */
add_action('enqueue_block_editor_assets', function () {

    $files = [
        'costered-blocks--entrypoint' => ['file' => 'js/app.js', 'dependencies' => ['wp-editor', 'wp-plugins', 'wp-i18n', 'wp-element', 'wp-components', 'wp-data', 'wp-blocks', 'wp-block-editor', 'costered-blocks--hooks']],
        'costered-blocks--hooks' => ['file' => 'js/hooks/index.js', 'dependencies' => ['wp-hooks', 'wp-element']],
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

    $is_debug = costered_is_debug_enabled();
    $has_tools = costered_debug_tools_available();
    $tools_active = costered_debug_tools_active();

    $enabled = costered_blocks_next_version_features_enabled();
    $features_json = $enabled ? 'true' : 'false';

    $inline = "
        window.CB_NEXT_VERSION_FEATURES = {$features_json};
        window.CB_WP_DEBUG = " . ( $is_debug ? 'true' : 'false') . ";
        window.CB_DEBUG_TOOLS_AVAILABLE = " . ( $has_tools ? 'true' : 'false' ) . ";
        window.CB_DEBUG_TOOLS_ACTIVE = " . ( $tools_active ? 'true' : 'false' ) . ";
        if(window.CB_WP_DEBUG ) { console.log('[costered] WP_DEBUG is enabled.'); }
        if (window.CB_WP_DEBUG === true) {
            if(window.CB_DEBUG_TOOLS_AVAILABLE ) { console.log('[costered] Plugin debug tools are available.'); }
            if(window.CB_DEBUG_TOOLS_ACTIVE ) { console.log('[costered] Plugin debug tools are Active. Click a block and view the Debug Controls tab in the sidebar.'); }
        }
    ";

    wp_add_inline_script('costered-blocks--entrypoint', $inline, 'before');

    wp_enqueue_style('costered-blocks--styles-plugin', COSTERED_BLOCKS_URL . 'css/plugin.css', ['wp-editor'], filemtime(COSTERED_BLOCKS_PATH . 'css/plugin.css'));
    wp_enqueue_style('costered-blocks--styles-overrides', COSTERED_BLOCKS_URL . 'css/overrides.css', ['wp-editor'], filemtime(COSTERED_BLOCKS_PATH . 'css/overrides.css'));
});

// Frontend AND Backend styles
add_action('enqueue_block_assets', function() {
    wp_enqueue_style('costered-blocks--styles-overrides', COSTERED_BLOCKS_URL . 'css/overrides.css', ['wp-editor'], filemtime(COSTERED_BLOCKS_PATH . 'css/overrides.css'));
});


function costered_blocks_next_version_features_enabled(): bool {
    static $cached = null;

    if ($cached !== null) {
        return $cached;
    }

    // 1) Try real environment variable first.
    $raw = getenv('CB_NEXT_VERSION_FEATURES');
    if ($raw !== false && $raw !== null) {
        $value = strtolower(trim((string) $raw));
        $cached = in_array($value, ['1', 'true', 'yes', 'on'], true);
        return $cached;
    }

    // 2) Fallback to WP constant if defined.
    $env_path = COSTERED_BLOCKS_PATH . '.env';
    if (!file_exists($env_path) || !is_readable($env_path)) {
        $cached = false;
        return $cached;
    }

    $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
        $key = trim($key);
        $value = strtolower(trim($value));

        if ($key !== 'CB_NEXT_VERSION_FEATURES') {
            continue;
        }

        $cached = in_array($value, ['1', 'true', 'yes', 'on'], true);
        return $cached;
    }

    $cached = false;
    return $cached;
}