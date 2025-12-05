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
                    wp_die(costered_i18n('admin.menu.currentUserCant'));
                }

                $rebuiltCount = isset($_GET['costered_rebuilt_count'])
                    ? (int) $_GET['costered_rebuilt_count']
                    : 0;
                ?>
                <div class="wrap">
                    <h1><?php echo costered_i18n('admin.menu.pageTitle') ?></h1>

                    <?php if (!empty($_GET['costered_rebuilt']) && $_GET['costered_rebuilt'] === '1') : ?>
                        <div class="notice notice-success is-dismissible">
                            <p>
                                <?php
                                    $rebuilt = sprintf(_n(
                                        costered_i18n('admin.menu.rebuild.noticeSingular'),
                                        costered_i18n('admin.menu.rebuild.noticePlural'),
                                        $rebuiltCount,
                                        'costered-blocks'
                                    ), number_format_i18n($rebuiltCount));
                                      
                                    echo sprintf(costered_i18n('admin.menu.rebuild.notice'), $rebuilt);
                                ?>
                            </p>
                        </div>
                    <?php endif; ?>

                    <p><?php echo esc_html(costered_i18n('admin.menu.rebuild.intro')) ?></p>

                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                        <?php wp_nonce_field('costered_rebuild_all_styles', 'costered_rebuild_all_styles_nonce'); ?>
                        <input type="hidden" name="action" value="costered_rebuild_all_styles" />
                        <?php submit_button(costered_i18n('admin.menu.rebuild.button'), 'primary', 'costered_rebuild_all_styles_submit', false); ?>
                    </form>
                </div>
                <?php
            }
        );
    });

    add_action('admin_post_costered_rebuild_all_styles', function () {
        if (!current_user_can('manage_options')) {
            wp_die(costered_i18n('admin.menu.currentUserNotAllowed'));
        }

        check_admin_referer('costered_rebuild_all_styles', 'costered_rebuild_all_styles_nonce');

        //$rebuiltCount = costered_rebuild_all_styles();
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
