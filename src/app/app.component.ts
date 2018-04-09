import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Subscription } from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { HttpClient } from '@angular/common/http';
import { EXTRA_ALL } from './reducers/extra.reducer';
import { TREE_ALL } from "./reducers/tree.reducer";
import { ALBUM_ALL } from "./reducers/album.reducer";
import { SIZE_ALL } from './reducers/size.reducer';
import { NavItems } from './models/nav.model';
import { ShuffleService } from './services/shuffle.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ShuffleService]
})
export class AppComponent implements OnInit{

    private loc: string = 'inventarisatie';
    public aantalVelden: number = 20;
    public aantalPag: number = 4;
//    private testDir = 'data';       //zet de copieer directory
    private testDir = '';       //zet de copieer directory

    @ViewChild("topDet", {read: ElementRef}) refTop: ElementRef;
    @ViewChild("boxDetT", {read: ElementRef}) refBoxT: ElementRef;
    @ViewChild("footerDet", {read: ElementRef}) refFooter: ElementRef;

    public correctieFooter = 30;

    private timerMenu;
    private subMenu: Subscription;
    public teller = 1000;
    public teller1 = 1000;
    public teller2 = 1000;

    private subSizeI;
    private subExtra;
    private subTree;
    private subAlbum;
    public sizeI  = {header: 8, boxT: 58, footer: 1000, breedte: 1000, hoogte: 1100};
    public extraInfo;
    public treemd;
    public albummd;

    public ready = false;
    public pristine = true;
    public warn: any;
    public show = false;
    public helpShow = false;
    public trashWarning: boolean;
    private s: string;
    private body: any;

    private breedte = window.innerWidth;
    private hoogte = window.innerHeight;
    private breedteOld = 0;
    private hoogteOld = 0;

    public sizeChange: Subject<any> = new Subject();
    private sizeCounter = 0;

    public navItems: any;

    public melding: string;
    public dataApp: object = {namesPict: []};

    private phase1: number;
    private phase2: number;
    private nummerPrev: number;
    private n: number;
    private nummer: number;
    public secure: any;
    private first1: boolean;
    private first2: boolean;

    private urlSchoon: string = './rawSchoon.php';
    private url5: string = './inventRaw.php';
    private urlUpToDate: string = './setUpToDate.php';
    private url3: string = './trash.php';
    private url2: string = './startFileSolo.php';
    private url4: string = './infoCopyI.php';
    private url4a: string = './showCopy.php';
    private urlDoc: string = './docCopy.php';
    private urlAlbum: string = './readAlbumMd.php';
    private urlHelp: string = './readMdHelp.php';
    private url2_9 = './prepare_1.php';
    private url1: string = './startDir3.php';
    private extraThumb: string[];
    private extraInv: string[];
    public picture = '';
    public bezig = false;

    public publiceer = false;

    private timer1 = TimerObservable.create(100, 500);   //uploaden, boekhouding
    private subtimer1: Subscription;

    private timer2 = TimerObservable.create(100, 5000);   //uploaden, boekhouding
    private subtimer2: Subscription;

    private filter: object[] = [{}, {}, {}];

    constructor(private store: Store<any>,
                private http: HttpClient,
                private shuffleService: ShuffleService,
                private sanitizer: DomSanitizer) {
        this.subTree = store.select('treemd')
            .subscribe(treemd => {
                this.treemd = treemd;
            });
        this.subAlbum = store.select('albummd')
            .subscribe(albummd => {
                this.albummd = albummd;
            });
        this.subSizeI = store.select('sizeI')
            .subscribe(sizeI => {
                this.sizeI = sizeI;
            });
        this.subExtra = store.select('extraInfo')
            .subscribe(extraInfo => {
                this.extraInfo = extraInfo;
            });
   }

//____________________________________________________________NAVIGEER FUNCTIE
    navigate(value) {
        this.helpShow = false;
        if (this.pristine) {
            this.extraInfo['nav'] = value;
            this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});
        } else {
            this.pristineMelding({'show': true, 'melding': 'TYPE verandering, INFO waarde niet opgeslagen', 'pristine': false});
        }
    }

    getStyle(nr) {
        if (this.extraInfo['nav']['type'] == nr) {
            return "yellow";
        }
    }
