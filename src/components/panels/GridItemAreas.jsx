import { useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Flex, FlexBlock, ComboboxControl } from '@wordpress/components';

import { useAttrSetter, useParentGridMeta } from '@hooks';
import { normaliseGridAreaName } from "@utils/gridPlacement";
import { LABELS } from '@labels';

export function GridItemAreas({ clientId, attributes }) {
    if (!clientId) return null;

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { setMany } = useAttrSetter(updateBlockAttributes, clientId);

    const { areaNames } = useParentGridMeta();

    // Guard gridArea *before* saving
    const writeGridArea = useCallback((raw) => {
        const name = normaliseGridAreaName(raw);
        // Only set if it's a valid name; otherwise do nothing (or clear if you prefer)
        setMany({
            'gridArea': name,
            //TODO: don't use undefined here -> it gets saved as a string and that breaks everything
            'gridColumn': '',
            'gridRow': ''
        });
    }, [setMany]);

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-area--panel">
            <FlexBlock className={'costered-blocks-grid-item-advanced-controls--grid-area-selector'}>
                <ComboboxControl
                    label={LABELS.gridItemsControls.areasPanel.gridAreaLabel}
                    value={attributes.gridArea || ''}
                    options={[
                        { label: LABELS.gridItemsControls.areasPanel.gridAreaNone, value: '' },
                        ...areaNames.map((area) => ({ label: area, value: area }))
                    ]}
                    onChange={(value) => writeGridArea(value)}
                    help={LABELS.gridItemsControls.areasPanel.gridAreaHelp}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            </FlexBlock>
        </Flex>
    );
}