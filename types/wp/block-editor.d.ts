// types/wp/block-editor.d.ts
declare module '@wordpress/block-editor' {
    export const InnerBlocks: any;
    export const InspectorControls: any;
    export const RichText: any;
    export const store: string;
    export const URLInput: any;
    export const useBlockProps: any;

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
