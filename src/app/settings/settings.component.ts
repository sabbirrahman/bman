import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
// Services
import { ValidatorService } from '../shared/services/validator.service';
import { BookmarkService } from '../bookmark/bookmark.service';
import { StorageService } from '../shared/services/storage.service';
import { ConfigService } from '../shared/services/config.service';
import { FileService } from '../shared/services/file.service';
import { UtilService } from '../shared/services/util.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  errMsg: string;

  constructor(
    private bookmarkService: BookmarkService,
    private fileService: FileService,
    private storage: StorageService,
    private config: ConfigService,
    private util: UtilService,
    private router: Router
  ) { }

  // Export Bookmarks & Configuration:
  export() {
    const zip = new JSZip();
    zip.file('bookmarks.json', JSON.stringify(this.bookmarkService.get()));
    zip.file('config.json'   , JSON.stringify(this.config.get()));
    const img = zip.folder('img');
    const httpConfig = { url : '' };

    for (let i = 0; i < this.bookmarkService.list.length; i++) {
      httpConfig.url = this.bookmarkService.list[i].img.substr(1);
      if (httpConfig.url.match(/^(.\/assets\/img\/)/)) { continue; }
      fetch(httpConfig.url)
          .then(res => res.arrayBuffer())
          .then((data) => {
            const fileName = this.bookmarkService.list[i].id + this.bookmarkService.list[i].ext;
            img.file(fileName, data, {binary: true});
          });
    }

    httpConfig.url = this.config.wallpaper.link.substr(1);
    if (!httpConfig.url.match(/^(.\/assets\/img\/)/)) {
      fetch(httpConfig.url)
          .then(res => res.arrayBuffer())
          .then((data) => {
            const fileName = this.config.wallpaper.name + '.jpg';
            img.file(fileName, data, { binary: true });
          });
    }

    const save = () => {
      const content = zip.generate({ type: 'blob' });
      FileSaver.saveAs(content, 'b-man.backup');
    };

    setTimeout(save, 2000);
  }

  // Import Bookmarks & Configuration:
  import(backup) {
    if (!backup.files || !backup.files[0]) { return; }
    if (!backup.files[0].name.match(/(backup)$/)) {
      this.errMsg = 'Invalid Backup File!';
      return;
    }
    const fr = new FileReader();

    fr.onloadend = () => {
      const zip = new JSZip(fr.result);

      // Configs
      const newConf = JSON.parse(zip.file('config.json').asText());
      if (!newConf.wallpaper.link.match(/^(.\/assets\/img\/)/)) {
        if (!this.config.wallpaper.link.match(/^(\/assets\/img\/)/)) {
          this.fileService.deleteFile('img/' + this.config.wallpaper.name + '.jpg');
        }
        const fileName = newConf.wallpaper.name + '.jpg';
        const blob = new Blob([zip.file('img/' + fileName).asArrayBuffer()]);
        this.fileService.upload(blob, 'img/' + fileName);
      }
      this.config.set(newConf);

      // Bookmarks
      const newBookmarks = JSON.parse(zip.file('bookmarks.json').asText());
      for (let i = 0; i < newBookmarks.length; i++) {
        const result = this.bookmarkService.list.filter(function(obj) {
          return obj.link === newBookmarks[i].link;
        });
        if (result.length < 1) {
          const bookmark = newBookmarks[i];
          this.bookmarkService.list.push(bookmark);
          if (!bookmark.img.match(/^(.\/assets\/img\/)/)) {
            const fileName = bookmark.id + bookmark.ext;
            const blob = new Blob([zip.file('img/' + fileName).asArrayBuffer()]);
            this.fileService.upload(blob, 'img/' + fileName);
          }
        }
      }
      this.bookmarkService.set(this.bookmarkService.list);
      this.router.navigate(['/folder']);
    };

    fr.readAsArrayBuffer(backup.files[0]);
  }

  // Import Bookmarks from Chrome
  importFromChrome() {
    const bookmark = {
      id: '',
      parentId: '',
      date: new Date(),
      link: '',
      img: '',
      type: '',
      rgb: '',
      name: '',
      ext : '.png',
      a: 0.75
    };
    const rgb = ['119, 119, 119', '175, 200, 238', '213, 244, 226'];
    let str = '[';
    let counterB = 0;
    let counterF = 0;
    const getBookmarks = (bookmarks, parentId) => {
      for (let i = 0; i < bookmarks.length; i++) {
        bookmark.id       = this.util.generateRandomString(8);
        bookmark.name     = bookmarks[i].title;
        bookmark.parentId = parentId;
        bookmark.date  = new Date();
        if (bookmarks[i].url) {
          bookmark.link     = bookmarks[i].url;
          bookmark.rgb      = rgb[counterB];
          bookmark.img      = './assets/img/asdjklha' + counterB + '.png';
          bookmark.type     = 'bookmark';
          str += JSON.stringify(bookmark) + ',';
          counterB = (counterB === 2) ? 0 : ++counterB;
        } else if (bookmarks[i].children) {
          bookmark.link     = '#/folder/' + bookmark.id;
          bookmark.rgb      = rgb[counterF];
          bookmark.img      = './assets/img/alsdhlas' + counterF + '.png';
          bookmark.type     = 'folder';
          str += JSON.stringify(bookmark) + ',';
          counterF = (counterF === 2) ? 0 : ++counterF;
          getBookmarks(bookmarks[i].children, bookmark.id || '');
        }
      }
    };
    chrome.bookmarks.getTree((result) => {
      getBookmarks(result[0].children, '');
      str = str.substr(0, str.length - 1) + ']';
      const newBookmarks = JSON.parse(str);
      for (let i = 0; i < newBookmarks.length; i++) {
        const res = this.bookmarkService.list.filter((obj) => {
          return obj.link === newBookmarks[i].link || (obj.type === 'folder' && obj.name === newBookmarks[i].name);
        });
        if (res.length < 1) { this.bookmarkService.list.push(newBookmarks[i]); }
      }
      this.bookmarkService.set(this.bookmarkService.list);
      this.router.navigate(['/folder']);
    });
  }

  // Wallpaper Upload:
  changeWallpaper(wall) {
      if (!wall.files || !wall.files[0]) { return; }
      const f = wall.files[0];
      // if(!ValidatorService.type(f, ['image/jpeg'])){
      //     this.errMsg = "Only jpg Images Please!";
      //     return;
      // }
      // if(!ValidatorService.size(f, 1024)){
      //     this.errMsg = "Too Large! Maximum 1 MB (1024 KB).";
      //     return;
      // }
      if (!this.config.wallpaper.link.match(/^(img\/)/)) {
        this.fileService.deleteFile('img/' + this.config.wallpaper.name + '.jpg');
      }

      this.config.wallpaper.name = this.util.generateRandomString(8);
      const fileName = this.config.wallpaper.name + '.jpg';

      this.fileService.upload(f, fileName, () => {
        this.fileService.move(fileName, 'img/', () => {
          this.fileService.getUrl('img/', fileName, (url) => {
            this.config.wallpaper.link = url;
            this.config.set();
          });
        });
      });
  }

  // Pattern as Wallpaper
  setPatterAsWallpaper(index) {
    this.config.wallpaper.name = 'xiawhraw' + index;
    this.config.wallpaper.link = 'assets/img/xiawhraw' + index + '.png';
    this.config.wallpaper.type = 'repeat';
    this.config.set();
  }

  // Set Wallpaper Type
  setWallpaperType(type) {
    this.config.wallpaper.type = type;
    // console.log(this.config.wallpaper);
    this.config.set();
  }

  // Order By:
  setOrderBy(orderBy) {
    this.config.orderBy = orderBy;
    // this.config.set();
    // if(this.config.orderBy != 'custom' && this.config.orderBy != 'lastVisited') {
    //     window.location.reload();
    // }
    // this.router.navigate(['/folder']);
  }

  // Shape Shifter:
  changeShape(shape) {
    this.config.shape = shape;
    this.config.set();
    this.router.navigate(['/folder']);
  }

  // Restore All Default Settings
  restoreDefaults() {
    if (!this.config.wallpaper.link.match(/^(img\/)/)) {
      this.fileService.deleteFile('img/' + this.config.wallpaper.name + '.jpg');
    }
    this.config.editMode = false;
    this.config.orderBy = 'custom';
    this.config.shape = 'rectangle';
    this.config.wallpaper.name = 'wallpaper';
    this.config.wallpaper.link = 'assets/img/wallpaper.jpg';
    this.config.wallpaper.type = 'stretch';
    this.config.set();
    this.router.navigate(['/folder']);
  }

}
