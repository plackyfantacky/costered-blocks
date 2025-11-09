import { Panel, PanelBody, Notice } from '@wordpress/components';
import { LABELS } from '@labels';
import type { ReactNode } from '@wordpress/element';

type Props = {
    message?: ReactNode,
    status?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
}

export default function NoBlockSelected({
    message = LABELS?.pluginSidebar?.noBlockSelected ?? 'No selected block',
    status = 'info',
    className = ''
}: Props) {
    return (
        <Panel className={['costered-blocks--no-block-selected', className].filter(Boolean).join(' ')}>
            <PanelBody> 
                <Notice status={status} isDismissible={false}>
                    {message}
                </Notice>
            </PanelBody>
        </Panel>
    );
}