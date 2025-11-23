<?php
    // Admin menu: Tools → Costered Blocks
    add_action('admin_menu', function () {

        $labels = costered_i18n_html_strings('admin.menu');

        add_management_page(
            $labels['pageTitle'],
            $labels['menuTitle'],
            'manage_options',
            'costered-blocks-tools',
            function () {
                $labels = costered_i18n_html_strings('admin.menu');

                if (!current_user_can('manage_options')) {
                    wp_die($labels['currentUserCant']);
                }

                $rebuiltCount = isset($_GET['costered_rebuilt_count'])
                    ? (int) $_GET['costered_rebuilt_count']
                    : 0;
                ?>
                <div class="wrap">
                    <h1><?= $labels['pageTitle'] ?></h1>

                    <?php if (!empty($_GET['costered_rebuilt']) && $_GET['costered_rebuilt'] === '1') : ?>
                        <div class="notice notice-success is-dismissible">
                            <p>
                                <?php
                                    $rebuilt = sprintf(_n(
                                        $labels['rebuild']['noticeSingular'],
                                        $labels['rebuild']['noticePlural'],
                                        $rebuiltCount,
                                        'costered-blocks'
                                    ), number_format_i18n($rebuiltCount));
                                      
                                    echo sprintf($labels['rebuild']['notice'], $rebuilt);
                                ?>
                            </p>
                        </div>
                    <?php endif; ?>

                    <p><?= esc_html($labels['rebuild']['intro']) ?></p>

                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                        <?php wp_nonce_field('costered_rebuild_all_styles', 'costered_rebuild_all_styles_nonce'); ?>
                        <input type="hidden" name="action" value="costered_rebuild_all_styles" />
                        <?php submit_button($labels['rebuild']['button'], 'primary', 'costered_rebuild_all_styles_submit', false); ?>
                    </form>
                </div>
                <?php
            }
        );
    });

    add_action('admin_post_costered_rebuild_all_styles', function () {

        $labels = costered_i18n_html_strings('admin.menu');

        if (!current_user_can('manage_options')) {
            wp_die($labels['currentUserNotAllowed']);
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
