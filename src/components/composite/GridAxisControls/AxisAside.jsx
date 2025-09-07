import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const pretty = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export function AxisAside({ 
    axis,
    canClear = false,
    onClear,
    active,
    owner = null,
    here = null
}) {
    const clearLabel = axis === 'columns'
        ? __('Clear Columns', 'costered-blocks')
        : __('Clear Rows', 'costered-blocks');

    const isSet = !!canClear;
    // Resolve state
    const ownedHere = typeof active === 'boolean'
        ? active
        : (isSet && owner && here && owner === here);

    const ownedElsewhere = isSet && owner && here && owner !== 'raw' && owner !== here && !ownedHere;
    const state = !isSet ? 'none' : (ownedHere ? 'here' : (ownedElsewhere ? 'elsewhere' : 'none'));

    const pipTitle = 
        state === 'none'
            ? __('No value set', 'costered-blocks')
            : state === 'here'
                ? __('Value matches this panel', 'costered-blocks')
                : (owner === 'raw'
                    ? __('Value set (unrecognised format)', 'costered-blocks')
                    : sprintf(__('Value set in %s panel', 'costered-blocks'), pretty(owner))
                );

    return (
        <div
            className={`costered-blocks-grid-axis-aside${state === 'here' ? ' is-owned-here' : ''}${state === 'elsewhere' ? ' is-elsewhere' : ''}`}
            data-state={state}
            data-owner={owner || 'none'}
            data-here={here || 'none'}
            aria-label={axis}
        >
            <Tooltip text={pipTitle}>
                <span className="costered-blocks-grid-axis__pip"/>
            </Tooltip>
            <Tooltip text={clearLabel}>
                <Button
                    icon="trash"
                    label={clearLabel}
                    onClick={onClear}
                    disabled={!isSet}
                    variant="tertiary"
                    className="costered-blocks-grid-axis-aside__clear"
                />
            </Tooltip>
        </div>
    );
}