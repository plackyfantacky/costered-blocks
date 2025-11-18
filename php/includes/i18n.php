<?php

if (! defined('COSTERED_BLOCKS_PATH')) {
    define('COSTERED_BLOCKS_PATH', trailingslashit(dirname(__DIR__, 2)));
}

// labels from JSON file for i18n
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

function costered_i18n(string $path, $default = null, string $textdomain = 'costered-blocks') {
    $node = costered_i18n_strings($textdomain);
    foreach (explode('.', $path) as $segment) {
        if (! is_array($node) || ! array_key_exists($segment, $node)) {
            return $default;
        }
        $node = $node[$segment];
    }
    return $node;
}