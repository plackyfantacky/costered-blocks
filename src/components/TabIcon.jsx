import { getBlockType } from '@wordpress/blocks';
import { isValidElement, cloneElement } from '@wordpress/element';

import { MdiQuestionBoxMultiple as UnknownIcon } from "@assets/icons";

export default function TabIcon({ name, size = 24, style = {} }) {
    if (!name) return <UnknownIcon />;
    const blockType = getBlockType(name);
    if (!blockType || !blockType.icon) return null;
    const icon = blockType.icon;

    // If the icon is a dashicons icon, render it as a span with the appropriate class
    if (typeof icon === 'string') {
        return <span className={`costered-blocks--tab-icon block-editor-block-icon dashicons dashicons-${icon}`} style={style} />;
    }

    //rare case where core block icon is an object
    if (typeof icon === 'object' && icon !== null && icon.src) {
        const { src, foreground = 'inherit', background = 'transparent' } = icon;

        const Wrapper = ({ children }) => (
            <span className={`costered-blocks--tab-icon-object`} style={{ width: size, height: size, backgroundColor: background, color: foreground, ...style }}>
                {children}
            </span>
        );

        if (isValidElement(src)) {
            return (
                <Wrapper>
                    {cloneElement(src, { width: size, height: size, style: { ...src.props.style, ...style } })}
                </Wrapper>
            );
        } else if (typeof src === 'function') {
            const IconComponent = src;
            return (
                <Wrapper>
                    <IconComponent width={size} height={size} style={{ ...style, width: size, height: size }} />
                </Wrapper>
            );
        }
    }

    // If icon is a valid React element (SVG etc), clone it with new size/style
    if (isValidElement(icon)) {
        return cloneElement(icon, {
            width: size,
            height: size,
            style: { ...icon.props.style, ...style }
        });
    }

    // Fallback
    return <UnknownIcon />;
};