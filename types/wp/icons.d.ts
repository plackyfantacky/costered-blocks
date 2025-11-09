// types/wp/icons.d.ts
declare module '@wordpress/icons' {
    import type { ComponentType, ReactElement, SVGProps } from 'react';

    export type IconType = 
        | ComponentType<SVGProps<SVGSVGElement>>
        | ReactElement
        | string
        | null
        | undefined;

    export const Icon: ComponentType<{ 
        icon?: IconType;
        size?: number | string;
        className?: string;
    }>;

    export const blockDefault: IconType;
    export const check: IconType;
    export const close: IconType;
    export const plus: IconType;
    export const chevronDown: IconType;
    export const chevronRight: IconType;
    export const more: IconType;
    export const moreVertical: IconType;
    export const settings: IconType;
    export const trash: IconType;
    export const edit: IconType;
    export const warning: IconType;
    export const info: IconType;
}
