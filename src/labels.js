import { __ } from '@wordpress/i18n';

export const LABELS = {
    pluginSidebar: {
        noBlockSelected            : __('Please select a block to edit its settings.', 'costered-blocks'),
        title                      : __('Costered Blocks', 'costered-blocks'),
        selectedBlock              : __('Selected block', 'costered-blocks'),
        blockWarningSummary        : __('Style changes may not appear in the editor', 'costered-blocks'),
        blockWarningDetails        : __('There may be some differences between the editor and the frontend. This is due to limitations with the block editor, which does not always allow custom inline styles to be displayed here.', 'costered-blocks'),
    },
    // Main Tabs
    // Display Controls
    displayControls: {
        panelTitle                 : __('Display Controls', 'costered-blocks'),
        displayLabel               : __('Display', 'costered-blocks'),
        unset                      : __('unset / initial', 'costered-blocks'),
        displayBlock               : __('Block', 'costered-blocks'),
        displayInline              : __('Inline', 'costered-blocks'),
        displayFlex                : __('Flex', 'costered-blocks'),
        displayGrid                : __('Grid', 'costered-blocks'),
        displayNone                : __('None', 'costered-blocks'),
        visibilityLabel            : __('Visibility', 'costered-blocks'),
        visibilityUnset            : __('unset / initial', 'costered-blocks'),
        visibilityVisible          : __('Visible', 'costered-blocks'),
        visibilityHidden           : __('Hidden', 'costered-blocks'),
        visibilityCollapse         : __('Collapse', 'costered-blocks'),
    },

    // Dimension Controls
    dimensionControls: {
        panelTitle                 : __('Dimension Controls', 'costered-blocks'),
        dimensionPanel             : __('Dimensions', 'costered-blocks'),
        dimensions: {
            width                  : __('Width', 'costered-blocks'),
            height                 : __('Height', 'costered-blocks'),
        },
        minPanel                   : __('Minimum Dimensions', 'costered-blocks'),
        minDimensions: {
            width                  : __('Min Width', 'costered-blocks'),
            height                 : __('Min Height', 'costered-blocks'),
        },
        maxPanel                   : __('Maximum Dimensions', 'costered-blocks'),
        maxDimensions: {
            width                  : __('Max Width', 'costered-blocks'),
            height                 : __('Max Height', 'costered-blocks'),
        },
    },

    // Spacing Controls
    spacingControls: {
        panelTitle                 : __('Spacing Controls', 'costered-blocks'),
        panelLabel                 : __('Spacing', 'costered-blocks'),
        marginLabel                : __('Margin', 'costered-blocks'),
        paddingLabel               : __('Padding', 'costered-blocks'),
    },

    // Flexbox Controls
    flexBoxControls: {
        panelTitle                 : __('Flexbox Controls', 'costered-blocks'),
        flexWrapLabel              : __('Flex Wrap', 'costered-blocks'),
        flexWrapNone               : __('No Wrap', 'costered-blocks'),
        flexWrapWrap               : __('Wrap', 'costered-blocks'),
        flexWrapReverse            : __('Reverse', 'costered-blocks'),
        alignmentPanel             : __('Alignment', 'costered-blocks'),
        gapPanel                   : __('Gap', 'costered-blocks'),
    },

    // Flex Item Controls
    flexItemControls: {    
        // Panel    
        panelTitle                 : __('Flex Item Controls', 'costered-blocks'),
        flexGrow                   : __('Grow', 'costered-blocks'),
        flexShrink                 : __('Shrink', 'costered-blocks'),
        flexBasis                  : __('Basis', 'costered-blocks'),
        flexBasisPlaceholder       : __('Enter value', 'costered-blocks'),
        order                      : __('Order', 'costered-blocks'),
    },

    // Grid Controls
    gridControls: {
        panelTitle                 : __('Grid Controls', 'costered-blocks'),
        gridTemplatePanel          : __('Grid Template', 'costered-blocks'),
        gridTemplatePanelSimple    : __('Simple', 'costered-blocks'),
        gridTemplatePanelTracks    : __('Tracks', 'costered-blocks'),
        gapPanel                   : __('Gap', 'costered-blocks'),
        gridTemplateAreasPanel     : __('Grid Template Areas', 'costered-blocks'),
        gridTemplateAreasEditLarge : __('Edit in larger view', 'costered-blocks'),
        gridTemplateAreasModal     : __('Edit Grid Template Areas', 'costered-blocks'),
    },

    // Grid Item Controls    
    gridItemsControls: {
        //Simple Panel
        simplePanel                : __('Simple', 'costered-blocks'),
        
        //Tracks Panel
        tracksPanel                : __('Tracks', 'costered-blocks'),

        //Areas Panel
        areasPanel                 : __('Areas', 'costered-blocks'),
        gridAreaLabel              : __('Named area (grid-area)', 'costered-blocks'),
        gridAreaNone               : __('— None —', 'costered-blocks'),
        gridAreaHelp               : __('Setting a named area overrides row/column placement.', 'costered-blocks'),


        // Panel    
        panelTitle                 : __('Grid Item Controls', 'costered-blocks'),
        settingsIsAdvancedOwned    : __('Settings use Advanced features (read-only here). Switch to the Advanced panel to edit.', 'costered-blocks'),
        settingsIsSimpleOwned      : __('Settings use Simple features (read-only here). Switch to the Simple panel to edit.', 'costered-blocks'),
        settingsHasArea            : __('This item uses a named grid area. Line-based placement is disabled.', 'costered-blocks'),
        panelAlignment             : __('Alignment', 'costered-blocks'),
        panelOrder                 : __('Order', 'costered-blocks'),
        // sub-panels
        simple                     : __('Simple', 'costered-blocks'),
        advanced                   : __('Advanced', 'costered-blocks'),
        // Controls
        
        
        columnsLabel               : __('Columns', 'costered-blocks'),
        rowsLabel                  : __('Rows', 'costered-blocks'),
        columnPlacementMode        : __('Placement uses', 'costered-blocks'),
        columnPlacementSpan        : __('Span', 'costered-blocks'),
        columnPlacementEnd         : __('End', 'costered-blocks'),
        columnStartMode            : __('Start uses', 'costered-blocks'),
        columnStartModeNumber      : __('Line number', 'costered-blocks'),
        columnStartModeNamed       : __('Named line', 'costered-blocks'),
        columnStart                : __('Column Start', 'costered-blocks'),
        columnStartHelp            : __('%1$d columns', 'costered-blocks'),
        columnStartNamed           : __('Column Start (named line)', 'costered-blocks'),
        columnStartNamedHelp       : __('Free text allowed; suggestions from parent column template.', 'costered-blocks'),
        columnStartNameMismatch    : __('Parent grid has no named column lines; this item currently uses a named start token.', 'costered-blocks'),
        columnSpan                 : __('Column Span', 'costered-blocks'),
        columnSpanHelp             : __('Max updates with start', 'costered-blocks'),
        columnSpanParentHelp       : __('Max updates with start & parent columns.', 'costered-blocks'),
        columnEndMode              : __('End uses', 'costered-blocks'),
        columnEndModeNumber        : __('Line number', 'costered-blocks'),
        columnEndModeNamed         : __('Named line', 'costered-blocks'),
        columnEndModeAuto          : __('Auto', 'costered-blocks'),
        columnEnd                  : __('Column End', 'costered-blocks'),
        columnEndHelp              : __('Max updates with start', 'costered-blocks'),
        columnEndNumber            : __('Column End (line number)', 'costered-blocks'),
        columnEndNumberHelp        : __('Supports negative indices (e.g. -1 = last line).', 'costered-blocks'),
        columnEndNamed             : __('Column End (named line)', 'costered-blocks'),
        columnEndNamedHelp         : __('Free text allowed; suggestions from parent column template.', 'costered-blocks'),
        columnEndNameMismatch      : __('Parent grid has no named column lines; this item currently uses a named end token.', 'costered-blocks'),
        rowStart                   : __('Row Start', 'costered-blocks'),
        rowStartHelp               : __('%1$d rows', 'costered-blocks'),
        rowSpan                    : __('Row Span', 'costered-blocks'),
        rowSpanHelp                : __('Max updates with start', 'costered-blocks'),
        order                      : __('Order', 'costered-blocks'),
    },

    //RTL Aware Components
    // Flex Direction
    flexDirection: {
        label                      : __('Flex Direction', 'costered-blocks'),
        row                        : __('Row', 'costered-blocks'),
        rowReverse                 : __('Row Reverse', 'costered-blocks'),
        column                     : __('Column', 'costered-blocks'),
        columnReverse              : __('Column Reverse', 'costered-blocks'),
    },

    // Justify Controls    
    justifyControls: {    
        label                      : __('Justify Content', 'costered-blocks'),
        start                      : __('Start', 'costered-blocks'),
        end                        : __('End', 'costered-blocks'),
        center                     : __('Center', 'costered-blocks'),
        spaceAround                : __('Space Around', 'costered-blocks'),
        spaceBetween               : __('Space Between', 'costered-blocks'),
        spaceEvenly                : __('Space Evenly', 'costered-blocks'),
    },

    // Align Controls    
    alignControls: {    
        label                      : __('Align Items', 'costered-blocks'),
        start                      : __('Start', 'costered-blocks'),
        end                        : __('End', 'costered-blocks'),
        center                     : __('Center', 'costered-blocks'),
        stretch                    : __('Stretch', 'costered-blocks'),
        baseline                   : __('Baseline', 'costered-blocks'),
        spaceAround                : __('Space Around', 'costered-blocks'),
        spaceBetween               : __('Space Between', 'costered-blocks'),
        spaceEvenly                : __('Space Evenly', 'costered-blocks'),
    },

    // Other Components
    //CustomSelectControl
    customSelectControl: {
        defaultText                : __('choose...', 'costered-blocks'),
    },

    // DimensionInputGroup
    dimensionInputGroup: {
        label                      : __('Dimensions', 'costered-blocks'),   
        labelPre                   : __('%1$s Dimensions', 'costered-blocks'),
        width                      : __('Width', 'costered-blocks'),
        height                     : __('Height', 'costered-blocks'),
        useCustom                  : __('Use custom values (e.g auto, calc)', 'costered-blocks'),
    },

    // DirectionalInputGroup
    directionalInputGroup: {
        label                      : __('Directions', 'costered-blocks'),
        top                        : __('Top', 'costered-blocks'),
        right                      : __('Right', 'costered-blocks'),
        bottom                     : __('Bottom', 'costered-blocks'),
        left                       : __('Left', 'costered-blocks'),
        useCustom                  : __('Use custom values (e.g auto, calc)', 'costered-blocks'),
    },

    // GapControls
    gapControls: {
        label                      : __('Gaps', 'costered-blocks'),
        rowLabel                   : __('Row Gap', 'costered-blocks'),
        switchToSingle             : __('Switch to Single Gap', 'costered-blocks'),
        switchToDual               : __('Switch to Dual Gap', 'costered-blocks'),
        columnLabel                : __('Column Gap', 'costered-blocks'),
        useCustom                  : __('Use custom values (e.g auto, calc)', 'costered-blocks'),
    },

    // GridAxisAside
    gridAxisAside: {
        label                      : __('Grid Axis', 'costered-blocks'),
        horizontal                 : __('Horizontal', 'costered-blocks'),
        vertical                   : __('Vertical', 'costered-blocks'),
        pipTitleNoValue            : __('No value set', 'costered-blocks'),
        pipTitleValueHere          : __('Value matches this panel', 'costered-blocks'),
        pipTitleValueElsewhere     : __('Value set in %s panel', 'costered-blocks'),
        pipTitleValueRaw           : __('Value set (unrecognised format)', 'costered-blocks'),
        clearRows                  : __('Clear Rows', 'costered-blocks'),
        clearColumns               : __('Clear Columns', 'costered-blocks'),
    },

    // PanelToggle
    panelToggle: {
        label                      : __('Panel', 'costered-blocks'),
    },

    // Token
    token: {
        expand                   : __('Edit token', 'costered-blocks'),
        collapse                 : __('Close editor', 'costered-blocks'),
        remove                   : __('Remove', 'costered-blocks'),
        moveLeft                 : __('Move left', 'costered-blocks'),
        moveRight                : __('Move right', 'costered-blocks'),
    },

    // Token Grid
    tokenGrid: {
        title                      : __('Areas', 'costered-blocks'),
        clear                      : __('Clear', 'costered-blocks'),
        sizeHint                   : __('%1$d columns x %2$d rows', 'costered-blocks'),
        mismatchText               : __('Templates areas (%1$dx%2$d) do not match current tracks (%3$dx%4$d)', 'costered-blocks'),
        resizeToTracks             : __('Resize areas to match tracks', 'costered-blocks'),
        growTracksToAreas          : __('Grow tracks to match areas', 'costered-blocks'),
        shrinkTracks               : __('Shrink tracks to areas', 'costered-blocks'),
        shrinkTracksWarning        : __('Shrinking may remove named lines. Continue?', 'costered-blocks'),
        shrinkTracksNote           : __('Shrinking tracks may remove named lines; please review afterwards.', 'costered-blocks'),
        shrinkTracksConfirm        : __('Shrink tracks', 'costered-blocks'),
        shrinkTracksCancel         : __('Cancel', 'costered-blocks'),
        shrinkTracksHeading        : __('Remove named lines?', 'costered-blocks'),
        shrinkTracksDescription    : __('Shrinking tracks will drop line names (e.g. [sidebar-start]). This can change template references. Continue?', 'costered-blocks'),
        //Token labels
        tokenExpand                : __('Edit cell', 'costered-blocks'),
        tokenCollapse              : __('Close editor', 'costered-blocks'),
        tokenRemove                : __('Clear cell', 'costered-blocks'),
        tokenMoveLeft              : __('Previous cell', 'costered-blocks'),
        tokenMoveRight             : __('Next cell', 'costered-blocks'),
        //Column/row gutter buttons
        addColumn                  : __('Add column', 'costered-blocks'),
        removeColumn               : __('Remove column', 'costered-blocks'),
        addRow                     : __('Add row', 'costered-blocks'),
        removeRow                  : __('Remove row', 'costered-blocks'),
    },

    // Token Editor
    tokenEditor: {
        add                        : __('Add', 'costered-blocks'),
        addPlaceholder             : __('Add token', 'costered-blocks'),
        addLineNames               : __('Add line names', 'costered-blocks'),
        listAriaLabel              : __('List of tokens', 'costered-blocks'),
        moveLeft                   : __('Move left', 'costered-blocks'),
        moveRight                  : __('Move right', 'costered-blocks'),
        remove                     : __('Remove', 'costered-blocks'),
        expand                     : __('Edit token', 'costered-blocks'),
        collapse                   : __('Close editor', 'costered-blocks'),
    },
}
