// import { useCallback, useEffect } from '@wordpress/element';
// import { PanelBody, PanelRow, Button, Notice, Spinner, Flex, FlexBlock, FlexItem } from '@wordpress/components';

import { Flex, PanelRow } from "@wordpress/components";

import SVGCodeEditor from "@components/SVGCodeEditor";
import type { SVGEditorState } from "@hooks/useSVGEditor";

type Props = {
    atttributes: Record<string, any>;
    setAttributes: (attributes: Record<string, any>) => void;
    clientId: string;
};

export function SVGCodeEditorPanel({ atttributes, setAttributes } : Props) {

    const savedSVGMarkup: string = String(atttributes?.svgMarkup ?? '');
    const hasUpload: boolean = Boolean(atttributes?.mediaId && atttributes?.mediaUrl);

    return (
        <PanelRow className="costered-blocks--inline-svg--code-editor">
            <Flex direction="column" gap={2} className="costered-blocks--inline-svg--code-editor--wrapper">
                <SVGCodeEditor 
                    markup={savedSVGMarkup} 
                    hasUpload={hasUpload} 
                    onChange={(next) => setAttributes({ svgMarkup: next ?? '' })}
                />
            </Flex>
        </PanelRow>
    )
}