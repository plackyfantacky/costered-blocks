import { __ } from '@wordpress/i18n';

export const LABELS = {
    pluginSidebar: {
        noBlockSelected: __("Please select a block to edit its settings.", 'costered-blocks'),
        title: __("Costered Blocks", 'costered-blocks'),
        selectedBlock: __("Selected block", 'costered-blocks'),
        blockWarningSummary: __("Style changes may not appear in the editor", 'costered-blocks'),
        blockWarningDetails: __("There may be some differences between the editor and the frontend. This is due to limitations with the block editor, which does not always allow custom inline styles to be displayed here.", 'costered-blocks')
    },

    blocks: {
        blockCategory: __("Costered Blocks", 'costered-blocks'),
        "inlineSVG": {
            panelTitle: __("Inline SVG", 'costered-blocks'),
            linkPanelTitle: __("Link (optional)", 'costered-blocks'),
            actions: {
                selectSVG: __("Select SVG", 'costered-blocks'),
                replaceSVG: __("Replace SVG", 'costered-blocks'),
                clear: __("Clear", 'costered-blocks')
            },
            notice: {
                errorFetchResponseInvalid: __("Invalid response from SVG fetch.", 'costered-blocks'),
                errorFetchResponseMalformedSVG: __("Response does not contain <svg>.", 'costered-blocks'),
                errorFetchResponseUnknownFallback: __("Error fetching SVG.", 'costered-blocks'),
                errorFetchResponseUnknown: __("Inline SVG Load Error: %1$s", 'costered-blocks'),
                errorFetchResponseEmpty: __("Fetched SVG is empty.", 'costered-blocks'),
                errorUIInvalidFileType: __("Please select an SVG file.", 'costered-blocks'),
                warningLinkButNoSVG: __("A link will do nothing until an SVG is selected.", 'costered-blocks'),
                warningSVGpreviewUnavailable: __("SVG preview is unavailable (SSR not loaded).", 'costered-blocks'),
                noticeSVGPending: __("Loading SVG preview...", 'costered-blocks')
            },
            fields: {
                svgClasses: {
                    label: __("SVG classes", 'costered-blocks'),
                    help: __("Optional class list for the <svg> element.", 'costered-blocks')
                },
                linkURL: {
                    label: __("Link URL", 'costered-blocks'),
                    placeholder: __("https://example.com", 'costered-blocks')
                },
                linkClasses: {
                    label: __("Link classes", 'costered-blocks'),
                    help: __("Optional class list for the <a> wrapper.", 'costered-blocks')
                },
                customMedia: {
                    label: __("SVG File", 'costered-blocks'),
                    help: __("Select or upload an SVG file.", 'costered-blocks')
                },
                svgWidth: {
                    label: __("SVG Width", 'costered-blocks'),
                    help: __("Set a custom width for the SVG (e.g. 100px, 10rem, 50%).", 'costered-blocks')
                },
                svgHeight: {
                    label: __("SVG Height", 'costered-blocks'),
                    help: __("Set a custom height for the SVG (e.g. 100px, 10rem, 50%).", 'costered-blocks')
                }
            }
        }
    },

    blockControls: {
        tabTitle: __("Block Controls", 'costered-blocks')
    },

    displayControls: {
        panelTitle: __("Display Controls", 'costered-blocks'),
        displayLabel: __("Display", 'costered-blocks'),
        display: {
            unset: __("unset / initial", 'costered-blocks'),
            block: __("Block", 'costered-blocks'),
            inline: __("Inline", 'costered-blocks'),
            flex: __("Flex", 'costered-blocks'),
            grid: __("Grid", 'costered-blocks'),
            none: __("None", 'costered-blocks')
        },
        visibilityLabel: __("Visibility", 'costered-blocks'),
        visibility: {
            unset: __("unset / initial", 'costered-blocks'),
            visible: __("Visible", 'costered-blocks'),
            hidden: __("Hidden", 'costered-blocks'),
            collapse: __("Collapse", 'costered-blocks')
        }
    },

    dimensionControls: {
        panelTitle: __("Dimension Controls", 'costered-blocks'),
        dimensionPanel: __("Dimensions", 'costered-blocks'),
        dimensions: {
            width: __("Width", 'costered-blocks'),
            height: __("Height", 'costered-blocks')
        },
        minPanel: __("Minimum Dimensions", 'costered-blocks'),
        minDimensions: {
            width: __("Min Width", 'costered-blocks'),
            height: __("Min Height", 'costered-blocks')
        },
        maxPanel: __("Maximum Dimensions", 'costered-blocks'),
        maxDimensions: {
            width: __("Max Width", 'costered-blocks'),
            height: __("Max Height", 'costered-blocks')
        }
    },

    spacingControls: {
        panelTitle: __("Spacing Controls", 'costered-blocks'),
        panelLabel: __("Spacing", 'costered-blocks'),
        marginLabel: __("Margin", 'costered-blocks'),
        paddingLabel: __("Padding", 'costered-blocks')
    },

    flexBoxControls: {
        panelTitle: __("Flexbox Controls", 'costered-blocks'),
        flexWrapLabel: __("Flex Wrap", 'costered-blocks'),
        flexWrapNone: __("No Wrap", 'costered-blocks'),
        flexWrapWrap: __("Wrap", 'costered-blocks'),
        flexWrapReverse: __("Reverse", 'costered-blocks'),
        alignmentPanel: __("Alignment", 'costered-blocks'),
        gapPanel: __("Gap", 'costered-blocks')
    },

    flexItemControls: {
        panelTitle: __("Flex Item Controls", 'costered-blocks'),
        flexGrow: __("Grow", 'costered-blocks'),
        flexShrink: __("Shrink", 'costered-blocks'),
        flexBasis: __("Basis", 'costered-blocks'),
        flexBasisPlaceholder: __("Enter value", 'costered-blocks'),
        order: __("Order", 'costered-blocks')
    },

    gridControls: {
        panelTitle: __("Grid Container Controls", 'costered-blocks'),
        templateMode: __("Template Mode", 'costered-blocks'),
        simplePanel: {
            title: __("Simple", 'costered-blocks'),
            description: __("In Simple mode, you can define the number of columns. All columns equally divide the total available width.", 'costered-blocks'),
            columns: __("Columns", 'costered-blocks'),
            columnsClear: __("Clear Columns", 'costered-blocks'),
            columnSpan: __("Use %1$s as column width", 'costered-blocks'),
            columnUnit: __("Unit", 'costered-blocks'),
            columnIsDisabled: __("Column settings are disabled because the parent grid uses subgrid for columns.", 'costered-blocks'),
            columnIsDisabledHelp: __("To enable column settings, change the parent grid to not use subgrid for columns.", 'costered-blocks'),
            rows: __("Rows", 'costered-blocks'),
            rowsClear: __("Clear Rows", 'costered-blocks'),
            rowSpan: __("Use %1$s as row height", 'costered-blocks'),
            rowUnit: __("Unit", 'costered-blocks'),
            rowIsDisabled: __("Row settings are disabled because the parent grid uses subgrid for rows.", 'costered-blocks'),
            rowIsDisabledHelp: __("To enable row settings, change the parent grid to not use subgrid for rows.", 'costered-blocks')
        },
        tracksPanel: {
            title: __("Tracks", 'costered-blocks'),
            description: __("In Tracks mode, you can define the exact track sizes using any valid CSS Grid value.", 'costered-blocks'),
            columns: {
                addPlaceholder: __("Add track or [line names]", 'costered-blocks'),
                addLabel: __("Add [line name]", 'costered-blocks'),
                addToken: __("Add column size", 'costered-blocks'),
                clear: __("Clear Columns", 'costered-blocks'),
                emptyState: __("No columns defined", 'costered-blocks'),
                label: __("Columns", 'costered-blocks'),
                mergeLeft: __("Merge left", 'costered-blocks'),
                size: __("Column Sizes", 'costered-blocks'),
                splitOut: __("Split", 'costered-blocks')
            },
            rows: {
                label: __("Rows", 'costered-blocks'),
                clear: __("Clear Rows", 'costered-blocks'),
                size: __("Row Sizes", 'costered-blocks'),
                addPlaceholder: __("Add track or [line names]", 'costered-blocks'),
                addToken: __("Add row size", 'costered-blocks'),
                addLabel: __("Add [line name]", 'costered-blocks')
            }
        },
        subgridPanel: {
            title: __("Subgrid", 'costered-blocks'),
            columns: {
                label: __("Columns use subgrid (%1$s)", 'costered-blocks'),
                help: __("Inherit column tracks from the parent grid on this breakpoint.", 'costered-blocks'),
                notice: __("Parent grid has no explicit columns; subgrid columns will inherit implicit tracks.", 'costered-blocks')
            },
            rows: {
                label: __("Rows use subgrid (%1$s)", 'costered-blocks'),
                help: __("Inherit row tracks from the parent grid on this breakpoint.", 'costered-blocks'),
                notice: __("Parent grid has no explicit rows; subgrid rows will inherit implicit tracks.", 'costered-blocks')
            }
        },
        gapPanel: {
            title: __("Gap", 'costered-blocks')
        },
        areasPanel: {
            title: __("Grid Template Areas", 'costered-blocks'),
            sizeHint: __("Grid Size: %1$d columns x %2$d rows", 'costered-blocks'),
            editLarge: __("Edit in larger view", 'costered-blocks'),
            modalTitle: __("Edit Grid Template Areas", 'costered-blocks'),
            noticePanel: {
                mismatchText: __("Templates areas (%1$dx%2$d) do not match current tracks (%3$dx%4$d)", 'costered-blocks'),
                resizeToTracks: __("Resize areas to match tracks", 'costered-blocks'),
                growTracksToAreas: __("Grow tracks to match areas", 'costered-blocks'),
                shrinkTracks: {
                    button: __("Shrink tracks to areas", 'costered-blocks'),
                    warning: __("Shrinking tracks may remove named lines please review afterwards.", 'costered-blocks'),
                    confirm: __("Shrink tracks", 'costered-blocks'),
                    cancel: __("Cancel", 'costered-blocks'),
                    heading: __("Remove named lines?", 'costered-blocks'),
                    description: __("Shrinking tracks will drop line names (e.g. [sidebar-start]). This can change template references. Continue?", 'costered-blocks')
                }
            }
        },
    },

    gridItemsControls: {
        panelTitle: __("Grid Item Controls", 'costered-blocks'),
        simplePanel: {
            title: __("Simple", 'costered-blocks'),
            columnLegend: __("Columns", 'costered-blocks'),
            columnStart: __("Column Start", 'costered-blocks'),
            columnStartHelp: __("%%1$d columns", 'costered-blocks'),
            columnStartHelpUnknown: __("Parent grid columns unknown; using a default range (1–24).", 'costered-blocks'),
            columnSpan: __("Column Span", 'costered-blocks'),
            columnSpanHelp: __("Max updates with start", 'costered-blocks'),
            rowLegend: __("Rows", 'costered-blocks'),
            rowStart: __("Row Start", 'costered-blocks'),
            rowStartHelp: __("%%1$d rows", 'costered-blocks'),
            rowStartHelpUnknown: __("Parent grid rows unknown; using a default range (1–24).", 'costered-blocks'),
            rowSpan: __("Row Span", 'costered-blocks'),
            rowSpanHelp: __("Max updates with start", 'costered-blocks')
        },
        tracksPanel: {
            title: __("Tracks", 'costered-blocks'),
            hasAreasNotice: __("This item uses a named grid area. Line-based placement is disabled.", 'costered-blocks'),
            namedLineMismatch: __("No named lines are defined in the parent grid.", 'costered-blocks'),
            zeroInvalid: __("0 isn’t a valid grid line. Use 1..N or negative indices like -1", 'costered-blocks'),
            columns: {
                legend: __("Columns", 'costered-blocks'),
                trackStartMode: __("Start uses", 'costered-blocks'),
                trackStartModeNamed: __("Named Line", 'costered-blocks'),
                trackStartModeNumber: __("Line Number", 'costered-blocks'),
                trackEndMode: __("End uses", 'costered-blocks'),
                trackEndModeSpan: __("Span", 'costered-blocks'),
                trackEndModeEnd: __("End", 'costered-blocks'),
                startNumber: __("Line Number", 'costered-blocks'),
                startNumberHelp: __("Positive or negative line number", 'costered-blocks'),
                startNamed: __("Named Line", 'costered-blocks'),
                startNamedHelp: __("Named lines from parent grid template", 'costered-blocks'),
                spanNumber: __("Span", 'costered-blocks'),
                spanNumberHelp: __("Max updates with start", 'costered-blocks'),
                endAuto: __("Auto", 'costered-blocks'),
                endAutoHelp: __("Automatically size based on start/span", 'costered-blocks'),
                endAutoNotice: __("Auto is currently applied to the end track.", 'costered-blocks'),
                endNamed: __("Named Line", 'costered-blocks'),
                endNamedHelp: __("Named lines from parent grid template", 'costered-blocks'),
                endNumber: __("Line Number", 'costered-blocks'),
                endNumberHelp: __("Positive or negative line number", 'costered-blocks')
            },
            rows: {
                legend: __("Rows", 'costered-blocks'),
                trackStartMode: __("Start uses", 'costered-blocks'),
                trackStartModeNamed: __("Named Line", 'costered-blocks'),
                trackStartModeNumber: __("Line Number", 'costered-blocks'),
                trackEndMode: __("End uses", 'costered-blocks'),
                trackEndModeSpan: __("Span", 'costered-blocks'),
                trackEndModeEnd: __("End", 'costered-blocks'),
                startNumber: __("Line Number", 'costered-blocks'),
                startNumberHelp: __("Positive or negative line number", 'costered-blocks'),
                startNamed: __("Named Line", 'costered-blocks'),
                startNamedHelp: __("Named lines from parent grid template", 'costered-blocks'),
                spanNumber: __("Span", 'costered-blocks'),
                spanNumberHelp: __("Max updates with start", 'costered-blocks'),
                endAuto: __("Auto", 'costered-blocks'),
                endAutoHelp: __("Automatically size based on start/span", 'costered-blocks'),
                endAutoNotice: __("Auto is currently applied to the end track.", 'costered-blocks'),
                endNamed: __("Named Line", 'costered-blocks'),
                endNamedHelp: __("Named lines from parent grid template", 'costered-blocks'),
                endNumber: __("Line Number", 'costered-blocks'),
                endNumberHelp: __("Positive or negative line number", 'costered-blocks')
            }
        },
        areasPanel: {
            title: __("Areas", 'costered-blocks'),
            areaAssigned: __("This item is assigned to area '%1$s'.", 'costered-blocks'),
            areaUnassigned: __("This item is not assigned to any area.", 'costered-blocks'),
            areaSelectLabel: __("Select Area", 'costered-blocks'),
            areaSelectPlaceholder: __("Choose an area", 'costered-blocks')
        },
        alignmentPanel: {
            title: __("Alignment", 'costered-blocks')
        },
        orderPanel: {
            title: __("Order", 'costered-blocks'),
            label: __("Order", 'costered-blocks')
        }
    },

    positioningControls: {
        panelTitle: __("Positioning Controls", 'costered-blocks'),
        position: {
            label: __("Position", 'costered-blocks'),
            help: __("Controls the positioning of the element.", 'costered-blocks'),
            values: {
                unset: __("unset / initial", 'costered-blocks'),
                static: __("Static", 'costered-blocks'),
                relative: __("Relative", 'costered-blocks'),
                absolute: __("Absolute", 'costered-blocks'),
                fixed: __("Fixed", 'costered-blocks'),
                sticky: __("Sticky", 'costered-blocks')
            }
        },
        coordinates: {
            label: __("Coordinates", 'costered-blocks'),
            help: __("Set the coordinates for the element. Works with relative, absolute, fixed, and sticky positioning.", 'costered-blocks'),
            top: __("Top", 'costered-blocks'),
            right: __("Right", 'costered-blocks'),
            bottom: __("Bottom", 'costered-blocks'),
            left: __("Left", 'costered-blocks'),
            useCustom: __("Use custom values (e.g auto, calc)", 'costered-blocks')
        },
        zIndex: {
            label: __("Z-Index", 'costered-blocks'),
            help: __("Controls the stack order of the element. Elements with a higher z-index cover those with a lower one.", 'costered-blocks')
        }
    },

    flexDirection: {
        label: __("Flex Direction", 'costered-blocks'),
        row: __("Row", 'costered-blocks'),
        rowReverse: __("Row Reverse", 'costered-blocks'),
        column: __("Column", 'costered-blocks'),
        columnReverse: __("Column Reverse", 'costered-blocks')
    },

    justifyControls: {
        label: __("Justify Content", 'costered-blocks'),
        start: __("Start", 'costered-blocks'),
        end: __("End", 'costered-blocks'),
        center: __("Center", 'costered-blocks'),
        spaceAround: __("Space Around", 'costered-blocks'),
        spaceBetween: __("Space Between", 'costered-blocks'),
        spaceEvenly: __("Space Evenly", 'costered-blocks')
    },

    justifySelfControl : {
        label: __("Justify Self", 'costered-blocks'),
        start: __("Start", 'costered-blocks'),
        end: __("End", 'costered-blocks'),
        center: __("Center", 'costered-blocks'),
        stretch: __("Stretch", 'costered-blocks')
    },

    alignControls: {
        label: __("Align Items", 'costered-blocks'),
        start: __("Start", 'costered-blocks'),
        end: __("End", 'costered-blocks'),
        center: __("Center", 'costered-blocks'),
        stretch: __("Stretch", 'costered-blocks'),
        baseline: __("Baseline", 'costered-blocks'),
        spaceAround: __("Space Around", 'costered-blocks'),
        spaceBetween: __("Space Between", 'costered-blocks'),
        spaceEvenly: __("Space Evenly", 'costered-blocks')
    },

    customSelectControl: {
        defaultText: __("choose...", 'costered-blocks')
    },

    dimensionInputGroup: {
        label: __("Dimensions", 'costered-blocks'),
        labelPre: __("%1$s Dimensions", 'costered-blocks'),
        width: __("Width", 'costered-blocks'),
        height: __("Height", 'costered-blocks'),
        useCustom: __("Use custom values (e.g auto, calc)", 'costered-blocks')
    },

    directionalInputGroup: {
        label: __("Directions", 'costered-blocks'),
        top: __("Top", 'costered-blocks'),
        right: __("Right", 'costered-blocks'),
        bottom: __("Bottom", 'costered-blocks'),
        left: __("Left", 'costered-blocks'),
        useCustom: __("Use custom values (e.g auto, calc)", 'costered-blocks')
    },

    gapControls: {
        label: __("Gaps", 'costered-blocks'),
        rowLabel: __("Row Gap", 'costered-blocks'),
        switchToSingle: __("Switch to Single Gap", 'costered-blocks'),
        switchToDual: __("Switch to Dual Gap", 'costered-blocks'),
        columnLabel: __("Column Gap", 'costered-blocks'),
        useCustom: __("Use custom values (e.g auto, calc)", 'costered-blocks')
    },

    gridAxisAside: {
        label: __("Grid Axis", 'costered-blocks'),
        horizontal: __("Horizontal", 'costered-blocks'),
        vertical: __("Vertical", 'costered-blocks'),
        pip: {
            noValue: __("No value set", 'costered-blocks'),
            valueHere: __("Value matches this panel", 'costered-blocks'),
            valueElsewhere: __("Value set in %s panel", 'costered-blocks'),
            valueRaw: __("Value set (unrecognised format)", 'costered-blocks')
        },
        clearRows: __("Clear Rows", 'costered-blocks'),
        clearColumns: __("Clear Columns", 'costered-blocks')
    },

    token: {
        expand: __("Edit token", 'costered-blocks'),
        collapse: __("Close editor", 'costered-blocks'),
        remove: __("Remove", 'costered-blocks'),
        moveLeft: __("Move left", 'costered-blocks'),
        moveRight: __("Move right", 'costered-blocks'),
        duplicate: __("Duplicate", 'costered-blocks')
    },

    tokenGrid: {
        title: __("Cells", 'costered-blocks'),
        clear: __("Clear", 'costered-blocks'),
        sizeHint: __("Cells: %1$d columns x %2$d rows", 'costered-blocks'),
        tokenExpand: __("Edit cell", 'costered-blocks'),
        tokenCollapse: __("Close editor", 'costered-blocks'),
        tokenRemove: __("Clear cell", 'costered-blocks'),
        tokenMoveLeft: __("Previous cell", 'costered-blocks'),
        tokenMoveRight: __("Next cell", 'costered-blocks'),
        addColumn: __("Add column", 'costered-blocks'),
        removeColumn: __("Remove column", 'costered-blocks'),
        addRow: __("Add row", 'costered-blocks'),
        removeRow: __("Remove row", 'costered-blocks'),
        matrix: {
            noAreas: __("No areas defined", 'costered-blocks'),
            reset: __("Reset Grid", 'costered-blocks')
        }
    },

    tokenEditor: {
        add: __("Add", 'costered-blocks'),
        addToken: __("Add token", 'costered-blocks'),
        addLineNames: __("Add line names", 'costered-blocks'),
        listAriaLabel: __("List of tokens", 'costered-blocks'),
        moveLeft: __("Move left", 'costered-blocks'),
        moveRight: __("Move right", 'costered-blocks'),
        duplicate: __("Duplicate", 'costered-blocks'),
        remove: __("Remove", 'costered-blocks'),
        expand: __("Edit token", 'costered-blocks'),
        collapse: __("Close editor", 'costered-blocks')
    },

    tokenGridNotice: {
        mismatchText: __("Cells (%1$dx%2$d) do not match current dimensions (%3$dx%4$d)", 'costered-blocks'),
        resizeToTracks: __("Resize cells to match dimensions", 'costered-blocks'),
        growTracksToAreas: __("Grow dimensions to match cells", 'costered-blocks'),
        shrinkTracks: {
            button: __("Shrink dimensions to cells", 'costered-blocks'),
            warning: __("Shrinking dimensions may remove columns/rows. Please review afterwards.", 'costered-blocks'),
            confirm: __("Shrink dimensions", 'costered-blocks'),
            cancel: __("Cancel", 'costered-blocks'),
            heading: __("Remove rows/columns?", 'costered-blocks'),
            description: __("Shrinking dimensions will drop rows/columns. Continue?", 'costered-blocks')
        }
    },

    actions: {
        apply: __("Apply", 'costered-blocks'),
        close: __("Close", 'costered-blocks'),
        cancel: __("Cancel", 'costered-blocks'),
        confirm: __("Confirm", 'costered-blocks'),
        clear: __("Clear", 'costered-blocks'),
        reset: __("Reset", 'costered-blocks'),
        remove: __("Remove", 'costered-blocks'),
        add: __("Add", 'costered-blocks'),
        edit: __("Edit", 'costered-blocks'),
        save: __("Save", 'costered-blocks'),
        copy: __("Copy", 'costered-blocks'),
        undo: __("Undo", 'costered-blocks'),
        redo: __("Redo", 'costered-blocks')
    },

    editingContext: {
        unsavedChanges: __("Unsaved changes", 'costered-blocks'),
        unsavedChangesForAttrs: __("Unsaved changes for: %s", 'costered-blocks'),
        saveChanges: __("Save Changes", 'costered-blocks'),
        discardChanges: __("Discard Changes", 'costered-blocks')
    }
}