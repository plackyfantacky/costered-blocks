<?php

/**
 * Inline desktop styles + optional tablet/mobile CSS per block.
 * - Desktop: injected into the first tag's style="" (inline)
 * - Tablet/Mobile: appended as a <style> with @media, scoped by [data-costered="UID"]
 */
add_filter('render_block', function($block_content, $block) {
    if (empty($block['attrs']) || !is_array($block['attrs'])) {
        return $block_content;
    }

    $attrs = $block['attrs'];
    $allowed = costered_get_attributes_map();
    $costered = costered_ensure_shape($attrs['costered'] ?? null);  
    $blockName = $block['blockName'] ?? '';

    // Get a selector UID (saved if present; else ephemeral so CSS can be buffered now)
    $uid = costered_resolve_block_uid($attrs, /* allow_fallback */ true);

    // Inject data-costered only when we have a UID string (helpers already guard)
    $block_content = costered_inject_data_attr($block_content, $uid);

    $desktop = [];
    $tablet = [];
    $mobile = [];

    if (!empty($allowed)) {
        foreach ($allowed as $attr_key => $css_key) {
            $desktop_value = costered_get($attrs, $attr_key, 'desktop', /* raw? */ false);
            if (!costered_is_unset_like($desktop_value)) {
                $desktop[$attr_key] = $desktop_value;
            }
    
            $tablet_value = costered_get($attrs, $attr_key, 'tablet', /* raw? */ true);
            if (!costered_is_unset_like($tablet_value)) {
                $tablet[$attr_key] = $tablet_value;
            }
    
            $mobile_value = costered_get($attrs, $attr_key, 'mobile', /* raw? */ true);
            if (!costered_is_unset_like($mobile_value)) {
                $mobile[$attr_key] = $mobile_value;
            }
        }
    } else {
        // Fallback: map all keys present in buckets if the attributes map is empty
        foreach (($costered['desktop']['styles'] ?? []) as $key => $value) {
            if (!costered_is_unset_like($value)) $desktop[$key] = $value;
        }
        foreach (($costered['tablet']['styles'] ?? []) as $key => $value) {
            if (!costered_is_unset_like($value)) $tablet[$key] = $value;
        }
        foreach (($costered['mobile']['styles'] ?? []) as $key => $value) {
            if (!costered_is_unset_like($value)) $mobile[$key] = $value;
        }
    }

    // Grid placement into each bucket
    $desktop_grid_area = costered_get($attrs, 'gridArea', 'desktop', /* raw? */ false) ?? null;
    $desktop_grid_column = costered_get($attrs, 'gridColumn', 'desktop', /* raw? */ false) ?? null;
    $desktop_grid_row = costered_get($attrs, 'gridRow', 'desktop', /* raw? */ false) ?? null;

    if (!costered_is_unset_like($desktop_grid_area)) {
        $desktop['gridArea'] = trim((string)$desktop_grid_area) . ' !important';
    } else {
        if (!costered_is_unset_like($desktop_grid_column)) $desktop['gridColumn'] = trim((string)$desktop_grid_column) . ' !important';
        if (!costered_is_unset_like($desktop_grid_row)) $desktop['gridRow'] = trim((string)$desktop_grid_row) . ' !important';
    }

    $tablet_grid_area = costered_get($attrs, 'gridArea',   'tablet', /* raw? */ true);
    $tablet_grid_column = costered_get($attrs, 'gridColumn', 'tablet', /* raw? */ true);
    $tablet_grid_row = costered_get($attrs, 'gridRow', 'tablet', /* raw? */ true);

    if (!costered_is_unset_like($tablet_grid_area)) {
        $tablet['gridArea'] = trim((string)$tablet_grid_area) . ' !important';
    } else {
        if (!costered_is_unset_like($tablet_grid_column)) $tablet['gridColumn'] = trim((string)$tablet_grid_column) . ' !important';
        if (!costered_is_unset_like($tablet_grid_row)) $tablet['gridRow'] = trim((string)$tablet_grid_row) . ' !important';
    }

    $mobile_grid_area = costered_get($attrs, 'gridArea', 'mobile', /* raw? */ true);
    $mobile_grid_column = costered_get($attrs, 'gridColumn', 'mobile', /* raw? */ true);
    $mobile_grid_row = costered_get($attrs, 'gridRow', 'mobile', /* raw? */ true);

    if (!costered_is_unset_like($mobile_grid_area)) {
        $mobile['gridArea'] = trim((string)$mobile_grid_area) . ' !important';
    } else {
        if (!costered_is_unset_like($mobile_grid_column)) $mobile['gridColumn'] = trim((string)$mobile_grid_column) . ' !important';
        if (!costered_is_unset_like($mobile_grid_row)) $mobile['gridRow'] = trim((string)$mobile_grid_row) . ' !important';
    }

    // Map camelCase attr keys to kebab-case CSS keys
    $mapCamelToKebab = function(array $assoc) use ($allowed) {
        $output = [];
        foreach ($assoc as $attr_key => $value) {
            if (isset($allowed[$attr_key])) {
                $output[$allowed[$attr_key]] = $value;
            } else {
                $output[costered_camel_kebab($attr_key)] = $value;
            }
        } 
        return $output;
    };

    // always returns 'desktop' filled; 'tablet' and 'mobile' may be empty
    $stylesByBreakpoint = [
        'desktop' => $mapCamelToKebab($desktop),
        'tablet'  => $mapCamelToKebab($tablet),
        'mobile'  => $mapCamelToKebab($mobile),
    ];

    // Build CSS and add to the shared buffer
    $css = costered_build_css_for_uid_pretty($uid, $stylesByBreakpoint, $blockName);

    //if ($css === '') {
        //error_log('costered: no CSS for uid ' . var_export($uid, true));
    //} else {
    if ($css !== '') {
        error_log('costered: added CSS for uid ' . var_export($uid, true));
    }

    if ($css !== '') {
        costered_styles_add($css);
    }

    return $block_content;
}, 10, 2);

add_filter('block_type_metadata_settings', function($settings, $metadata) {
    $targets = [
        'core/group',
        'core/buttons',
        'core/columns'
    ];

    if (!in_array($metadata['name'] ?? '', $targets, true)) {
        return $settings;
    }

    // ensure support exists
    if (!isset($settings['supports']) || !is_array($settings['supports'])) {
        $settings['supports'] = [];
    }

    // nuke the attrs.layout object (which is used for the default block layout controls)
    $settings['supports']['layout'] = false;
    return $settings;
}, 10, 2);