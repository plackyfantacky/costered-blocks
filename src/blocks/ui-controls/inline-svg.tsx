import { PanelBody } from '@wordpress/components';
import type { BlockUIComponent } from '@types';

export const INLINE_SVG_BLOCK_NAME = 'costered-blocks/inline-svg';

export const InlineSVGBlockUI: BlockUIComponent = ({ clientId }) => {
    return (
        <PanelBody title="testing" initialOpen={true}>
            <p>InlineSVG beans - {clientId}</p>
        </PanelBody>
    )
}