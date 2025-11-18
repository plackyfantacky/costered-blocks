import { sprintf } from '@wordpress/i18n';
import { useMemo, useCallback } from '@wordpress/element';
import { Flex, FlexItem, Button } from '@wordpress/components';

import { useTokenAreas } from '@hooks';
import TokenGridBoard from './TokenGridBoard';
import TokenGridNoticePanel from './TokenGridNoticePanel';
import { LABELS as DEFAULT_LABELS } from '@labels';
import { toCount } from '@utils/gridUtils';

type Props = {
    clientId: string;
    labels?: {
        tokenGrid?: Partial<typeof DEFAULT_LABELS['tokenGrid']>;
        tokenGridNotice?: Partial<typeof DEFAULT_LABELS['tokenGridNotice']>;
    };
};

export default function TokenGrid({
    clientId,
    labels = {}
}: Props) {
    const { 
        matrix,
        columnData,
        rowData,
        setCell,
        resize: resizeObj,
        clear,
        resetToTrackCount,
    } = useTokenAreas(clientId);

    const tokenGridLabels = useMemo(
        () => ({ ...DEFAULT_LABELS.tokenGrid, ...(labels.tokenGrid || {}) }),
        [labels]
    );

    const tokenGridNoticeLabels = useMemo(
        () => ({ ...DEFAULT_LABELS.tokenGridNotice, ...(labels.tokenGridNotice || {}) }),
        [labels]
    );

    const resize = useCallback((cols: number, rows: number) => {
        resizeObj(cols, rows);
    }, [resizeObj]);

    const areaCols = Array.isArray(matrix) && Array.isArray(matrix[0]) ? matrix[0].length : 0;
    const areaRows = Array.isArray(matrix) ? matrix.length : 0;

    const trackCols = toCount((columnData as any)?.count ?? columnData);
    const trackRows = toCount((rowData as any)?.count ?? rowData);

    const mismatch = 
        areaCols > 0 && areaRows > 0 && trackCols > 0 && trackRows > 0 &&
        (areaCols !== trackCols || areaRows !== trackRows);

    const gridMatrix = useMemo(() => ({ resize }), [resize]);

    return (
        <Flex direction="column" gap={2} className="costered-blocks--token-grid-component">
            {mismatch && (
                <TokenGridNoticePanel
                    clientId={clientId}
                    columnData={columnData}
                    rowData={rowData}
                    gridMatrix={gridMatrix}
                    labels={tokenGridNoticeLabels}
                />
            )}
            <Flex direction="row" gap={2} align="center" justify="space-between" className={"costered-blocks--token-grid-header"}>
                {areaCols > 0 && areaRows > 0 && (
                    <FlexItem>
                        <span className="costered-blocks--token-grid-help">
                            {sprintf(tokenGridLabels.sizeHint, areaCols, areaRows)}
                        </span>
                    </FlexItem>
                )}
                {/* disabling this for now, as this action is destructive and I should at least confirm with the user */}
                {/* <FlexItem>
                    <Button
                        icon="trash"
                        variant="tertiary"
                        onClick={() => clear(trackColumnCount, trackRowCount)}
                    >
                        {tokenGridLabels.clear}
                    </Button>
                </FlexItem> */}
            </Flex>
            <TokenGridBoard
                matrix={matrix}
                columnData={areaCols}
                rowData={areaRows}
                emptyToken={'.'}
                labels={tokenGridLabels}
                setCell={setCell}
                resize={resize}
                clear={clear}
                onEditingChange={() => {}}
            />
            {!matrix?.length && (
                <div className="costered-blocks--token-grid--notice">
                    <p>{tokenGridLabels.matrix.noAreas}</p>
                    <Button variant="secondary" onClick={() => resize(1, 1)}>
                        {tokenGridLabels.matrix.reset}
                    </Button>
                </div>
            )}
        </Flex>
    );
}