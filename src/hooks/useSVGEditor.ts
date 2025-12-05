import { useState, useMemo, useEffect } from '@wordpress/element';

export type SVGEditorState = {
    markup: string;
    originalMarkup: string;
    hasUpload: boolean;
    isModified: boolean;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    setMarkup: (nextMarkup: string) => void;
    restoreOriginal: () => void;
    clearMarkup: () => void;
    loadFromFile: () => void;
};

type Options = {
    markup: string;
    hasUpload: boolean;
    onChange: (nextMarkup: string) => void;
}

export function useSVGEditor({ 
    markup, 
    hasUpload, 
    onChange 
}: Options): SVGEditorState {
    const initialMarkup = markup || '';

    const [originalMarkup] = useState<string>(initialMarkup);
    const [editorMarkup, setEditorMarkup] = useState<string>(initialMarkup);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const next = markup || '';
        setEditorMarkup((current) => (current === next ? current : next));
    }, [markup]);

    const isModified = useMemo(() => {
        return editorMarkup !== originalMarkup;
    }, [editorMarkup, originalMarkup]);

    function setMarkup(nextMarkup: string): void {
        setEditorMarkup(nextMarkup);
        onChange(nextMarkup);
    }

    function restoreOriginal(): void {
        setMarkup(originalMarkup);
    }

    function clearMarkup(): void {
        setMarkup('');
    }

    function loadFromFile(): void {
        // to be implemented later
        console.log('loadFromFile called. (to be implemented)');
    }

    function openModal(): void {
        setIsModalOpen(true);
    }

    function closeModal(): void {
        setIsModalOpen(false);
    }

    return {
        markup: editorMarkup,
        originalMarkup,
        hasUpload,
        isModified,
        isModalOpen,
        openModal,
        closeModal,
        setMarkup,
        restoreOriginal,
        clearMarkup,
        loadFromFile,
    };
}