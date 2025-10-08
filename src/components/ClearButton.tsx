import { Button, Tooltip } from '@wordpress/components';
import { Icon, trash } from '@wordpress/icons';
import { useCallback } from '@wordpress/element';

import { LABELS } from '@labels';
import { useAttrSetter } from '@hooks';

type Props = {
    clientId?: string | null;
    keys?: readonly string[];
    label?: string;
    onAfterClear?: () => void;
    disabled?: boolean;
    className?: string;
};

export default function ClearButton({
    clientId,
    keys = [],
    label,
    onAfterClear,
    disabled = false,
    className = '',
}: Props) {
    const clearLabel = label || LABELS.actions.clear;
    const { unset, unsetMany } = useAttrSetter(clientId);

    const handleClick = useCallback(() => {
        if (Array.isArray(keys) && keys.length > 1) {
            unsetMany(keys);
        } else if (keys && keys.length === 1) {
            unset(keys[0]!);
        }
        onAfterClear?.();
    }, [keys, unset, unsetMany, onAfterClear]);

    return (
        <Tooltip text={clearLabel}>
            <Button
                className="costered-blocks--icon-button costered-blocks--clear-button"
                variant="tertiary"
                size="compact"
                icon={<Icon icon={trash} />}    
                onClick={handleClick}
                label={clearLabel}
                aria-label={clearLabel}
                disabled={disabled}
            />
        </Tooltip>
    );
}
