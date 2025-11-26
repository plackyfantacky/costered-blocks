import { useState, useCallback } from '@wordpress/element';

export type SVGEditorState = {
    unsavedSVGMarkup: string;
    setUnsavedSVGMarkup: (value: string) => void;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    loadFromFile: () => void;
    clearEditor: () => void;
    savedSVGMarkup: string;
    hasUpload: boolean;
};

type Options = {
    savedSVGMarkup: string;
    hasUpload: boolean;
}

export function useSVGEditor({ savedSVGMarkup, hasUpload }: Options): SVGEditorState {
    const [ unsavedSVGMarkup, setUnsavedSVGMarkup ] = useState<string>('');
    const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const loadFromFile = useCallback(() => {
        //placeholder
        setUnsavedSVGMarkup(savedSVGMarkup);
    }, [savedSVGMarkup]);

    const clearEditor = useCallback(() => {
        setUnsavedSVGMarkup('');
    }, []);

    return {
        unsavedSVGMarkup,
        setUnsavedSVGMarkup,
        isModalOpen,
        openModal,
        closeModal,
        loadFromFile,
        clearEditor,
        savedSVGMarkup,
        hasUpload,
    };

}