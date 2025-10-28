// types/wp/blocks.d.ts
declare module '@wordpress/blocks' {
    export function registerBlockType<Attrs extends Record<string, unknown> = Record<string, unknown>>(
        name: string,
        settings: BlockConfiguration<Attrs>
    ): any;
    
    export function getBlockType(name: string): any;
    export function getBlockVariations(name: string): Array<{ name: string; isDefault?: boolean }> | undefined;
    export function unregisterBlockVariation(blockName: string, variationName: string): void;

    export interface BlockConfiguration<Attrs extends Record<string, unknown> = Record<string, unknown>> {
        apiVersion?: number;
        title?: string;
        category?: string;
        icon?: any;
        keywords?: string[];
        parent?: string[];
        attributes?: Record<string, unknown>;
        supports?: Record<string, unknown>;
        providesContext?: Record<string, string>;
        usesContext?: string[];
        example?: unknown;
        styles?: unknown[];
        transforms?: unknown;
        variations?: unknown[];
        deprecated?: unknown[];
        edit?: (props: { attributes: Attrs; setAttributes: (next: Partial<Attrs>) => void } & Record<string, unknown>) => React.ReactNode;
        save?: (props: { attributes: Attrs } & Record<string, unknown>) => React.ReactNode;
    }
}
