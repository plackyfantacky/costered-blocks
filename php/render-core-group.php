<?php

add_filter('render_block_core/group', function ($block_content, $block) {
    $attrs  = $block['attrs'] ?? [];
    $layout = $attrs['layout'] ?? [];

    $style_map = [
        'paddingTop' => 'padding-top',
        'paddingRight' => 'padding-right',
        'paddingBottom' => 'padding-bottom',
        'paddingLeft' => 'padding-left',
        'marginTop' => 'margin-top',
        'marginRight' => 'margin-right',
        'marginBottom' => 'margin-bottom',
        'marginLeft' => 'margin-left',
        'gapVertical' => 'row-gap',
        'gapHorizontal' => 'column-gap',
    ];

    $style = [];

    foreach ($style_map as $attr_key => $css_key) {
        if (!empty($attrs[$attr_key])) {
            $style[] = "{$css_key}: {$attrs[$attr_key]};";
        }
    }

    //Justification
    if (!empty($attrs['justifyContent'])) {
        
        // Alignment centre (both flex and non-flex)
        if(in_array($layout['justifyContent'], ['center', 'space-between', 'space-around', 'space-evenly'])) {
            $style[] = 'margin-left: auto;';
            $style[] = 'margin-right: auto;';
        }

        $justify_map = [
            'left' => 'flex-start',
            'right' => 'flex-end',
            'center' => 'center',
            'space-between' => 'space-between',
            'space-around' => 'space-around',
            'space-evenly' => 'space-evenly',
        ];

        if(in_array($layout['justifyContent'], array_keys($justify_map))) {
            $justify = $layout['justifyContent'];
            $style[] = 'justify-content: ' . $justify_map[$justify] . ';';
        }
    }

    // Container type
    if (($attrs['containerType'] ?? '') === 'boxed') {
        $width = $attrs['containerWidth'] ?? '1200px';
        $style[] = "max-width: {$width};";
    }

    // Layout: flex/grid
    if (!empty($layout['type'])) {
        if ($layout['type'] === 'flex') {
            $style[] = 'display: flex;';
            $direction = ($layout['orientation'] ?? '') === 'vertical' ? 'column' : 'row';
            $style[] = "flex-direction: {$direction};";
        
        } elseif ($layout['type'] === 'grid') {
            $style[] = 'display: grid;';
            if (!empty($layout['columnCount'])) {
                $style[] = "grid-template-columns: repeat({$layout['columnCount']}, 1fr);";
            } elseif (!empty($layout['minimumColumnWidth'])) {
                $min = esc_attr($layout['minimumColumnWidth']);
                $style[] = "grid-template-columns: repeat(auto-fit, minmax({$min}, 1fr));";
            }
        }
    }

    // Fallback content alignment for non-flex layouts
    if (
        empty($layout['type']) ||
        $layout['type'] === 'default' ||
        $layout['type'] === 'constrained'
    ) {
        $justify = $layout['justifyContent'] ?? null;

        $fallback_map = [
            'left'   => 'flex-start',
            'center' => 'center',
            'right'  => 'flex-end',
        ];

        if ($justify && isset($fallback_map[$justify])) {
            $style[] = 'display: flex;';
            $style[] = 'flex-direction: column;';
            $style[] = 'align-items: ' . $fallback_map[$justify] . ';';
        }
    }

    $style = array_unique($style);

    // Extract the opening <div ...> from innerHTML
    if (preg_match('/^(\s*<div[^>]*>)/i', $block['innerHTML'], $matches)) {
        $opening_tag = $matches[1];
    } else {
        return $block_content; // Bail if we can't parse it
    }

    // Inject or merge styles into the opening tag
    $styled_tag = preg_replace_callback(
        '/<div([^>]*)>/',
        function ($matches) use ($style) {
            $attr = $matches[1];

            if (preg_match('/style="([^"]*)"/', $attr, $styleMatch)) {
                $existing = rtrim($styleMatch[1], ';') . '; ';
                $merged   = $existing . implode(' ', $style);
                $attr     = preg_replace('/style="[^"]*"/', 'style="' . esc_attr($merged) . '"', $attr);
            } else {
                $attr .= ' style="' . esc_attr(implode(' ', $style)) . '"';
            }

            return '<div' . $attr . '>';
        },
        $opening_tag,
        1
    );

    // Render inner blocks
    $inner = '';
    foreach ($block['innerBlocks'] ?? [] as $inner_block) {
        $inner .= render_block($inner_block);
    }

    // Final assembled output
    return $styled_tag . $inner . '</div>';
}, 10, 2);
