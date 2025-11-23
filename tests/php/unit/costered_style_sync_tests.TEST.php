<?php

    require_once dirname(__DIR__) . '/helpers/costered-test-helpers.php';

    class costered_style_sync_test extends WP_UnitTestCase {


        public function test_sync_styles_for_post_creates_rows_per_breakpoint(): void {
            global $wpdb;

            // Arrange: create a post with Costered attributes in the content.
            $postId = $this->factory()->post->create([
                'post_content' => costered_test_block_button_example(),
            ]);

            $written = costered_sync_styles_for_post($postId);
            $this->assertGreaterThan(0, $written, 'Expected at least one style record to be written.');

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

            // Assert: three rows created (desktop, tablet, mobile)
            $this->assertSame(3, count($rows), 'Expected one style row per breakpoint.');

            $uids = array_unique(array_column($rows, 'thing_costered_id'));

            // Assert: all rows share the same costeredId
            $this->assertSame(1, count($uids), 'Expected all style rows to share the same costeredId.');

            foreach ($rows as $row) {
                $this->assertSame('style', $row['thing_type']);

                $thingData = json_decode($row['thing_data'], true);

                // Assert: thing_data has expected structure
                $this->assertIsArray($thingData);
                $this->assertArrayHasKey('blockName', $thingData);
                $this->assertArrayHasKey('styles', $thingData);
                $this->assertIsArray($thingData['styles']);
                $this->assertNotEmpty($thingData['styles'], 'Styles payload should not be empty.');
            }
        }

        public function test_sync_skips_empty_breakpoints(): void {
            global $wpdb;

            // Arrange: create a post with only desktop Costered attributes in the content.
            $postId = $this->factory()->post->create([
                'post_content' => costered_test_block_desktop_only(),
            ]);

            $written = costered_sync_styles_for_post($postId);
            $this->assertGreaterThan(0, $written);

            $table = $wpdb->prefix . 'costered_things';
            $rows = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT thing_key, thing_data
                    FROM {$table}
                    WHERE thing_type = %s
                    ORDER BY thing_key ASC",
                    'style'
                ),
                ARRAY_A
            );

            // Assert: only one row created for desktop breakpoint.
            $this->assertSame(1, count($rows), 'Expected only desktop to be saved.');
            $this->assertSame('desktop', $rows[0]['thing_key']);

            // Assert: styles contain expected maxWidth value.
            $thingData = json_decode($rows[0]['thing_data'], true);
            $this->assertArrayHasKey('styles', $thingData);
            $this->assertArrayHasKey('maxWidth', $thingData['styles']);
            $this->assertSame('40%', $thingData['styles']['maxWidth']);
        }

        public function test_sync_updates_existing_rows_on_second_run(): void {
            global $wpdb;
            
            // Arrange: create a post with only desktop Costered attributes in the content.
            $postId = $this->factory()->post->create([
                'post_content' => costered_test_block_desktop_only(),
            ]);
            
            $written = costered_sync_styles_for_post($postId);
            $this->assertGreaterThan(0, $written, 'Expected at least one style record to be written.');
            
            $table = $wpdb->prefix . 'costered_things';
            $rowBefore = $wpdb->get_row(
                "SELECT id, thing_data FROM {$table} WHERE thing_type = 'style' AND thing_key = 'desktop' LIMIT 1",
                ARRAY_A
            );
            
            $this->assertNotEmpty($rowBefore);
            $idBefore = (int) $rowBefore['id'];

            // Act: Change maxWidth and resync.
            $post = get_post($postId);
            $attrs = [
                'costeredId' => 'test-uid-desktop-only',
                'costered'   => [
                    'desktop' => [
                        'styles' => [
                            'maxWidth' => '55%',
                        ],
                    ],
                    'tablet'  => ['styles' => []],
                    'mobile'  => ['styles' => []],
                ],
            ];
            $json = wp_json_encode($attrs);

            $newContent = <<<HTML
<!-- wp:paragraph {$json} -->
<p>Example desktop only updated</p>
<!-- /wp:paragraph -->
HTML;

            wp_update_post([
                'ID'           => $postId,
                'post_content' => $newContent,
            ]);

            costered_sync_styles_for_post($postId);

            // Assert: existing row is updated, not a new row created.
            $rowAfter = $wpdb->get_row(
                "SELECT id, thing_data FROM {$table} WHERE thing_type = 'style' AND thing_key = 'desktop' LIMIT 1",
                ARRAY_A
            );

            $this->assertNotEmpty($rowAfter);
            $this->assertSame($idBefore, (int) $rowAfter['id'], 'Expected upsert to update, not insert a new row.');

            // Assert: styles contain updated maxWidth value.
            $thingData = json_decode($rowAfter['thing_data'], true);
            $this->assertSame('55%', $thingData['styles']['maxWidth']);
        }
    }