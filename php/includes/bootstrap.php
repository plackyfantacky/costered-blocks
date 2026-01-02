<?php

    if (!function_exists('costered_is_debug_enabled')) {
        function costered_is_debug_enabled(): bool {
            $enabled = defined('WP_DEBUG') && WP_DEBUG;
            return (bool) apply_filters('costered_is_debug_enabled', $enabled);
        }
    }

    if (!function_exists('costered_debug_tools_available')) {
        function costered_debug_tools_available(): bool {
            $debug_tools_file = COSTERED_BLOCKS_PATH . 'php/includes/debug.php';
            return file_exists($debug_tools_file);
        }
    }

    if (!function_exists('costered_debug_tools_active')) {
        function costered_debug_tools_active(): bool {
            $active = costered_is_debug_enabled() && costered_debug_tools_available();
            return (bool) apply_filters('costered_debug_tools_active', $active);
        }
    }
