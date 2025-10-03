import { createReduxStore, register } from '@wordpress/data';
import { REDUX_STORE_KEY  } from '@config';

import type { Breakpoint } from '@types';
const DEFAULT_STATE = { breakpoint: 'desktop' };

const actions = { setBreakpoint(breakpoint: Breakpoint) { 
    return { type: 'SET_BREAKPOINT', breakpoint }; }
}

const selectors = { getBreakpoint(state) { return state.breakpoint; } }
 
function reducer(state = DEFAULT_STATE, action) {
    switch (action.type) {
        case 'SET_BREAKPOINT':
            return { ...state, breakpoint: action.breakpoint || 'desktop' };
        default:
            return state;
    }
}

const store = createReduxStore(REDUX_STORE_KEY, { reducer, actions, selectors });

try { register(store); } catch(_) { /* already registered */ }

export { actions, selectors }