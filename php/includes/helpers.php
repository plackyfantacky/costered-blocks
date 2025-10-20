<?php

/**
 * Load and cache the full Costered config JSON.
 * Supports both the new shape:
 *   { "attributes": {...}, "settings": {...}, "collections": {...}, "meta": {...} }
 * and the legacy (flat) shape:
 *   { "width": {...}, "marginTop": {...}, ... }
 *
 * @param bool $force_reload  Bypass the static cache and re-read from disk.
 * @return array              Normalised associative array with at least an "attributes" key.
 */
function costered_load_config($force_reload = false) {
    static $cache = null;

    if (!$force_reload && is_array($cache)) {
        return $cache;
    }

    $file = rtrim(COSTERED_BLOCKS_PATH, '/\\') . '/config/config.json';
    if (!is_string($file) || !file_exists($file) || !is_readable($file)) {
        // Always return a normalized structure
        $cache = [
            'attributes' => [],
            'collections' => [],
            'settings' => []
        ];
        return $cache;
    }

    $json = file_get_contents( $file );
    $data = json_decode( $json, true );

    if (!is_array($data)) {
        $cache = [
            'attributes' => [],
            'collections' => [],
            'settings' => []
        ];
        return $cache;
    }

    // Normalise legacy flat configs into the new shape
    if (!array_key_exists('attributes', $data) || !is_array($data['attributes'])) {
        $data = [
            'attributes'  => (array) $data,
            'collections' => [],
            'settings'    => []
        ];
    } else {
        // Ensure optional keys exist
        $data += [
            'settings'    => [],
            'collections' => [],
        ];
        // Force arrays for the optional keys
        foreach (['settings','collections'] as $k) {
            if (!is_array($data[$k])) $data[$k] = [];
        }
    }

    $cache = $data;
    return $cache;
}

/**
 * Build a map of attributeKey => cssProperty from the loaded config.
 * Reads from the "attributes" key of the config.
 *
 * @param bool $force_reload  If true, re-reads the JSON before generating the map.
 * @return array               e.g. [ 'marginTop' => 'margin-top', 'gap' => 'gap', ... ]
 */
function costered_get_attributes_map($force_reload = false) {
    static $map_cache = null;

    if (!$force_reload && is_array($map_cache)) {
        return $map_cache;
    }

    $config = costered_load_config($force_reload);
    $attrs  = isset($config['attributes']) && is_array($config['attributes'])
        ? $config['attributes']
        : [];

    $map = [];
    foreach ($attrs as $attrKey => $meta) {
        if (is_array($meta) && !empty($meta['css'])) {
            $map[$attrKey] = $meta['css'];
        }
    }

    $map_cache = $map;
    return $map_cache;
}

/**
 * Extract a stable block UID from the attributes, if present and valid.
 * Sanitizes to allow only [A-Za-z0-9\-_:.] and max length 64.
 * Returns null if no valid costeredId is found.
 * 
 * @param array $attrs  The block attributes array.
 * @return string|null   The sanitized costeredId or null if not found/invalid.
 */
function costered_resolve_block_uid(array $attrs, $allow_fallback = true) {
    $saved = $attrs['costeredId'] ?? $attrs['costeredID'] ?? null;
    if (is_string($saved) && $saved !== '') {
        return substr(preg_replace('/[^A-Za-z0-9\-_:.]/', '', $saved), 0, 64);
    }
    if (!$allow_fallback) return null;

    static $sequence = 0;
    $sequence++;
    $pid = (int) (get_the_ID() ?: 0);
    return 'cb-e-' . $pid . '-' . $sequence;
}

/**
 * Inject a data-costered="UID" attribute into the first HTML tag.
 * Returns modified HTML (or original if it couldn't inject).
 */
function costered_inject_data_attr($html, $uid) {
    if (!is_string($html) || $html === '') return $html;
    if (!is_string($uid) || $uid === '') return $html;

    if (!preg_match('/^\s*<[^>]+>/', $html, $match, PREG_OFFSET_CAPTURE)) return $html;

    $tag = $match[0][0];
    $offset = $match[0][1];
    $escaped = htmlspecialchars((string)$uid, ENT_QUOTES, 'UTF-8');

    // If it already has data-costered, leave it (or replace it if you prefer)
    if (stripos($tag, 'data-costered=') !== false) {
        // Replace existing value
        $new_tag = preg_replace('/\sdata-costered=("|\')[^"\']*\1/i', ' data-costered="' . $escaped . '"', $tag, 1);
    } else {
        // Inject before '>'
        $new_tag = rtrim($tag, '>') . ' data-costered="' . $escaped . '">';
    }
    return substr_replace($html, $new_tag, $offset, strlen($tag));
}

