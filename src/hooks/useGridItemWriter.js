import { useCallback } from '@wordpress/element';

export function useGridItemWriter(set, attributeName, mode) {
    return useCallback((next) => {
        const start = `${next.start ?? 'auto'}`.trim();
        if (mode === 'end') {
            const end = `${next.end ?? 'auto'}`.trim();
            set(attributeName, `${start} / ${end}`);
        } else {
            const span = Number(next.span) || 1;
            set(
                attributeName,
                span === 1 && start !== 'auto'
                    ? start
                    : `${start} / span ${span}`
            );
        }
    }, [set, attributeName, mode]);
}