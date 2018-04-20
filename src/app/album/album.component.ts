import { Component, OnInit, OnDestroy, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ALBUM_ALL, albummd} from "../reducers/album.reducer";
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AlbumService } from '../services/album.service';
import 'rxjs/add/operator/bufferTime';

@Component({
    selector: 'app-album',
    templateUrl: './album.component.html',
    styleUrls: ['./album.component.css'],
    providers: [AlbumService],
    encapsulation: ViewEncapsulation.Emulated,
})
export class AlbumComponent implements OnInit, OnDestroy {

    @Input() extraInfo;
    @Input() treemd;
    @Input() sizeI;

    @Output() newAlbum: EventEmitter<{'reload': boolean, 'melding': string}> = new EventEmitter;
    click$ = new Subject;
    werk;

    private subItem: Subscription;
    private timerItem;
    public albummd;

    private url_albumMd = './albumMd.php';
    private counter = 0;
    public show = false;
    public sure = false;

    private multi: number = 0;
    private pictNr: number;
    public pictSel = '';

    constructor(private store: Store<any>,
                private http: HttpClient,
                private albumService: AlbumService) {
        this.werk = this.click$            //lees het aantal clicks, de optelling eindigt na de wachtijd pauze
            .bufferTime(800)              //vrij lang i.v.m. iPad, die anders gaat zoomen
            .map(data => (data.length))
            .subscribe(data => {
                if (data > 0) {
                    this.multi = this.multi + data;
                } else {
                    if (this.multi > 0) {
                        if (this.multi < 4) {
                            this.albumService.pictActie(this.multi, this.pictNr);
                        } else {
                            this.show = true;
                            this.counter = 0;
                        }
                        this.multi = 0;
                    }
                }
            });
    }

//___________________________________________________________________________________________________________________
//_________________________________________________________ALGEMEEN
    getStyle(value) {                                                      //maak gekozen menu item geel
        if (value['sel']) {
            return "solid 6px red";
        } else {
            return "solid 6px white";
        }
    }

//___________________________________________________________________________________________________________________
    getMd() {
        this.http.post(this.url_albumMd, 'album')
            .subscribe(albummd => {
                this.albummd = albummd;
//                console.log(this.albummd);
                this.store.dispatch({type: ALBUM_ALL, payload: this.albummd});
            })
    }
//___________________________________________________________________________________________________________________
    verwijder1() {
        this.show = false;
        this.sure = true;
        this.counter = 0;
    }
//___________________________________________________________________________________________________________________
    verwijder2() {
        this.albumService.wis();
        this.sure = false;
        //om de pagina te vernieuwen is ee drastische manier nodig: eerst naar een lege pagina (7) en dan terug via APP
        setTimeout(() => {
            this.newAlbum.emit({'reload': true, 'melding': 'ALBUM vernieuwd'});
        }, 500);
    }
//___________________________________________________________________________________________________________________
    deselect() {
        this.albumService.deselect();
    }
//__________________________________________________________________________________________TIMER FUNCTIES
    tickerFuncItem() {
        this.counter++;

        if (this.counter > 10) {
            this.show = false;
            this.sure = false;
        }
    };
//___________________________________________________________________________________________________________________
    keuze(val) {
        this.pictSel = val['name'];
        this.pictNr = val['id'];
    }

    ngOnInit() {
        this.timerItem = TimerObservable.create(250, 1000);                      //hier wordt de tijd tik ingesteld
        this.subItem = this.timerItem.subscribe(t => this.tickerFuncItem());

        this.getMd();
    }

    ngOnDestroy() {
        this.subItem.unsubscribe();
    }
}
