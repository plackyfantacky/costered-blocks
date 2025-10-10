export type TokenAtomicItem = {
    kind: 'name' | 'raw'; // no other variety; never null;
    text: string; // never empty
    groupId?: number;
    row?: number;
    col?: number;
}

export interface TokenModelAdapter<Persisted> {
    expand(persisted: Persisted): TokenAtomicItem[];
    collapse(items: readonly TokenAtomicItem[]): Persisted;
    mergeWithPrev?(item: TokenAtomicItem[], index: number): TokenAtomicItem[];
    clearGroup?(item: TokenAtomicItem[], index: number): TokenAtomicItem[];
    canMove?(items: readonly TokenAtomicItem[], index: number, delta: number): boolean; 
}

/** Canonical persisted shapes we deal with. */
export type PersistedTracks = string;     // e.g., "[a b] minmax(100px,1fr) [c]"
export type PersistedAreas  = string[];   // e.g., ["a a .", "b c c"]