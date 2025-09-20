import { useState, useCallback, useRef, useMemo } from '@wordpress/element';
import { Button, Flex, FlexItem } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

import { useGridAreasMatrix, useGridStoreAreasIO } from '@hooks';
import { GridBoard } from './GridBoard';
import { NoticePanel } from './NoticePanel';
import { LABELS as DEFAULT_LABELS } from '@labels';

export default function TokenGrid({ clientId, labels = {} }) {

    const tokenGridLabels = useMemo(() => ({ ...DEFAULT_LABELS.tokenGrid, ...labels.tokenGrid }), [labels]);
    const tokenGridNoticeLabels = useMemo(() => ({ ...DEFAULT_LABELS.tokenGridNotice, ...labels.tokenGridNotice }), [labels]);

    const {
        applyMatrixToStore,
        seedFromStore,
        trackColumnCount,
        trackRowCount,
    } = useGridStoreAreasIO(clientId);

    const seedMatrix = useMemo(() => seedFromStore('.'), [seedFromStore]);

    // Suspend/resume resync around editing
    const [isEditing, setIsEditing] = useState(false);
    const resumeRef = useRef(null);

    const handleEditingChange = useCallback((editing) => {
        if (resumeRef.current) clearTimeout(resumeRef.current);
        if (editing) setIsEditing(true);
        else resumeRef.current = setTimeout(() => setIsEditing(false), 60);
    }, []);

    const gridMatrix = useGridAreasMatrix({
        seedMatrix,
        emptyToken: '.',
        onApply: applyMatrixToStore,
        suspendResync: isEditing,
    });
    const { matrix, setCell, resize, clear } = gridMatrix;

    const columnData = matrix[0]?.length || 0;
    const rowData = matrix.length || 0;

    const mismatch = (
        (trackColumnCount || 0) !== columnData || (trackRowCount || 0) !== rowData
    );

    return (
        <Flex direction="column" gap={2} className="costered-blocks--token-grid-component">
            {mismatch && (
                <NoticePanel
                    clientId={clientId}
                    columnData={columnData}
                    rowData={rowData}
                    gridMatrix={gridMatrix}
                    labels={tokenGridNoticeLabels}
                />
            )}
            <Flex direction="row" gap={2} align="center" justify="space-between" className={"costered-blocks--token-grid-header"}>
                <FlexItem>
                    <span className="costered-blocks--token-grid-help">
                        {sprintf(tokenGridLabels.sizeHint, columnData, rowData)}
                    </span>
                </FlexItem>
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
            <GridBoard
                matrix={matrix}
                columnData={columnData}
                rowData={rowData}
                emptyToken={'.'}
                labels={tokenGridLabels}
                setCell={setCell}
                resize={resize}
                onEditingChange={handleEditingChange}
            />
        </Flex>
    );
}