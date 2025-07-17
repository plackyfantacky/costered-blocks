import { addFilter } from '@wordpress/hooks';
import { InnerBlocks, InspectorControls, URLInput, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, Flex, FlexItem, BaseControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';

addFilter('blocks.registerBlockType', 'costered-blocks/core-button--innerblocks-support-registerblocktype', (settings, name) => {
    if (name !== 'core/button') return settings;

    return {
        ...settings,
        edit: (props) => {
            const blockProps = useBlockProps({ className: 'wp-block-button cb-button--with-innerblocks' });

            const { attributes } = props;

            return (
                <div {...blockProps}>
                    <div className="wp-block-button__link">
                        <InnerBlocks
                            allowedBlocks={[
                                'core/image',
                                'core/group',
                                'core/html',
                                'core/shortcode',
                                'outermost/icon-block'
                            ]}
                            orientation="horizontal"
                            templateLock={false}
                        />
                    </div>
                </div>
            );
        },
        supports: {
            ...settings.supports,
            innerBlocks: true
        },
        attributes: {
            ...settings.attributes,
            url: {
                type: 'string',
                default: '#',
            }
        }
    };
});

addFilter('blocks.getSaveElement', 'costered-blocks/core-button--innerblocks-support-save', (element, blockType, attributes) => {
    if (blockType.name !== 'core/button') return element;

    return (
        <div className="wp-block-button">
            <a href={attributes.url} className="wp-block-button__link">
                <InnerBlocks.Content />
            </a>
        </div>
    );
});

addFilter('editor.BlockEdit', 'costered-blocks/core-button--innerblocks-support-sidebar', (BlockEdit) => (props) => {
    if (props.name !== 'core/button') return <BlockEdit {...props} />;

    const { attributes, setAttributes } = props;

    const handleURLChange = (newURL) => {
        setAttributes({ url: newURL });
    };

    return (
        <>
            <BlockEdit {...props} />
            <InspectorControls>
                <PanelBody title="Button Link" initialOpen={true}>
                    <BaseControl label="Button URL">
                        <Flex expanded>
                            <FlexItem isBlock>
                                <URLInput
                                    value={attributes.url}
                                    onChange={handleURLChange}
                                    className="cb-button__url-input"
                                    placeholder="Enter URL"
                                />
                            </FlexItem>
                        </Flex>
                    </BaseControl>
                </PanelBody>
            </InspectorControls>
        </>
    );
});


/**
 * Register a custom block for button text.
 * This block allows users to add text inside the button.
 */
import { registerBlockType } from '@wordpress/blocks';

registerBlockType('costered-blocks/button-text', {
    title: 'Button Text',
    category: 'text',
    icon: 'editor-textcolor',
    parent: ['core/button'],
    attributes: {
        content: {
            type: 'string',
            source: 'text',
            selector: 'span',
        },
    },
    edit: ({ attributes, setAttributes, isSelected }) => {
        const { content } = attributes;
        const inputRef = useRef(null);
        const measureRef = useRef(null);
        const [inputWidth, setInputWidth] = useState('auto');

        const updateWidth = () => {
            if (measureRef.current) {
                const width = measureRef.current.offsetWidth + 2; // add 2px buffer
                setInputWidth(`${width}px`);
            }
        };

        useEffect(() => {
            updateWidth();
        }, [content]);

        useEffect(() => {
            if (isSelected && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isSelected]);

        return (
            <div className="cb-button-text-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="cb-button-text-input"
                    value={content || ''}
                    onInput={(e) => setAttributes({ content: e.target.value })}
                    size={4}
                    placeholder="Button Text"
                    style={{
                        textAlign: 'left',
                        display: 'inline',
                        font: 'inherit',
                        color: 'inherit',
                        padding: '0',
                        margin: '0',
                        background: 'transparent',
                        border: ' 0 none',
                        minHeight: '0',
                        width: inputWidth,
                        outline: isSelected ? '1px dotted #999' : 'none',
                        boxShadow: 'none'
                    }}
                />
                <span
                    ref={measureRef}
                    className="cb-button-text-measure"
                    style={{
                        position: 'absolute',
                        visibility: 'hidden',
                        whiteSpace: 'pre',
                        font: 'inherit',
                        padding: 0,
                        margin: 0,
                    }}>
                    {attributes.content || 'Add text'}
                </span>
            </div>
            
        );
    },
    save: ({ attributes }) => {
        return <span className="cb-button-text">{attributes.content}</span>;
    },
});