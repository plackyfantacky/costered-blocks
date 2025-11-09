<?php 
    
    // ===== Global debug bootstrap (frontend + admin + REST) =====

    // Default: off
    defined('COSTERED_DEBUG_DEFAULT') || define('COSTERED_DEBUG_DEFAULT', true);

    // Will be set on 'plugins_loaded'. NULL before then.
    $GLOBALS['costered_debug_flag'] = null;

    /**
     * Compute a per-request debug flag once WordPress is fully bootstrapped.
     * - Respects COSTERED_DEBUG_DEFAULT and WP_DEBUG
     * - Honours ?costered_debug=1 only for users who can edit_posts
     */
    add_action('plugins_loaded', function () {
        $enabled = COSTERED_DEBUG_DEFAULT || (defined('WP_DEBUG') && WP_DEBUG);

        // Optional per-request toggle: ?costered_debug=1
        if (isset($_GET['costered_debug']) && $_GET['costered_debug'] === '1') {
            // Pluggables are loaded by now; safe to check caps.
            if (current_user_can('edit_posts')) {
                $enabled = true;
            }
        }

        $GLOBALS['costered_debug_flag'] = (bool) $enabled;
    }, 0);

    /**
     * Read the debug flag anywhere (frontend/admin/REST), safely even very early.
     * If called before 'plugins_loaded', it falls back to constants only.
     */
    function costered_is_debug_enabled(): bool {
        if ($GLOBALS['costered_debug_flag'] !== null) {
            return (bool) $GLOBALS['costered_debug_flag'];
        }
        // Very-early fallback (no caps checks here!)
        return (bool) (COSTERED_DEBUG_DEFAULT || (defined('WP_DEBUG') && WP_DEBUG));
    }

    /**
     * Convenience logger – only logs when debug is enabled.
     */
    function costered_debug_log(string $label, $data = null): void {
        if (!costered_is_debug_enabled()) return;
        if (is_null($data)) {
            error_log("[Costered] {$label}");
        } else {
            $text = is_scalar($data) ? (string) $data : print_r($data, true);
            error_log("[Costered] {$label}: {$text}");
        }
    }