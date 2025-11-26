import ModalEditor from "./ModalEditor";
import SidebarEditor from "./SidebarEditor";

import { useSVGEditor } from "@hooks";

import type { SVGEditorState } from "@hooks/useSVGEditor";

type Props = {
    savedSVGMarkup: string;
    hasUpload: boolean;
}

export default function SVGCodeEditor({ savedSVGMarkup, hasUpload }: Props) {
    const state: SVGEditorState = useSVGEditor({ savedSVGMarkup, hasUpload } );
    return (
        <>
            <SidebarEditor state={state} />
            { state.isModalOpen && <ModalEditor state={state} /> }
        </>
    );
}
