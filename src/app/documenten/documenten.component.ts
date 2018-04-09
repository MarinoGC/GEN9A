import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
//import { SIZE_ALL, SIZE_CLEAR } from '../reducers/size.reducer';
import { Observable } from 'rxjs/Observable';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

@Component({
    selector: 'app-documenten',
    templateUrl: './documenten.component.html',
    styleUrls: ['./documenten.component.css'],
    providers: [],
    encapsulation: ViewEncapsulation.Emulated
})
export class DocumentenComponent implements OnInit, OnDestroy {

    term$ = new Subject<string>();

    @ViewChild("formDet", {read: ElementRef}) refForm: ElementRef;

    @Input() extraInfo;
    @Input() aantalVelden;
    @Input() aantalPag;
    @Input() sizeI;
    @Output() pristineMelding: EventEmitter<{ 'show': boolean, 'melding': string, 'pristine': boolean}> = new EventEmitter;

    teksten;
    private subItem: Subscription;
    private timerItem;
    public albummd;

    public topForm: number = 50;

    content1: string = '';
    private contentOld: string = '';
    content2;
    secure: any;
    pristine = true;
    pristinePrev = true;
    private url2_9 = './prepare_1.php';
    private url2_10 = './werk_1.php';
    private url2_11 = './werk_3.php';
    private url_albumMd = './albumMd.php';
    localPageN: number = 0;
    localVeld: number = 0;
    localPage: any;
    private fileName: string = '';
    private s: string;
    public caretPos = 0;
    public imgRestrict = '';
    private counter = 0;
    public show = false;
    private opnemen = false;
    public bevestig = '';

    public volgnr: number;
    private volgnrOld: number;
    public titel: string;
    private titelOld: string;

    constructor(private sanitizer: DomSanitizer,
                private store: Store<any>,
                private http: HttpClient) {
        this.search(this.term$, this.url2_10, 500)
            .subscribe(results => {
                this.generateHTML(results);
            })
    };

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


//________________________________________________________________________
    pristineAnalyse(value: boolean) {
        this.pristine = value;
        if (this.pristine != this.pristinePrev) {
            if (this.pristine) {
                this.pristineMelding.emit({'show': false, 'melding': 'alles OK - oude situatie', 'pristine': this.pristine});
            } else {
                this.pristineMelding.emit({'show': false, 'melding': 'editing mode', 'pristine': this.pristine});
            }
        }
        this.pristinePrev = this.pristine;
    }
//________________________________________________________________________
    generateHTML(results) {
        this.content2 = results;
        this.secure = this.sanitizer.bypassSecurityTrustHtml(this.content2);
        this.pristineAnalyse(this.content1 == this.contentOld);
    }
//________________________________________________________________________
    meldenNr(newVolgnr) {
        this.volgnr = newVolgnr;
        this.pristine = false;
        this.pristineAnalyse(this.volgnr == this.volgnrOld);
//        console.log(this.volgnr);
    }
//________________________________________________________________________
    meldenTitel(newTitel) {
        this.titel = newTitel;
        this.pristine = false;
        this.pristineAnalyse(this.titel == this.titelOld);
//        console.log(this.titel);
    }
//________________________________________________________________________
    selectedPage(value): void {
        if (!this.pristine) {
            this.pristineMelding.emit({'show': true, 'melding': 'PAGE verandering, INFO waarde niet opgeslagen', 'pristine': this.pristine});
        } else {
            this.localPage = value;
            this.selectedNummer(0);
        }
    }

    selectedNummer(value): void {
        if (!this.pristine) {
            this.pristineMelding.emit({'show': true, 'melding': 'INFO verandering, INFO waarde niet opgeslagen', 'pristine': this.pristine});
        } else {
            this.localVeld = value;
            this.s = this.localPage[this.localVeld]['pag'];
            this.localPageN =  Number(this.s);
            this.fileName = this.s + this.localPage[this.localVeld]['veld'] + '.md';
            this.content1 = this.localPage[this.localVeld]['content1'];
            this.term$.next(this.content1);
            this.contentOld = this.content1;
            this.volgnr = this.localPage[this.localVeld]['volgnr'];
            this.volgnrOld = this.volgnr;
            this.titel = this.localPage[this.localVeld]['titel'];
            this.titelOld = this.titel;
        }
    }

