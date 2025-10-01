import { useState, useCallback, useRef, useMemo, useEffect } from '@wordpress/element';
import { Flex, FlexItem } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

import { useGridAreasMatrix } from '@hooks';
import { GridBoard } from './GridBoard';
import { NoticePanel } from './NoticePanel';
import { LABELS as DEFAULT_LABELS } from '@labels';
import { toCount } from '@utils/gridUtils';

export default function TokenGrid({ clientId, labels = {} }) {
    const [isEditing, setIsEditing] = useState(false);
    const resumeRef = useRef(null);

    const tokenGridLabels = useMemo(
        () => ({ ...DEFAULT_LABELS.tokenGrid, ...labels.tokenGrid }),
        [labels]
    );

    const tokenGridNoticeLabels = useMemo(
        () => ({ ...DEFAULT_LABELS.tokenGridNotice, ...labels.tokenGridNotice }),
        [labels]
    );

    const {
        matrix,
        columnData: columns,
        rowData: rows,
        setCell,
        resize,
        clear
    } = useGridAreasMatrix(clientId);

    const areaCols = Array.isArray(matrix) && Array.isArray(matrix[0]) ? matrix[0].length : 0;
    const areaRows = Array.isArray(matrix) ? matrix.length : 0;

    const trackCols = toCount(columns?.count ?? columns);
    const trackRows = toCount(rows?.count ?? rows);

    const mismatch = (areaCols || areaRows || trackCols || trackRows)
        ? (areaCols !== trackCols || areaRows !== trackRows)
        : false;

    const handleEditingChange = useCallback((editing) => {
        if (resumeRef.current) clearTimeout(resumeRef.current);
        if (editing) {
            setIsEditing(true);
        } else {
            resumeRef.current = setTimeout(() => setIsEditing(false), 60);
        }
    }, []);

    // Cleanup any pending timer on unmount
    useEffect(() => () => resumeRef.current && clearTimeout(resumeRef.current), []);

    return (
        <Flex direction="column" gap={2} className="costered-blocks--token-grid-component">
            {mismatch && (
                <NoticePanel
                    clientId={clientId}
                    columnData={trackCols}
                    rowData={trackRows}
                    gridMatrix={matrix}
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
            <GridBoard
                matrix={matrix}
                columnData={areaCols}
                rowData={areaRows}
                emptyToken={'.'}
                labels={tokenGridLabels}
                setCell={setCell}
                resize={resize}
                clear={clear}
                onEditingChange={handleEditingChange}
            />
        </Flex>
    );
}