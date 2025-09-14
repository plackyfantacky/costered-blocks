<?php

function costered_blocks_get_allowed_attributes_map() {
    static $map = null;
    if (null !== $map) return $map;

    $file = rtrim(COSTERED_BLOCKS_PATH, '/\\') . '/config/attributes.json';
    if ( ! file_exists( $file ) || ! is_readable( $file ) ) {
        $map = [];
        return $map;
    }

    $json = file_get_contents( $file );
    $data = json_decode( $json, true );
    if ( ! is_array( $data ) ) {
        $map = [];
        return $map;
    }
    $map = [];
    foreach ( $data as $attr => $meta ) {
        if ( isset( $meta['css'] ) && $meta['css'] ) {
            $map[ $attr ] = $meta['css'];
        }
    }
    return $map;
}

add_filter('render_block', function($block_content, $block) {
    if (empty($block['attrs']) || !is_array($block['attrs'])) {
        return $block_content;
    }

    $allowed = costered_blocks_get_allowed_attributes_map();
    if (empty($allowed)) {
        return $block_content;
    }    

    $style_string = '';
    foreach ($allowed as $attr_key => $css_key) {
        if (!empty($block['attrs'][$attr_key])) {
            $value = trim($block['attrs'][$attr_key]);
            if ($value !== '') {
                $style_string .= "{$css_key}:{$value};";
            }
        }
    }
    if (!$style_string) return $block_content;

    if (preg_match('/<[^>]+>/', $block_content, $m, PREG_OFFSET_CAPTURE)) {
        $tag = $m[0][0];
        if (strpos($tag, 'style=') === false) {
            $new_tag = rtrim($tag, '>') . ' style="' . esc_attr($style_string) . '">';
            $block_content = substr_replace($block_content, $new_tag, $m[0][1], strlen($tag));
        } else {
            $new_tag = preg_replace('/style="([^"]*)"/', 'style="$1 ' . esc_attr($style_string) . '"', $tag);
            $block_content = substr_replace($block_content, $new_tag, $m[0][1], strlen($tag));
        }
    }

    return $block_content;
}, 10, 2);

add_filter('block_type_metadata_settings', function($settings, $metadata) {
    $targets = [
        'core/group',
        'core/buttons',
        'core/columns'
    ];

    if(!in_array($metadata['name'] ?? '', $targets, true)) {
        return $settings;
    }

    // ensure support exists
    if (!isset($settings['supports']) || !is_array($settings['supports'])) {
        $settings['supports'] = [];
    }

    // nuke the attrs.layout object (which is used for the default block layout constols)
    $settings['supports']['layout'] = false;
    return $settings;
}, 10, 2);