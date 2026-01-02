<?php 

    if (!function_exists('costered_debug_log')) {
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
    }