import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { Flex, FlexBlock } from '@wordpress/components';

import { useAttrSetter, useGridModel } from '@hooks';
import { normaliseTemplate } from '@utils/gridUtils';
import { LABELS } from '@labels';
import type { GridAxisModel, GridModel, GridAxisDisabled } from '@types';

import { TokenEditor } from '@components/Tokens/TokenEditor';

type WriteFn = (next: readonly string[]) => void;

type Props = {
    clientId: string | null;
    axisDisabled?: GridAxisDisabled;
};

export function GridAxisTracks({ 
    clientId,
    axisDisabled
 }: Props) {
    if (!clientId) return null;

    const { set, unset } = useAttrSetter(clientId ?? null);

    const model = (useGridModel(clientId) as GridModel | null) ?? null;
    const col = (model?.columns ?? null) as GridAxisModel | null;
    const row = (model?.rows ?? null) as GridAxisModel | null;

    // Use the normalised value if present, else template, else ''.
    const colValue: string = useMemo(() => {
        const v = (col?.normalised ?? col?.template ?? '') as string;
        return normaliseTemplate(v);
    }, [col?.normalised, col?.template]);

    const rowValue: string = useMemo(() => {
        const v = (row?.normalised ?? row?.template ?? '') as string;
        return normaliseTemplate(v);
    }, [row?.normalised, row?.template]);

    const writeCols = useCallback((next: string) => {
        const text = String(next ?? '').trim();
        text ? set('gridTemplateColumns', text) : unset('gridTemplateColumns');
    }, [set, unset]);

    const writeRows = useCallback((next: string) => {
        const text = String(next ?? '').trim();
        text ? set('gridTemplateRows', text) : unset('gridTemplateRows');
    }, [set, unset]);


    const ownerCols: string | null = (model?.activePane?.columns ?? null) as string | null;
    const ownerRows: string | null = (model?.activePane?.rows ?? null) as string | null;

    return (
        <Flex direction="column" gap={6}>
            <FlexBlock>
                {LABELS.gridControls.tracksPanel.description}
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={3} className={"costered-blocks--grid-panel-tracks--axis-controls"}>
                    <fieldset className="costered-blocks--fieldset">
                        <legend>{LABELS.gridControls.tracksPanel.columns.label}</legend>
                        <TokenEditor
                            value={colValue}
                            onChange={writeCols}
                            floatingEditor
                            popoverPlacement="bottom-start"
                            // Optional: pass labels through to TokenListEditor if you want custom copy
                            // labels={{ addLabel: LABELS.something }}
                        />
                    </fieldset>
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={3} className={"costered-blocks--grid-panel-tracks--axis-controls"}>
                    <fieldset className="costered-blocks--fieldset">
                        <legend>{LABELS.gridControls.tracksPanel.rows.label}</legend>
                        <TokenEditor
                            value={rowValue}
                            onChange={writeRows}
                            floatingEditor
                            popoverPlacement="bottom-start"
                            // Optional: pass labels through to TokenListEditor if you want custom copy
                            // labels={{ addLabel: LABELS.something }}
                        />
                    </fieldset>
                </Flex>
            </FlexBlock>
        </Flex>
    );
}