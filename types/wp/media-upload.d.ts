// types/wp/media-upload.d.ts
declare module '@wordpress/media-upload' {
    export interface MediaUploadProps {
        onSelect: (media: any) => void;
        value?: number | number[] | null;
        allowedTypes?: string[] | string;
        render: (args: { open: () => void }) => any;
        multiple?: boolean;
        gallery?: boolean;
        addToGallery?: boolean;
        modalClass?: string;
        title?: string;
    }
    export function MediaUpload(props: MediaUploadProps): any;
    export default MediaUpload;
}
