import { fetchSanitisedSVG } from '@utils/inlineSVGutils';

let mockApiFetch: jest.Mock;

beforeEach(() => {
    mockApiFetch = jest.fn();
    (window as any).wp = {
        ...(window as any).wp,
        apiFetch: mockApiFetch,
    };
});

describe('fetchSanitisedSVG', () => {

    it('returns SVG when response contains valid svg string', async () => {
        mockApiFetch.mockResolvedValue({ svg: '<svg>ok</svg>' });

        const result = await fetchSanitisedSVG(123);

        expect(mockApiFetch).toHaveBeenCalledWith({
            path: '/costered-blocks/v1/svg/123',
            method: 'GET',
            parse: true,
        });
        expect(result).toBe('<svg>ok</svg>');
    });
    
});