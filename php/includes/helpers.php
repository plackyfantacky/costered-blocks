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

    // If it already has data-costered, leave it (or replace it)
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

/** camelCase -> kebab-case for CSS props */
function costered_camel_kebab($key) {
    return strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', (string) $key));
}

/**
 * Read a value from the responsive shape.
 * $raw = true  -> read ONLY the given $breakpoint bucket
 * $raw = false -> cascade upwards (mobile->tablet->desktop)
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
function costered_style_string($camel_array, $indent = "    ") {
    $output = [];
    foreach ($camel_array as $key => $value) {
        if (costered_is_unset_like($value)) continue;
        $output[] = $indent . costered_camel_kebab($key) . ': ' . trim((string) $value) . ';';
    }
    if (empty($output)) return '';
    return implode("\n", $output) . "\n";
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

/**
 * Checks the current blockName against a list of blocks that need strengthened selectors.
 * If the block is in the list, it needs multiple selectors (e.g core/button needs .wp-block-button__link AND .wp-element-button).
 * Returns the original selector as-is or as an array ready for further processing.
 * 
 * @param string $selector      The base selector to strengthen e.g '[data-costered="UID"]'.
 * @param string $block_name    The block name (e.g. 'core/button').
 * @return string|array         The strengthened selector(s).
 */
function costered_return_selector_or_selector_array(string $block_name, string $selector) {
    $special_blocks = [
        'core/button' => [
            '.wp-block-buttons > ' . $selector . ' .wp-block-button__link',
            '.wp-block-buttons > ' . $selector . ' .wp-element-button'
        ],
    ];

    return $special_blocks[$block_name] ?? $selector;
}

/**
 * Join one selector or an array of selectors into a pretty, comma-separated list.
 *
 * @param string|array<int,string>      $selectorOrArray
 * @param string                        $lineIndent - Indent to prefix on each selector line.
 * @return string
 */
function costered_join_selectors(string|array $selectorOrArray, string $lineIndent = ''): string {
    if (is_string($selectorOrArray)) {
        return ($lineIndent !== '' ? $lineIndent : '') . $selectorOrArray;
    }
    $list = array_values(array_filter(array_map('trim', $selectorOrArray), 'strlen'));
    if (!$list) return '';
    return $lineIndent . implode(",\n{$lineIndent}", $list);
}

/**
 * Render a single CSS rule block (no @media yet), pretty-printed.
 *
 * @param string|array<int,string>      $selectorOrArray
 * @param array<string,string>          $declarationMap - camelCase => value
 * @param string                        $baseIndent
 * @return string
 */
function costered_render_rule_block(string|array $selectorOrArray, array $declarationMap, string $baseIndent = ''): string {
    if (empty($declarationMap)) return '';
    $selector = costered_join_selectors($selectorOrArray, $baseIndent);
    $css = "{$selector} {\n";
    $css .= costered_style_string($declarationMap, $baseIndent . '    ');
    $css .= "{$baseIndent}}\n";
    return $css;
}


/**
 * Build pretty CSS for desktop/tablet/mobile buckets for the given selector(s).
 * Uses dynamic breakpoints from costered_get_breakpoints().
 *
 * @param string|array<int,string>      $selectorOrArray
 * @param array                         $stylesByBreakpoint
 * @param string                        $baseIndent
 * @return string
 */
function costered_build_css_pretty_for_selectors(string|array $selectorOrArray, array $stylesByBreakpoint, string $baseIndent = ''): string {
    $hasDesktop = !empty($stylesByBreakpoint['desktop']);
    $hasTablet  = !empty($stylesByBreakpoint['tablet']);
    $hasMobile  = !empty($stylesByBreakpoint['mobile']);
    
    if (!$hasDesktop && !$hasTablet && !$hasMobile) {
        return '';
    }

    $selectorLine = costered_join_selectors($selectorOrArray, $baseIndent);
    if ($selectorLine === '') {
        return '';
    }

    $breakpoints = costered_get_breakpoints();
    $mobileMaxPx = (int) ($breakpoints['mobile'] ?? 782);
    $tabletMaxPx = (int) ($breakpoints['tablet'] ?? 1024);
    $tabletMinPx = $mobileMaxPx + 1;

    $baseDeclIndent   = $baseIndent . '    ';
    $nestedBlockIndent = $baseIndent . '    ';
    $innerDeclIndent  = $nestedBlockIndent . '    ';

    $css = $selectorLine . " {\n";

    // Base (desktop) declarations
    if ($hasDesktop) {
        $css .= costered_style_string($stylesByBreakpoint['desktop'], $baseDeclIndent);
    }

    $hasPrintedNested = false;

    // Tablet nested @media
    if ($hasTablet) {
        if ($hasDesktop) {
            $css .= "\n";
        }

        $css .= $nestedBlockIndent . "@media (min-width: {$tabletMinPx}px) and (max-width: {$tabletMaxPx}px) {\n";
        $css .= costered_style_string($stylesByBreakpoint['tablet'], $innerDeclIndent);
        $css .= $nestedBlockIndent . "}\n";

        $hasPrintedNested = true;
    }

    // Mobile nested @media
    if ($hasMobile) {
        if ($hasDesktop || $hasPrintedNested) {
            $css .= "\n";
        }

        $css .= $nestedBlockIndent . "@media (max-width: {$mobileMaxPx}px) {\n";
        $css .= costered_style_string($stylesByBreakpoint['mobile'], $innerDeclIndent);
        $css .= $nestedBlockIndent . "}\n";
    }

    $css .= $baseIndent . "}\n";

    return $css;
}

