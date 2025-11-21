<?php

if (! defined('COSTERED_BLOCKS_PATH')) {
    define('COSTERED_BLOCKS_PATH', trailingslashit(dirname(__DIR__, 2)));
}

// Retrieve labels from JSON file for i18n as array (raw, unescaped).
// read from file once and make available globally
function costered_i18n_strings(string $textdomain = 'costered-blocks'): array {
    static $cache = null;
    static $lastMtime = null;

    $file = COSTERED_BLOCKS_PATH . 'config/strings.json';
    $mtime = @filemtime($file) ?: 0;

    if ($cache !== null && $lastMtime === $mtime) {
        return $cache;
    }

    // Decode JSON
    if (function_exists('wp_json_file_decode')) {
        $data = wp_json_file_decode($file, ['associative' => true]);
    } else {
        $raw  = @file_get_contents($file);
        $data = is_string($raw) ? json_decode($raw, true) : null;
    }
    $data = is_array($data) ? $data : [];

    // Recursively translate all string leaves via __()
    $translate = function ($value) use (&$translate, $textdomain) {
        if (is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $translate($v);
            }
            return $out;
        }
        return is_string($value) ? __($value, $textdomain) : $value;
    };

    $cache = $translate($data);
    $lastMtime = $mtime;
    return $cache;
}

/**
 * Retrieve an i18n string (raw, unfiltered).
 */
function costered_i18n(string $path, $default = null, string $textdomain = 'costered-blocks'):string {
    $node = costered_i18n_strings($textdomain);
    foreach (explode('.', $path) as $segment) {
        if (! is_array($node) || ! array_key_exists($segment, $node)) {
            return $default;
        }
        $node = $node[$segment];
    }
    return $node;
}

/**
 * Retrieve an HTML-escaped i18n string.
 */
function costered_i18n_html(string $path, $default = null, string $textdomain = 'costered-blocks'): string {
    $value = costered_i18n($path, $default, $textdomain);
    return is_string($value) ? esc_html($value) : '';
}

/**
 * Retrieve an array of HTML-escaped i18n strings.
 */
function costered_i18n_html_strings(string $path, $default = null, string $textdomain = 'costered-blocks'): array {
    $node = costered_i18n_strings($textdomain);
    foreach (explode('.', $path) as $segment) {
        if (! is_array($node) || ! array_key_exists($segment, $node)) {
            return is_array($default) ? $default : [];
        }
        $node = $node[$segment];
    }

    $escape = function ($value) use (&$escape) {
        if (is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $escape($v);
            }
            return $out;
        }
        return is_string($value) ? esc_html($value) : $value;
    };

    return is_array($node) ? $escape($node) : (is_array($default) ? $default : []);
}

/**
 * Retrieve an attribute-escaped i18n string.
 */
function costered_i18n_attr(string $path, $default = null, string $textdomain = 'costered-blocks'): string {
    $value = costered_i18n($path, $default, $textdomain);
    return is_string($value) ? esc_attr($value) : '';
}

/**
 * Retrieve an array of attribute-escaped i18n strings.
 */
function costered_i18n_attr_strings(string $path, $default = null, string $textdomain = 'costered-blocks'): array {
    $node = costered_i18n_strings($textdomain);
    foreach (explode('.', $path) as $segment) {
        if (! is_array($node) || ! array_key_exists($segment, $node)) {
            return is_array($default) ? $default : [];
        }
        $node = $node[$segment];
    }

    $escape = function ($value) use (&$escape) {
        if (is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $escape($v);
            }
            return $out;
        }
        return is_string($value) ? esc_attr($value) : $value;
    };

    return is_array($node) ? $escape($node) : (is_array($default) ? $default : []);
}