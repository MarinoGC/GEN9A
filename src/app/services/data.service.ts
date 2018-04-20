import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// import { KunstItems, KunstType } from '../models/nav.model';

@Injectable()
export class DataService {

    constructor(private sanitizer: DomSanitizer) {
    }

    private w = 0;
    private wl = 0;
//    private werkPlus: any[];
    private werkItem: any;

    addSecurity(value) {
        this.werkItem = {
            'secure': this.sanitizer.bypassSecurityTrustHtml((value)),
            'new': value
        };
        return this.werkItem;
    }


        /*
            addInfo(old, value) {
                this.werkPlus = old;
                this.wl = old.length;
                for (this.w = 0; this.w < this.wl; this.w++) {
                    this.werkItem = this.sanitizer.bypassSecurityTrustHtml(value);
                    this.werkPlus.push(this.werkItem);
                }
                return this.werkPlus;
            }
        */

}
