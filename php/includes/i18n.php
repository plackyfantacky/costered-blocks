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
 * Return a single i18n string.
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
        return wp_kses($node, array());
    }

    return $default;
}

/**
 * Return an HTML-escaped i18n string.
 */
function costered_i18n_html(string $path, $default = null, string $textdomain = 'costered-blocks'): string {
    $value = costered_i18n($path, $default, $textdomain);
    return is_string($value) ? esc_html($value) : '';
}

/**
 * Return an attribute-escaped i18n string.
 */
function costered_i18n_attr(string $path, $default = null, string $textdomain = 'costered-blocks'): string {
    $value = costered_i18n($path, $default, $textdomain);
    return is_string($value) ? esc_attr($value) : '';
}

/**
 * Print an i18n string.
 */
function costered_i18n_e(string $path, $default = '', string $textdomain = 'costered-blocks'): void {
    // use wp_kses wherever needed on the output side
    echo wp_kses(costered_i18n($path, $default, $textdomain));
}

/**
 * Print an HTML-escaped i18n string.
 */
function costered_i18n_html_e(string $path, $default = null, string $textdomain = 'costered-blocks'): void {
    echo esc_html(costered_i18n_html($path, $default, $textdomain));
}

/**
 * Print an attribute-escaped i18n string.
 */
function costered_i18n_attr_e(string $path, $default = null, string $textdomain = 'costered-blocks'): void {
    echo esc_attr(costered_i18n_attr($path, $default, $textdomain));
}