import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/bufferTime';
import { EXTRA_ALL, EXTRA_ADD, EXTRA_CLEAR } from '../reducers/extra.reducer';
import {TREE_ALL} from "../reducers/tree.reducer";
import { NavItems } from '../models/nav.model';
import { ShuffleService } from '../services/shuffle.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-shuffle',
    templateUrl: './shuffle.component.html',
    styleUrls: ['./shuffle.component.css'],
    providers: [ShuffleService],
    encapsulation: ViewEncapsulation.Emulated
})
export class ShuffleComponent implements OnInit, OnDestroy {

    @Input() extraInfo;
    @Input() treemd;
    @Input() sizeI;
    click$ = new Subject;
    werk;

    private subShuffle: Subscription;
    private timerShuffle;

    private navItems: any;
    private body: any;
    private urlWachtTo: string = './wachtTo.php';
    private urlNode: string = './nodeMdWrite.php';
    private mdUpdate: string = './treeNode.php';
    private filter: any[] = [];
    private enter: boolean = true;
    private teller: number = 0;
    private pathShort: string;
    ready: boolean = false;
    private trailOld: string[] = ['', 'start'];
    private nav: string;
    private start: boolean;
    private pathKeuze: string;

    private multi: number = 0;
    private pictNr: number;
    private pictKeuze: boolean = false;

    constructor(private store: Store<any>,
                private http: HttpClient,
                private shuffleService: ShuffleService) {
        this.werk = this.click$            //lees het aantal clicks, de optelling eindigt na de wachtijd pauze
            .bufferTime(400)
            .map(data => (data.length))
            .subscribe(data => {
                if (data > 0) {
                    this.multi = this.multi + data;
                } else {
                    if (this.multi > 0) {
                        if (this.pictKeuze) {
                            this.pictActie(this.multi, this.pictNr);            //pas dit toe op picture keuze
                        } else {
                            this.interActie(this.multi);                        //pas dit toe op menu keuze
                        }
                        this.multi = 0;
                    }
                }
            })
    }
//___________________________________________________________________________________________________________________
//_________________________________________________________ALGEMEEN
    pictActie(aantal, nr) {
        this.treemd = this.shuffleService.changeSel(aantal, nr, this.treemd);           //reageer op muis kliks, PICTURE SELECTIE
        this.copySourceGoal();
        this.body = JSON.stringify({path: this.pathShort,
                                    fileSel: this.treemd['contents'][this.treemd['path']],
                                    nav: this.nav});
        this.http.post(this.mdUpdate, this.body)
            .subscribe(data => {
                console.log(data);
            })
    }
//___________________________________________________________________________________________________________________
    copySourceGoal() {                                                                  //source en goal updaten
        this.pathKeuze = this.treemd['trail'][1] + ' ' + this.treemd['trail'][2] + ' ' + this.treemd['trail'][3];
        if (this.treemd['path'] == this.treemd['sourceInfo']['path']) {
            this.treemd['sourceInfo'] = {files: this.treemd['contents'][this.treemd['path']],
                path: this.treemd['path'],
                tekst: this.pathKeuze,
                nav: this.nav};
        }
        if (this.treemd['path'] == this.treemd['goalInfo']['path']) {
            this.treemd['goalInfo'] = {files: this.treemd['contents'][this.treemd['path']],
                path: this.treemd['path'],
                tekst: this.pathKeuze,
                nav: this.nav};
        }
        this.store.dispatch({type: TREE_ALL, payload: this.treemd});
    }
//___________________________________________________________________________________________________________________
    menu(nr) {                                                                  //administratief (binnen menu item)
        this.enter = true;
        if (this.trailOld[nr] != this.treemd['trail'][nr]) {
            this.treemd['filter'][nr]  = this.shuffleService.filterTree1(this.treemd ,this.treemd['trail'][nr]);
            this.store.dispatch({type: TREE_ALL, payload: this.treemd});
            this.trailOld[nr] = this.treemd['trail'][nr];
        }
    }

