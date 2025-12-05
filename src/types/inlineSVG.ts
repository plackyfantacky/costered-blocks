export type InlineSVGAttrs = {
    mediaId: number;
    mediaUrl: string;
    svgClasses: string;
    linkURL: string;
    linkClasses: string;
    svgMarkup: string;
    svgWidth: string;
    svgHeight: string;
}

export type InlineSVGSetter = (patch: Partial<InlineSVGAttrs>) => void;

export type SVGMediaMinimal = {
    id?: number | string;
    url?: string;
    source_url?: string;
    mime?: string;
    mime_type?: string;
};