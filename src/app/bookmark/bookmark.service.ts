import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
// Services
import { StorageService } from '../shared/services/storage.service';
import { FileService } from '../shared/services/file.service';

@Injectable()
export class BookmarkService {
  list: Array<any> = [];

  constructor(
    private fileService: FileService,
    private storage: StorageService,
    private http: Http
  ) { }

  get() {
    if (!this.storage.isSet('bookmarks')) {
      this.http.get('./assets/js/bookmarks.json')
          .map(res => res.json())
          .subscribe((bookmarks) => {
            this.set(bookmarks);
          });
    } else {
      let bookmarks = this.storage.get('bookmarks');
      this.set(bookmarks);
      return bookmarks;
    }
  }

  set(bookmarks?) {
    this.list = bookmarks || this.list;
    this.storage.set('bookmarks', bookmarks);
  }

  add(bookmark) {
    this.list.push(bookmark);
    this.set(this.list);
  }

  save(bookmark, index) {
    this.list[index] = bookmark;
    this.set(this.list);
  }

  delete(index) {
    let bookmark = this.list[index];
    if(bookmark.type == 'folder'){
      for(var i=0; i < this.list.length; i++){
        if(this.list[i].parentId === bookmark.id){
          this.list[i].parentId = bookmark.parentId;
        }
      }
    }
    if(!bookmark.img.match(/^(img\/)/))
        this.fileService.deleteFile("img/" + this.list[index].id
                                           + this.list[index].ext);
    this.list.splice(index, 1);
    this.set(this.list);
  }

}
