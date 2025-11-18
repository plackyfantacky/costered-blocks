import { Tooltip } from "@wordpress/components";

import { MdiEditOutline as EditIcon } from "@assets/icons";
import { useUnsavedAttr } from "@hooks";
import { LABELS } from "@labels";
import { sprintf } from "@wordpress/i18n";
import type { UnsavedAttr } from "@types";

type Props = {
    costeredId: string | null;
    attrs: string | UnsavedAttr[]; // we either get a string or an array of strings
    variant?: 'icon' | 'dot';
    className?: string;
}

export function UnsavedIcon({
    costeredId,
    attrs,
    variant = 'icon',
    className = ''
}: Props) {
    if (!costeredId || !attrs) return null;

    const attrOrList: string[] = Array.isArray(attrs) 
        ? attrs.map(attribute => typeof attribute === 'string' ? attribute : attribute.attr)
        : [attrs];

    const unsavedChecks = attrOrList.map(attr => useUnsavedAttr(costeredId, attr));
    const unsavedAttrs = unsavedChecks.filter(attribute => attribute.unsaved);
    if (unsavedAttrs.length === 0) return null;

    const unsavedNames = unsavedAttrs
        .map(attribute => attribute.fieldId?.split(':')[1] ?? '')
        .filter(Boolean)
        .join(', ');
    
    const tooltipText = unsavedNames.length > 0
        ? sprintf(LABELS.editingContext.unsavedChangesForAttrs, unsavedNames)
        : LABELS.editingContext.unsavedChanges;

    return (
        <Tooltip text={tooltipText}>
            { variant === 'icon' ? (
                <span className="costered-blocks--unsaved-indicator costered-blocks--unsaved-icon">
                    <EditIcon width="1rem" height="1rem" className={`costered-blocks--unsaved-icon-svg ${className}`} />
                </span>
            ) : (
                <span className={`costered-blocks--unsaved-indicator costered-blocks--unsaved-dot ${className}`} />
            )
        }
        </Tooltip>
    );
}
