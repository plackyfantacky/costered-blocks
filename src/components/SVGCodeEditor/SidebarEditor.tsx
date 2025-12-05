import { Flex, Button, Toolbar, ToolbarButton } from '@wordpress/components';
import type { SVGEditorState } from '@hooks/useSVGEditor';

import { 
    // MaterialSymbolsHistory,
    // MdiFileImport,
    MdiTrashCanOutline,
    StreamlineSharpBrowserCode2,
} from '@assets/icons';
import Icon from '@components/Icon';

type Props = {
    state: SVGEditorState;
}

// const RevertIcon = <Icon icon={MaterialSymbolsHistory} size={20} />;
// const LoadIcon = <Icon icon={MdiFileImport} size={20} />;
const ClearIcon = <Icon icon={MdiTrashCanOutline} size={20} />;
const CodeEditorIcon = <Icon icon={StreamlineSharpBrowserCode2} size={20} />;


export default function SidebarEditor({ state }: Props) {
    const {
        markup,
        setMarkup,
        hasUpload,
        // loadFromFile,
        clearMarkup,
        openModal,
    } = state;
    
    return (
        <Flex direction="column" gap={1} className="costered-blocks--svg-sidebar-editor">
            <textarea
                className="costered-blocks--svg-sidebar-editor--textarea"
                placeholder="<!-- SVG markup here -->"
                value={markup}
                onChange={(event) => setMarkup(event.target.value)}
            />
            <Flex direction="row" justify="flex-start" align="center" gap={2}>
                {/* <Button icon={RevertIcon} label="Revert" /> */} {/* Revert functionality can be added later */}
                {/* <Button icon={LoadIcon} label="Load from file" onClick={loadFromFile} disabled={!hasUpload} />  */} {/* Load from file can be enabled later */}
                <Button icon={ClearIcon} label="Clear editor" onClick={clearMarkup} />
                <Button icon={CodeEditorIcon} label="Open full editor" onClick={openModal} />
            </Flex>
        </Flex>
    )
}
