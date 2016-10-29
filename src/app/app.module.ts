import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';

import { BookmarkModule } from './bookmark/bookmark.module';
import { SharedModule } from './shared/shared.module';

import { SettingsComponent } from './settings/settings.component';
import { AppComponent } from './app.component';

import { ROUTES } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent
  ],
  imports: [
    RouterModule.forRoot(ROUTES, { useHash: true }),
    BookmarkModule.forRoot(),
    SharedModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
