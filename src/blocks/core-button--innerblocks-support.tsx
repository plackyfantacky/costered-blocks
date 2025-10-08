import { addFilter } from '@wordpress/hooks';
import { PanelBody, Flex, FlexItem, BaseControl } from '@wordpress/components';
import {
    InnerBlocks, 
    InspectorControls, 
    URLInput,
    useBlockProps, 
    type InnerBlocksTemplate 
} from '@wordpress/block-editor';
import { useEffect, useRef, useState } from '@wordpress/element';
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';


type ButtonAttrs = {
    url?: string;
    buttonGap?: string;
    [key: string]: any;
}

type ButtonEditProps = {
    attributes: ButtonAttrs;
    setAttributes: (next: Partial<ButtonAttrs>) => void;
}

type ButtonSaveProps = {
    attributes: ButtonAttrs;
}

type BlockSettings = BlockConfiguration<ButtonAttrs>; 

type SplitArg = {
    className?: string;
    style?: React.CSSProperties;
} & Record<string, unknown>;

type SplitResult = {
    outerProps: {
        className?: string;
        [key: string]: unknown;
    };
    innerProps: {
        className?: string;
        style?: React.CSSProperties;
        [key: string]: unknown;
    };
};

const BLOCK_TEMPLATE: InnerBlocksTemplate = [
    ['costered-blocks/button-text', { content: 'Button Text' }],
];

addFilter(
    'blocks.registerBlockType',
    'costered-blocks/core-button--innerblocks-support-registerblocktype',
    (settings: BlockSettings, name?: string) => {
        if (name !== 'core/button') return settings;

        return {
            ...settings,
            supports: {
                ...(settings.supports as Record<string, unknown> | undefined),
                innerBlocks: true,
                color: true,
                background: true,
                textColor:true
            },
            attributes: {
                ...(settings.attributes as Record<string, unknown> | undefined),
                url: {
                    type: 'string',
                    default: '#',
                },
                buttonGap: {
                    type: 'string',
                    default: '',
                }
            },
            edit: ({attributes, setAttributes}: ButtonEditProps) => {
                
                const { buttonGap } = attributes;
                const wrapperRef = useRef<HTMLDivElement | null>(null);
                
                useEffect(() => {
                    if (wrapperRef.current) {
                        const layout = wrapperRef.current.querySelector<HTMLDivElement>(
                            '.block-editor-block-list__layout'
                        );
                        if (layout) layout.style.gap = String(buttonGap ?? '');
                    }
                }, [buttonGap]);
                
                const blockProps = useBlockProps({
                    className: 'cb-button--with-innerblocks',
                });

                const { outerProps, innerProps } = splitBlockProps(blockProps);

                return (
                    <div {...outerProps}>
                        <div {...innerProps} ref={wrapperRef}>
                            <InnerBlocks
                                allowedBlocks={[
                                    'core/image',
                                    'core/group',
                                    'core/html',
                                    'core/shortcode',
                                    'outermost/icon-block'
                                ]}
                                template={BLOCK_TEMPLATE}
                                templateLock={false}
                                orientation="horizontal"
                            />
                        </div>
                    </div>
                );
            }
        };
    }
);

addFilter(
    'blocks.getSaveElement',
    'costered-blocks/core-button--innerblocks-support-save',
    (
        element: any,
        blockType: { name?: string },
        attributes: ButtonAttrs
    ): any => {
        if (blockType.name !== 'core/button') return element;

        const rawProps = useBlockProps.save();
        const { outerProps, innerProps } = splitBlockProps(rawProps as SplitArg);

        return (
            <div {...outerProps}>
                <a href={attributes.url || '#'} {...innerProps }>
                    <InnerBlocks.Content />
                </a>
            </div>
        );
    }
);

addFilter(
    'editor.BlockEdit',
    'costered-blocks/core-button--innerblocks-support-sidebar',
    (BlockEdit: React.ComponentType<any>) =>
        (props: any): any => {
            if (props.name !== 'core/button') return <BlockEdit {...props} />;

            const { attributes, setAttributes } = props as {
                attributes: ButtonAttrs;
                setAttributes: (next: Partial<ButtonAttrs>) => void;
            };

            const handleURLChange = (newURL?: string) => {
                setAttributes({ url: newURL ?? '' });
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
                                            value={attributes.url ?? ''}
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
        }
);


/**
 * Register a custom block for button text.
 * This block allows users to add text inside the button.
 */

registerBlockType<{ content?: string }>('costered-blocks/button-text', {
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
    edit: ({
        attributes,
        setAttributes,
        isSelected
    }) => {
        const { content } = attributes;
        const inputRef = useRef<HTMLInputElement | null>(null);
        const measureRef = useRef<HTMLSpanElement | null>(null);
        const [inputWidth, setInputWidth] = useState<string>('auto');

        const updateWidth = () => {
            const width = (measureRef.current?.offsetWidth ?? 0) + 2;
            setInputWidth(`${width}px`);
        };

        useEffect(updateWidth, [content]);

        useEffect(() => {
            if (isSelected) inputRef.current?.focus();
        }, [isSelected]);

        return (
            <div className="cb-button-text-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="cb-button-text-input"
                    value={content ?? ''}
                    onInput={(event) => 
                        setAttributes({ content: (event.target as HTMLInputElement).value })}
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
    save: ({ attributes }: { attributes: { content?: string } }) => {
        return <span className="cb-button-text">{attributes.content}</span>;
    },
});

function splitBlockProps({
    className = '',
    style,
    ...rest
}: SplitArg): SplitResult {
    const classList = className.trim() ? className.trim().split(/\s+/) : [];

    const visualClassNames = new Set<string>();
    const structuralClassNames: string[] = [];

    for (const cls of classList) {
        if (
            /^has-[\w-]+-(color|background-color)$/.test(cls) ||
            /^has-(text|background|link)-color$/.test(cls) ||
            cls.startsWith('is-style-')
        ) {
            visualClassNames.add(cls);
        } else {
            structuralClassNames.push(cls);
        }
    }

    const innerBase = {
        className: ['wp-block-button__link', ...visualClassNames].join(' ')
    } as { className: string; style?: React.CSSProperties }

    return {
        outerProps: {
            ...rest,
            className: structuralClassNames.join(' '),
        },
        innerProps: innerBase
    };
}
