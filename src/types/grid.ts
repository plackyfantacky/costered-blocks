import type { ComponentType } from '@wordpress/element';

export type GridControlsPanelMap<Key extends string> = Record<Key, ComponentType<any>>;
export type GridControlsPanelProps<Key extends string> =
    | Record<string, unknown>
    | ((active: Key) => Record<string, unknown>);

export type GridAxisModeKey = 'simple' | 'tracks'
export type GridAxisKey = 'rows' | 'columns';
export type GridAxisModel = {
    template: string | null;
    normalised?: string;
    tracks?: string[];
    activePane?: GridAxisModeKey | null;
};
export type GridAxisDisabled = { columns: boolean; rows: boolean };

export type GridModel = {
    columns: GridAxisModel | null;
    rows: GridAxisModel | null;
    activePane: Record<GridAxisKey, GridAxisModeKey | null>;
};

export type GridItemPanelKey = 'simple' | 'tracks' | 'areas';

export type ColumnInfo = number | { count?: number } | undefined;
export type RowInfo = number | { count?: number } | undefined;

export type Token = string;
export type Matrix = Token[][];