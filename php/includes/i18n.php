<?php

if (! defined('COSTERED_BLOCKS_PATH')) {
    define('COSTERED_BLOCKS_PATH', trailingslashit(dirname(__DIR__, 2)));
}

// Retrieve labels from /config/strings.php.
// read from file once and make available globally
function costered_i18n_strings(string $textdomain = 'costered-blocks'): array {
    static $labels = null;
    if ($labels === null) {
        $labels = include COSTERED_BLOCKS_PATH . 'config/strings.php';
    }
    return $labels;
}
/**
 * Retrieve a single i18n string.
 */
function costered_i18n(string $path, $default = '', string $textdomain = 'costered-blocks'):string {
    $node = costered_i18n_strings($textdomain);

    foreach (explode('.', $path) as $segment) {
        if (! is_array($node) || ! array_key_exists($segment, $node)) {
            return $default;
        }
        $node = $node[$segment];
    }
    
    if (is_string($node)) {
        return $node;
    }

    return $default;
}

/**
 * Retrieve an HTML-escaped i18n string.
 */
function costered_i18n_html(string $path, $default = null, string $textdomain = 'costered-blocks'): string {
    $value = costered_i18n($path, $default, $textdomain);
    return is_string($value) ? esc_html($value) : '';
}

/**
 * Retrieve an attribute-escaped i18n string.
 */
function costered_i18n_attr(string $path, $default = null, string $textdomain = 'costered-blocks'): string {
    $value = costered_i18n($path, $default, $textdomain);
    return is_string($value) ? esc_attr($value) : '';
}