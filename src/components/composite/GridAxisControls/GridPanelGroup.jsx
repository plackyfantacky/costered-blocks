import { createContext, useCallback, useContext, useMemo, useState } from '@wordpress/element';
import { Flex } from '@wordpress/components';

export const GridPanelContext = createContext(null);

export function GridPanelGroup({ active, defaultActive = 'simple', onChange, children }) {
    const [internal, setInternal] = useState(defaultActive);
    const current = active !== undefined ? active : internal;

    const setActive = useCallback((next) => {
        if (onChange) onChange(next);
        if (active === undefined) setInternal(next);
    }, [onChange, active]);

    const ctx = useMemo(() => ({ active: current, setActive }), [current, setActive]);

    return (
        <GridPanelContext.Provider value={ctx}>
            <Flex direction="column" gap={2} className="costered-blocks-grid-panel-group">
                {children}
            </Flex>
        </GridPanelContext.Provider>
    );
}

export function GridPanel({ group, children }) {
    const ctx = useContext(GridPanelContext);
    if (!ctx || ctx.active !== group) return null;
    return (
        <div className="costered-blocks-grid-panel" data-group={group}>
            {children}
        </div>
    );
}