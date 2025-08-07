<?php

add_filter('render_block', function($block_content, $block) {
    if (empty($block['attrs']) || !is_array($block['attrs'])) {
        return $block_content;
    }

    // Map of allowed attribute keys to CSS property names (handles camelCase or dash-case if needed)
    $allowed = [
        'display' => 'display',
        'visibility' => 'visibility',
        'width' => 'width',
        'height' => 'height',
        'maxWidth' => 'max-width',
        'maxHeight' => 'max-height',
        'minWidth' => 'min-width',
        'minHeight' => 'min-height',
        'marginTop' => 'margin-top',
        'marginRight' => 'margin-right',
        'marginBottom' => 'margin-bottom',
        'marginLeft' => 'margin-left',
        'paddingTop' => 'padding-top',
        'paddingRight' => 'padding-right',
        'paddingBottom' => 'padding-bottom',
        'paddingLeft' => 'padding-left',
        // add more as needed
    ];

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
