import { useCallback } from '@wordpress/element';

export function useGridItemWriter(setMany, attributeName, mode) {
    return useCallback((next) => {
        const start = `${next.start ?? 'auto'}`.trim();
        const value = mode === 'end'
            ? `${start} / ${next.end ?? 'auto'}`.trim()
            : (() => {
                const span = Number(next.span) || 1;
                return span === 1 && start !== 'auto'
                    ? start
                    : `${start} / span ${span}`;
            })();
        setMany({
            [attributeName]: value,
            // Clear area if present, as it would conflict
            gridArea: '', //TODO: don't use undefined here -> it gets saved as a string and that breaks everything
        });
    }, [setMany, attributeName, mode]);
}