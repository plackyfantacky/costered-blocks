<?php

use enshrined\svgSanitize\Sanitizer;
use enshrined\svgSanitize\data\AllowedTags as BaseAllowedTags;
use enshrined\svgSanitize\data\AllowedAttributes as BaseAllowedAttributes;

// Allow safe SVG uploads
add_filter('upload_mimes', function ($mimes) {
    if (current_user_can('upload_files') && current_user_can('unfiltered_html')) {
        $mimes['svg'] = 'image/svg+xml';
    }
    return $mimes;
});

// Verify and sanitise SVG uploads
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes, $real_mime = '') {
    $filetype = wp_check_filetype($filename, $mimes);
    return [
        'ext' => $filetype['ext'],
        'type' => $filetype['type'],
        'proper_filename' => $data['proper_filename'],
    ];
}, 10, 5);

add_filter('wp_get_attachment_image_attributes', function ($attr, $attachment) {
    if (get_post_mime_type($attachment) === 'image/svg+xml') {
        unset($attr['width'], $attr['height']);       // let CSS control sizing
        $attr['class'] = trim(($attr['class'] ?? '') . ' is-svg');
        $attr['role']  = $attr['role'] ?? 'img';
    }
    return $attr;
}, 10, 2);

add_action('send_headers', function () {
    header("Content-Security-Policy: object-src 'none'; base-uri 'self'");
});

// Provide SVG dimensions to the media library
add_filter('wp_prepare_attachment_for_js', function ($response, $attachment, $meta) {
    if ($response['mime'] === 'image/svg+xml' && empty($response['sizes'])) {
        $svg_path = get_attached_file($attachment->ID);
        if (file_exists($svg_path)) {
            $response['sizes'] = [
                'full' => [
                    'url' => wp_get_attachment_url($attachment->ID),
                    'width' => 0,
                    'height' => 0,
                    'orientation' => 'portrait'
                ]
            ];
        }
    }
    return $response;
}, 10, 3);

function costered_sanitize_svg_raw(string $raw): string {
    if (stripos($raw, '<svg') === false) return '';

    $pre = costered_svg_lift_presentation_styles_to_attributes($raw);

    $sanitizer = new Sanitizer();
    $sanitizer->minify(true);
    $sanitizer->removeXMLTag(true);
    $sanitizer->removeRemoteReferences(true);

    //allow animations
    costered_svg_allow_smil($sanitizer);

    $clean = $sanitizer->sanitize($pre);
    if ($clean === false || $clean === '') {
        // Optional: inspect problems
        return '';
    }

    // Optional Gutenberg-friendly normalisation (helps block diffs)
    $selfClosing = '(?:path|rect|circle|ellipse|line|polyline|polygon|stop|use|g|mask|clippath|lineargradient|radialgradient|pattern|marker)';
    $clean = preg_replace('/<(' . $selfClosing . ')(\b[^>]*)\/\s*>/i', '<$1$2></$1>', $clean) ?? $clean;
    
    return trim($clean);
}

// Returns true if the post content contains our inline-svg block.
function costered_contains_inline_svg_block(string $content): bool {
    if (strpos($content, '<!-- wp:') === false) {
        return false;
    }
    $stack = parse_blocks($content);
    while (!empty($stack)) {
        $b = array_pop($stack);
        if (!is_array($b)) {
            continue;
        }
        if (!empty($b['blockName']) && $b['blockName'] === 'costered-blocks/inline-svg') {
            return true;
        }
        if (!empty($b['innerBlocks']) && is_array($b['innerBlocks'])) {
            // push children to stack for iterative DFS (avoids recursion pitfalls)
            foreach ($b['innerBlocks'] as $child) {
                $stack[] = $child;
            }
        }
    }
    return false;
}

/**
 * Move url(...) style declarations to real SVG attributes, so KSES won't drop them.
 * Only touches allowed properties; leaves the rest intact.
 */
