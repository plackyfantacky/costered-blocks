import { renderHook, act } from '@testing-library/react';
import { useSVGEditor } from '@hooks/useSVGEditor';

/**
 * Tests to write/scenarios
 *
 * ## loading the markup into the editor
 * - attrs.svgMarkup contains the current markup value. (if a file was uploaded, its contents are also saved here).
 * - if attrs.svgMarkup is anything other than an empty string, we should copy that into originalMarkup on load
 * - unsaved state should be false on load
 * 
 * - jest: it should initialise with the svgMarkup value
 * - jest: it should initialise with the hasUpload value (if true, the "load from file" button is enabled)
 * - jest: it should set originalMarkup to the svgMarkup value on initialisation
 * - jest: it should set isModified to false on initialisation
 * 
 * ## during normal markup editing
 * - when the user edits the SVG, attrs.svgMarkup (local state) is changed
 * - at certain events, we should compare attrs.svgMarkup to originalMarkup to see if there are unsaved changes
 * - if there are unsaved changes, we should update the unsaved state to true
 * 
 * - jest: it should compare svgMarkup to originalMarkup and set isModified to true when they differ
 * 
 * ## on save
 * - WP block editor handles save state and persisting changes to attrs.svgMarkup
 * - when the block is saved, we should update originalMarkup to match attrs.svgMarkup
 * - unsaved state should be set to false
 * 
 * - jest: it should set originalMarkup to svgMarkup and isModified to false when the user "saves" the page/post
 * 
 * ## manually loading from file
 * - (on init) the ui should check if hasUpload is true, and if so, enable the "load from file" button
 * - if the user clicks "load from file", we should compare the file contents to attrs.svgMarkup
 *   - if they are different, and if unsaved changes exist, we should prompt the user to confirm overwriting unsaved changes
 *     - if the user confirms, we load the file contents into attrs.svgMarkup, update originalMarkup, and set unsaved state to false
 *     - if the user cancels, we do nothing
 *   - if there are no unsaved changes, we load the file contents into attrs.svgMarkup, update originalMarkup, and set unsaved state to false
 * 
 * - jest: it should load the file contents into svgMarkup and set isModified to false when the user loads from file and there are no unsaved changes
 * - jest: it should prompt the user to confirm overwriting unsaved changes when loading from file if there are unsaved changes
 * - jest: it should load the file contents into svgMarkup and set isModified to false when the user confirms overwriting unsaved changes
 * - jest: it should not change svgMarkup when the user cancels loading from file due to unsaved changes
 * 
 * ## restoring original markup
 * - if the user clicks "restore original", we should check if there are unsaved changes
 *   - if there are unsaved changes, we should prompt the user to confirm overwriting unsaved changes
 *     - if the user confirms, we restore originalMarkup into attrs.svgMarkup, and set unsaved state to false
 *     - if the user cancels, we do nothing
 *   - if there are no unsaved changes, we restore originalMarkup into attrs.svgMarkup, and set unsaved state to false
 * 
 * - jest: it should restore originalMarkup into svgMarkup and set isModified to false when there are no unsaved changes
 * - jest: it should prompt the user to confirm overwriting unsaved changes when restoring original if there are unsaved changes
 * - jest: it should restore originalMarkup into svgMarkup and set isModified to false when the user confirms overwriting unsaved changes
 * - jest: it should not change svgMarkup when the user cancels restoring original due to unsaved changes
 * 
 * ## clearing the editor
 * - if the user clicks "clear editor", we should check if there are unsaved changes
 *   - if there are unsaved changes, we should prompt the user to confirm overwriting unsaved changes
 *     - if the user confirms, we clear attrs.svgMarkup, set originalMarkup to an empty string, and set unsaved state to false
 *     - if the user cancels, we do nothing
 *   - if there are no unsaved changes, we clear attrs.svgMarkup, set originalMarkup to an empty string, and set unsaved state to false
 * 
 * - jest: it should clear svgMarkup and set isModified to false when there are no unsaved changes
 * - jest: it should prompt the user to confirm overwriting unsaved changes when clearing the editor if there are unsaved changes
 * - jest: it should clear svgMarkup and set isModified to false when the user confirms overwriting unsaved changes
 * - jest: it should not change svgMarkup when the user cancels clearing the editor due to unsaved changes
 * 
 * Things we don't need to test here:
 * - the actual file upload process (handled elsewhere)
 * - the actual modal UI and its open/closed state (currently doesn't affect the hook logic, but may change in future)
 * - the CodeMirror editor itself (we just care about the state management here)
 */ 

describe('useSVGEditor: loading the markup into the editor', () => {

    it('should initialise with the svgMarkup value', () => {
        const { result } = renderHook(() => useSVGEditor({
            markup: '<svg></svg>',
            hasUpload: false,
            onChange: () => {},
        }));

        expect(result.current.markup).toBe('<svg></svg>');
    });

    it('should initialise with the hasUpload value', () => {
        const { result } = renderHook(() => useSVGEditor({
            markup: '',
            hasUpload: true,
            onChange: () => {},
        }));

        expect(result.current.hasUpload).toBe(true);
    });

    it('should set originalMarkup to the svgMarkup value on initialisation', () => {
        const { result } = renderHook(() => useSVGEditor({
            markup: '<svg></svg>',
            hasUpload: false,
            onChange: () => {},
        }));

        expect(result.current.originalMarkup).toBe('<svg></svg>');
    });

    it('should set isModified to false on initialisation', () => {
        const { result } = renderHook(() => useSVGEditor({
            markup: '<svg></svg>',
            hasUpload: false,
            onChange: () => {},
        }));

        expect(result.current.isModified).toBe(false);
    });

});

describe('useSVGEditor: during normal markup editing', () => {

    it('should compare svgMarkup to originalMarkup and set isModified to true when they differ', () => {
        const { result } = renderHook(() => useSVGEditor({
            markup: '<svg></svg>',
            hasUpload: false,
            onChange: () => {},
        }));

        act(() => {
            result.current.setMarkup('<svg><circle /></svg>');
        });

        expect(result.current.isModified).toBe(true);
    });
    
});