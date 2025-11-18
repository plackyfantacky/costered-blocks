<?php

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

add_filter('block_categories_all', function($block_categories, $block_editor_context) {
    // Some environments pass null here; be tolerant.
    if (!class_exists('WP_Block_Editor_Context') || !($block_editor_context instanceof WP_Block_Editor_Context)) {
        return $block_categories;
    }

    $title = costered_i18n('blocks.blockCategory');
    
    return array_merge(
        array(
            array(
                'slug' => 'costered-blocks',
                'title' => $title,
                'icon' => null,
            ),
        ),
        $block_categories
    );
    
}, 10, 2);

add_action('init', function() {
    // block registrations
    register_block_type(COSTERED_BLOCKS_PATH. '/js/blocks/inline-svg');
});