/**
 * Build pretty CSS for a block UID, strengthening selectors when needed.
 * - By default, all declarations go to the base selector: [data-costered="UID"].
 * - If costered_return_selector_or_selector_array() returns stronger selector(s)
 *   (e.g. core/button -> descendant anchor selectors), margin* stays on the wrapper,
 *   everything else goes to the strengthened selector(s).
 *
 * @param string        $uid
 * @param array         $stylesByBreakpoint
 * @param string        $blockName
 * @return string
 */
function costered_build_css_for_uid_pretty(string $uid, array $stylesByBreakpoint, string $blockName = ''): string {
    if ($uid === '') return '';

    $baseWrapperSelector         = '[data-costered="' . esc_attr($uid) . '"]';
    $strengthenedSelectorOrList  = costered_return_selector_or_selector_array($blockName, $baseWrapperSelector);

    // No special handling -> everything on the wrapper selector.
    if ($strengthenedSelectorOrList === $baseWrapperSelector) {
        return costered_build_css_pretty_for_selectors($baseWrapperSelector, $stylesByBreakpoint);
    }

    // Split: margin* -> wrapper; everything else -> strengthened selector(s).
    $wrapperDeclarationsByBreakpoint = ['desktop'=>[], 'tablet'=>[], 'mobile'=>[]];
    $innerDeclarationsByBreakpoint   = ['desktop'=>[], 'tablet'=>[], 'mobile'=>[]];

    foreach (['desktop','tablet','mobile'] as $breakpointKey) {
        foreach (($stylesByBreakpoint[$breakpointKey] ?? []) as $propName => $propValue) {
            $propLower = strtolower($propName);
            if ($propLower === 'margin' || str_starts_with($propLower, 'margin-')) {
                $wrapperDeclarationsByBreakpoint[$breakpointKey][$propName] = $propValue;
            } else {
                $innerDeclarationsByBreakpoint[$breakpointKey][$propName] = $propValue;
            }
        }
    }

    $outer_css = costered_build_css_pretty_for_selectors($baseWrapperSelector, $wrapperDeclarationsByBreakpoint);
    $inner_css = costered_build_css_pretty_for_selectors($strengthenedSelectorOrList, $innerDeclarationsByBreakpoint);

    return costered_join_css_blocks([$outer_css, $inner_css]);
}

/**
 * Join CSS blocks with exactly one blank line between non-empty blocks,
 * and exactly one trailing newline at the end.
 *
 * @param string[] $blocks
 * @return string
 */
function costered_join_css_blocks(array $blocks): string {
    $output = '';
    foreach ($blocks as $block) {
        $block = rtrim((string)$block);   // strip trailing newlines/whitespace
        if ($block === '') continue;      // skip empties
        if ($output !== '') $output .= "\n\n";  // one blank line between blocks
        $output .= $block;
    }
    return $output === '' ? '' : ($output . "\n");
}

/**
 * Rebuild the CSS file for a given post ID by rendering its blocks.
 * Returns (url, path, version) or (null, null, null) on failure/no CSS.
 */
function costered_rebuild_post_css($postId) {
    $postId = (int) $postId;
    if ($postId <= 0) {
        return array(null, null, null);
    }

    $post = get_post($postId);
    if (!$post instanceof WP_Post) {
        return array(null, null, null);
    }

    // Skip trash and auto-draft etc.
    if (in_array($post->post_status, array('trash', 'auto-draft'), true)) {
        return array(null, null, null);
    }

    // Ensure the buffer is clean.
    if (function_exists('costered_styles_reset')) {
        costered_styles_reset();
    } else {
        $GLOBALS['costered_css_buffer'] = array();
    }

    $previousGlobalPost = isset($GLOBALS['post']) ? $GLOBALS['post'] : null;

    // Set the global $post and set up postdata so any block logic relying on it behaves.
    $GLOBALS['post'] = $post;
    setup_postdata($post);

    /* Trigger normal block rendering so the render_block filter can
    collect CSS into the buffer via costered_styles_add(...). */
    $renderedContent = apply_filters('the_content', $post->post_content);
    unset($renderedContent); // We only care about the side effects.

    // Collect buffered CSS.
    $buffer = isset($GLOBALS['costered_css_buffer']) && is_array($GLOBALS['costered_css_buffer'])
        ? $GLOBALS['costered_css_buffer']
        : array();

    $css = trim(implode("\n\n", $buffer));

    wp_reset_postdata();
    $GLOBALS['post'] = $previousGlobalPost;

    if ($css === '') {
        return array(null, null, null);
    }

    if (!function_exists('costered_write_css_file')) {
        return array(null, null, null);
    }

    return costered_write_css_file($css, $postId);
}

/**
 * Rebuild Costered CSS for all pages, posts, and global blocks.
 *
 * Returns the number of items processed (not necessarily the number
 * of files written successfully).
 */
function costered_rebuild_all_styles() {
    $postTypes = array('page', 'post', 'wp_block');

    $query = new WP_Query(array(
        'post_type' => $postTypes,
        'post_status' => array('publish', 'private'), // adjust if needed
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => 'ID',
        'order' => 'ASC',
        'no_found_rows' => true,
    ));

    if (!$query->have_posts()) {
        return 0;
    }

    $processedCount = 0;

    foreach ($query->posts as $postId) {
        $postId = (int) $postId;

        // Allow future optimisation if needed (logging, error handling, etc).
        costered_rebuild_post_css($postId);
        $processedCount++;
    }

    return $processedCount;
}