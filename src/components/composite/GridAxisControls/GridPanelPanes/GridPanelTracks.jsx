import { useMemo, useState, useCallback } from '@wordpress/element';
import { Flex, FlexBlock, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function GridPanelTracks() {
    let value = '';
    return (
        <Flex direction="column" gap={4}>
            <FlexBlock>
                {__('In Tracks mode, you can define the exact track sizes using any valid CSS Grid value.', 'costered-blocks')}
            </FlexBlock>
        </Flex>
    );
}