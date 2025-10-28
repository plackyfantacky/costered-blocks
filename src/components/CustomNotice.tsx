import { Flex, Notice } from '@wordpress/components';
import type { ComponentProps, ReactNode } from 'react';

type WPNoticeProps = ComponentProps< typeof Notice >;
type NoticeStatus = 
    WPNoticeProps extends { status: infer Status }
        ? Status
        : 'info' | 'warning' | 'error' | 'success';

type Props = {
    type: NoticeStatus;
    title: ReactNode;
    content: ReactNode;
    icon?: ReactNode | null;
    className?: string;
    dismissible?: boolean;
};  

export default function CustomNotice({
    type,
    icon = null,
    title,
    content,
    className = '',
    dismissible = false,
}: Props) {
    const noticeClass = `costered-blocks--custom-notice costered-blocks--custom-notice--type-${String(type)} ${className}`.trim();

    return (
        <Notice
            status={type}
            isDismissible={dismissible} 
            className={`costered-blocks--custom-notice ${noticeClass}`}
        >
            <details className="costered-blocks--custom-notice--details">
                <summary className="costered-blocks--custom-notice--summary">
                    {icon ? <span className="costered-blocks--custom-notice--icon">{icon}</span> : null}
                    {title}
                </summary>
                {content ? (
                    <Flex className="costered-blocks--custom-notice--body" direction="column" gap={2}>
                        {content}
                    </Flex>
                ) : null}
            </details>
        </Notice>
    );
}
