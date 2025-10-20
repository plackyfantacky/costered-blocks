export type TokenAtomicItem = {
    kind: 'name' | 'raw'; // no other variety; never null;
    text: string; // never empty
    groupId?: number;
    row?: number;
    col?: number;
    _id: string; // unique identifier
}

export interface TokenModelAdapter<Token, Item extends Partial<TokenAtomicItem> = TokenAtomicItem> {
    expand(persisted: Token): Item[];
    collapse(items: TokenAtomicItem[]): Token;
    mergeWithPrev?(item: TokenAtomicItem[], index: number): TokenAtomicItem[];
    clearGroup?(item: TokenAtomicItem[], index: number): TokenAtomicItem[];
    canMove?(items: TokenAtomicItem[], index: number, delta: number): boolean; 
}

/** Canonical persisted shapes we deal with. */
export type PersistedTracks = string;     // e.g., "[a b] minmax(100px,1fr) [c]"
export type PersistedAreas  = string[];   // e.g., ["a a .", "b c c"]