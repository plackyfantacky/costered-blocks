import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

import MarginControls from '../components/MarginControls.jsx';
import PaddingControls from '../components/PaddingControls.jsx';
import GapControls from '../components/GapControls.jsx';
import ContainerSizingControls from '../components/ContainerSizingControls.jsx';

console.log({
    Fragment: typeof Fragment,
    InspectorControls: typeof InspectorControls,
    PanelBody: typeof PanelBody,
});


addFilter('blocks.registerBlockType', 'costered-blocks/core-group--layout-controls-register-block-type', (settings, name) => {
    if (name !== 'core/group') return settings;
    return {
        ...settings,
        attributes: {
            ...settings.attributes,
            paddingTop: { type: 'string', default: '' },
            paddingRight: { type: 'string', default: '' },
            paddingBottom: { type: 'string', default: '' },
            paddingLeft: { type: 'string', default: '' },
            marginTop: { type: 'string', default: '' },
            marginRight: { type: 'string', default: '' },
            marginBottom: { type: 'string', default: '' },
            marginLeft: { type: 'string', default: '' },
            gapHorizontal: { type: 'string', default: '' },
            gapVertical: { type: 'string', default: '' },
            containerType: { type: 'string', default: 'full' },
            containerWidth: { type: 'string', default: '' },
            // Additional attributes for grid layout until WP supports it natively
            gridTemplateColumns: { type: 'string' },
            justifyItems: { type: 'string' },
            alignItems: { type: 'string' },
            gridGapRow: { type: 'string' },
            gridGapColumn: { type: 'string' }
        }
    };
});

domReady(() => {
    
    const withGroupSpacingControls = createHigherOrderComponent((BlockEdit) => {
        
        return (props) => {
            
            if (props.name !== 'core/group') return <BlockEdit {...props} />;
            const { attributes, setAttributes } = props;
            return (
                <Fragment>
                    <BlockEdit {...props} />
                    <InspectorControls>
                        <PanelBody title="Spacing" initialOpen={true}>
                            <ContainerSizingControls attributes={attributes} setAttributes={setAttributes} />
                            <PaddingControls attributes={attributes} setAttributes={setAttributes} />
                            <MarginControls attributes={attributes} setAttributes={setAttributes} />
                            <GapControls attributes={attributes} setAttributes={setAttributes} />
                        </PanelBody>
                    </InspectorControls>
                </Fragment>
            );
        };
    }, 'withGroupSpacingControls');
    
    addFilter('editor.BlockEdit', 'costered-blocks/core-group--spacing-controls-block-edit', withGroupSpacingControls);
    
});

