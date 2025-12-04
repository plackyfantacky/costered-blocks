import { renderHook, act, waitFor } from '@testing-library/react';
import { fetchSanitisedSVG } from '@utils/inlineSVGutils';
import { useInlineSVG } from '@hooks/useInlineSVG';

type InlineSVGAttributes = {
    mediaId: number;
    mediaUrl: string;
    svgMarkup: string;
    svgWidth: string;
    svgHeight: string;
    linkURL: string;
    linkClasses: string;
    svgClasses: string;
};

const defaultInlineSVGAttrs: InlineSVGAttributes = {
    mediaId: 0,
    mediaUrl: '',
    svgMarkup: '',
    svgWidth: '',
    svgHeight: '',
    linkURL: '',
    linkClasses: '',
    svgClasses: ''
};

jest.mock('@utils/inlineSVGutils', () => {
    const actual = jest.requireActual('@utils/inlineSVGutils');
    return {
        ...actual,
        fetchSanitisedSVG: jest.fn(), // we will control this per test
    };
});

const mockFetchSanitisedSVG = fetchSanitisedSVG as jest.MockedFunction<typeof fetchSanitisedSVG>;

beforeEach(() => {
    mockFetchSanitisedSVG.mockReset();
    mockFetchSanitisedSVG.mockResolvedValue('<svg>ok</svg>');
});

function createBlockAttrs() {
    let blockAttrs: Record<string, unknown> = {};
    
    const setAttributes = (patch: Record<string, unknown>) => {
        blockAttrs = { ...blockAttrs, ...patch };
    };

    const getAttrs = () => blockAttrs;

    return { setAttributes, getAttrs };
}

function renderUseInlineSVG(overrides: Partial<InlineSVGAttributes> = {}) {
    const { setAttributes, getAttrs } = createBlockAttrs();

    const initialAttrs: InlineSVGAttributes = {
        ...defaultInlineSVGAttrs,
        ...overrides,
    };

    const renderResult = renderHook(() =>
        useInlineSVG(initialAttrs, setAttributes)
    );

    return {
        ...renderResult,
        getAttrs
    };
}

describe('useInlineSVG', () => {
    it('reads a mediaID (non-zero) and mediaUrl (non-empty) and saves them to block data attributes', async () => {
        // Arrange
        const { result, getAttrs } = renderUseInlineSVG();
        
        // Act trigger the async path
        const mockMedia = {
            id: 123,
            url: 'https://example.com/image.svg',
            mime: 'image/svg+xml',
        };
        
        act(() => {
            result.current.onSelectMedia(mockMedia);
        });

        // Wait: let async work complete
        await waitFor(() => {
            const blockAttrs = getAttrs();
            expect(blockAttrs.mediaId).toBe(123);
            expect(blockAttrs.mediaUrl).toBe('https://example.com/image.svg');
        });
    });

    it('sets isLoading state correctly when loading SVG markup', async () => {
        // Arrange
        const { result } = renderUseInlineSVG();

        const mockMedia = {
            id: 123,
            url: 'https://example.com/image.svg',
            mime: 'image/svg+xml',
        };

        // Act trigger the async path that will eventually call setLoading(false)
        act(() => {
            result.current.onSelectMedia(mockMedia);
        });

        // Wait: let async work complete and state update
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('handles SVG fetch errors: invalid ID', async () => {
        const { result, getAttrs } = renderUseInlineSVG();

        const mockMedia = {
            id: 999999, // Assume this ID will cause fetch error
            url: 'https://example.com/invalid-image.svg',
            mime: 'image/svg+xml',
        };

        mockFetchSanitisedSVG.mockRejectedValueOnce(new Error('not found'));

        act(() => {
            result.current.onSelectMedia(mockMedia);
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const blockAttrs = getAttrs();
        expect(blockAttrs.svgMarkup).toBe('');
    });

    it('handles SVG fetch errors: invalid media type', () => {
        const { result, getAttrs } = renderUseInlineSVG();

        const mockMedia = {
            id: 456,
            url: 'https://example.com/image.png',
            mime: 'image/png',
        };

        act(() => {
            result.current.onSelectMedia(mockMedia);
        });
        
        // Assert: blockAttrs should not have been updated with invalid media
        const blockAttrs = getAttrs();
        expect(blockAttrs.svgMarkup).toBeUndefined();
        expect(blockAttrs.mediaId).toBeUndefined();
        expect(blockAttrs.mediaUrl).toBeUndefined();
    });

    it('handles SVG fetch errors: SVG file content is empty', async () => {
        const { result, getAttrs } = renderUseInlineSVG();

        const mockMedia = {
            id: 789,
            url: 'https://example.com/empty-image.svg',
            mime: 'image/svg+xml',
        };

        mockFetchSanitisedSVG.mockRejectedValueOnce(new Error('empty svg'));

        act(() => {
            result.current.onSelectMedia(mockMedia);
        });
        
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            // Assert: blockAttrs should not have been updated with empty SVG
        });
        
        const blockAttrs = getAttrs();
        expect(blockAttrs.svgMarkup).toBe('');
    });

    it('handles mediaId being zero and clears attributes', () => {
        // Arrange: we have existing mediaId and mediaUrl set
        const { result, getAttrs } = renderUseInlineSVG({
            mediaId: 123,
            mediaUrl: 'https://example.com/image.svg',
            svgMarkup: '<svg>existing</svg>',
        });

        act(() => {
            result.current.onClearMedia();
        });
        
        // Assert: blockAttrs should have been cleared    
        const blockAttrs = getAttrs();
        expect(blockAttrs.mediaId).toBe(0);
        expect(blockAttrs.mediaUrl).toBe('');
        expect(blockAttrs.svgMarkup).toBe('');
    });

    it('reformats SVG markup self-closing tags, cleans up whitespace and doctypes', () => {
        const { normaliseSVGForHTML } = require('@utils/inlineSVGutils');

        const dirtySVG = `<?xml version="1.0"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
            "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg width="100" height="100">

                <rect width="100" height="100" style="fill:rgb(0,0,255);"></rect>

            </svg>`;

        const cleanSVG = normaliseSVGForHTML(dirtySVG);

        expect(cleanSVG).toBe('<svg width="100" height="100"><rect width="100" height="100" style="fill:rgb(0,0,255);"></rect></svg>');

    });
});