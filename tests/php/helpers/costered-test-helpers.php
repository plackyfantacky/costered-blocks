<?php

    /**
     * Generate a minimal Costered block for tests.
     */
    function costered_test_block_with_styles(array $desktop = [], array $tablet = [], array $mobile = [], string $uid = 'test-uid'): string
    {
        $attrs = [
            'costeredId' => $uid,
            'costered'   => [
                'desktop' => ['styles' => $desktop],
                'tablet'  => ['styles' => $tablet],
                'mobile'  => ['styles' => $mobile],
            ],
        ];

        $json = wp_json_encode($attrs);

        return <<<HTML
<!-- wp:paragraph {$json} -->
<p>Test block</p>
<!-- /wp:paragraph -->
HTML;
    }

    // Desktop only block.
    function costered_test_block_desktop_only(array $desktop = ['maxWidth' => '40%'], string $uid = 'test-uid-desktop-only'): string
    {
        return costered_test_block_with_styles($desktop, [], [], $uid);
    }

    // Minimal block styles for 3-breakpoints.
    function costered_test_block_for_three_breakpoints(): string {
        return costered_test_block_with_styles(
            ['maxWidth' => '40%'],
            ['maxWidth' => '100%'],
            [
                'width'        => '100%',
                'paddingRight' => '0rem',
                'paddingLeft'  => '0rem',
                'maxWidth'     => '100%',
            ],
            'hook-test-uid-1'
        );
    }

    // Real example for button styles.
    function costered_test_block_button_example(): string {
        return costered_test_block_with_styles(
            [
                "marginTop" => "2rem",
                "marginRight" => "0rem",
                "marginLeft" => "0rem",
                "marginBottom" => "0rem",
                "paddingTop" => "0.28rem",
                "paddingLeft" => "0.5rem",
                "paddingRight" => "0.5rem",
                "paddingBottom" => "0.28rem"
            ],
            [
                "marginTop" => "1rem",
                "paddingTop" => "0.25rem",
                "paddingBottom" => "0.25rem",
                "paddingLeft" => "0.75rem",
                "paddingRight" => "0.5rem"
            ],
            [
                "paddingTop" => "0.35rem",
                "paddingBottom" => "0.35rem"
            ]
        );
    }

    // Real example with CSS grid styles.
    function costered_test_block_grid_example(): string {
        return costered_test_block_with_styles(
            [
                "display" => "grid",
                "gap" => "2rem",
                "position" => "relative",
                "gridTemplateColumns" => "[content-start column-1-start] repeat(3,1fr) [column-1-end column-2-start] repeat(3,1fr) [column-2-end column-3-start] repeat(3,1fr) [column-3-end content-end]",
                "gridTemplateAreas" => "\". . . . . . . . .\"\n\". . . . . . . . .\"\n\". . . . . . . . .\""
            ],
            [
                "gap" => "3rem",
                "gridTemplateColumns" => "[content-start] [col-1-start] minmax(0, 1fr) [col-1-end] [col-2-start] minmax(0, 1fr) [col-2-end] [col-3-start] minmax(0, 1fr) [col-3-end]",
                "position" => "static"
            ],
            [
                "display" => "flex",
                "flexDirection" => "column"   
            ]
        );
    }