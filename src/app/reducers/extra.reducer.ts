export const EXTRA_ADD = 'EXTRA_ADD';
export const EXTRA_ALL = 'EXTRA_ALL';
export const EXTRA_CLEAR = 'EXTRA_CLEAR';

export function extraInfo(state, {type, payload}) {
    switch (type) {
        case EXTRA_CLEAR:
            return [];
        case EXTRA_ADD:
            return [...state, payload];
        case EXTRA_ALL:
            return payload;
        default:
            return state;
    }
}

