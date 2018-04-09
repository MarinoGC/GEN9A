import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/map';
import {TREE_ALL} from "../reducers/tree.reducer";

@Component({
    selector: 'app-directory',
    templateUrl: './directory.component.html',
    styleUrls: ['./directory.component.css'],
    providers: [],
    encapsulation: ViewEncapsulation.Emulated
})
export class DirectoryComponent implements OnInit, OnDestroy {

    @Input() extraInfo;
    @Input() treemd;
    click$ = new Subject;
    werk;

    constructor(private store: Store<any>,
                private http: HttpClient) {
        this.werk = this.click$            //lees het aantal clicks, de optelling eindigt na de wachtijd pauze
            .bufferTime(250)
            .map(data => (data.length))
            .subscribe(data => {
                if (data > 0) {
                    this.multi = this.multi + data;
                } else {
                    if (this.multi > 0) {
                        this.dirActie(this.multi, this.dirNr);
                        this.multi = 0;
                    }
                }
            })
    }

    private dirNr: number = 0;
    private multi: number = 0;
    private dirSel: boolean[];
    private n: number;
    private dLength: number;
    private tus: string[];
    private urlDir: string = './writeDir.php';
    private body: any;

    selectDir(value) {
        this.dirNr = value;
    }

    dirActie(aantal, nr) {
        if (aantal == 2) {
            for (this.n = (this.dLength - 1); this.n >= 0; this.n--) {
                if (this.dirSel[this.n]) {
                    this.dirSel[this.n] = false;
                    this.moveDir(this.n, nr);
                    this.n = this.dLength;
                }
            }
        } else {
            this.dirSel[nr] = !this.dirSel[nr];
        }
    }

    moveDir(org, nu) {                                                                     //shuif 'nu' naar positie 'org'
        if (org > nu) {
            this.tus = this.treemd['menu1'][org];
            for (this.n = org; this.n > nu; this.n--) {
                this.treemd['menu1'][this.n] = this.treemd['menu1'][this.n - 1];
            }
            this.treemd['menu1'][nu] = this.tus;
        } else {
            this.tus = this.treemd['menu1'][org];
            for (this.n = org; this.n < nu; this.n++) {
                this.treemd['menu1'][this.n] = this.treemd['menu1'][this.n + 1];
            }
            this.treemd['menu1'][nu] = this.tus;
        }
        this.store.dispatch({type: TREE_ALL, payload: this.treemd});
        this.body = JSON.stringify({loc: this.treemd['loc'], menu1: this.treemd['menu1']});
        this.http.post(this.urlDir, this.body)
            .subscribe(data => {
                // console.log('________________________________verversing DataInfo.md');
                // console.log(data);
            });
    }

    getStyle2(nr) {
        if (this.dirSel[nr]) {
            return "solid 6px red";
        }
    }

    ngOnInit() {
        this.dLength = this.treemd['menu1'].length;
        this.dirSel = [];
        for (this.n = 0; this.n < this.dLength; this.n++) {
            this.dirSel.push(false);
        }
    }

    ngOnDestroy() {
    }
}