/**
 * Ensure the new responsive shape exists.
 * ['desktop'=>['styles'=>[]], 'tablet'=>['styles'=>[]], 'mobile'=>['styles'=>[]]]
 */
function costered_ensure_shape($costered) {
    $safe = is_array($costered) ? $costered : [];
    
    $safe['desktop'] = isset($safe['desktop']) && is_array($safe['desktop']) ? $safe['desktop'] : [];
    $safe['tablet']  = isset($safe['tablet'])  && is_array($safe['tablet'])  ? $safe['tablet']  : [];
    $safe['mobile']  = isset($safe['mobile'])  && is_array($safe['mobile'])  ? $safe['mobile']  : [];
    
    $safe['desktop']['styles'] = isset($safe['desktop']['styles']) && is_array($safe['desktop']['styles']) ? $safe['desktop']['styles'] : [];
    $safe['tablet']['styles']  = isset($safe['tablet']['styles'])  && is_array($safe['tablet']['styles'])  ? $safe['tablet']['styles']  : [];
    $safe['mobile']['styles']  = isset($safe['mobile']['styles'])  && is_array($safe['mobile']['styles'])  ? $safe['mobile']['styles']  : [];
    
    return $safe;
}

/** Treat these as unset/empty */
function costered_is_unset_like($value) {
    return $value === null || $value === '' || $value === 'null' || $value === 'undefined';
}

/** camelCase → kebab-case for CSS props */
function costered_camel_kebab($key) {
    return strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', (string) $key));
}

/**
 * Read a value from the responsive shape.
 * $raw = true  → read ONLY the given $breakpoint bucket
 * $raw = false → cascade upwards (mobile→tablet→desktop)
 */
function costered_get($attrs, $key, $breakpoint = 'desktop', $raw = true) {
    $shaped = costered_ensure_shape(isset($attrs['costered']) ? $attrs['costered'] : null);
    $buckets = $raw
        ? [$breakpoint]
        : ($breakpoint === 'mobile' ? ['mobile','tablet','desktop'] : ($breakpoint === 'tablet' ? ['tablet','desktop'] : ['desktop']));

    foreach ($buckets as $bucket) {
        $styles = $shaped[$bucket]['styles'];
        if (array_key_exists($key, $styles) && !costered_is_unset_like($styles[$key])) {
            return $styles[$key];
        }
    }

    return null;
}

/** Turn an assoc array of camelCase => value into a CSS declaration string */
function costered_style_string($camel_array) {
    $output = [];
    foreach ($camel_array as $key => $value) {
        if (costered_is_unset_like($value)) continue;
        $output[] = costered_camel_kebab($key) . ': ' . trim((string) $value) . ';';
    }
    return implode(' ', $output);
}

/**
 * Build desktop/tablet/mobile CSS blocks for a selector.
 * $stylesByBp: ['desktop'=>[prop=>val], 'tablet'=>[...], 'mobile'=>[...]]
 */
function costered_build_css_for_selector($selector, $stylesByBp) {
    $css = '';
    if (!empty($stylesByBp['desktop'])) {
        $css .= $selector . ' { ' . costered_style_string($stylesByBp['desktop']) . " }\n";
    }
    if (!empty($stylesByBp['tablet'])) {
        $css .= "@media (min-width: 783px) and (max-width: 1024px) { {$selector} { " . costered_style_string($stylesByBp['tablet']) . " } }\n";
    }
    if (!empty($stylesByBp['mobile'])) {
        $css .= "@media (max-width: 782px) { {$selector} { " . costered_style_string($stylesByBp['mobile']) . " } }\n";
    }
    return $css;
}

/**
 * Return numeric breakpoints (px) from config with sane defaults.
 */
function costered_get_breakpoints() {
    $config = costered_load_config();
    $breakpoint = isset($config['settings']['breakpoints']) && is_array($config['settings']['breakpoints'])
        ? $config['settings']['breakpoints'] : [];
    return [
        'mobile'  => (int)($breakpoint['mobile']  ?? 782),
        'tablet'  => (int)($breakpoint['tablet']  ?? 1024),
        'desktop' => (int)($breakpoint['desktop'] ?? 1440),
    ];
}

/**
 * Per-request CSS buffer.
 */
function costered_styles_reset() {
    $GLOBALS['costered_css_buffer'] = [];
}

function costered_styles_add($css) {
    if (!isset($GLOBALS['costered_css_buffer'])) $GLOBALS['costered_css_buffer'] = [];
    if (is_string($css) && $css !== '') {
        $GLOBALS['costered_css_buffer'][] = $css;
    }
}

