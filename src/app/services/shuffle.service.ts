import { Injectable } from '@angular/core';

@Injectable()
export class ShuffleService {

    private fMenu1: string[];
    private fMenu2: string[];
    private n: number;
    private m: number;
    private p: number;
    private fLength: number;
    private s: string;
    private t: string;
    private tot: string;
    private loc: string;
    private pathShort: string;
    private treemd: any;
    private data;
    private dataEl;

//______________________________________________________________________________BEPAAL STATUS INFORMATIE
    pathInfo(nr, value, data) {                                                        //gebruikt bij menu selectie (lijkt op getPath)
        this.treemd = data;
        for (this.n = 0; this.n <= this.treemd['diepte']; this.n++) {           //bepaal de trail
            if (this.n == (nr + 1)) {
                this.treemd['trail'][this.n] = this.treemd['filter'][nr]['menu1'][value];
            }
            if (this.n > (nr + 1)) {
                this.treemd['trail'][this.n] = '';
            }
        }
        this.treemd['path'] = '';                                               //bepaal het pad
        for (this.n = 0; this.n <= this.treemd['diepte']; this.n++) {
            if (this.treemd['trail'][this.n] != '') {
                this.treemd['path'] = this.treemd['path'] + '/' + this.treemd['trail'][this.n];
            }
        }
        this.treemd['path'] = this.treemd['path'] + '/';
        this.pathShort = this.treemd['path'];
        this.treemd['path'] = '.' + this.treemd['path'];
        return this.pathShort;
    }

    getPath(value, nr, data) {                                                        //gebruikt bij path-selectie met muiskliks
        this.treemd = data;
        this.s = this.treemd['filter'][nr]['menu1'][value];                     //(lijkt op pathInfo)
        this.loc = this.treemd['loc'];
        this.tot = this.s;
        do {
            for (this.n = 0; this.n < this.treemd['menu1'].length; this.n++) {
                if (this.treemd['menu1'][this.n][1] == this.s) {
                    this.t = this.treemd['menu1'][this.n][0];
                    this.tot = this.t + '/' + this.tot;
                    if (this.t == this.treemd['loc']) {
                        this.n = this.treemd['menu1'].length;
                    } else {
                        this.n = 0;
                        this.s = this.t;
                    }
                }
            }
        }
        while (this.t != this.loc);
        this.tot = '/' + this.tot + '/';
        return this.tot;
    }

    filterTree1(data, value) {                                         //maak uppercase (fMenu2) van fMenu1
        this.fLength = data['menu1'].length;
        this.fMenu1 = [];
        this.fMenu2 = [];
        for (this.n = 0; this.n < this.fLength; this.n++) {
            if (data['menu1'][this.n][0] == value) {
                this.s = (data['menu1'][this.n][1]);
                this.fMenu1.push(this.s);
                this.s = this.s.toUpperCase();
                this.fMenu2.push(this.s);
            }
        }
        return {'menu1': this.fMenu1, 'menu2': this.fMenu2};
    }

    body(path) {                                                //bereid gegevens voor voor INIT-functie
        this.fMenu1 = path.split('/');
        this.fLength = (this.fMenu1).length - 1;
        this.s = '/';
        for (this.n = 1; this.n < this.fLength; this.n++) {
            this.s = this.s + this.fMenu1[this.n] + '/';
            this.t = this.fMenu1[this.fLength - 1].toUpperCase();
        }
        return JSON.stringify({nav: this.t, path: this.s, fileSel: this.treemd['contents'][path]});
    }

//___________________________________________________________________________________SELECTIE ACTIES
    changeSel(clicks, nr, data) {                                                                 //bepaalt acties n.a.v. aantal muiskliks
        this.treemd = data;
        this.fLength = Object.keys(this.treemd['contents'][this.treemd['path']]).length;
        switch (clicks) {
            case 1:                                                                         //toggle selected
                this.treemd['contents'][this.treemd['path']][nr]['sel'] = !this.treemd['contents'][this.treemd['path']][nr]['sel'];
                break;

            case 2:
                //verplaats geselecteerden naar klik positie
                this.data = this.treemd['contents'][this.treemd['path']];
                for (this.m = (this.data.length - 1); this.m > nr; this.m--) {
                    if (this.data[this.m]['sel']) {
                        this.dataEl = this.data[this.m];
                        this.dataEl['sel'] = false;
                        this.data.splice(this.m, 1);
                        this.data.splice(nr, 0, this.dataEl);
                        for (this.p=1; this.p<this.data.length; this.p++) {
                            this.data[this.p]['nr'] = this.p;
                        }
                        this.m = this.data.length;
                    }
                }
                for (this.m = 1; this.m < nr; this.m++) {
                    if (this.data[this.m]['sel']) {
                        this.dataEl = this.data[this.m];
                        this.dataEl['sel'] = false;
                        this.data.splice(this.m, 1);
                        this.data.splice(nr, 0, this.dataEl);
                        for (this.p=1; this.p<this.data.length; this.p++) {
                            this.data[this.p]['nr'] = this.p;
                        }
                        this.m = 0;
                    }
                }
                this.treemd['contents'][this.treemd['path']] = this.data;
                this.treemd['contents'][this.treemd['path']][0]['upToDate'] = false;
                break;

            case 3:                                                                         //selecteer reeks
                for (this.m = nr; this.m < this.fLength; this.m++) {                       //de geselecteerde tot volgende selected
                    if (this.treemd['contents'][this.treemd['path']][this.m]['sel']) {
                        this.m = this.fLength;
                    } else {
                        this.treemd['contents'][this.treemd['path']][this.m]['sel'] = true;
                    }
                }
                break;

            default:                                                                        //reset de selectie
                for (this.m = 0; this.m < this.fLength; this.m++) {
                    this.treemd['contents'][this.treemd['path']][this.m]['sel'] = false;
                }
        }
        this.treemd['contents'][this.treemd['path']].sort((a, b) => a['nr'] - b['nr']);
        return this.treemd;
    }

//_________________________________________________________________________________
}
