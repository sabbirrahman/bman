// Import from @angular
import { Routes } from '@angular/router';
// Router Componets
import { BookmarkListComponent } from './bookmark-list/bookmark-list.component';
import { BookmarkFormComponent } from './bookmark-form/bookmark-form.component';

export const BOOKMARK_ROUTES: Routes = [
  { path: ''                , component: BookmarkListComponent },
  { path: 'folder'          , component: BookmarkListComponent },
  { path: 'folder/:folderId', component: BookmarkListComponent },
  { path: 'edit/:index',      component: BookmarkFormComponent },
  { path: 'add',              component: BookmarkFormComponent }
];
