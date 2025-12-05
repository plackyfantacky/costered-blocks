import ModalEditor from "./ModalEditor";
import SidebarEditor from "./SidebarEditor";

import { useSVGEditor } from "@hooks";

import type { SVGEditorState } from "@hooks/useSVGEditor";

type Props = {
    markup: string;
    hasUpload: boolean;
    onChange: (nextMarkup: string) => void;
}

export default function SVGCodeEditor({ markup, hasUpload, onChange }: Props) {
    const state: SVGEditorState = useSVGEditor({ markup, hasUpload, onChange } );
    return (
        <>
            <SidebarEditor state={state} />
            { state.isModalOpen && <ModalEditor state={state} /> }
        </>
    );
}