function costered_styles_output() {
    //error_log('costered: styles_output fired');
    $buffer = $GLOBALS['costered_css_buffer'] ?? null;

    if (empty($buffer)) {
        //error_log('costered: styles_output fired (buffer empty)');
        return;
    }

    $joined = implode("\n", array_unique($buffer));

    if ($joined === '') {
        //error_log('costered: styles_output fired (joined empty)');
        return;
    }

    //error_log('costered: styles_output printed ' . strlen($joined) . ' bytes');
    echo "<style id=\"costered-blocks-styles\">\n{$joined}\n</style>";
}

/**
 * Build CSS for a single block uid across breakpoints.
 * $stylesByBp = ['desktop'=>[prop=>val], 'tablet'=>[...], 'mobile'=>[...]]
 */
function costered_build_css_for_uid($uid, array $stylesByBp) {
    if (!is_string($uid) || $uid === '') return '';
    $selector = '[data-costered="' . esc_attr($uid) . '"]';
    $css = '';

    $breakpoint = costered_get_breakpoints();
    $mobileMax = $breakpoint['mobile']; // e.g. 782
    $tabletMax = $breakpoint['tablet']; // e.g. 1024
    $tabletMin = $mobileMax + 1;

    // Desktop as base (no media)
    if (!empty($stylesByBp['desktop'])) {
        $css .= $selector . ' { ' . costered_style_string($stylesByBp['desktop']) . " }\n";
    }

    // Tablet range
    if (!empty($stylesByBp['tablet'])) {
        $decls = costered_style_string($stylesByBp['tablet']);
        if ($decls !== '') {
            $css .= "@media (min-width: {$tabletMin}px) and (max-width: {$tabletMax}px) { {$selector} { {$decls} } }\n";
        }
    }

    // Mobile max
    if (!empty($stylesByBp['mobile'])) {
        $decls = costered_style_string($stylesByBp['mobile']);
        if ($decls !== '') {
            $css .= "@media (max-width: {$mobileMax}px) { {$selector} { {$decls} } }\n";
        }
    }
    
    return $css;
}

/**
 * Write collected CSS to uploads/costered and return (url, path, version).
 */
function costered_write_css_file($css, $post_id = 0) {
    if (!is_string($css)) return [null, null, null];

    $css = trim($css);
    if ($css === '') return [null, null, null];

    $uploads = wp_upload_dir();
    if (!empty($uploads['error'])) return [null, null, null];

    $base_dir = rtrim($uploads['basedir'], '/\\') . '/costered';
    $base_url = rtrim($uploads['baseurl'], '/\\') . '/costered';

    if (is_ssl()) {
        $base_url = set_url_scheme($base_url, 'https');
    }

    if (!is_dir($base_dir) && !wp_mkdir_p($base_dir)) {
        return [null, null, null];
    }

    if (!is_writable($base_dir)) {
        return [null, null, null];
    }
    
    // Prefer per-post file on singulars for cache-friendliness
    $pid = $post_id ?: (int) get_the_ID() ?: 0;

    $hash = md5($css);
    $filename = ($pid ? "post-{$pid}-" : 'global-') . substr($hash, 0, 12) . '.css';
    $path = $base_dir . '/' . $filename;
    $url  = $base_url . '/' . $filename;

    // Write only if new or changed
    $need_write = !file_exists($path) || @md5_file($path) !== $hash;
    if ($need_write) {
        $bytes = @file_put_contents($path, $css, LOCK_EX);
        if ($bytes === false || !file_exists($path)) {
            return [null, null, null];
        }

        //GC: remove old files for this post or global
        foreach (glob($base_dir . '/' . ($pid ? "post-{$pid}-*.css" : 'global-*.css') ) as $oldfile) {
            if ($oldfile !== $path) @unlink($oldfile);
        }
    }

    return [$url, $path, $hash];
}

/**
 * Footer emitter: turn the buffer into a file and print a <link>.
 * Runs after blocks have rendered (buffer is full).
 */
function costered_print_collected_css_link() {
    $buffer = $GLOBALS['costered_css_buffer'] ?? [];
    if (empty($buffer)) return;

    $css = implode("\n", array_unique($buffer));
    if ($css === '') return;

    $post_id = (is_singular() ? (int) get_queried_object_id() : 0);
    list($url, $path, $version) = costered_write_css_file($css, $post_id);

    if (!$url) return;

    //clear the buffer
    $GLOBALS['costered_css_buffer'] = [];

    if (is_ssl()) {
        $url = set_url_scheme($url, 'https');
    }

    echo '<link id="costered-blocks-stylesheet" rel="stylesheet" href="' . esc_url($url) . '?ver=' . esc_attr($version) . "\" />\n";
}