function costered_svg_move_url_styles_to_attrs(string $svg): string {
    // Quick bail if there's no style= or url(
    if (stripos($svg, 'style=') === false || stripos($svg, 'url(') === false) {
        return $svg;
    }

    // Tags where this commonly appears
    $tags = 'path|rect|circle|ellipse|line|polyline|polygon|g|use|mask|clippath';
    $pattern = '/<(' . $tags . ')\b([^>]*?)style="([^"]*url\([^"]*\)[^"]*)"([^>]*)>/i';

    return preg_replace_callback($pattern, function ($m) {
        $tag = $m[1];
        $before = $m[2];
        $style = $m[3];
        $after  = $m[4];

        // Parse style declarations
        $pairs = array_filter(array_map('trim', explode(';', $style)), 'strlen');

        $attrs = [];
        $kept  = [];

        foreach ($pairs as $decl) {
            [$name, $val] = array_map('trim', array_pad(explode(':', $decl, 2), 2, ''));
            $lname = strtolower($name);
            // Only lift url(...) values on known properties
            if ($val !== '' && preg_match('/^url\(\s*#[^)]+\)$/i', $val)) {
                if (in_array($lname, [
                    'fill','stroke','filter','clip-path','mask',
                    'marker-start','marker-mid','marker-end'
                ], true)) {
                    $attrs[$lname] = $val; // keep as-is (url(#...))
                    continue; // do not keep in style=""
                }
            }
            $kept[] = $name . ':' . $val;
        }

        // Rebuild start tag
        $attrStr = '';
        foreach ($attrs as $k => $v) {
            // If attribute already present in before/after, skip adding a duplicate
            if (stripos($before.$after, $k.'=') === false) {
                $attrStr .= ' ' . $k . '="' . esc_attr($v) . '"';
            }
        }

        // Rebuild style=""
        if (count($kept)) {
            $styleStr = ' style="' . esc_attr(implode(';', $kept)) . '"';
        } else {
            $styleStr = '';
        }

        return '<' . $tag . $before . $attrStr . $styleStr . $after . '>';
    }, $svg);
}

/**
 * Lift SVG presentation declarations from style="" into attributes so KSES won't strip them.
 * Also lifts url(#...) declarations for fill/stroke/filter/clip-path/mask/marker-*.
 */
function costered_svg_lift_presentation_styles_to_attributes(string $svg): string {
    if (stripos($svg, 'style=') === false) return $svg;

    // Elements that commonly carry style=""
    $tags = 'path|rect|circle|ellipse|line|polyline|polygon|g|use|mask|clippath|text|tspan';
    $pattern = '/<(' . $tags . ')\b([^>]*?)\sstyle="([^"]+)"([^>]*)>/i';

    // Properties we will lift to attributes verbatim
    $presentationProps = [
        'fill','fill-opacity','fill-rule',
        'stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit',
        'stroke-dasharray','stroke-dashoffset','stroke-opacity',
        'vector-effect','paint-order','shape-rendering','image-rendering','mix-blend-mode',
        'color-interpolation-filters',
        'filter','clip-path','mask',
        'marker-start','marker-mid','marker-end',
        // add others you care about
    ];

    return preg_replace_callback($pattern, function ($m) use ($presentationProps) {
        $tag = $m[1];
        $before = $m[2];
        $style = $m[3];
        $after = $m[4];

        // Parse style="a:b; c:d"
        $pairs = array_filter(array_map('trim', explode(';', $style)), 'strlen');

        $attrs = [];
        $kept = [];

        foreach ($pairs as $decl) {
            [$name, $val] = array_map('trim', array_pad(explode(':', $decl, 2), 2, ''));
            if ($name === '') continue;

            $lname = strtolower($name);

            // 1) Lift known presentation props to attributes (any safe-ish value)
            if (in_array($lname, $presentationProps, true)) {
                if ($val !== '') $attrs[$lname] = $val;
                continue; // do not keep in style=""
            }

            // 2) Lift url(#...) for the usual suspects even if not in the list above
            if ($val !== '' && preg_match('/^url\(\s*#[^)]+\)$/i', $val)) {
                if (in_array($lname, ['fill','stroke','filter','clip-path','mask','marker-start','marker-mid','marker-end'], true)) {
                    $attrs[$lname] = $val;
                    continue;
                }
            }

            // Otherwise leave in style=""
            $kept[] = $name . ':' . $val;
        }

        // Build attributes (avoid duplicates if already present)
        $attrStr = '';
        foreach ($attrs as $k => $v) {
            if (stripos($before . $after, $k . '=') === false) {
                $attrStr .= ' ' . $k . '="' . esc_attr($v) . '"';
            }
        }

        // Rebuild style only if anything left
        $styleStr = count($kept) ? ' style="' . esc_attr(implode(';', $kept)) . '"' : '';

        return '<' . $tag . $before . $attrStr . $styleStr . $after . '>';
    }, $svg);
}

