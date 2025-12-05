import { Flex, PanelRow } from "@wordpress/components";

import InlineSVGPreview from "@components/InlineSVGPreview";
import SVGCodeEditor from "@components/SVGCodeEditor";

type Props = {
    attributes: Record<string, any>;
    setAttributes: (attributes: Record<string, any>) => void;
    clientId: string;
};

export function SVGCodeEditorPanel({ attributes, setAttributes } : Props) {

    const savedSVGMarkup: string = String(attributes?.svgMarkup ?? '');
    const hasUpload: boolean = Boolean(attributes?.mediaId && attributes?.mediaUrl);

    return (
        <PanelRow className="costered-blocks--inline-svg--code-editor">
            <Flex direction="column" gap={2} className="costered-blocks--inline-svg--code-editor--wrapper">
                <InlineSVGPreview
                    svgMarkup={savedSVGMarkup}
                    className="costered-blocks--inline-svg--editor--preview"
                />
                <SVGCodeEditor 
                    markup={savedSVGMarkup} 
                    hasUpload={hasUpload} 
                    onChange={(next) => setAttributes({ svgMarkup: next ?? '' })}
                />
            </Flex>
        </PanelRow>
    )
}