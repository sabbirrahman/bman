import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
// Services
import { ValidatorService } from '../../shared/services/validator.service';
import { BookmarkService } from '../bookmark.service';
import { StorageService } from '../../shared/services/storage.service';
import { ColorService } from '../../shared/services/color.service';
import { FileService } from '../../shared/services/file.service';
import { UtilService } from '../../shared/services/util.service';
declare let chrome: any;

@Component({
  selector: 'app-bookmark-form',
  templateUrl: './bookmark-form.component.html',
  styleUrls: ['./bookmark-form.component.scss']
})
export class BookmarkFormComponent implements OnInit {
  editMode: boolean = false;
  folders: Array<any> = [];
  errMsg: string = '';
  colorOption: string;
  bookmark: any;
  offsetTop: any;
  index: number;
  file: any;

  constructor(
    private bookmarkService: BookmarkService,
    private colorService: ColorService,
    private fileService: FileService,
    private storage: StorageService,
    private route: ActivatedRoute,
    private util: UtilService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.folders = this.bookmarkService.list.filter((obj) => {
        return obj.type == 'folder';
      });
      if (params['index']) {
        this.editMode = true;
        this.bookmark = this.bookmarkService.list[params['index']];
        this.index = params['index'];
        setTimeout(() => {
          this.colorService.showImg(
            this.bookmarkService.list[this.index].id + this.bookmark.ext,
            'canvas1', 100, 100, true
          );
        }, 100);
      } else {
        this.bookmark = {
          id       : this.util.generateRandomString(8),
          name     : '',
          img      : 'assets/img/asdjklha0.png',
          rgb      : '119, 119, 119',
          a        : 0.75,
          ext      : '.png',
          type     : 'bookmark',
          parentId : ''
        };
        setTimeout(() => {
          this.colorService.showImg(
            this.bookmark.id + this.bookmark.ext,
            'canvas1', 100, 100, true
          );
        }, 100);

        // window.addEventListener('load', function(evt) {
        //   chrome.runtime.getBackgroundPage(function(eventPage) {
        //     eventPage.getPageDetails(this.onPageDetailsReceived);
        //   });
        // });
      }
    });
  }

  add(){
    if(ValidatorService.isLinkExist(this.bookmark.link, this.bookmarkService.list)){
      this.errMsg = "Link Already Exist";
      return;
    }
    this.bookmark.date = new Date();
    if(this.bookmark.img !== "assets/img/asdjklha0.png" &&
       this.bookmark.img !== "assets/img/alsdhlas0.png") {
      let fileName = this.bookmark.id + this.bookmark.ext;
      this.upload(() => {
        this.bookmarkService.add(this.bookmark);
        this.router.navigate(['folder']);
      })
    } else {
      this.bookmarkService.add(this.bookmark);
      this.router.navigate(['folder']);
    }
  }

  edit(){
      if(this.file) {
        this.upload(() => {
          this.bookmarkService.save(this.bookmark, this.index);
          this.router.navigate(['folder']);
        });
      } else {
        this.bookmarkService.save(this.bookmark, this.index);
        this.router.navigate(['folder']);
      }
  }

  submit() {
    if (this.editMode) {
      this.edit();
    } else {
      this.add();
    }
  }

  changeEntryType(checked){
    if (checked){
      this.bookmark.type = 'folder';
      this.bookmark.link = '#/folder/' + this.bookmark.id;
      if (this.bookmark.img === "assets/img/asdjklha0.png"){
        this.bookmark.img  = 'assets/img/alsdhlas0.png',
        setTimeout(() => {
          this.colorService.showImg(
            this.bookmark.id + this.bookmark.ext,
            'canvas1', 100, 100, true
          );
        }, 100);
      }
    } else {
      this.bookmark.type = 'bookmark';
      this.bookmark.link = '';
      if (this.bookmark.img == "assets/img/alsdhlas0.png"){
        this.bookmark.img  = 'assets/img/asdjklha0.png',
        setTimeout(() => {
          this.colorService.showImg(
            this.bookmark.id + this.bookmark.ext,
            'canvas1', 100, 100, true
          );
        }, 100);
      }
    }
  }

  fixLink(){
    if (!this.bookmark.link) return;
    if (!this.bookmark.link.match(/^http/))
      this.bookmark.link = 'http://' + this.bookmark.link;
  }

  draw(fileInp) {
    if (!fileInp.files || !fileInp.files[0] ) return;
    this.file = fileInp.files[0];
    if(!ValidatorService.type(this.file, ['image/png', 'image/jpeg'])){
      this.errMsg = "Invalid Image Type";
      setTimeout(() => { this.errMsg = "" }, 2000);
      return;
    }
    if(!ValidatorService.size(this.file, 256)){
      this.errMsg = "Too Large! Maximum 256 KB.";
      setTimeout(() => {this.errMsg = "" }, 2000);
      return;
    }
    let canvas: any  = document.getElementById('canvas1');
    let context = canvas.getContext && canvas.getContext('2d');
    let fileReader: any = new FileReader();
    fileReader.onload = (ev) => {
      let img: any = new Image();
      img.onload = () => {
        context.clearRect (0, 0, 100, 100);
        context.drawImage(img, 0, 0, 100, 100);
        this.bookmark.img = img.src;
      };
      img.src = ev.target.result;
    };
    fileReader.readAsDataURL(this.file);
}

  upload(callback?) {
    this.bookmark.id  = this.util.generateRandomString(8);
    this.bookmark.ext = (this.file.type == 'image/jpeg')? '.jpg' : '.png';
    let fileName = this.bookmark.id + this.bookmark.ext;
    this.fileService.upload(this.file, fileName, () => {
      this.fileService.move(fileName, "img/", () => {
        this.fileService.getUrl("img/", fileName, (url) => {
          this.bookmark.img = url;
          if (callback) callback();
        });
      });
    });
  }

  pickColor(ev, canvasId){
    if ((canvasId === 'canvas1' && this.colorOption === 'C') || this.colorOption === 'A') return;
    let c = this.colorService.pickColorFromImg(ev, canvasId, 0, this.offsetTop);
    this.bookmark.rgb = c.r + ', ' + c.g + ', ' + c.b;
  }

  changeColorOption(colorOption){
    this.colorOption = colorOption;
    this.offsetTop = (window.innerWidth <= 480) ? 100 : 50;
    if (this.colorOption === 'A') {
      this.bookmark.rgb = this.colorService
                  .autoDetectColor(this.bookmark.id + this.bookmark.ext);
    } else if (this.colorOption === 'C') {
      this.colorService.showImg("colorWheel", "canvas2", 200, 200);
    }
  }

  onPageDetailsReceived(pageDetails)  {
    this.bookmark.name = pageDetails.title;
    this.bookmark.link = pageDetails.url;
  }

}
