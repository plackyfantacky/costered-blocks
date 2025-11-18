import { memo, useCallback } from '@wordpress/element';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, DropZone } from '@wordpress/components';

type Props = {
    onSelect: (media: any) => void;
    accept?: string[];
    value?: number | undefined;
    label?: string;
    className?: string;
    disabled?: boolean;
    onFilesDrop?: (files: File[]) => void;
};

function CompactMediaTriggerBase({
    onSelect,
    accept = ['image/svg+xml'],
    value,
    label = 'Select Media',
    className = '',
    disabled = false,
    onFilesDrop
}: Props) {
    const handleDrop = useCallback((files: File[]) => {
        if (onFilesDrop) onFilesDrop(files);
    }, [onFilesDrop]);

    return (
        <div className={['costered-blocks--custom-media-trigger', className].filter(Boolean).join(' ')}>
            {onFilesDrop && <DropZone onFilesDrop={handleDrop} />}
            <MediaUploadCheck>
                <MediaUpload
                    onSelect={onSelect}
                    allowedTypes={accept}
                    value={value}
                    render={({ open }: { open: () => void }) => (
                        <Button
                            variant="tertiary"
                            onClick={open}
                            className="costered-blocks--custom-media-trigger__button"
                            aria-label={label}
                            disabled={disabled}
                            __next40pxDefaultSize
                        >
                            {/* Use your universal icon component if you like */}
                            <span className="costered-blocks--custom-media-trigger__icon" aria-hidden="true">+</span>
                            <span className="costered-blocks--custom-media-trigger__label">{label}</span>
                        </Button>
                    )}
                />
            </MediaUploadCheck>
        </div>
    );
}

export default memo(CompactMediaTriggerBase);