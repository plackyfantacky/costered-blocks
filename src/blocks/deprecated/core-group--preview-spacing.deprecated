import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { cloneElement } from '@wordpress/element';

const withEditorSpacingStyles = createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
        const { name, attributes } = props;

        if (name !== 'core/group') return <BlockListBlock {...props} />;

        const {
            containerType,
            containerMXAuto,
            containerWidth,
            ...rest
        } = attributes;

        const style = {
            paddingTop: attributes.paddingTop,
            paddingRight: attributes.paddingRight,
            paddingBottom: attributes.paddingBottom,
            paddingLeft: attributes.paddingLeft,
            marginTop: attributes.marginTop,
            marginRight: attributes.marginRight,
            marginBottom: attributes.marginBottom,
            marginLeft: attributes.marginLeft,
            rowGap: attributes.gapVertical,
            columnGap: attributes.gapHorizontal
        };

        if (containerType === 'boxed' && containerWidth) {
            style.maxWidth = containerWidth;
            if(containerMXAuto && containerMXAuto !== 'false') {
                style.marginLeft = 'auto';
                style.marginRight = 'auto';
            } else {
                style.marginLeft = 'initial !important';
                style.marginRight = 'initial !important';
            }
        } else if (containerType === 'flex') {
            style.flex = '1';
        } else if (containerType === 'full') {
            style.width = '100%';
        } else if (containerType === 'none') {
            style.maxWidth = 'initial';
            style.width = 'initial';
            style.marginLeft = 'initial';
            style.marginRight = 'initial';
            style.flex = 'initial';
        }

        // Remove undefined/empty values to avoid invalid styles
        Object.keys(style).forEach(
            (key) => (style[key] === undefined || style[key] === '') && delete style[key]
        );

        return cloneElement(<BlockListBlock {...props} />, {
            wrapperProps: {
                ...props.wrapperProps,
                style: {
                    ...(props.wrapperProps?.style || {}),
                    ...style,
                },
            },
        });
    };
}, 'withEditorSpacingStyles');

addFilter(
    'editor.BlockListBlock',
    'costered-blocks/core-group--preview-spacing-blocklist-block',
    withEditorSpacingStyles
);
