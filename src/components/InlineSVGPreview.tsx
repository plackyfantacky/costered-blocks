import { memo, RawHTML } from '@wordpress/element';

type Props = {
    svgMarkup?: string;
    previewUrl?: string;
    className?: string;
};

function InlineSVGPreviewBase({
    svgMarkup = '',
    previewUrl = '',
    className = '',
}: Props) {
    const hasInline = Boolean(svgMarkup && svgMarkup.trim().length > 0);
    const classNames = ['costered-blocks--inline-svg--preview', className].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            {hasInline && (
                <RawHTML>{svgMarkup!}</RawHTML>
            )}
            {!hasInline && previewUrl && (
                <img src={previewUrl} alt="SVG Preview" />
            )}
            {!hasInline && !previewUrl && (
                <div className="costered-blocks--inline-svg--preview-empty">
                    <RawHTML>
                        {`
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                <line x1="3" y1="3" x2="21" y2="21"></line>
                            </svg>
                        `}
                    </RawHTML>
                    <span>No SVG Preview Available</span>
                </div>
            )}
        </div>
    );
}

export default memo(InlineSVGPreviewBase);