// ./src/components/Icon.tsx
import { isValidElement, cloneElement } from '@wordpress/element';
import type { 
    ReactNode, 
    ReactElement,
    ElementType,
    CSSProperties
} from '@wordpress/element';

import { MdiQuestionBoxMultiple as UnknownIcon } from "@assets/icons";

/** Shared shape for WP-style icon objects */
export type IconObject = {
    /** WP uses either an element-like node or a component here */
    src: ReactElement | ElementType;
    foreground?: string;
    background?: string; 
}

/** Single union type we can use anywhere we deal with block icons */
export type IconInput =
    | string //dashicon name
    | ReactNode // element e.g <svg>...</svg>
    | ElementType
    | IconObject; // { src, foreground?, background? }

type IconProps = {
    name?: string | null;
    icon?: IconInput;
    size?: number;
    className?: string;
    style?: CSSProperties;
}

function isDashicon(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isIconObject(value: unknown): value is IconObject {
    return !!value && typeof value === 'object' && 'src' in (value as Record<string, unknown>);
}

function Wrapper({
    size,
    className,
    style,
    foreground,
    background,
    children
}: {
    size: number;
    className?: string;
    style?: CSSProperties;
    foreground?: string | undefined;
    background?: string | undefined;
    children: ReactNode;
}) {
    const cssVars: Record<string, string> = {};
    if (typeof size === 'number') cssVars['--cb-icon-size'] = `${size}px`;
    if (foreground) cssVars['--cb-icon-foreground'] = foreground;
    if (background) cssVars['--cb-icon-background'] = background;

    return (
        <span 
            className={['costered-blocks--icon', className].filter(Boolean).join(' ')} 
            style={{ ...style, ...cssVars }}
        >
            {children}
        </span>
    );
}

export default function Icon({ 
    name = null,
    icon,
    size = 24,
    className = '',
    style = {}
}: IconProps) {
    // Priority: `icon` prop wins; fallback to `name` (dashicons)
    const candidate = icon ?? name;

    //case 1: dashicon by slug
    if(isDashicon(candidate)) {
        return (
            <Wrapper size={size} className={className} style={style}>
                <span className={`dashicons dashicons-${candidate}`} />
            </Wrapper>
        );          
    }

    //case 2: icon object
    if(isIconObject(candidate)) {
        const { src, foreground, background } = candidate;
        
        if (isValidElement(src)) {
            const element = src as ReactElement<{ style?: CSSProperties }>;
            return (
                <Wrapper 
                    size={size}
                    className={className}
                    style={style}
                    foreground={foreground}
                    background={background}
                >
                    {cloneElement(element, {
                        style: { ...(element.props?.style ?? {}) }
                    })}
                </Wrapper>
            );
        }

        if (typeof src === 'function') {
            const Component = src as ElementType;
            return (
                <Wrapper
                    size={size}
                    className={className}
                    style={style}
                    foreground={foreground}
                    background={background}
                >
                    <Component />
                </Wrapper>
            );
        }
    }

    //case 3: ReactNode or Component
    if (isValidElement(candidate)) {
        const element = candidate as ReactElement<{ style?: CSSProperties }>;
        return (
            <Wrapper size={size} className={className} style={style}>
                {cloneElement(element, {
                    style: { ...(element.props?.style ?? {}) }
                })}
            </Wrapper>
        );
    }

    // case 4: candidate is a component type
    if (typeof candidate === 'function') {
        const Component = candidate as ElementType;
        return (
            <Wrapper size={size} className={className} style={style}>
                <Component />
            </Wrapper>
        );
    }

    // Fallback
    return (
        <Wrapper size={size} className={className} style={style}>
            <UnknownIcon />
        </Wrapper>
    );
};