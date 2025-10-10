import { splitTopLevel, collapseAdjacentNamedLines, normaliseTemplate } from '@utils/gridUtils';
import type { TokenAtomicItem, TokenModelAdapter, PersistedTracks } from "@types";

export const TracksTokensAdapter: TokenModelAdapter<PersistedTracks> = {
    expand(persisted: PersistedTracks): TokenAtomicItem[] {
        const collapsed = collapseAdjacentNamedLines(persisted);
        const tokens = splitTopLevel(collapsed);

        let nextGroupId = 1;
        const atomic: TokenAtomicItem[] = [];
        for (const tok of tokens) {
            // bracket group => [a b] -> 'name' items with same groupId
            const match = tok.match(/^\[(.*?)\]$/);
            if (match) {
                const inner = match[1]!.trim();
                if (inner) {
                    const groupId = nextGroupId++;
                    for (const name of inner.split(/\s+/)) {
                        atomic.push({ kind: 'name', text: name, groupId });
                    }
                }
                continue
            }
            // otherwise raw track/token
            atomic.push({ kind: 'raw', text: tok });
        }
        return atomic;
    },
    collapse(items: TokenAtomicItem[]): PersistedTracks {
        const output: string[] = [];
        let i = 0;

        while (i < items.length) {
            const item = items[i]!;
            if (item.kind === 'name') {
                const groupId = item.groupId;
                const bucket = [item.text];
                if (groupId != null) {
                    let j = i + 1;
                    while (j < items.length && items[j]!.kind === 'name' && items[j]!.groupId === groupId) {
                        bucket.push(items[j]!.text);
                        j++;
                    }
                    output.push(`[${bucket.join(' ')}]`);
                    i = j;
                } else {
                    output.push(`[${bucket[0]}]`);
                    i++;
                }
            } else {
                output.push(item.text);
                i++;
            }
        }
        
        return normaliseTemplate(output.join(' '));
    },

    mergeWithPrev(items, index) {
        if (index <= 0) return items;
        const prev = items[index - 1];
        const current = items[index];
        if(!prev || !current) return items;
        if (prev.kind !== 'name' || current.kind !== 'name') return items;

        const next = items.slice();
        const maxGroupId = next.reduce((max, item) => Math.max(max, item.groupId ?? 0), 0);
        const gid = prev.groupId ?? current.groupId ?? (maxGroupId + 1);

        next[index - 1] = { ...prev, groupId: gid };
        next[index] = { ...current, groupId: gid };
        return next;
    },

    clearGroup(items, index) {
        const item = items[index];
        if (!item || item.kind !== 'name' || item.groupId === null) return items;

        const next = items.slice();
        const { groupId: _omit, ...rest } = item;
        next[index] = rest;
        return next;
    }
}