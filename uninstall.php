<?php
    defined('WP_UNINSTALL_PLUGIN') || exit;

    // only remove data if user opted in
    // ntil we have a settings UI, this option will not exist,
    // so get_option will return false and we keep everything.
    $costered_delete_data = get_option('costered_delete_data_on_uninstall', false);

    if ($costered_delete_data !== 'yes') {
        return;
    }

    global $wpdb;
    $costered_table_name = $wpdb->prefix . 'costered_things';
    $costered_table_name_escaped = esc_sql($costered_table_name);
    
    /*
    * We need a direct DROP TABLE here. WordPress placeholders do not support
    * identifiers such as table names; using $wpdb->prepare and %s would wrap the name 
    * in quotes and produce invalid SQL.
    *
    * $table_name_escaped is derived solely from $wpdb->prefix and a fixed suffix,
    * so user input cannot reach it. We disable the relevant sniffs for this line
    * to avoid a false positive while keeping the query actually safe.
    */
    // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery, PluginCheck.Security.DirectDB.UnescapedDBParameter
    $wpdb->query("DROP TABLE IF EXISTS " . $costered_table_name_escaped . ";");

    // clean up options
    delete_option('costered_db_version');
    delete_option('costered_delete_data_on_uninstall');