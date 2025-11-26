import { Modal, Button, Flex } from '@wordpress/components';
import type { SVGEditorState } from '@hooks/useSVGEditor';

type Props = {
    state: SVGEditorState;
}

export default function ModalEditor({ state }: Props) {
    const {
        unsavedSVGMarkup,
        setUnsavedSVGMarkup,
        loadFromFile,
        clearEditor,
        closeModal,
        hasUpload
    } = state;

    return (
        <Modal
            title="SVG Full Editor"
            onRequestClose={closeModal}
            className="costered-blocks--svg-modal-editor"
            shouldCloseOnClickOutside={false}
        >
            <div className="costered-blocks--svg-modal-editor--wrapper">
                <textarea
                    className="costered-blocks--svg-modal-editor--textarea"
                    placeholder="<!-- SVG markup here -->"
                    value={unsavedSVGMarkup}
                    onChange={(event) => setUnsavedSVGMarkup(event.target.value)}
                />
            </div>
            <Flex direction="row" gap={8} className="costered-blocks--svg-modal-editor--buttons">
                <Button
                    variant="secondary"
                    onClick={loadFromFile}
                    disabled={!hasUpload}
                >
                    Load from file
                </Button>
                <Button
                    variant="tertiary"
                    onClick={clearEditor}
                >
                    Clear
                </Button>
                <Button
                    variant="primary"
                    onClick={closeModal}
                >
                    Close Editor
                </Button>
            </Flex>
        </Modal>
    )
}