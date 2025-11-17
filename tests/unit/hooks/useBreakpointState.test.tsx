import { describe, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useBreakpointState } from '@hooks/useBreakpointState';

// Mock useAttrGetter and useAttrSetter from @hooks
jest.mock('@hooks', () => {
    return {
        useAttrGetter: jest.fn(),
        useAttrSetter: jest.fn()
    };
});

import { useAttrGetter, useAttrSetter } from '@hooks';

describe('useBreakpointState', () => {
    it('reads raw value from useAttrGetter and exposes draft keyed by breakpoint', () => {
        const getRawMock = jest.fn().mockReturnValue('100px');
        const bp = 'desktop';

        (useAttrGetter as unknown as jest.Mock).mockReturnValue({
            getRaw: getRawMock,
            bp
        });

        const setMock = jest.fn();
        (useAttrSetter as unknown as jest.Mock).mockReturnValue({
            set: setMock
        });

        const { result } = renderHook(() =>
            useBreakpointState<string>('client-1', 'width')
        );

        expect(getRawMock).toHaveBeenCalledWith('width');
        expect(result.current.raw).toBe('100px');
        expect(result.current.draft).toBe('100px');
        expect(result.current.key).toBe('client-1:width:desktop');
    });

    it('commits on change when commitOn is "change"', () => {
        const getRawMock = jest.fn().mockReturnValue('10px');

        (useAttrGetter as unknown as jest.Mock).mockReturnValue({
            getRaw: getRawMock,
            bp: 'desktop'
        });

        const setMock = jest.fn();
        (useAttrSetter as unknown as jest.Mock).mockReturnValue({
            set: setMock
        });

        const { result } = renderHook(() =>
            useBreakpointState<string>('client-1', 'width', { commitOn: 'change' })
        );

        // Simulate typing a new value
        act(() => {
            result.current.bind.onChange('20px');
        });

        expect(result.current.draft).toBe('20px');

        // set should have been called immediately
        expect(setMock).toHaveBeenCalledTimes(1);
        expect(setMock).toHaveBeenCalledWith('width', '20px');
    });

    it('commits on blur when commitOn is "blur"', () => {
        const getRawMock = jest.fn().mockReturnValue('10px');

        (useAttrGetter as unknown as jest.Mock).mockReturnValue({
            getRaw: getRawMock,
            bp: 'desktop'
        });

        const setMock = jest.fn();
        (useAttrSetter as unknown as jest.Mock).mockReturnValue({
            set: setMock
        });

        const { result } = renderHook(() =>
            useBreakpointState<string>('client-1', 'width', { commitOn: 'blur' })
        );

        act(() => {
            result.current.bind.onFocus();
            result.current.bind.onChange('30px');
        });

        // no commit yet
        expect(setMock).not.toHaveBeenCalled();

        act(() => {
            // onBlur should commit the current draft
            result.current.bind.onBlur?.();
        });

        expect(setMock).toHaveBeenCalledTimes(1);
        expect(setMock).toHaveBeenCalledWith('width', '30px');
    });

    it('does not overwrite draft while editing when raw/bp change', () => {
        // Start with "10px"
        const getRawMock = jest.fn().mockReturnValue('10px');
        const useAttrGetterMock = useAttrGetter as unknown as jest.Mock;

        useAttrGetterMock.mockReturnValue({
            getRaw: getRawMock,
            bp: 'desktop'
        });

        const setMock = jest.fn();
        (useAttrSetter as unknown as jest.Mock).mockReturnValue({ set: setMock });

        const { result, rerender } = renderHook(() =>
            useBreakpointState<string>('client-1', 'width', { commitOn: 'blur' })
        );

        // User starts editing and changes draft
        act(() => {
            result.current.bind.onFocus();
            result.current.bind.onChange('42px');
        });

        expect(result.current.draft).toBe('42px');

        // Now imagine breakpoint/raw changed underneath (e.g. cascade, external edit)
        useAttrGetterMock.mockReturnValue({
            getRaw: jest.fn().mockReturnValue('999px'),
            bp: 'tablet'
        });

        rerender();

        // Because isEditing.current is true, draft should remain the user's value
        expect(result.current.draft).toBe('42px');
        expect(result.current.key).toBe('client-1:width:tablet');
    });

    it('applies parse and serialise functions', () => {
        const getRawMock = jest.fn().mockReturnValue('100');

        (useAttrGetter as unknown as jest.Mock).mockReturnValue({
            getRaw: getRawMock,
            bp: 'desktop'
        });

        const setMock = jest.fn();
        (useAttrSetter as unknown as jest.Mock).mockReturnValue({
            set: setMock
        });

        const parse = (raw: unknown) => Number(raw) || 0;
        const serialise = (value: number) => `${value}px`;

        const { result } = renderHook(() =>
            useBreakpointState<number>('client-1', 'width', {
                parse,
                serialise,
                commitOn: 'change'
            })
        );

        // parsed should be numeric
        expect(result.current.draft).toBe(100);

        act(() => {
            result.current.bind.onChange(120);
        });

        // set receives serialised value
        expect(setMock).toHaveBeenCalledWith('width', '120px');
    });


});