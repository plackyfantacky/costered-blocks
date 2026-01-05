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

type BlockSettings = BlockConfiguration<ButtonAttrs>; 

type SplitArg = {
    className?: string;
    style?: React.CSSProperties;
} & Record<string, unknown>;

type SplitResult = {
    outerClassNames: {
        className?: string;
        [key: string]: unknown;
    };
    innerClassNames: {
        className?: string;
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

        const prevSupports = (settings.supports as Record<string, any>) ?? {};
        const prevSpacing = (prevSupports.spacing as Record<string, any>) ?? {};

        return {
            ...settings,
            supports: {
                ...prevSupports,
                innerBlocks: true,
                color: true,
                background: true,
                textColor:true,
                spacing: {
                    ...prevSpacing,
                    padding: false,
                    margin: true,

                },
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
                        const layout = wrapperRef.current.querySelector<HTMLDivElement>('.block-editor-block-list__layout');
                        if (layout) layout.style.gap = String(buttonGap ?? '');
                    }
                }, [buttonGap]);
                
                const raw = useBlockProps({ className: 'costered-blocks--button--innerblocks',});

                const { outerClassName, innerClassName } = splitClassNames(raw.className);
                const { outerStyle, innerStyle } = splitStyles(raw.style);

                const { className: _omitClass, style: _omitStyle, ...outerRest } = raw;

                return (
                    <div {...outerRest} className={outerClassName} style={outerStyle}>
                        <div 
                            className={innerClassName}
                            style={innerStyle}
                            role="button"
                            tabIndex={0}
                            ref={wrapperRef}
                        >
                            <InnerBlocks
                                allowedBlocks={[
                                    'core/image',
                                    'core/group',
                                    'core/html',
                                    'core/shortcode',
                                    'outermost/icon-block',
                                    'costered-blocks/inline-svg'
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
    (element: any, blockType: { name?: string }, attributes: ButtonAttrs): any => {
        if (blockType.name !== 'core/button') return element;

        const raw = useBlockProps.save();
        const { outerClassName, innerClassName } = splitClassNames(String(raw.className || ''));
        const { outerStyle, innerStyle } = splitStyles(raw.style);

        return (
            <div className={outerClassName} style={outerStyle}>
                <a href={attributes.url || '#'} className={innerClassName} style={innerStyle}>
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
    apiVersion: 3,
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

function splitClassNames(className: string = '') {
    const classes = className.trim() ? className.trim().split(/\s+/) : [];

    const outerClasses: string[] = [];
    const innerClasses: string[] = ['wp-block-button__link'];

    for (const cls of classes) {
        // editor state classes that must remain on the wrapper
        if (
            /^wp-block(?:-|$)/.test(cls) ||
            cls.startsWith('block-editor') ||
            cls.startsWith('align') ||
            cls.startsWith('is-layout') ||
            cls === 'is-selected' ||
            cls === 'has-child-selected' ||
            cls === 'is-hovered' ||
            cls === 'is-reusable' ||
            cls === 'is-dragging'
        ) {
            outerClasses.push(cls);
            continue;
        }

        /* --- inner classes (presentation only) --- */

        if (cls.startsWith('is-style-')) { innerClasses.push(cls); continue; }
        if (
            cls.startsWith('is-style-') ||
            /^has-[\w-]+-(color|background-color)$/.test(cls) ||
            cls === 'has-text-color' ||
            cls === 'has-background' ||
            cls === 'has-link-color' ||
            cls.startsWith('has-border') ||
            cls.startsWith('has-radius') ||
            cls.startsWith('has-shadow') ||
            cls.startsWith('costered-blocks--')
        ) { innerClasses.push(cls); continue; }

        innerClasses.push(cls);
    }

    if (!outerClasses.some((cls) => cls.startsWith('wp-block-button'))) {
        outerClasses.unshift('wp-block-button');
    }

    return {
        outerClassName: outerClasses.join(' '),
        innerClassName: innerClasses.join(' ')
    };
}

function splitStyles(style?: React.CSSProperties) {
    if (!style) return { outerStyle: undefined as React.CSSProperties | undefined, innerStyle: undefined as React.CSSProperties | undefined };

    const outerStyle: Record<string, unknown> = {};
    const innerStyle: Record<string, unknown> = {};

    const moveToInner = new Set([
        'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
        'gap','columnGap','rowGap',
        'display',
        'flex','flexGrow','flexShrink','flexBasis',
        'justifyContent','justifyItems','justifySelf',
        'alignContent','alignItems','alignSelf',
        'placeContent','placeItems','placeSelf',
        'grid','gridTemplate','gridTemplateAreas',
        'gridTemplateColumns','gridTemplateRows',
        'gridAutoFlow','gridAutoColumns','gridAutoRows',
        'gridColumn','gridColumnStart','gridColumnEnd',
        'gridRow','gridRowStart','gridRowEnd',
        'position','top','right','bottom','left','zIndex','inset',
        'background','backgroundColor','backgroundImage','backgroundSize','backgroundRepeat',
        'color','border','borderColor','borderWidth','borderStyle','borderRadius',
        'boxShadow','outline',
        'width','height','minWidth','minHeight','maxWidth','maxHeight',
        'transform','transformOrigin','transition','transitionProperty','transitionDuration','transitionTimingFunction','transitionDelay',
        'font','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','textDecoration',
    ]);

    for (const [key, value] of Object.entries(style)) {
        // CSS Custom Properties: send relevant vars to inner
        if (key.startsWith('--wp--') || key.startsWith('--costered-')) {
            innerStyle[key] = value;
            continue;
        }

        if (key.startsWith('margin')) {
            outerStyle[key] = value; // flow placement
            continue;
        }
        if (moveToInner.has(key)) {
            innerStyle[key] = value;
            continue;
        }
        
        innerStyle[key] = value;
    }

    return {
        outerStyle: Object.keys(outerStyle).length ? (outerStyle as React.CSSProperties) : undefined,
        innerStyle: Object.keys(innerStyle).length ? (innerStyle as React.CSSProperties) : undefined,
    };
}
