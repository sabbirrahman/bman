// Imports from @angular
import { Injectable } from '@angular/core';
// Services
import { StorageService } from '../shared/services/storage.service';
import { FileService } from '../shared/services/file.service';

@Injectable()
export class BookmarkService {
  list: Array<any> = [];

  constructor(
    private fileService: FileService,
    private storage: StorageService
  ) { }

  get() {
    if (!this.storage.isSet('bookmarks')) {
      fetch('./assets/js/bookmarks.json')
        .then(res => res.json())
        .then(bookmarks => this.set(bookmarks));
    } else {
      const bookmarks = this.storage.get('bookmarks');
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
    const bookmark = this.list[index];
    if (bookmark.type === 'folder') {
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].parentId === bookmark.id) {
          this.list[i].parentId = bookmark.parentId;
        }
      }
    }
    if (!bookmark.img.match(/^(img\/)/)) {
      this.fileService.deleteFile('img/' + this.list[index].id
                                          + this.list[index].ext);

    }
    this.list.splice(index, 1);
    this.set(this.list);
  }

}