    clickItem(value, nr) {                                                      //reageer op muis kliks, PATH SELECTIE
        this.pictKeuze = false;
        this.pathKeuze = this.shuffleService.getPath(value, nr, this.treemd);
    }

    enterItem(value, nr, nav) {
        this.enter = true;
        if (nav == null) {
            console.log(`=======> NAV ALARM !!!!!!!!!!`);
            console.log(value);
            console.log(this.treemd);
            console.log(`==============================`);
        }
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
                    this.store.dispatch({type: TREE_ALL, payload: this.treemd});
                });
        }
    }

    leaveItem() {                                                               //ga menu item uit
        this.enter = false;
    }

    getStyle1(value, nr) {                                                      //maak gekozen menu item geel
        if (this.treemd['filter'][nr]['menu1'][value] == this.treemd['trail'][nr + 1]) {
            return "yellow";
        }
    }

//___________________________________________________________________________________________________________________
//_________________________________________________________SELECTEREN VAN PICTURES
    interActie(aantal) {                                                        //menu keuze VERPLAATSEN
        this.pathKeuze = this.treemd['trail'][1] + ' ' + this.treemd['trail'][2] + ' ' + this.treemd['trail'][3];
        if (aantal == 1) {
            this.treemd['sourceInfo'] = {files: this.treemd['contents'][this.treemd['path']],
                                         path: this.treemd['path'],
                                         tekst: this.pathKeuze,
                                         nav: this.nav};
        } else {
            this.treemd['goalInfo'] = {files: this.treemd['contents'][this.treemd['path']],
                                       path: this.treemd['path'],
                                       tekst: this.pathKeuze,
                                       nav: this.nav};
        }
        this.store.dispatch({type: TREE_ALL, payload: this.treemd});
    }

    selectPict(value) {                                                         //muis klik, selecteer plaatje
        this.pictKeuze = true;
        this.pictNr = value;
    }

    getStyle2(nr) {                                                             //geef gekozen geselecteerd plaatje rode border
        if (this.treemd['contents'][this.treemd['path']][nr]['sel']) {
            return "solid 6px red";
        }
    }
//___________________________________________________________________________________________________________________
//_________________________________________________________VERPLAATSEN VAN PICTURES
    actionAction() {                                                            //verplaatsen van pictures
        this.extraInfo['action'] = false;                                       //zet actie-knop uit
        this.teller = 0;                                                        //reset de timer
        this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});

        this.body = JSON.stringify({                                            //registreer de source- en goal-informatie
                source: this.treemd['sourceInfo'],
                goal: this.treemd['goalInfo'],
            }
        );
        this.http.post(this.urlWachtTo, this.body)                   //verplaats de pictures
            .subscribe(data => {
                console.log('______________inter shift action');
                console.log(data);
                this.treemd['contents'][data['goalP']] = data['goal'];
                this.treemd['contents'][data['sourceP']] = data['source'];
                this.store.dispatch({type: TREE_ALL, payload: this.treemd});
                this.teller = 0;
            });
    }

    tickerFuncShuffle() {                                                       //timing van de verplaatsings acties
        this.menu(0);
        this.menu(1);
        this.menu(2);

        if (this.teller == 50) {
            this.teller = 0;
        }

        if (!this.ready) {
            this.ready = true;
        }

        if (this.extraInfo['action']) {                                         //verplaats de pictures
            this.actionAction();
        }

        this.teller++;
    }
//_________________________________________________________________________________________________________________
    ngOnInit() {
        this.navItems = NavItems;
        this.enter = true;

        this.timerShuffle = Observable.timer(1000, 500);                      //hier wordt de tijd tik ingesteld
        this.subShuffle = this.timerShuffle
            .subscribe(t => this.tickerFuncShuffle());
    }

    ngOnDestroy() {
        this.subShuffle.unsubscribe();
    }
}