//______________________________________________________________________________________
    tickerInfo() {
        this.teller2++;

        switch(this.phase2) {
            case 0:
                this.melding = `phase ${this.phase2}: updaten tree info | ${this.teller2}`;
                if (this.first2) {
                    this.first2 = false;
                    this.body = JSON.stringify({loc: this.loc, nav: 'leeg', short: true});
                    this.http.post(this.url1, this.body)
                        .subscribe(data => {
                            console.log(`phase ${this.phase2} | tree-md ververst | ${this.teller2}`);
                            console.log(data);
                            this.first2 = true;
                            this.phase2++;
                        })
                }
                break;

            case 1:
                this.melding = `phase ${this.phase2}: updaten documenten | ${this.teller2}`;
                if (this.first2) {
                    this.first2 = false;
                    this.http.post(this.url2_9, JSON.stringify({velden: this.aantalVelden, pag: this.aantalPag}))
                        .subscribe(data => {
                            console.log(`phase ${this.phase2} | data-md ververst | ${this.teller2}`);
                            console.log(data);
                            this.first2 = true;
                            this.phase2++;
                        });
                }
                break;

            case 2:
                this.melding = `phase ${this.phase2}: publiceren | ${this.teller2}`;
                if (this.first2) {
                    this.first2 = false;
                    this.body = JSON.stringify([this.testDir, {loc: this.loc, werk: 'werk', thumb: 'thumb', md: 'md', album: 'album'}]);
//                    this.body = JSON.stringify({loc: this.loc});
                    this.http.post(this.url4, this.body)
                        .subscribe(data => {
                            console.log(`phase ${this.phase2} | ${data} | ${this.teller2}`);
                            this.first2 = true;
                            this.phase2++;
                        })
                }
                break;
            case 3:
                this.melding = `phase ${this.phase2}: show files | ${this.teller2}`;
                if (this.first2) {
                    this.first2 = false;
                    this.body = JSON.stringify({loc: this.loc, test: this.testDir});
                    this.http.post(this.url4a, this.body)
                        .subscribe(data => {
                            console.log(`phase ${this.phase2} | ${data} | ${this.teller2}`);
                            this.first2 = true;
                            this.phase2++;
                        })
                }
                break;

            case 4:
                this.treemd['contents']['./inventarisatie/'][0]['upToDate'] = false;
                this.store.dispatch({type: TREE_ALL, payload: this.treemd});

                this.melding = `phase ${this.phase2}: afronden | ${this.teller2}`;
                if (this.first1) {
                    this.first1 = false;
                    setTimeout(() =>{
                        this.phase2++;
                        this.first2 = true;
                        this.melding = '';
                        this.subtimer2.unsubscribe();
                        this.publiceer = false;
                        this.melding = '';
                        console.log(`phase ${this.phase2}: ready | ${this.teller2}`);
                    }, 3500)
                }
                break;

            default:
        }
    }
//______________________________________________________________________________________
//_______________________________________HET DUPLICEREN VAN ALLE INFO VOOR EEN ANDER PROGRAMMA
    info(value) {
        this.phase2 = 0;
        this.first2 = true;
        this.melding = value;
        this.teller2 = 0;
        this.publiceer = true;

        this.subtimer2 = this.timer2
            .subscribe(t => this.tickerInfo());

    }
//_______________________________________HET DUPLICEREN VAN DE DOCUMENTEN ALLEEN VOOR EEN ANDER PROGRAMMA
    infoDoc(value) {
        this.melding = value;
        this.body = JSON.stringify([this.testDir, {loc: this.loc, werk: 'werk', album: 'album'}]);
        this.http.post(this.urlDoc, this.body)
            .subscribe(data => {
                console.log(`${data}`);
                this.melding = '';
            })
    }
