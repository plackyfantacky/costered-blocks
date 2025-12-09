<?php
    // Admin menu: Tools → Costered Blocks
    add_action('admin_menu', function () {
        add_management_page(
            costered_i18n('admin.menu.pageTitle'),
            costered_i18n('admin.menu.menuTitle'),
            'manage_options',
            'costered-blocks-tools',
            function () {
                if (!current_user_can('manage_options')) {
                    $msg = costered_i18n('admin.menu.currentUserCant');
                    wp_die(esc_html($msg));
                }
            ?>
                <div class="wrap">
                    <h1><?php costered_i18n_html_e('admin.menu.pageTitle') ?></h1>
                    <?php
                        if (
                            isset($request['costered_rebuilt'], $request['costered_rebuilt_count']) &&
                            $request['costered_rebuilt'] === '1' &&
                            is_numeric($request['costered_rebuilt_count'])
                        ) {
                            $rebuiltCount = (int) $request['costered_rebuilt_count'];
                            if ($rebuiltCount > 0) {
                                
                                /* i18n rant: I do not like that I cannot use my own i18n handler (all strings in a seperate file, referenced by keys). I will comply, but I will be salty about it. */
                                // translators: %d is the number of rebuilt items
                                $rebuiltLabel = sprintf(_n(
                                    "%d item was",
                                    "%d items were",
                                    $rebuiltCount,
                                    'costered-blocks'
                                ), number_format_i18n($rebuiltCount));
                            } else {
                                $rebuiltLabel = costered_i18n('admin.menu.rebuild.none');
                            }
                            $noticeTemplate = costered_i18n('admin.menu.rebuild.notice');
                        ?>        
                            <div class="notice notice-success is-dismissible">
                                <p>
                                    <?php echo esc_html(sprintf($noticeTemplate, $rebuiltLabel)); ?>
                                </p>
                            </div>
                            <?php
                        }
                    ?>

                    <p><?php costered_i18n_html_e('admin.menu.rebuild.intro') ?></p>

                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                        <?php wp_nonce_field('costered_rebuild_all_styles', 'costered_rebuild_all_styles_nonce'); ?>
                        <input type="hidden" name="action" value="costered_rebuild_all_styles" />
                        <?php
                            $submit = costered_i18n('admin.menu.rebuild.button');
                            submit_button(esc_html($submit), 'primary', 'costered_rebuild_all_styles_submit', false);
                        ?>
                    </form>
                </div>
                <?php
            }
        );
    });

    add_action('admin_post_costered_rebuild_all_styles', function () {
        if (!current_user_can('manage_options')) {
            $msg = costered_i18n('admin.menu.currentUserNotAllowed');
            wp_die(esc_html($msg));
        }

        check_admin_referer('costered_rebuild_all_styles', 'costered_rebuild_all_styles_nonce');

        $rebuiltCount = costered_rebuild_all_styles_from_things();

        $redirectUrl = add_query_arg(
            array(
                'page'                     => 'costered-blocks-tools',
                'costered_rebuilt'         => '1',
                'costered_rebuilt_count'   => (string) $rebuiltCount,
            ),
            admin_url('tools.php')
        );

        wp_safe_redirect($redirectUrl);
        exit;
    });
