import { useState, useCallback, useRef, useMemo, useEffect } from '@wordpress/element';
import { Flex, FlexItem } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

import { useGridAreasMatrix } from '@hooks';
import { GridBoard } from './GridBoard';
import { NoticePanel } from './NoticePanel';
import { LABELS as DEFAULT_LABELS } from '@labels';
import { toCount } from '@utils/gridUtils';
import type { Matrix, ColumnInfo, RowInfo } from '@types';

type LabelsTokenGrid = typeof DEFAULT_LABELS['tokenGrid'];
type LabelsTokenGridNotice = typeof DEFAULT_LABELS['tokenGridNotice'];

type Props = {
    clientId: string;
    labels?: {
        tokenGrid?: Partial<LabelsTokenGrid>;
        tokenGridNotice?: Partial<LabelsTokenGridNotice>;
    };
};

type MatrixReturn = {
    matrix: Matrix;
    columnData: ColumnInfo;
    rowData: RowInfo;
    setCell: (row: number, col: number, token: string) => void;
    resize: (args: { cols: number; rows: number }) => void;
    clear: () => void;
};

export default function TokenGrid({
    clientId,
    labels = {}
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const resumeRef = useRef<number | undefined>(undefined);

    const tokenGridLabels: LabelsTokenGrid = useMemo(
        () => ({ ...DEFAULT_LABELS.tokenGrid, ...(labels.tokenGrid || {}) }),
        [labels]
    );

    const tokenGridNoticeLabels: LabelsTokenGridNotice = useMemo(
        () => ({ ...DEFAULT_LABELS.tokenGridNotice, ...(labels.tokenGridNotice || {}) }),
        [labels]
    );

    const {
        matrix,
        columnData,
        rowData,
        setCell,
        resize: resizeObj,
        clear
    } = useGridAreasMatrix(clientId) as MatrixReturn;

    const resize = useCallback((cols: number, rows: number) => {
        resizeObj({ cols, rows });
    }, [resizeObj]);

    const areaCols = Array.isArray(matrix) && Array.isArray(matrix[0]) ? matrix[0].length : 0;
    const areaRows = Array.isArray(matrix) ? matrix.length : 0;

    const trackCols = toCount((columnData as any)?.count ?? columnData);
    const trackRows = toCount((rowData as any)?.count ?? rowData);

    const mismatch = 
        areaCols || areaRows || trackCols || trackRows
            ? areaCols !== trackCols || areaRows !== trackRows
            : false;

    const handleEditingChange = useCallback((editing: boolean) => {
        if (resumeRef.current !== undefined) {
            window.clearTimeout(resumeRef.current);
            resumeRef.current = undefined;
        }
        if (editing) {
            setIsEditing(true);
        } else {
            resumeRef.current = window.setTimeout(() => {
                setIsEditing(false);
                resumeRef.current = undefined;
            }, 60);
        }
    }, []);

    // Cleanup any pending timer on unmount
    useEffect(() => {
        return () =>  {
            if (resumeRef.current !== undefined)  window.clearTimeout(resumeRef.current);
        };
    }, []);

    return (
        <Flex direction="column" gap={2} className="costered-blocks--token-grid-component">
            {mismatch && (
                <NoticePanel
                    clientId={clientId}
                    columnData={trackCols}
                    rowData={trackRows}
                    gridMatrix={{ resize }}
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