//____________________________________________________________________________________
    onUploaded(value) {                                //melding vanaf HOME, dat er files zijn gedownload
       console.log('_________________________files uploaded');
       console.log(value);
        this.phase1 = 0;
        this.first1 = true;
        this.melding = value;
        this.teller1 = 0;

        this.subtimer1 = this.timer1
            .subscribe(t => this.tickerUpload());
    }
//______________________________________________________________________________________
//______________________________________________________________________________________
    tickerUpload() {
        this.teller1++;

        switch(this.phase1) {

            case 0:                         //het schonen van de RAW directory, alleen jpg en png files
                this.melding = `phase ${this.phase1}: schonen van RAW directory | ${this.teller1}`;
                if (this.first1) {
                    this.first1 = false;
                    console.log(`phase ${this.phase1}: schonen van RAW directory | ${this.teller}`);
                    this.body = JSON.stringify({goal: 'raw'});
                    this.http.post(this.urlSchoon, this.body)
                        .subscribe(data => {
                            // console.log(`volbracht => schonen van RAW`);
                            // console.log(data);
                            this.phase1++;
                            this.first1 = true;
                        })
                }
                break;

            case 1:                         //wees files verwijderen en ontbrekende files inventariseren
                this.melding = `phase ${this.phase1}: discard orphan files | ${this.teller1}`;
                if (this.first1) {                                   //eenmalig uitvoeren
                    this.first1 = false;
                    console.log(`phase ${this.phase1}: discard orphan files | ${this.teller}`);
                    this.body = JSON.stringify({source: 'raw', goal1: 'inventarisatie', goal2: 'thumb'});
                    this.http.post(this.url5, this.body)
                        .subscribe(data => {
                            // console.log(`volbracht => extra THUMB en INVENTARISATIE`);
                            // console.log(data);
                            this.extraThumb = data['writeThumb'];
                            this.extraInv = data['writeInv'];
                            this.phase1++;
                            this.first1 = true;
                        });
                }
                break;

            case 2:                         //ontbrekende inventarisatie files toevoegen
                if (this.first1) {
                    this.nummerPrev = -1;
                    this.nummer = 0;
                    this.first1 = false;
                }
                this.melding = `phase ${this.phase1}: make new INVENTARISATIE files | ${this.teller1}`;
                if (this.extraInv.length > 0) {
                    this.bezig = true;
                    if (this.nummerPrev != this.nummer) {           //elk nummer eenmaal uitvoeren
                        this.nummerPrev = this.nummer;
                        this.body = JSON.stringify({
                            source: '/raw/',
                            goal: '/inventarisatie/wachtkamer/',
                            file: this.extraInv[this.nummer],
                            verticalRes: 1200,
                            number: this.nummer
                        });
                        this.http.post(this.url2, this.body)
                            .subscribe(data => {
                                this.picture = './inventarisatie/wachtkamer/' + this.extraInv[this.nummer];
                                console.log(`picture: ${this.extraInv[this.nummer]} | ${this.nummer}`);
                                this.nummer++;
                                if (this.nummer >= this.extraInv.length) {   //alle files verwerkt
                                    this.phase1++;
                                    console.log(`volbracht => ontbrekende INV files toegevoegd`);
                                    this.first1 = true;
                                }
                            });
                    }
                } else {
                    this.phase1++;
                    this.first1 =true;
                }
                break;

            case 3:                         //ontbrekende thumb files toevoegen
                if (this.first1) {
                    this.nummerPrev = -1;
                    this.nummer = 0;
                    this.first1 = false;
                }
                this.melding = `phase ${this.phase1}: make new THUMB files | ${this.teller1}`;
                if (this.extraThumb.length > 0) {
                    this.bezig = true;
                    if (this.nummerPrev != this.nummer) {
                        this.nummerPrev = this.nummer;
                        this.body = JSON.stringify({
                            source: '/raw/',
                            goal: '/thumb/',
                            file: this.extraThumb[this.nummer],
                            verticalRes: 120,
                            number: this.nummer
                        });
                        this.http.post(this.url2, this.body)
                            .subscribe(data => {
                                this.picture = './thumb/' + this.extraThumb[this.nummer];
                                console.log(`picture: ${this.extraThumb[this.nummer]} | ${this.nummer}`);
                                this.nummer++;
                                if (this.nummer >= this.extraThumb.length) {
                                    this.phase1++;
                                    console.log(`volbracht => ontbrekende THUMB files toegevoegd`);
                                    this.first1 = true;
                                }
                            });
                    }
                } else {
                    this.phase1++;
                    this.first1 = true;
                }
                break;

            case 4:                                                 //zet ALLE upToDate's op false
                this.melding = `phase ${this.phase1}: reset node files | ${this.teller1}`;
                if (this.first1) {
                    this.first1 = false;
                    this.body = JSON.stringify({inv: 'inventarisatie'});
                    this.http.post(this.urlUpToDate, this.body)
                        .subscribe(data => {
                            console.log(`phase ${this.phase1}: reset node files | ${this.teller}`);
                            this.phase1++;
                            this.first1 = true;
                        })
                }
                break;

            case 5:
                this.treemd['contents']['./inventarisatie/wachtkamer/'][0]['upToDate'] = false;                    this.store.dispatch({type: TREE_ALL, payload: this.treemd});
                this.store.dispatch({type: TREE_ALL, payload: this.treemd});

                this.melding = `phase ${this.phase1}: afronden | ${this.teller1}`;
                if (this.first1) {
                    this.first1 = false;
                    console.log(`phase ${this.phase1}: ready | ${this.teller}`);
                    setTimeout(() =>{
                        this.phase1++;
                        this.first1 = true;
                        this.melding = '';
                        console.log(`phase ${this.phase1}: discard timer  | ${this.teller1}`);
                        this.subtimer1.unsubscribe();
                        this.bezig = false;
                    }, 3500)
                }
                break;

            default:
        }
    }
