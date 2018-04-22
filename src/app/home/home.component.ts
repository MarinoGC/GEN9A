import { Component, EventEmitter, ViewEncapsulation, OnInit, OnDestroy, Input } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [DataService],
    encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent implements OnInit, OnDestroy {

    @Input() sizeI;

    constructor() { }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

}
