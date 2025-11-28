import { useEffect, useRef } from "@wordpress/element";
import { Modal, Button, Flex } from '@wordpress/components';

import type { KeyboardEvent } from '@wordpress/element';
import type { SVGEditorState } from '@hooks/useSVGEditor';

import { 
    MaterialSymbolsHistory,
    MdiFileImport,
    MdiTrashCanOutline,
    StreamlineSharpBrowserCode2,
} from '@assets/icons';
import Icon from '@components/Icon';

import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, indentMore, indentLess } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { xml } from '@codemirror/lang-xml';

type CodeMirrorProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

type ModalEditorProps = {
    state: SVGEditorState;
}

const RevertIcon = <Icon icon={MaterialSymbolsHistory} size={20} />;
const LoadIcon = <Icon icon={MdiFileImport} size={20} />;
const ClearIcon = <Icon icon={MdiTrashCanOutline} size={20} />;
const CodeEditorIcon = <Icon icon={StreamlineSharpBrowserCode2} size={20} />;

function CM6Editor({
    value,
    onChange,
    className
}: CodeMirrorProps) {
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);

    const tabHandler = EditorView.domEventHandlers({
        keydown(event, view) {
            if (event.key === 'Tab' && !event.metaKey && !event.ctrlKey) {
                // We take full control: no browser focus, no WP modal, only CM.
                event.preventDefault();
                event.stopPropagation();

                if (event.shiftKey) {
                    indentLess(view);
                } else {
                    indentMore(view);
                }

                return true;
            }
        }
    });

    useEffect(() => {
        if (!editorContainerRef.current) {
            return
        };

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                onChange(update.state.doc.toString());
            }
        });

        const state = EditorState.create({
            doc: value,
            extensions: [
                lineNumbers(),
                EditorView.lineWrapping,
                keymap.of([
                    ...defaultKeymap,
                ]),
                xml(),
                syntaxHighlighting(defaultHighlightStyle),
                EditorState.tabSize.of(4),
                tabHandler,
                updateListener,
                EditorView.theme({
                    "&": {
                        height: "100%",
                        fontFamily: "monospace",
                        fontSize: "13px",
                    },
                    '.cm-scroller': {
                        overflow: 'auto',
                    }
                }),
                
            ],
            
        });

        const view = new EditorView({
            state,
            parent: editorContainerRef.current
        });

        viewRef.current = view;

        return () => {
            view.destroy();
        };
    }, []);

    useEffect(() => {
        const view = viewRef.current;
        if (!view) {
            return;
        }
        
        const current = view.state.doc.toString();
        if (current !== value) {
            view.dispatch({
                changes: { from: 0, to: current.length, insert: value }
            });
        }
    }, [value]);

    return (
        <div className={className} ref={editorContainerRef} />
    );
}

export default function ModalEditor({ state }: ModalEditorProps) {
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
            title="Edit SVG code"
            onRequestClose={closeModal}
            className="costered-blocks--svg-modal-editor"
            shouldCloseOnClickOutside={false}
            shouldCloseOnEsc={false}
        >
            <Flex
                direction="column" 
                className="costered-blocks--svg-modal-editor--wrapper"
            >
                <Flex direction="row" gap={0} justify="flex-start" className="costered-blocks--svg-modal-editor--buttons">
                    <Button 
                        icon={RevertIcon} 
                        label="Revert" 
                        onClick={loadFromFile}
                        disabled={!hasUpload}
                    />
                    <Button
                        icon={ClearIcon}
                        label="Clear editor"
                        onClick={clearEditor}
                    />
                </Flex>
                <CM6Editor
                    value={unsavedSVGMarkup}
                    onChange={setUnsavedSVGMarkup}
                    className="costered-blocks--svg-modal-editor--codemirror"
                />
                <div className="costered-blocks--svg-modal-editor--status">status</div>
            </Flex>
        </Modal>
    )
}