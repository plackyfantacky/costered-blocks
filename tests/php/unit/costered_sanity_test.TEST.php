<?php
    class costered_sanity_test extends WP_UnitTestCase {

        public function test_wordpress_and_plugin_loaded() {
            $this->assertTrue(function_exists('do_action'), 'WordPress core not loaded.');
            $this->assertTrue(function_exists('costered_print_collected_css_link'), 'Costered plugin not loaded.');
        }
    }