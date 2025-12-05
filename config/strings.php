<?php
    
    // Exit if accessed directly.
    if (!defined('ABSPATH')) { exit;}

    if (! defined('COSTERED_BLOCKS_PATH')) {
        define('COSTERED_BLOCKS_PATH', trailingslashit(dirname(__DIR__, 2)));
    }

    $LABELS = array(
        'admin' => array(
            'menu' => array(
                'pageTitle' => __("Costered Blocks Settings", 'costered-blocks'),
                'menuTitle' => __("Costered Blocks", 'costered-blocks'),
                'currentUserCant' => __("You do not have permission to access this page.", 'costered-blocks'),
                'currentUserNotAllowed' => __("Sorry, you are not allowed to do this.", 'costered-blocks'),
                'rebuild' => array(
                    'notice' => __("Rebuild completed. %s processed.", 'costered-blocks'),
                    'noticeSingular' => __(" %d item was", 'costered-blocks'),
                    'noticePlural' => __(" %d items were", 'costered-blocks'),
                    'intro' => __("Use this tool to rebuild all generated Costered CSS for pages, posts, and global blocks.", 'costered-blocks'),
                    'button' => __("Rebuild Costered CSS", 'costered-blocks')
                )
            )
        ),
        'blocks' => array(
            'blockCategory' => __("Costered Blocks", 'costered-blocks'),
        )
            
    );

    return $LABELS;