export const NavItems = [
    {
        type: 0,
        main: true,
        extraNav: true,
        wacht: false,
        navType: 0,
        title: "HOME",
        name: "home",
    },
    {
        type: 1,
        main: true,
        extraNav: false,
        wacht: false,
        navType: 0,
        title:"COMMENT",
        name: "comment",
    },
    {
        type: 2,
        main: false,
        extraNav: false,
        wacht: false,
        navType: 0,
        title:"INHOUD",
        name: "inhoud",
    },
    {
        type: 3,
        main: true,
        extraNav: false,
        wacht: false,
        navType: 0,
        title: "SHUFFLE",
        name: "shuffle",
    },
    {
        type: 4,
        main: true,
        extraNav: false,
        wacht: false,
        navType: 0,
        title: "DIRECTORY",
        name: "directory",
    },
    {
        type: 5,
        main: true,
        extraNav: false,
        wacht: false,
        navType: 0,
        title: "ALBUM",
        name: "album",
    },
    {
        type: 6,
        main: true,
        extraNav: false,
        wacht: false,
        navType: 0,
        title: "DOCUMENTEN",
        name: "documenten",
    },
    {
        type: 7,
        main: false,
        extraNav: false,
        wacht: false,
        navType: 0,
        title: "LEEG",
        name: "leeg",
    },
];

export interface AlbumItem  {
    id: number;
    name: string;
    sel:boolean;
}

export enum KEY_CODE {
    ENTER = 13,
    LEFT_ARROW = 37,
    UP_ARROW = 38,
    RIGHT_ARROW = 39,
    DOWN_ARROW = 40
}
