<?php

    // Admin menu: Tools → Costered Blocks
    add_action('admin_menu', function () {
        add_management_page(
            __('Costered Blocks Tools', 'costered-blocks'), // Page title
            __('Costered Blocks', 'costered-blocks'),       // Menu label under Tools
            'manage_options',                               // Capability (adjust if needed)
            'costered-blocks-tools',                        // Slug
            function () {
                if (!current_user_can('manage_options')) {
                    wp_die(__('Sorry, you are not allowed to access this page.', 'costered-blocks'));
                }

                $rebuiltCount = isset($_GET['costered_rebuilt_count'])
                    ? (int) $_GET['costered_rebuilt_count']
                    : 0;

                ?>
                <div class="wrap">
                    <h1><?php esc_html_e('Costered Blocks Tools', 'costered-blocks'); ?></h1>

                    <?php if (!empty($_GET['costered_rebuilt']) && $_GET['costered_rebuilt'] === '1') : ?>
                        <div class="notice notice-success is-dismissible">
                            <p>
                                <?php
                                printf(
                                    esc_html(_n(
                                        'Rebuild completed. %d item was processed.',
                                        'Rebuild completed. %d items were processed.',
                                        $rebuiltCount,
                                        'costered-blocks'
                                    )),
                                    (int) $rebuiltCount
                                );
                                ?>
                            </p>
                        </div>
                    <?php endif; ?>

                    <p>
                        <?php esc_html_e(
                            'Use this tool to rebuild all generated Costered CSS for pages, posts, and global blocks.',
                            'costered-blocks'
                        ); ?>
                    </p>

                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                        <?php wp_nonce_field('costered_rebuild_all_styles', 'costered_rebuild_all_styles_nonce'); ?>
                        <input type="hidden" name="action" value="costered_rebuild_all_styles" />
                        <?php submit_button(
                            __('Rebuild all Costered styles', 'costered-blocks'),
                            'primary',
                            'costered_rebuild_all_styles_submit',
                            false
                        ); ?>
                    </form>
                </div>
                <?php
            }
        );
    });
