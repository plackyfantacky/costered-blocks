import { Flex, Notice, Button } from '@wordpress/components';
import type { SVGEditorState } from '@hooks/useSVGEditor';

type Props = {
    state: SVGEditorState;
}

export default function SidebarEditor({ state }: Props) {
    const {
        unsavedSVGMarkup,
        setUnsavedSVGMarkup,
        loadFromFile,
        clearEditor,
        openModal,
        hasUpload,
    } = state;
    
    return (
        <div className="costered-blocks--svg-sidebar-editor">
            <textarea
                className="costered-blocks--svg-sidebar-editor--textarea"
                placeholder="<!-- SVG markup here -->"
                value={unsavedSVGMarkup}
                onChange={(event) => setUnsavedSVGMarkup(event.target.value)}
            />
            <Flex direction="row" gap={8} className="costered-blocks--svg-sidebar-editor--buttons">
                <Button
                    variant="secondary"
                    onClick={loadFromFile}
                    disabled={!hasUpload}
                >
                    Load from file
                </Button>
                <Button
                    variant="secondary"
                    onClick={clearEditor}
                >
                    Clear
                </Button>
                <Button
                    variant="secondary"
                    onClick={openModal}
                >
                    Open Full Editor
                </Button>
            </Flex>
            <Notice status="info" isDismissible={false} className="costered-blocks--svg-sidebar-editor--notice">
                Sidebar editor scaffold - behaviour to be implemented.
            </Notice>
        </div>
    )
}