//____________________________________________________________________________________
    pristineMelding(value) {                                //melding over saving
//        console.log(value);
        this.pristine = value['pristine'];
        this.warn = value['melding'];
        if (value['show']) {
            this.show = true;
            setTimeout(() => {
                this.show = false;
            }, 3000);
        }
    }
//______________________________________________________________________________________
    newAlbum(value) {
        console.log('___________album melding_____________');
        console.log(value);
        this.navigate(this.navItems[7]);    // eerst even naar de lege pagina
        setTimeout(() => {
            this.navigate(this.navItems[5]);   // en dan weer terug naar ALBUM
        }, 200)
    }
//________________________________________KNOPPEN VOOR DE SHUFFLE-FUNCTIE
    inter() {
        this.extraInfo['inter'] = !this.extraInfo['inter'];
        this.extraInfo['action'] = false;
        this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});
    }

    action() {
        this.extraInfo['action'] = true;
        this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});
    }

    wacht(value) {
        if (value == 0) {
            this.extraInfo['inter'] = !this.extraInfo['inter'][0];
        }                                                                               //inter: verplaatsen tusen directories
        if (value == 1) {
            this.extraInfo['action'] = true;
        }                                                                               //actie: verplaats tussen directories
        console.log(this.extraInfo['inter']);
        this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});
    }
//_______________________________________________________________
    help() {
        this.helpShow = !this.helpShow;
        if (this.helpShow) {
            this.body = JSON.stringify({name: this.extraInfo['nav']['name']});
            this.http.post(this.urlHelp, this.body)
                .subscribe(data => {
                    this.secure = this.sanitizer.bypassSecurityTrustHtml(data['content2']);
//                    console.log('____________________help______________________');
//                    console.log(data);
                });
        }
    }
