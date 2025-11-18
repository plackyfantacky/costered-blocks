// types/wp/block-editor.d.ts
declare module '@wordpress/block-editor' {
    export const InspectorControls: React.ComponentType<any>;
    export const MediaUpload: React.ComponentType<any>;
    export const MediaUploadCheck: React.ComponentType<any>;
    export const MediaPlaceholder: React.ComponentType<any>;
    export const InnerBlocks: React.ComponentType<any>;
    export const RawHTML: React.ComponentType<any>;
    export const RichText: any;
    export const store: string;
    export const URLInput: any;
    export const useBlockProps: any;

    export const useBlockProps: {
        (options?: any): any;
        save(options?: any): any;
    };

    export type InnerBlocksTemplateItem =
        | readonly [string]
        | readonly [string, Readonly<Record<string, unknown>>]
        | readonly [string, Readonly<Record<string, unknown>>, Readonly<InnerBlocksTemplate>];

    export type InnerBlocksTemplate = ReadonlyArray<InnerBlocksTemplateItem>;

    export interface InnerBlocksProps {
        allowedBlocks?: readonly string[];
        template?: InnerBlocksTemplate;
        templateLock?: false | 'all' | 'insert';
        orientation?: 'horizontal' | 'vertical';
        renderAppender?: React.ComponentType | null;
    }

    export const InnerBlocks: React.ComponentType<Partial<InnerBlocksProps> & Record<string, any>>;
}
