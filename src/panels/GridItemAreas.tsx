import { useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Flex, FlexBlock, ComboboxControl } from '@wordpress/components';

import { useAttrGetter, useAttrSetter, useParentGridMeta } from '@hooks';
import { normaliseGridAreaName } from "@utils/gridPlacement";
import { LABELS } from '@labels';

type Props = {
    clientId: string | null;
    blockName?: string | null;
};

export function GridItemAreas({ 
    clientId
}: Props) {
    if (!clientId) return null;

    const { get } = useAttrGetter(clientId);
    const { setMany } = useAttrSetter(clientId);
    const { areaNames } = useParentGridMeta();

    // Guard gridArea *before* saving
    const writeGridArea = useCallback((raw?: string) => {
        const name = normaliseGridAreaName(raw ?? '');
        // Only set if it's a valid name; otherwise do nothing (or clear if you prefer)
        setMany({
            'gridArea': name,
            //TODO: don't use undefined here -> it gets saved as a string and that breaks everything
            'gridColumn': '',
            'gridRow': ''
        });
    }, [setMany]);

    const value = String(get('gridArea') ?? '');

    const options: ReadonlyArray<{ label: string; value: string }> = [
        { label: LABELS.gridItemsControls.areasPanel.gridAreaNone, value: '' },
        ...areaNames.map((area: string) => ({ label: area, value: area }))
    ];

    return (
        <Flex direction="column" gap={4} className="costered-blocks-grid-item-area--panel">
            <FlexBlock className={'costered-blocks-grid-item-advanced-controls--grid-area-selector'}>
                <ComboboxControl
                    label={LABELS.gridItemsControls.areasPanel.gridAreaLabel}
                    value={value}
                    options={options}
                    onChange={(next?: string) => writeGridArea(next)}
                    help={LABELS.gridItemsControls.areasPanel.gridAreaHelp}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            </FlexBlock>
        </Flex>
    );
}