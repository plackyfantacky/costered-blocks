import { describe, it, expect } from '@jest/globals';
import { ensureShape } from "@utils/attributeUtils";

/**
 * Preface:
 * A "bucket" in this app is an object from a corresponding breakpoint structured to have a "styles" property. 
 * Currently, these breakpoints are "desktop", "tablet", and "mobile", and contains no other properties.
 */

describe('ensureShape', () => {
    it('returns empty breakpoint "buckets" when called with no costered attribute', () => {
        const result = ensureShape();

        expect(result.desktop).toBeDefined();
        expect(result.tablet).toBeDefined();
        expect(result.mobile).toBeDefined();

        expect(result.desktop.styles).toEqual({});
        expect(result.tablet.styles).toEqual({});
        expect(result.mobile.styles).toEqual({});
    });

    it('returns empty breakpoint "buckets" when costered is not an object', () => {
        const result = ensureShape('not-an-object' as any);

        expect(result.desktop.styles).toEqual({});
        expect(result.tablet.styles).toEqual({});
        expect(result.mobile.styles).toEqual({});
    });

    it('clones existing styles objects per breakpoint', () => {
        const costered = {
            desktop: {
                styles: {
                    width: '100rem',
                    marginTop: '2rem'
                }
            },
            tablet: {
                styles: {
                    width: '80rem'
                }
            },
            mobile: {
                styles: {
                    marginTop: '1rem'
                }
            }
        } as const;

        const result = ensureShape(costered);

        // same values
        expect(result.desktop.styles).toEqual(costered.desktop.styles);
        expect(result.tablet.styles).toEqual(costered.tablet.styles);
        expect(result.mobile.styles).toEqual(costered.mobile.styles);

        // but different references
        expect(result.desktop.styles).not.toBe(costered.desktop.styles);
        expect(result.tablet.styles).not.toBe(costered.tablet.styles);
        expect(result.mobile.styles).not.toBe(costered.mobile.styles);
    });

    it('resets invalid or missing styles objects to empty objects', () => {
        const costered = {
            desktop: {
                styles: 'not-an-object'
            },
            tablet: {
                styles: ['invalid', 'styles']
            },
            mobile: {
                
            }
        } as any;

        const result = ensureShape(costered);

        // all styles should be reset to empty objects
        expect(result.desktop.styles).toEqual({});
        expect(result.tablet.styles).toEqual({});
        expect(result.mobile.styles).toEqual({});

        // buckets themselves should still exist
        expect(result.desktop).toBeDefined();
        expect(result.tablet).toBeDefined();
        expect(result.mobile).toBeDefined();
    });
});