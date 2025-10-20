import { getBlockType } from '@wordpress/blocks';
import { isValidElement, cloneElement } from '@wordpress/element';
import type { CSSProperties, ReactNode, ReactElement, ComponentType } from 'react';

import { MdiQuestionBoxMultiple as UnknownIcon } from "@assets/icons";

type BlockIconObject = {
    src: ReactElement | ComponentType<any>;
    foreground?: string;
    background?: string; 
}

type TabIconProps = {
    name: string | null;
    size?: number;
    style?: React.CSSProperties;
}

export default function TabIcon({ name, size = 24, style = {} }: TabIconProps) {
    if (!name) return <UnknownIcon style={{ fontSize: size, width: size, height: size, ...style }} />;
    
    const blockType: any = getBlockType(name);
    const icon: string | ReactNode | BlockIconObject | undefined = blockType?.icon;
    if (!icon) return <UnknownIcon style={{ fontSize: size, width: size, height: size, ...style }} />;

    
    // If the icon is a dashicons icon, render it as a span with the appropriate class
    if (typeof icon === 'string') {
        return <span className={`costered-blocks--tab-icon block-editor-block-icon dashicons dashicons-${icon}`} style={style} />;
    }

    //rare case where core block icon is an object
    if (typeof icon === 'object' && icon !== null && 'src' in icon) {
        const { src, foreground = 'inherit', background = 'transparent' } = icon;

        const Wrapper = ({children}: {children: ReactNode}) => (
            <span className={`costered-blocks--tab-icon-object`} style={{ width: size, height: size, backgroundColor: background, color: foreground, ...style }}>
                {children}
            </span>
        );

        if (isValidElement(src)) {
            const element = src as ReactElement<any>;
            return (
                <Wrapper>
                    {cloneElement(
                        element, {
                            style: {
                                ...(element.props as any)?.style,
                                display: 'inline-block',
                                width: '1rem',
                                height: '1rem'
                            },
                        } as any
                    )}
                </Wrapper>
            );
        } else if (typeof src === 'function') {
            const IconComponent = src as ComponentType<any>;
            return (
                <Wrapper>
                    <IconComponent />
                </Wrapper>
            );
        }
    }

    // If icon is a valid React element (SVG etc), clone it with new size/style
    if (isValidElement(icon)) {
        const element = icon as ReactElement<any>;
        return cloneElement(
            element, 
            {
                style: {
                    ...(icon as any).props?.style,
                    display: 'inline-block',
                    width: size,
                    height: size,
                    fontSize: size,
                    ...style
                },
            } as any
        );
    }
    // Fallback
    return <UnknownIcon />;
};