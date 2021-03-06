import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Services
import { BookmarkService } from './bookmark/bookmark.service';
import { StorageService } from './shared/services/storage.service';
import { ConfigService } from './shared/services/config.service';
import { FileService } from './shared/services/file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private bookmark: BookmarkService,
    private fileService: FileService,
    private storage: StorageService,
    public config: ConfigService,
    private router: Router
  ) {}

  ngOnInit() {
    this.config.get();
    this.bookmark.get();

    // Creating Image Folder:
    if (!this.storage.isSet('imgFolder')) {
      this.fileService.createFolder('img');
      this.storage.set('imgFolder', true);
    }
    // Filter:
    // if(this.config.orderBy && this.config.orderBy != 'custom' && this.config.orderBy != 'lastVisited'){
    //   this.bookmarks = $filter('orderBy')(this.bookmarks, this.config.orderBy).reverse();
    //   if(this.config.orderBy == 'name' || this.config.orderBy == 'link') this.bookmarks.reverse();
    // }
  }

  // colorMaker = function(rgb, a){ return 'rgba(' + rgb + ',' + a + ')'; }
  // Validator:
  // Validate = {
  //     type: function(file, validTypes){
  //         for(var i=0; i<validTypes.length; i++) if(file.type == validTypes[i]) return true;
  //         return false;
  //     },
  //     size: function(file, size){
  //         return !(file.size > (size*1024));
  //     },
  //     isLinkExist: function(link){
  //         var result = this.bookmarks.filter(function(obj){
  //             return obj.link == link;
  //         });
  //         if(result.length<1) return false;
  //         else return true;
  //     }
  // }

  toggleEditMode() {
    this.config.editMode = !this.config.editMode;
    this.config.set();
  }

  get isOverlayVisible (): string {
    return (/\(overlay:/).test(this.router.url) ? 'flex' : 'none';
  }

  closeOverlay(ev) {
    if (ev.target.classList[0] === 'overlay') {
      this.router.navigate(['/']);
    }
  }
}
