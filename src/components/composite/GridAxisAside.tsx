import { Button, Tooltip } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

import { pretty } from "@utils/gridUtils";
import { LABELS } from '@labels';
import type { GridAxisKey } from '@types';

type Props = {
    axis: GridAxisKey;
    canClear?: boolean;
    onClear: () => void;
    active?: boolean; 
    owner?: string | null;
    here?: string | null;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export function GridAxisAside({ 
    axis, 
    canClear = false, 
    onClear, 
    active, 
    owner = null, 
    here = null, 
    label, 
    disabled = false,
    className = ''
 }: Props) {
    const clearLabel = label ?? 
        (axis === 'columns'
            ? LABELS.gridAxisAside.clearColumns
            : LABELS.gridAxisAside.clearRows
        );

    const hasOwner = typeof owner === 'string' && owner.length > 0;
    const hasHere = typeof here === 'string' && here.length > 0;
    const isSet = !disabled && canClear;
    
    // Resolve state
    const ownedHere: boolean = 
        typeof active === 'boolean'
            ? active
            : (isSet && hasOwner && hasHere && owner === here);

    const ownedElsewhere: boolean = 
        isSet && 
        hasOwner && 
        hasHere && 
        owner !== 'raw' && 
        owner !== here && 
        !ownedHere;

    const state: 'none' | 'here' | 'elsewhere' = !isSet 
        ? 'none' 
        : (ownedHere 
            ? 'here' 
            : (ownedElsewhere 
                ? 'elsewhere' 
                : 'none'));

    const pipTitle = 
        state === 'none'
            ? LABELS.gridAxisAside.pip.noValue
            : state === 'here'
                ? LABELS.gridAxisAside.pip.valueHere
                : (owner === 'raw'
                    ? LABELS.gridAxisAside.pip.valueRaw
                    : sprintf(LABELS.gridAxisAside.pip.valueElsewhere, pretty(owner))
                );

    const wrapperClass = 
        `costered-blocks--grid-axis-aside` +
        (state === 'here' ? ' is-owned-here' : '') +
        (state === 'elsewhere' ? ' is-elsewhere' : '') +
        (className ? ` ${className}` : '');

    return (
        <div
            className={wrapperClass}
            data-state={state}
            data-owner={owner ?? 'none'}
            data-here={here ?? 'none'}
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
                    aria-disabled={!isSet}
                />
            </Tooltip>
        </div>
    );
}