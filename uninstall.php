<?php
    defined('WP_UNINSTALL_PLUGIN') || exit;

    // only remove data if user opted in
    // ntil we have a settings UI, this option will not exist,
    // so get_option will return false and we keep everything.
    $delete_data = get_option('costered_delete_data_on_uninstall', false);

    if ($delete_data !== 'yes') {
        return;
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'costered_things';
    // drop our custom table if it exists
    $wpdb->query("DROP TABLE IF EXISTS {$table_name};");

    // clean up options
    delete_option('costered_db_version');
    delete_option('costered_delete_data_on_uninstall');