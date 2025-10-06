import { createReduxStore, register } from '@wordpress/data';
import { REDUX_STORE_KEY  } from '@config';

import type { Breakpoint } from '@types';

type State = { breakpoint: Breakpoint};
type SetBreakpointAction = { type: 'SET_BREAKPOINT'; breakpoint: Breakpoint };

const DEFAULT_STATE = { breakpoint: 'desktop' } satisfies State;

const actions = {
    setBreakpoint(breakpoint: Breakpoint): SetBreakpointAction { 
        return { type: 'SET_BREAKPOINT', breakpoint };
    }
}

const selectors = {
    getBreakpoint(state: State): Breakpoint {
        return state.breakpoint;
    }
};

function reducer(state: State = DEFAULT_STATE, action: SetBreakpointAction): State {
    switch (action.type) {
        case 'SET_BREAKPOINT':
            return { ...state, breakpoint: action.breakpoint || 'desktop' };
        default:
            return state;
    }
}

const config = { reducer, actions, selectors };
const store = createReduxStore(REDUX_STORE_KEY, config);

try {
    if(typeof register === 'function' && register.length === 1) {
        // @ts-ignore
        register(store);
    } else if(typeof register === 'function' && register.length === 2) {
        (register as unknown as (name: string, s: unknown) => void)(REDUX_STORE_KEY, store);
    } else if (typeof register === 'function') {
        // @ts-ignore
        registerStore(REDUX_STORE_KEY, store);
    }
} catch(_) {
    /* already registered */
}

export const selectActiveBreakpoint = (select: any): Breakpoint =>
    (select(REDUX_STORE_KEY)?.getBreakpoint?.() as Breakpoint || 'desktop');

export { actions, selectors }