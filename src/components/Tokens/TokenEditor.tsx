import { useMemo } from '@wordpress/element';
import { TokenListEditor } from "@components/Tokens/TokenListEditor";
import { TracksTokensAdapter } from '@utils/tokenTracksAdapter';

type Props = {
    value: string;
    onChange: (next: string) => void;

    floatingEditor?: boolean;
    popoverPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    popoverWidth?: string | number;

    labelScope: string;
};

export function TokenEditor({ 
    value,
    onChange,
    labelScope,
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
            labelScope={labelScope}
            floatingEditor={floatingEditor}
            popoverPlacement={popoverPlacement}
            popoverWidth={popoverWidth}
            allowRaw={true}
            showPerTokenGrouping={false}
        />
    )
}