/**
 * REST API endpoint to retrieve and sanitise an SVG attachment by ID.
 */
add_action('rest_api_init', function () {
    register_rest_route('costered-blocks/v1', '/svg/(?P<id>\d+)', [
        'methods' => 'GET',
        'permission_callback' => function () {
            return current_user_can('edit_posts'); // editor context
        },
        'callback' => function (\WP_REST_Request $req) {
            $id = (int) $req['id'];
            if ($id <= 0) {
                return new \WP_REST_Response(['error' => 'invalid_id'], 400);
            }

            $mime = get_post_mime_type($id);
            if ($mime !== 'image/svg+xml') {
                return new \WP_REST_Response(['error' => 'unsupported_media_type'], 415); // unsupported media type
            }

            $file = get_attached_file($id);
            if (! $file || ! file_exists($file)) {
                return new \WP_REST_Response(['error' => 'not_found'], 404);
            }

            $raw = file_get_contents($file);
            if ($raw === false || $raw === '') {
                return new \WP_REST_Response(['error' => 'empty_file'], 500);
            }

            // === Sanitizer step (with instrumentation) ===
            $rawLen = strlen($raw);
            $clean = costered_sanitize_svg_raw($raw);
            $ok = is_string($clean) && $clean !== '';
            $cleanLen = $ok ? strlen($clean) : 0;

            if (!$ok) {
                return new \WP_REST_Response(['error' => 'sanitisation_failed'], 400);
            }

            // because wp_kses hates svgs, and I hate wp_kses back
            $clean = costered_sanitize_svg_raw($raw);
            if ($clean === '') {
                return new WP_REST_Response(['error' => 'sanitisation_failed'], 400);
            }

            // Normal success path
            $resp = new \WP_REST_Response(['svg' => $clean], 200);
            $resp->set_headers(['Cache-Control' => 'no-store, max-age=0']);
            return $resp;
        }
    ]);
});

// Sanitize inline SVGs on post save (before KSES).
add_filter('content_save_pre', function (string $content) {
    if (!costered_contains_inline_svg_block($content)) {
        return $content;
    }

    $content = preg_replace_callback('#<svg\b[^>]*>.*?</svg>#is', function ($m) {
        $clean = costered_sanitize_svg_raw($m[0]);
        return $clean ?: '';
    }, $content) ?? $content;

    return $content;
}, 8);

// Bypass KSES only for this save if our block is present and context/user are trusted.
add_filter('content_save_pre', function (string $content) {
    if (!costered_contains_inline_svg_block($content)) {
        return $content;
    }

    // Only in admin or REST requests
    $is_trusted_context = (is_admin() || defined('REST_REQUEST'));
    // Only for trusted users (tweak the cap if you prefer)
    $is_trusted_user    = current_user_can('edit_theme_options');

    if ($is_trusted_context && $is_trusted_user) {
        remove_filter('content_save_pre', 'wp_filter_post_kses', 10);
        remove_filter('content_filtered_save_pre','wp_filter_post_kses', 10);
    }

    return $content;
}, 9);

class CosteredAllowedTagsSMIL extends BaseAllowedTags {
    public static function getTags(): array {
        $base = parent::getTags();

        $extra = [
            'animate',
            'animatetransform',
            'animatemotion',
            'set',
        ];

        return array_values(array_unique(array_merge($base, $extra)));
    }
}

class CosteredAllowedAttributesSMIL extends BaseAllowedAttributes {
    public static function getAttributes(): array {
        $base = parent::getAttributes();

        $extra = [
            'attributename', 'from', 'to', 'dur', 'repeatcount', 'values',
            'keytimes', 'keysplines', 'calcmode', 'begin', 'end', 'fill',
            'additive', 'accumulate', 'min', 'max', 'restart',
            'type', 'path', 'keypoints', 'rotate',
            'href', 'xlink:href',
        ];

        return array_values(array_unique(array_merge($base, $extra)));
    }
}

/** Extend allowed tags/attrs to keep SMIL animation. */
function costered_svg_allow_smil(Sanitizer $sanitizer): void
{
    $sanitizer->setAllowedTags(new CosteredAllowedTagsSMIL());
    $sanitizer->setAllowedAttrs(new CosteredAllowedAttributesSMIL());
}

