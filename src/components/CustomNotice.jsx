import { Flex, Notice } from '@wordpress/components';

export default function CustomNotice({ type, icon = null, title, content, className = '' }) {

    const noticeClass = `costered-blocks--custom-notice--type-${type} ${className}`;

    return (
        <Notice status={type} isDismissible={false} className={`costered-blocks--custom-notice ${noticeClass}`}>
            <details key={".0"} className="costered-blocks--custom-notice--details">
                <summary className="costered-blocks--custom-notice--summary">
                    {icon && <span className="costered-blocks--custom-notice--icon">{icon}</span>}    
                    {title}
                </summary>
                <Flex className="costered-blocks--custom-notice--body" direction="column" gap={2}>
                    {content}
                </Flex>
            </details>
        </Notice>
    );
}
