<?php 
    
    /**
     * Are Costered Blocks debug tools enabled?
     *
     * Source of truth is WP_DEBUG. If WP_DEBUG is not defined, we treat debug as off.
     * This runs everywhere (frontend, admin, REST) because WP_DEBUG is global.
     */
    function costered_is_debug_enabled(): bool {
        $enabled = defined('WP_DEBUG') && WP_DEBUG;
        return (bool) apply_filters('costered_is_debug_enabled', $enabled);
    }

    /**
     * Convenience logger – only logs when debug is enabled.
     */
    function costered_debug_log(string $label, $data = null): void {
        if (!costered_is_debug_enabled()) {
            return;
        }

        if ($data === null) {
            error_log("[costered] {$label}");
            return;
        }

        $text = is_scalar($data) ? (string) $data : print_r($data, true);
        error_log("[costered] {$label}: {$text}");
    }