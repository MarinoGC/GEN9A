import {Component, OnInit, OnDestroy, Input, HostListener} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/map';
import { EXTRA_ALL } from '../reducers/extra.reducer';
import { TREE_ALL} from "../reducers/tree.reducer";
import { KEY_CODE, NavItems } from '../models/nav.model';
import { ShuffleService } from '../services/shuffle.service';

@Component({
    selector: 'app-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.css'],
    providers: [ShuffleService]
})
export class TreeComponent implements OnInit, OnDestroy {

    @Input() extraInfo;
    @Input() treemd;
    @Input() sizeI;

    private subTree: Subscription;
    private timerTree;

    private navItems: any;
    private filter: any[] = [];
    private enter: boolean = true;
    private teller: number = 0;
    ready: boolean = false;
    private trailOld: string[] = ['', 'start'];
    private pictSel: {} = {'name': '', 'nr': 0, 'path': '', 'subTree': ['']};
    private pathShort: string;
    private nav: string;
    private urlNode: string = './nodeMdWrite.php';
    private body: string;

    constructor(private store: Store<any>,
                private shuffleService: ShuffleService,
                private http: HttpClient) {}
//_______________________________________________________________________________MENU STRUCTUUR
    menu(nr) {
        this.enter = true;
        if (this.trailOld[nr] != this.treemd['trail'][nr]) {
            this.treemd['filter'][nr]  = this.shuffleService.filterTree1(this.treemd, this.treemd['trail'][nr]);
            this.store.dispatch({type: TREE_ALL, payload: this.treemd});
            this.trailOld[nr] = this.treemd['trail'][nr];
        }
    }

    enterItem(value, nr, nav) {
        this.enter = true;
        this.nav = nav;
        this.extraInfo['previous'] = this.extraInfo['nav']['name'];             //waar komen we vandaan?
        this.pathShort = this.shuffleService.pathInfo(nr, value, this.treemd);
        this.nav = nav;
        this.teller = 0;

        if (!this.treemd['contents'][this.treemd['path']][0]['upToDate']) {
            console.log(`first time: ` + this.treemd['path']);
            this.treemd['contents'][this.treemd['path']][0]['upToDate'] = true;

            this.body = JSON.stringify({nav: nav,
                path: this.pathShort,
                fileSel: this.treemd['contents'][this.treemd['path']]});
            this.http.post(this.urlNode, this.body)
                .subscribe(data => {
                    console.log(data);
                    this.treemd['contents'][this.treemd['path']] = data;
                    this.startSelect();
                });
        } else {
            this.startSelect();
        }
    }

    leaveItem() {
        this.enter = false;
    }


    getStyle(value, nr) {
        if (this.treemd['filter'][nr]['menu1'][value] == this.treemd['trail'][nr + 1]) {
            return "yellow";
        }
    }

    tickerFuncTree() {
        this.menu(0);
        this.menu(1);
        this.menu(2);

        if (this.teller == 50) {
            this.teller = 0;
        }

        if (!this.ready) {
            this.ready = true;
        }

        this.teller++;
    }
//_______________________________________________________________________________UITKIEZEN BEELD VOOR COMMENTAAR VELDEN
    startSelect() {
        if(this.treemd['contents'][this.treemd['path']].length > 1) {
            this.makeSelect({
                name: this.treemd['contents'][this.treemd['path']][1]['name'],
                nr: 1});
        } else {
            this.makeSelect({name: '', nr: 0});
        }
    }
//_______________________________________________________________________________UITKIEZEN BEELD VOOR COMMENTAAR VELDEN
    makeSelect(value) {
        this.pictSel = {'name': value['name'],
            'nr': value['nr'],
            'path': this.treemd['path'],
            'subTree': this.treemd['contents'][this.treemd['path']]
        };
        this.treemd['selectPict'] = this.pictSel;
    }
//_______________________________________________________________________________UITKIEZEN BEELD VOOR COMMENTAAR VELDEN
    selectPict(value) {                                                              //noteer gegevens geselecteerd picture
        this.makeSelect(value);
        this.store.dispatch({type: TREE_ALL, payload: this.treemd});

        this.extraInfo['nav'] = this.navItems[2];                               //ga naar item-component voor commentaar velden
        this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});
    }
//____________________________voor up/down/left/right toetsen__________________
    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
         if (event.keyCode === KEY_CODE.DOWN_ARROW) {
            if (this.treemd['selectPict'].nr > 0) {
                this.selectPict({
                    name: this.treemd['selectPict']['name'],
                    nr: this.treemd['selectPict']['nr']
                });
            }
        }
    }
//________________________________________________________________________________________
    ngOnInit() {
        this.navItems = NavItems;
        this.enter = true;

        this.timerTree = Observable.timer(1000, 250);                           //hier wordt de tijd tik ingesteld
        this.subTree = this.timerTree.subscribe(t => this.tickerFuncTree());
    }

    ngOnDestroy() {
        this.subTree.unsubscribe();
    }

}
