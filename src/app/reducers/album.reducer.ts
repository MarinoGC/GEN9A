export const ALBUM_ALL = 'ALBUM_ALL';
export const ALBUM_ADD = 'ALBUM_ADD';
export const ALBUM_CLEAR = 'ALBUM_CLEAR';

export function albummd(state, {type, payload}) {
    switch (type) {
        case ALBUM_CLEAR:
            return [];
        case ALBUM_ADD:
            return[...state, payload];
        case ALBUM_ALL:
            return payload;

        default:
            return state;
    }
};

