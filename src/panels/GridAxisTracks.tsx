import { useCallback, useMemo } from '@wordpress/element';
import { Flex, FlexBlock } from '@wordpress/components';

import { LABELS } from '@labels';
import { useAttrSetter, useGridModel, useUnsavedAttr } from '@hooks';
import { normaliseTemplate } from '@utils/gridUtils';
import { getBlockCosteredId } from '@utils/blockUtils';
import type { GridAxisModel, GridModel, GridAxisDisabled } from '@types';

import { UnsavedIcon } from '@components/UnsavedIcon';
import { TokenEditor } from '@components/Tokens/TokenEditor';

type Props = {
    clientId: string | null;
    axisDisabled?: GridAxisDisabled;
};

export function GridAxisTracks({ 
    clientId,
 }: Props) {
    if (!clientId) return null;

    const { set, unset } = useAttrSetter(clientId ?? null);

    const costeredId = getBlockCosteredId(clientId);
    const unsavedCols = useUnsavedAttr(costeredId, 'gridTemplateColumns', 'tracks');
    const unsavedRows = useUnsavedAttr(costeredId, 'gridTemplateRows', 'tracks');

    const model = (useGridModel(clientId) as GridModel | null) ?? null;
    const col = (model?.columns ?? null) as GridAxisModel | null;
    const row = (model?.rows ?? null) as GridAxisModel | null;

    // Use the normalised value if present, else template, else ''.
    const colValue: string = useMemo(() => {
        const val = (col?.normalised ?? col?.template ?? '') as string;
        return normaliseTemplate(val);
    }, [col?.normalised, col?.template]);

    const rowValue: string = useMemo(() => {
        const val = (row?.normalised ?? row?.template ?? '') as string;
        return normaliseTemplate(val);
    }, [row?.normalised, row?.template]);

    const writeCols = useCallback((next: string) => {
        const text = String(next ?? '').trim();
        text ? set('gridTemplateColumns', text) : unset('gridTemplateColumns');
        unsavedCols.setUnsaved(!!text);
    }, [set, unset, unsavedCols]);

    const writeRows = useCallback((next: string) => {
        const text = String(next ?? '').trim();
        text ? set('gridTemplateRows', text) : unset('gridTemplateRows');
        unsavedRows.setUnsaved(!!text);
    }, [set, unset, unsavedRows]);

    return (
        <Flex direction="column" gap={6}>
            <FlexBlock>
                {LABELS.gridControls.tracksPanel.description}
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={3} className={"costered-blocks--grid-panel-tracks--axis-controls"}>
                    <fieldset className="costered-blocks--fieldset">
                        <legend>{LABELS.gridControls.tracksPanel.columns.label}</legend>
                        <UnsavedIcon costeredId={costeredId} attrs="gridTemplateColumns" />
                        <TokenEditor
                            value={colValue}
                            onChange={writeCols}
                            labelScope="gridControls.tracksPanel.columns"
                            floatingEditor
                            popoverPlacement="bottom-start"
                        />
                    </fieldset>
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={3} className={"costered-blocks--grid-panel-tracks--axis-controls"}>
                    <fieldset className="costered-blocks--fieldset">
                        <legend>{LABELS.gridControls.tracksPanel.rows.label}</legend>
                        <UnsavedIcon costeredId={costeredId} attrs="gridTemplateRows" />
                        <TokenEditor
                            value={rowValue}
                            onChange={writeRows}
                            labelScope="gridControls.tracksPanel.rows"
                            floatingEditor
                            popoverPlacement="bottom-start"
                        />
                    </fieldset>
                </Flex>
            </FlexBlock>
        </Flex>
    );
}