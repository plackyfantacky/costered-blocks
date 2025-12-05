<?php
    require_once dirname(__DIR__) . '/helpers/costered-test-helpers.php';

    class Costered_Style_Save_Tests extends WP_UnitTestCase {
        public function test_save_post_triggers_sync_and_rebuild_for_costered_content(): void {
            global $wpdb;

            // Arrange: track existing CSS files before running the test
            $uploads = wp_upload_dir();
            $cssDir  = rtrim($uploads['basedir'], '/\\') . '/costered';

            if (!is_dir($cssDir)) {
                wp_mkdir_p($cssDir);
            }

            $beforeFiles = glob($cssDir . '/global-*.css');

            // Arrange: create a post with Costered attributes in the content.
            $postId = $this->factory()->post->create([
                'post_content' => costered_test_block_button_example(),
            ]);

            $written = costered_sync_styles_for_post($postId);
            $this->assertGreaterThan(0, $written, 'Expected at least one style record to be written.');

            $table = $wpdb->prefix . 'costered_things';
            $rowsBefore = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT thing_type, thing_costered_id, thing_key, thing_data
                    FROM {$table}
                    WHERE thing_type = %s
                    ORDER BY thing_key ASC",
                    'style'
                ),
                ARRAY_A
            );
            $this->assertNotEmpty($rowsBefore, 'Expected style rows to exist before post update.');

            // Act: wp_update_post() to trigger save_post.
            wp_update_post([
                'ID' => $postId,
                'post_content' => get_post_field('post_content', $postId),
            ]);

            costered_sync_styles_for_post($postId);

            // Assert: style rows exist in wp_costered_things for that UID
            $rowsAfter = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT thing_type, thing_costered_id, thing_key, thing_data
                    FROM {$table}
                    WHERE thing_type = %s
                    ORDER BY thing_key ASC",
                    'style'
                ),
                ARRAY_A
            );
            $this->assertSame(count($rowsBefore), count($rowsAfter), 'Expected same number of style rows after post update.');
            
            $uids = array_unique(array_column($rowsAfter, 'thing_costered_id'));
            $this->assertSame(1, count($uids), 'Expected all style rows to share the same costeredId.');
            
            // Assert: a global-*.css exists in uploads/costered
            $afterFiles = glob($cssDir . '/global-*.css');
            $this->assertNotEmpty($afterFiles, 'Expected at least one global-*.css file to exist after post update.');

            if (!empty($beforeFiles)) {
                $this->assertNotEquals($beforeFiles, $afterFiles, 'Expected global-*.css files to be updated after post update.');
            }
        }

        public function test_save_post_does_not_touch_styles_for_non_costered_content(): void {
            global $wpdb;

            // Arrange: track existing CSS files before running the test
            $uploads = wp_upload_dir();
            $cssDir  = rtrim($uploads['basedir'], '/\\') . '/costered';

            if (!is_dir($cssDir)) {
                wp_mkdir_p($cssDir);
            }

            $beforeFiles = glob($cssDir . '/global-*.css');
            sort($beforeFiles);

            // Arrange: create a plain post with no Costered attrs.
            $postId = $this->factory()->post->create([
                'post_content' => <<<HTML
<!-- wp:paragraph -->
<p>No costered attributes here.</p>
<!-- /wp:paragraph -->
HTML
            ]);

            // Act: wp_update_post()
            wp_update_post([
                'ID' => $postId,
                'post_content' => get_post_field('post_content', $postId),
            ]);

            costered_sync_styles_for_post($postId);

            // Assert: style rows exist in wp_costered_things for that UID
            $table = $wpdb->prefix . 'costered_things';
            $rows = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT thing_type, thing_costered_id, thing_key, thing_data
                    FROM {$table}
                    WHERE thing_type = %s
                    ORDER BY thing_key ASC",
                    'style'
                ),
                ARRAY_A
            );
            $this->assertEmpty($rows, 'Expected no style rows to exist for non-Costered content.');

            // Assert: no new global-*.css files created

            $afterFiles = glob($cssDir . '/global-*.css');
            sort($afterFiles);
            
            $this->assertSame($beforeFiles, $afterFiles, 'Expected no new global-*.css files to be created for non-Costered content.');
        }
    }