//______________________________________________________TRASH
    trash(value) {
        this.trashWarning = (value == 0);
        if (value == 1) {
            this.s = '/' + this.loc + '/trash/';
            this.body = JSON.stringify({loc: this.s,
                files: this.treemd['contents']['.' + this.s],
                md: '/md/',
                thumb: '/thumb/',
                trash: '/trash/',
                raw: '/raw/'});
            this.http.post(this.url3, this.body)
                .subscribe(data => {
                    console.log(data);
                    this.treemd['contents']['./inventarisatie/trash/'][0]['upToDate'] = false;
                    this.store.dispatch({type: TREE_ALL, payload: this.treemd});
                    this.onUploaded('TRASH');
                })
        }
    }

//______________________________________________________________________________________
    sizeGeg() {
        this.breedte = window.innerWidth;
        this.hoogte = window.innerHeight;

        if ((this.breedte != this.breedteOld) || (this.hoogte != this.hoogteOld)) {
            this.sizeI = {
                'header': this.refTop.nativeElement.offsetTop,
                'boxT': this.refBoxT.nativeElement.offsetTop,
                'footer': this.hoogte - this.correctieFooter,
                'breedte': this.breedte,
                'hoogte': this.hoogte,
            };

            this.store.dispatch({type: SIZE_ALL, payload: this.sizeI});
            this.sizeChange.next(this.sizeCounter);
            this.sizeCounter++;
            this.breedteOld = this.breedte;
            this.hoogteOld = this.hoogte;
            if(!this.ready) {
                this.ready = true;
            }
        }

    }
//_____________________________________________________________________
    tickerFunc() {
        //______________________geregeld kijken of de dimensies nog kloppen
        this.teller++;
        if (this.teller > 10) {
            this.teller = 0;
            this.sizeGeg();
        }
    }

//_//__________________________________INIT: initiaties voor treemd
    init() {
        this.body = JSON.stringify({loc: this.loc, nav: 'leeg', short: false});
        this.http.post(this.url1, this.body)
            .subscribe(data => {
                this.treemd = data;
                console.log('____________________app______________________init()');
                console.log(data);
                this.treemd['filter'] = this.filter;
                this.treemd['filter'][0] = this.filter[0];
                this.treemd['trail'] = [this.loc, '', '', ''];
                this.filter[0] = this.shuffleService.filterTree1(data, this.treemd['trail'][0]);
                this.treemd['sourceInfo'] = {files: [], path: '', tekst: '', nav: ''};                         //sourceInfo & goalInfo moeten gedefinieerd worden.
                this.treemd['goalInfo'] = {files: [], path: '', tekst: '', nav: ''};
                this.treemd['selectPict'] = {name: '', nr: 0, subTree: [{'upToDate': false}]};
                this.store.dispatch({type: TREE_ALL, payload: this.treemd});
                this.first1 = true;
            });
    }
//__________________________________INIT: initiaties voor albummd
    initAlbum() {
        this.body = JSON.stringify({loc: '/album/restrict/album.md'});
        this.http.post(this.urlAlbum, this.body)
            .subscribe(data => {
                this.albummd = data;
                console.log('____________________album______________________');
                console.log(data);
                this.store.dispatch({type: ALBUM_ALL, payload: this.albummd});
            });
    }
//_____________________________________________________________________
//_____________________________________________________________________
    ngOnInit() {
        this.timerMenu = TimerObservable.create(100,50);       //hier wordt de tijd tik tijd ingesteld
        this.subMenu = this.timerMenu.subscribe(t => this.tickerFunc());

        this.ready = false;

        this.navItems = NavItems;
        this.extraInfo = {
            'nav': this.navItems[0],
            'path': 'init',
            'inter': false,
            'action': false,
            'wissel': false,
        };
        this.store.dispatch({type: EXTRA_ALL, payload: this.extraInfo});

        this.init();
        this.initAlbum();
    }

}