    terug(): void {
        this.content1 = this.contentOld;
        this.term$.next(this.content1);
        this.volgnr = this.volgnrOld;
        this.titel = this.titelOld;
        this.pristine = true;
        this.pristinePrev = false;
    }

//___________________________hier de md-file updaten
    nieuw(): void {
        this.http.post(this.url2_11, JSON.stringify({
            content1: this.content1,
            content2: this.content2,
            volgnr: this.volgnr,
            titel: this.titel,
            secure: this.secure,
            pagNu: String(this.localPageN),
            veldNu: String(this.localVeld),
            velden: String(this.aantalVelden),
            pag: String(this.aantalPag)}))
            .subscribe(data => {
                this.teksten = data;
                this.localPage = this.teksten[this.localPageN];
            });
        this.contentOld = this.content1;
        this.volgnrOld = this.volgnr;
        this.titelOld = this.titel;
        this.pristineMelding.emit({'show': false, 'melding': 'alles OK - informatie vernieuwd', 'pristine': true});
        this.pristine = true;
        this.pristinePrev = false;
    }
//____________________________________________________________________
    keuze(value) {
        //      console.log(this.albummd[value]);
        this.show = true;
        this.counter = 0;

        this.imgRestrict = '<img src="' +
            './album/restrict/' +
            this.albummd[value].name +
            '" width="40%" height="auto" align="left" style="margin:10px 10px">';

        this.bevestig = 'Klik op OPNEMEN om de file op te nemen. Klik binnen 10 sec. op de positie in de tekst voor de plaats.'
    }

    geenPict() {
        this.show = false;
        this.opnemen = false;
    }

    welPict() {
        this.show = false;
        this.counter = 0;
        this.opnemen = true;
    }
//____________________________________________________________________
    getCaretPos(oField) {
        if (this.opnemen) {
            if(oField.selectionStart || oField.selectionStart == '0') {
                this.caretPos = oField.selectionStart;
                this.content1 = [ this.content1.slice(0, this.caretPos),
                    this.imgRestrict,
                    this.content1.slice(this.caretPos)].join('');
                this.term$.next(this.content1);
                this.opnemen = false;
            }
        }
    }
//__________________________________________________________________________________________TIMER FUNCTIES
    tickerFuncItem() {
        this.counter++;
        if (this.counter > 10) {
            this.show = false;
        }
        if (this.counter > 10) {
            this.opnemen = false;
        }
        this.topForm = this.refForm.nativeElement.offsetTop;
//        console.log(`formDet: ${this.topForm}`);

    };
//____________________________________________________________________
    ngOnInit() {
        this.timerItem = TimerObservable.create(250, 1000);                      //hier wordt de tijd tik ingesteld
        this.subItem = this.timerItem.subscribe(t => this.tickerFuncItem());

        this.pristineMelding.emit({'show': false, 'melding': 'INIT documenten', 'pristine': true});

        this.http.post(this.url2_9, JSON.stringify({velden: this.aantalVelden, pag: this.aantalPag}))
            .subscribe(data => {
                console.log('________DOC____werk info');
                console.log(data);
                this.teksten = data;
                this.selectedPage(this.teksten[0]);
            });

        this.http.post(this.url_albumMd, 'album')
            .subscribe(abummd => {
//                console.log('________DOC____album info');
                this.albummd = abummd;
//                console.log(this.albummd);

            });
        this.topForm = this.refForm.nativeElement.offsetTop;
    }

    ngOnDestroy() {
        this.subItem.unsubscribe();
    }
}
