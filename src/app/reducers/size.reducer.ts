export const SIZE_ALL = 'SIZE_ALL';
export const SIZE_ADD = 'SIZE_ADD';
export const SIZE_CLEAR = 'SIZE_CLEAR';

export function sizeI(state, {type, payload}) {
    switch (type) {
        case SIZE_CLEAR:
            return [];
        case SIZE_ADD:
            return[...state, payload];
        case SIZE_ALL:
            return payload;

        default:
            return state;
    }
};

