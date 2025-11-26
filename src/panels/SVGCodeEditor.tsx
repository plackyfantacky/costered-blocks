import { useCallback, useEffect } from '@wordpress/element';
import { PanelBody, PanelRow, Button, Notice, Spinner, Flex, FlexBlock, FlexItem } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck, useBlockProps} from '@wordpress/block-editor';


import { LABELS } from '@labels';
import {
    useAttrSetter,
    useParentGridMeta,
    useGridItemTracksController,
    useScopedKey,
    useUIPreferences
} from '@hooks';

type Props = {
    clientId: string | null;
    safeBlockName?: string;
};


export function SVGCodeEditor({
    clientId,
    safeBlockName }
: Props) {
    if (!clientId) return null;

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <p>beans</p>
        </div>
    )

}