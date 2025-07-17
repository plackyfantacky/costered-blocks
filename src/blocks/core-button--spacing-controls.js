import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { Fragment, cloneElement, useEffect, useRef } from '@wordpress/element';

import WidthHeightControls from "../components/WidthHeightControls.jsx";
import MarginControls from '../components/MarginControls.jsx';
import PaddingControls from '../components/PaddingControls.jsx';

// Extend attributes
addFilter('blocks.registerBlockType', 'costered-blocks/core-button--spacing-controls-register-block-type', (settings, name) => {
    if (name !== 'core/button') return settings;

    settings.attributes = {
        ...settings.attributes,
        buttonWidth: { type: 'string', default: '' },
        buttonHeight: { type: 'string', default: '' },
        paddingTop: { type: 'string', default: '' },
        paddingRight: { type: 'string', default: '' },
        paddingBottom: { type: 'string', default: '' },
        paddingLeft: { type: 'string', default: '' },
        marginMode: { type: 'string', default: 'default' }, // 'default' or 'custom'
        marginTop: { type: 'string', default: '' },
        marginRight: { type: 'string', default: '' },
        marginBottom: { type: 'string', default: '' },
        marginLeft: { type: 'string', default: '' }
    };

    const originalSave = settings.save;
    settings.save = (props) => {
        const el = originalSave(props);

        if (!el?.props?.children) return el;

        const {
            buttonWidth,
            buttonHeight,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft
        } = props.attributes;

        const style = {
            ...(buttonWidth && { width: buttonWidth }),
            ...(buttonHeight && { height: buttonHeight }),
            ...(paddingTop && { paddingTop }),
            ...(paddingRight && { paddingRight }),
            ...(paddingBottom && { paddingBottom }),
            ...(paddingLeft && { paddingLeft }),
            ...(marginTop && { marginTop }),
            ...(marginRight && { marginRight }),
            ...(marginBottom && { marginBottom }),
            ...(marginLeft && { marginLeft })
        };

        const inner = el.props.children;
        const styledLink = cloneElement(inner, {
            style: {
                ...inner.props?.style,
                ...style
            }
        });

        return cloneElement(el, {}, styledLink);
    };
    return settings;
});


const withSpacingControls = createHigherOrderComponent((BlockEdit) => (props) => {
    if (props.name !== 'core/button') return <BlockEdit {...props} />;

    const { attributes, setAttributes } = props;

    const wrapperRef = useRef(null);

    const {
        buttonWidth,
        buttonHeight,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft
    } = props.attributes;

    useEffect(() => {

        if (!wrapperRef.current) return;
        const link = wrapperRef.current.querySelector('.wp-block-button__link');
    
        if (!link) return;

        Object.assign(link.style, {
            ...(paddingTop && { paddingTop }),
            ...(paddingRight && { paddingRight }),
            ...(paddingBottom && { paddingBottom }),
            ...(paddingLeft && { paddingLeft }),
            ...(marginTop && { marginTop }),
            ...(marginRight && { marginRight }),
            ...(marginBottom && { marginBottom }),
            ...(marginLeft && { marginLeft }),
            ...(buttonWidth && { width: buttonWidth }),
            ...(buttonHeight && { height: buttonHeight })
        });

    }, [buttonWidth, buttonHeight, paddingTop, paddingRight, paddingBottom, paddingLeft, marginTop, marginRight, marginBottom, marginLeft]);

    return (
        <Fragment>
            <div className="beans" ref={wrapperRef}>
                <BlockEdit {...props} />
            </div>
            <InspectorControls>
                <PanelBody title="Spacing" initialOpen={true}>
                    <WidthHeightControls attributes={attributes} setAttributes={setAttributes} />
                    <PaddingControls attributes={attributes} setAttributes={setAttributes} />
                    <MarginControls attributes={attributes} setAttributes={setAttributes} />
                </PanelBody>
            </InspectorControls>
        </Fragment>
    );
}, 'withSpacingControls');

addFilter('editor.BlockEdit', 'costered-blocks/core-button--spacing-controls-blockedit', withSpacingControls);
