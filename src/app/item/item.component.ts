import { Component, ViewChild, OnInit, OnDestroy, Input, Output, EventEmitter, ViewEncapsulation, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavItems, KEY_CODE } from '../models/nav.model';
import { Store } from '@ngrx/store';
import { EXTRA_ALL } from '../reducers/extra.reducer';
import { TREE_ALL } from "../reducers/tree.reducer";
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.css'],
    providers: [],
    encapsulation: ViewEncapsulation.Emulated
})
export class ItemComponent implements OnInit, OnDestroy {

    @Input() extraInfo;
    @Input() treemd;
    @Output() pristineMelding: EventEmitter<{'show': boolean, 'melding': string, 'pristine': boolean}> = new EventEmitter;
    @ViewChild('formRef') form;

    tit1$ = new Subject<string>();
    tit2$ = new Subject<number>();
    term$ = new Subject<string>();

    private subItem: Subscription;
    private timerItem;
    private subSizeI;

    hideLow: boolean = false;
    hideHigh: boolean = false;
    private lengte: number;
    private nr: number;
    private navItems: any;
    public sizeI;

    public secure: any;
    public pristine = true;
    private pristinePrev = true;

    public title1: string = '';
    public alpha: number = 100;
    public inhoud: string = '';
    public extra;
    private title1Old: string = '';
    private alphaOld: number = 100;
    private inhoudOld: string = '';
    private extraOld;
    private checkedAlpha: number;
//    public listTitle2 = ['1', '2', '3', '4'];

    private url3 = './writeMd.php';
    private url4 = './readMd.php';
    private url2_10 = './werk_1.php';
    private url_albumF = './albumFile.php';
    private body: any;
    private counter = 0;
    public show = false;
    public melding = '';

    constructor(private store: Store<any>,
                private sanitizer: DomSanitizer,
                private http: HttpClient) {
        this.subSizeI = store.select('sizeI')
            .subscribe(sizeI => {
                this.sizeI = sizeI;
            });
        this.search(this.term$, this.url2_10, 500)
            .subscribe(results => {
                this.extra = results;
                this.secure = this.sanitizer.bypassSecurityTrustHtml(this.extra);
                this.testPristine(this.inhoud, this.inhoudOld);
            });
        this.tit1$
            .subscribe(results => {
                this.testPristine(this.title1, this.title1Old);
            });
        this.tit2$
            .subscribe(results => {
                this.testPristine(this.alpha, this.alphaOld);
            });
    }

//_____________________________________________PRISTINE MELDING__________
    testPristine(val1, val2) {
        this.pristine = (val1 == val2);
        if (this.pristine != this.pristinePrev) {
            if (this.pristine) {
                this.pristineMelding.emit({'show': true, 'melding': 'alles OK - oude situatie', 'pristine': this.pristine});
            } else {
                this.pristineMelding.emit({'show': false, 'melding': 'editing mode', 'pristine': this.pristine});
            }
        }
        this.pristinePrev = this.pristine;
    }
//_____________________________________________MARKDOWN, vertraagd__________
    search(terms: Observable<string>, URL: string, delayMs) {
        return terms
            .debounceTime(delayMs)
            .distinctUntilChanged()
            .switchMap(term => this.rawsearch(term, URL))
    }

    rawsearch (term: string, URL: string) {
        return this.http.post(URL, term)
    }
//_____________________________________________________________VERANDEREN VAN PICTURE EN TERUG NAAR OVERZICHT
    change(value) {                                                         //naar eerder of later picture
        if (!this.pristine) {
            this.pristineMelding.emit({'show': true, 'melding': 'INFO verandering, INFO waarde niet opgeslagen', 'pristine': false});
        } else {
            this.nr = this.nr + value;

            if (this.nr > this.lengte) {
                this.nr--;
            }
            this.hideHigh = (this.nr >= this.lengte);

            if (this.nr < 1) {
                this.nr++;
            }                           //positie 0 bevat upToDate informatie
            this.hideLow = (this.nr <= 1);

            this.treemd['selectPict']['name'] = this.treemd['selectPict']['subTree'][this.nr]['name'];
            this.treemd['selectPict']['nr'] = this.nr;

            this.extraInfo['path'] = this.treemd['path'] + '  =>  ' + this.treemd['selectPict']['name'];
            this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});

