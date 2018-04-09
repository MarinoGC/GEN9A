export const TREE_ALL = 'TREE_ALL';
export const TREE_ADD = 'TREE_ADD';
export const TREE_CLEAR = 'TREE_CLEAR';

export function treemd(state, {type, payload}) {
    switch (type) {
        case TREE_CLEAR:
            return [];
        case TREE_ADD:
            return[...state, payload];
        case TREE_ALL:
            return payload;

        default:
            return state;
    }
};

