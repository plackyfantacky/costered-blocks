import { describe, it, expect } from '@jest/globals';
import { mapDeviceToBp } from '@utils/breakpointUtils';

describe('mapDeviceToBp', () => {
    it('returns desktop by default', () => {
        expect(mapDeviceToBp(undefined)).toBe('desktop');
    });
});
