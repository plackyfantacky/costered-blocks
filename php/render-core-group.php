<?php

add_filter('render_block_core/group', function ($block_content, $block) {
    $attrs  = $block['attrs'] ?? [];
    $layout = $attrs['layout'] ?? [];

    $type = $layout['type'] ?? '';
    $orientation  = $layout['orientation'] ?? 'horizontal';

    $justify = $attrs['layout']['justifyContent'] ?? $attrs['justifyContent'] ?? '';
    $align_items = $attrs['layout']['alignItems'] ?? $attrs['alignItems'] ?? '';

    $attrStyle = $attrs['style'] ?? [];
    $styleLayout = $attrStyle['layout'] ?? [];
    $columnSpan = $styleLayout['columnSpan'] ?? '';
    $rowSpan = $styleLayout['rowSpan'] ?? '';

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

    // Container type
    if (($attrs['containerType'] ?? '') === 'boxed') {
        //TODO: add support for a custom global layout width
        $width = $attrs['containerWidth'] ?? '1200px';
        $style[] = "max-width: {$width};";
        $style[] = 'width: 100%;';
        // TO DO: might need to add a third layout type to boxed layouts without centering
    } elseif (($attrs['containerType'] ?? '') === 'full') {
        // Full width, no max-width
        $style[] = 'width: 100%;';
        $style[] = 'max-width: none;';
    }

    // Grid column/row span (if group is a child of a grid container)
    // we need to process this regardless of the layout type

    if ($columnSpan) {
        $style[] = 'grid-column: span ' . esc_attr($columnSpan) . ';';
    }

    if ($rowSpan) {
        $style[] = 'grid-row: span ' . esc_attr($rowSpan) . ';';
    }

    // Layout: flex/grid
    if (is_array($layout)) {

        if ($type === 'flex') {
            $style[] = 'display: flex;';


            if ($orientation === 'vertical') {
                $style[] = 'flex-direction: column;';
                if ($justify) {
                    $style[] = 'align-items: ' . esc_attr($justify) . ';';
                }
            } elseif ($orientation === 'horizontal') {
                $style[] = 'flex-direction: row;';
                if ($justify) {
                    $style[] = 'justify-content: ' . esc_attr($justify) . ';';
                }
                if ($align_items) {
                    $style[] = 'align-items: ' . esc_attr($align_items) . ';';
                }
            }
        }

        if ($type === 'grid') {
            $style[] = 'display: grid;';
            if ($justify) {
                $style[] = 'justify-content: ' . esc_attr($justify) . ';';
            }
            if (!empty($layout['alignItems'])) {
                $style[] = 'align-items: ' . esc_attr($layout['alignItems']) . ';';
            }

            if (!empty($layout['columnCount'])) {
                $style[] = "grid-template-columns: repeat({$layout['columnCount']}, 1fr);";
            } elseif (!empty($layout['minimumColumnWidth'])) {
                $min = esc_attr($layout['minimumColumnWidth']);
                $style[] = "grid-template-columns: repeat(auto-fit, minmax({$min}, 1fr));";
            }
        }

        // Fallback content alignment for non-flex layouts
        if (empty($type) || $type === 'default' || $type === 'constrained') {
            $fallback_map = [
                'left'   => 'flex-start',
                'center' => 'center',
                'right'  => 'flex-end',
            ];

            $mapped_justify = $fallback_map[$justify] ?? null;

            if ($justify && isset($fallback_map[$justify])) {
                $style[] = 'display: flex;';
                $style[] = 'flex-direction: column;';
                $style[] = 'align-items: ' . esc_attr($mapped_justify) . ';';
            }

            if ($align_items) {
                $style[] = 'align-items: ' . esc_attr($align_items) . ';';
            }
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
