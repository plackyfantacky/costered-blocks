import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function AxisAside({ active = false, canClear = false, onClear, axis }) {
    const clearLabel = axis === 'columns'
        ? __('Clear Columns', 'costered-blocks')
        : __('Clear Rows', 'costered-blocks');
    
    return (
        <div className="costered-blocks-grid-axis-aside">
            <span className={`costered-blocks-grid-axis__pip${ active ? ' is-active' : '' }`} aria-hidden />
            <Tooltip text={clearLabel}>
                <Button
                    icon="trash"
                    label={clearLabel}
                    onClick={onClear}
                    disabled={!canClear}
                    variant="tertiary"
                    className="costered-blocks-grid-axis-aside__clear"
                />
            </Tooltip>
        </div>
    );
}