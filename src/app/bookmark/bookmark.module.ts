import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
// Routes
import { BOOKMARK_ROUTES } from './bookmark.routes';
// Components
import { BookmarkListComponent } from './bookmark-list/bookmark-list.component';
import { BookmarkFormComponent } from './bookmark-form/bookmark-form.component';
// Services
import { BookmarkService } from './bookmark.service';

@NgModule({
  imports: [
    RouterModule.forChild(BOOKMARK_ROUTES),
    SharedModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    BookmarkListComponent,
    BookmarkFormComponent
  ]
})
export class BookmarkModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: BookmarkModule,
      providers: [
        BookmarkService
      ]
    }
  }
}
