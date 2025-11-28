// import { useCallback, useEffect } from '@wordpress/element';
// import { PanelBody, PanelRow, Button, Notice, Spinner, Flex, FlexBlock, FlexItem } from '@wordpress/components';

import { Flex, PanelRow } from "@wordpress/components";

import SVGCodeEditor from "@components/SVGCodeEditor";
import type { SVGEditorState } from "@hooks/useSVGEditor";

type Props = {
    atttributes: Record<string, any>;
};

export function SVGCodeEditorPanel({ atttributes } : Props) {
    const savedSVGMarkup: string = String(atttributes?.svgMarkup ?? '');
    const hasUpload: boolean = Boolean(atttributes?.mediaId && atttributes?.mediaUrl);

    return (
        <PanelRow className="costered-blocks--inline-svg--code-editor">
            <Flex direction="column" gap={2} className="costered-blocks--inline-svg--code-editor--wrapper">
                <SVGCodeEditor 
                    savedSVGMarkup={savedSVGMarkup} 
                    hasUpload={hasUpload} 
                />
            </Flex>
        </PanelRow>
    )
}