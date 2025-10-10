import { useMemo } from '@wordpress/element';
import { TokenListEditor } from "@components/Tokens/TokenListEditor";
import { TracksTokensAdapter } from '@utils/tokenTracksAdapter';

import { LABELS } from "@labels";

type Props = {
    value: string;
    onChange: (next: string) => void;

    floatingEditor?: boolean;
    popoverPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    popoverWidth?: string | number;

    labels?: Partial<Record<string, string>>;
};

export function TokenEditor({ 
    value,
    onChange,
    floatingEditor = false,
    popoverPlacement = 'bottom-start',
    popoverWidth = 200
}: Props) {

    const adapter = useMemo(() => TracksTokensAdapter, []);

    return (
        <TokenListEditor
            persisted={value}
            adapter={adapter}
            onChange={onChange}
            floatingEditor={floatingEditor}
            popoverPlacement={popoverPlacement}
            popoverWidth={popoverWidth}
            allowRaw={true}
            showPerTokenGrouping={false}
            labels={{
                //TODO: remap these to @labels and import LABELS
                addLabel: LABELS?.gridControls?.tracksPanel?.columns?.addLabel,
                addPlaceholder: LABELS?.gridControls?.tracksPanel?.columns?.addPlaceholder,
                addKindName: LABELS?.gridControls?.tracksPanel?.columns?.addKindName ?? '@@Name [a]@@',
                addKindRaw: LABELS?.gridControls?.tracksPanel?.columns?.addKindRaw ?? '@@Raw (e?.g?. 1fr, minmax)@@',
                emptyState: LABELS?.gridControls?.tracksPanel?.columns?.emptyState ?? '@@No tokens yet.@@',
                mergeLeft: LABELS?.gridControls?.tracksPanel?.columns?.mergeLeft ?? '@@Merge with left@@',
                splitOut: LABELS?.gridControls?.tracksPanel?.columns?.splitOut ?? '@@Split from group@@',
            }}
        />
    )
}