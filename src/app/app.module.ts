import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { environment } from './../environments/environment';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { treemd } from './reducers/tree.reducer';
import { albummd } from './reducers/album.reducer';
import { extraInfo } from './reducers/extra.reducer';
import { sizeI } from './reducers/size.reducer';

import { AppComponent } from './app.component';
import { AlbumComponent } from './album/album.component';
import { DirectoryComponent } from './directory/directory.component';
import { DocumentenComponent } from './documenten/documenten.component';
import { ItemComponent } from './item/item.component';
import { ShuffleComponent } from './shuffle/shuffle.component';
import { TreeComponent } from './tree/tree.component';
import { HomeComponent } from './home/home.component';


@NgModule({
    declarations: [
        AppComponent,
        AlbumComponent,
        DirectoryComponent,
        DocumentenComponent,
        ItemComponent,
        ShuffleComponent,
        TreeComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        StoreModule.forRoot({albummd, sizeI, treemd, extraInfo}),
        !environment.production ? StoreDevtoolsModule.instrument({maxAge: 25}) : []
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
