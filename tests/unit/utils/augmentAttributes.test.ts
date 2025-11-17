import { describe, it, expect } from '@jest/globals';
import { augmentAttributes } from '@utils/breakpointUtils';

const attrs = {
    align: 'wide',
    width: '50rem',
    costered: {
        desktop: {
            styles: {
                width: '80rem',
                marginTop: '2rem'
            }
        },
        tablet: {
            styles: {
                width: '60rem'
            }
        },
        mobile: {
            styles: {
                // deliberately no width here
                marginTop: '1rem'
            }
        }
    }
} as const;

describe('augmentAttributes', () => {

    it('returns a shallow clone and does not mutate the original attrs', () => {
        const original = { ...attrs };
        const augmented = augmentAttributes(original, 'desktop');

        //not the same reference
        expect(augmented).not.toBe(original);

        //shallow properties are equal
        expect(augmented.align).toBe('wide');
        expect(augmented.width).toBe('50rem');

        //changing the clone should not change the original top level props
        (augmented as any).align = 'full';
        expect(original.align).toBe('wide');
    });

    
    it('does not expost helper properties as enumerable keys', () => {
        const augmented = augmentAttributes(attrs, 'desktop');
        const keys = Object.keys(augmented as any);
        
        expect(keys).not.toContain('$get');
        expect(keys).not.toContain('$getCascade');
        expect(keys).not.toContain('$getMany');
        expect(keys).not.toContain('$bp');
    });


    it('uses cascade by default and follows the correct order per breakpoint', () => {
        const desktop = augmentAttributes(attrs, 'desktop');
        const tablet = augmentAttributes(attrs, 'tablet');
        const mobile = augmentAttributes(attrs, 'mobile');

        //desktop only
        expect(desktop.$get('width')).toBe('80rem');
        expect(desktop.$get('marginTop')).toBe('2rem');
        //no cascade to anything else because order is desktop > tablet > mobile
        expect(desktop.$get('nonexistent')).toBeUndefined();

        //tablet: tablet first then desktop
        expect(tablet.$get('width')).toBe('60rem'); //from tablet
        expect(tablet.$get('marginTop')).toBe('2rem'); //from desktop
        expect(tablet.$get('nonexistent')).toBeUndefined();

        //mobile: mobile first, then tablet, then desktop
        expect(mobile.$get('marginTop')).toBe('1rem'); //from mobile
        //mobile has no width, so goes to tablet then desktop
        expect(mobile.$get('width')).toBe('60rem'); //cascaded from tablet
        expect(mobile.$get('nonexistent')).toBeUndefined();
    });


    it('treats $getCascade as equivalent to $get with cascade:true', () => {
        const mobile = augmentAttributes(attrs, 'mobile');

        expect(mobile.$getCascade('width')).toBe('60rem');
        expect(mobile.$get('width', { cascade: true })).toBe('60rem');

        expect(mobile.$getCascade('marginTop')).toBe('1rem');
        expect(mobile.$get('marginTop', { cascade: true })).toBe('1rem');
    });

    
    it('respects raw:true and reads only from the active breakpoint', () => {
        const mobile = augmentAttributes(attrs, 'mobile');
        const tablet = augmentAttributes(attrs, 'tablet');

        //on mobile, raw width is unset, so raw should should not cascade to tablet/desktop
        expect(mobile.$get('width', { raw: true })).toBeUndefined();

        //on tablet, raw width exists
        expect(tablet.$get('width', { raw: true })).toBe('60rem');

        //raw marginTop of tablet is undefined, even though it exists on desktop
        expect(tablet.$get('marginTop', { raw: true })).toBeUndefined();
    });


    it('treats cascade:false as raw mode by default', () => {
        const mobile = augmentAttributes(attrs, 'mobile');
        
        //because raw defaults to !cascade, cascade:false behaves the same as raw:true
        expect(mobile.$get('width', { cascade: false })).toBeUndefined();
        expect(mobile.$get('width', { raw: true })).toBeUndefined();

        const tablet = augmentAttributes(attrs, 'tablet');

        expect(tablet.$get('width', { cascade: false })).toBe('60rem');
        expect(tablet.$get('width', { raw: true })).toBe('60rem');
    });
    
    it('$getMany resolves multiple keys with shared options', () => {
        const mobile = augmentAttributes(attrs, 'mobile');

        const resultCascade = mobile.$getMany(['width', 'marginTop']);
        expect(resultCascade).toEqual({
            width: '60rem',
            marginTop: '1rem'
        });

        const resultRaw = mobile.$getMany(['width', 'marginTop'], { raw: true });
        expect(resultRaw).toEqual({
            width: undefined,
            marginTop: '1rem'
        });
    });

    it('exposes the active breakpoint via $bp', () => {
        const desktop = augmentAttributes(attrs, 'desktop');
        const tablet = augmentAttributes(attrs, 'tablet');
        const mobile = augmentAttributes(attrs, 'mobile');

        expect(desktop.$bp).toBe('desktop');
        expect(tablet.$bp).toBe('tablet');
        expect(mobile.$bp).toBe('mobile');
    });
});