            this.readMD();
        }
    }

    stop() {                                                                //terug naar tree-component
        if (!this.pristine) {
            this.pristineMelding.emit({'show': true, 'melding': 'TYPE verandering, INFO waarde niet opgeslagen', 'pristine': false});
        } else {
            this.extraInfo['nav'] = this.navItems[1];
            this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});
        }
    }
//____________________________voor up/down/left/right toetsen__________________
    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
//        console.log(event);
        if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
            this.change(1);
        }
        if (event.keyCode === KEY_CODE.LEFT_ARROW) {
            this.change(-1);
        }
        if (event.keyCode === KEY_CODE.UP_ARROW) {
            this.stop();
        }
        if (event.keyCode === KEY_CODE.ENTER) {
            this.album();
        }
    }
//________________________________________________________LEZEN VAN EN SCHRIJVEN NAAR MD-FILES
    writeMD() {
        this.body = JSON.stringify({
            md: this.treemd['selectPict']['name'],
            info: this.treemd['itemInfo'],
            path: this.treemd['path']
        });
        this.http.post(this.url3, this.body)
            .subscribe(data => {
                console.log(data);
            });
    }

    readMD() {
        this.body = JSON.stringify({md: this.treemd['selectPict']['name']});
        this.http.post(this.url4, this.body)
            .subscribe(data => {
                this.title1 = data['title1'];
                this.alpha = data['alpha'];
                this.inhoud = data['inhoud'];
                this.extra = data['extra'];
//                console.log(`data => title = ${this.title1} ||  alpha = ${this.alpha} ||  inhoud = ${this.inhoud} ||  extra = ${this.extra}`);
                this.bevestig();
                this.store.dispatch({type: TREE_ALL, payload: this.treemd});
                this.term$.next(this.inhoud);
                this.pristine = true;
            });
    }
//__________________________________________________________________________________________TIMER FUNCTIES
    onSelectItem(i: number) {
        this.checkedAlpha = i;
//        console.log(i);
    }

    isChecked(i: number) {
        console.log("i:", i," checked: ", this.checkedAlpha);
    }
//__________________________________________________________________________________________TIMER FUNCTIES
    tickerFuncItem() {
        this.counter++;
        if (this.counter > 5) {
            this.show = false;
        }
        if ((this.title1 != this.title1Old) ||
            (this.alpha != this.alphaOld) ||
            (this.inhoud != this.inhoudOld))  {
            this.pristine = false;
        } else {
            this.pristine = true;
        }
    };

//___________________________________________________________________________________ADMINISTRATIEF
    nieuw(): void {
        this.bevestig();
        this.treemd['itemInfo'] = {title1: this.title1, alpha: this.alpha, inhoud: this.inhoud, extra: this.extra};
        this.store.dispatch({type: TREE_ALL, payload: this.treemd});
        this.writeMD();
        this.pristineMelding.emit({'show': false, 'melding': 'INFO geschreven', 'pristine': true});
        this.pristine = true;
        this.pristinePrev = false;
    }

    bevestig() {
        this.title1Old = this.title1;
        this.alphaOld = this.alpha;
        this.inhoudOld = this.inhoud;
        this.extraOld = this.extra;
    }

    reset(): void {
        this.title1 = this.title1Old;
        this.alpha = this.alphaOld;
        this.inhoud = this.inhoudOld;
        this.extra = this.extraOld;
        this.secure = this.sanitizer.bypassSecurityTrustHtml(this.extra);
        this.pristineMelding.emit({'show': false, 'melding': 'RESET INFO', 'pristine': true});
        this.pristine = true;
        this.pristinePrev = false;
    }

    album() {
        this.body = JSON.stringify(this.treemd['selectPict']);
        this.http.post(this.url_albumF, this.body)
            .subscribe(data => {
//                console.log(data);
                this.counter = 0;
                this.show = true;
                this.melding = data['name'] + data['melding'];
            })
    }

//_________________________________________________________________________________
    ngOnInit() {
        this.pristineMelding.emit({'show': false, 'melding': 'INIT photo item', 'pristine': true});

        this.timerItem = TimerObservable.create(250, 1000);                      //hier wordt de tijd tik ingesteld
        this.subItem = this.timerItem.subscribe(t => this.tickerFuncItem());

        this.lengte = this.treemd['selectPict']['subTree'].length - 1;
        this.nr = this.treemd['selectPict']['nr'];
        this.hideHigh = (this.nr >= this.lengte);
        this.hideLow = (this.nr <= 1);
        this.navItems = NavItems;

        this.readMD();
    }

    ngOnDestroy() {
        this.subItem.unsubscribe();
    }
}
