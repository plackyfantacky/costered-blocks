import { Button, Tooltip } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { pretty } from "@utils/gridUtils";
import { LABELS } from '@labels';

export function GridAxisAside({ axis, canClear = false, onClear, active, owner = null, here = null, label, disabled = false }) {
    const clearLabel = label || (
        axis === 'columns'
            ? LABELS.gridAxisAside.clearColumns
            : LABELS.gridAxisAside.clearRows
        );

    const isSet = !disabled && canClear;
    // Resolve state
    const ownedHere = typeof active === 'boolean'
        ? active
        : (isSet && owner && here && owner === here);

    const ownedElsewhere = isSet && owner && here && owner !== 'raw' && owner !== here && !ownedHere;
    const state = !isSet ? 'none' : (ownedHere ? 'here' : (ownedElsewhere ? 'elsewhere' : 'none'));

    const pipTitle = 
        state === 'none'
            ? LABELS.gridAxisAside.pip.noValue
            : state === 'here'
                ? LABELS.gridAxisAside.pip.valueHere
                : (owner === 'raw'
                    ? LABELS.gridAxisAside.pip.valueRaw
                    : sprintf(LABELS.gridAxisAside.pip.valueElsewhere, pretty(owner))
                );

    return (
        <div
            className={`costered-blocks--grid-axis-aside ${state === 'here' ? 'is-owned-here' : ''} ${state === 'elsewhere' ? 'is-elsewhere' : ''}`}
            data-state={state}
            data-owner={owner || 'none'}
            data-here={here || 'none'}
            aria-label={axis}
        >
            <Tooltip text={pipTitle}>
                <span className="costered-blocks--grid-axis-aside--pip"/>
            </Tooltip>
            <Tooltip text={clearLabel}>
                <Button
                    icon="trash"
                    label={clearLabel}
                    onClick={onClear}
                    disabled={!isSet}
                    variant="tertiary"
                    className="costered-blocks--grid-axis-aside__clear"
                />
            </Tooltip>
        </div>
    );
}