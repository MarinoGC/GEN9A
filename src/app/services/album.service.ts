import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ALBUM_ALL } from "../reducers/album.reducer";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AlbumService {

    private subAlbum;
    public albummd;
    private el;
    private n: number;
    private m: number;
    private l: number;
    private klaar: boolean;
    private url_albumWrite = './albumWrite.php';
    private url_albumWis = './albumWis.php';

    constructor(private store: Store<any>,
                private http: HttpClient) {
        this.subAlbum = store.select('albummd')
            .subscribe(albummd => {
                this.albummd = albummd;
            });
    }

//_________________________________________________________________________________________
    pictActie(multi, id) {
        this.l = Object.keys(this.albummd).length;
        switch (multi) {
            case 1:                                                                         //toggle selected
                this.albummd[id]['sel'] = !this.albummd[id]['sel'];
                break;
            case 2:
                this.klaar = false;
                while (!this.klaar) {
                    this.klaar = true;
                    for (this.m = 0; this.m < this.l; this.m++) {
                        if (this.albummd[this.m]['sel']) {
                            this.klaar = false;
                            this.albummd[this.m]['sel'] = false;
                            this.shift(this.albummd[this.m]['id'], this.albummd[id]['id']);
                        }
                    }
                }
                break;
            case 3:
                this.klaar = false;
                if (!this.albummd[id]['sel']) {
                    for (this.n = id; this.n < this.l; this.n++) {
                        if (!this.klaar) {
                            this.klaar = (this.albummd[this.n]['sel'] == true);
                            this.albummd[this.n]['sel'] = true;
                        }
                    }
                }
                break;
            default:
        }
        this.writeMd();
    }

//_________________________________________________________________________________________
    shift(i: number, j: number) {
        if (i < j) {
            for (this.n = i; this.n < j; this.n++) {
                this.swap(this.n, this.n + 1);
            }
        }
        if (i > j) {
            for (this.n = i; this.n > j; this.n--) {
                this.swap(this.n, this.n - 1);
            }
        }
        for (this.n = 0; this.n < this.l; this.n++) {
            this.albummd[this.n]['id'] = this.n;
        }
    }

//_________________________________________________________________________________________
    swap(a: number, b: number) {
        this.el = this.albummd[a];
        this.albummd[a] = this.albummd[b];
        this.albummd[b] = this.el;
    }

//_________________________________________________________________________________________
    writeMd() {
        this.http.post(this.url_albumWrite, {'loc': './album/restrict/', 'info': this.albummd})
            .subscribe(result => {
                console.log(result);
                this.store.dispatch({type: ALBUM_ALL, payload: this.albummd});
            })
    }
//_________________________________________________________________________________________
    deselect() {
        this.l = Object.keys(this.albummd).length;
        for (this.n = 0; this.n < this.l; this.n++) {
            this.albummd[this.n]['sel'] = false;
        }
        this.writeMd();
    }
//_________________________________________________________________________________________
    wis() {
        this.http.post(this.url_albumWis, 'album')
            .subscribe(albummd => {
                this.albummd = albummd;
//                console.log(this.albummd);
                this.store.dispatch({type: ALBUM_ALL, payload: this.albummd});
            })
    }
}

