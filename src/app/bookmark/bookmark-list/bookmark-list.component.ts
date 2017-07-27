import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Services
import { BookmarkService } from '../bookmark.service';
import { ConfigService } from '../../shared/services/config.service';
import { FileService } from '../../shared/services/file.service';

@Component({
  selector: 'app-bookmark-list',
  templateUrl: './bookmark-list.component.html',
  styleUrls: ['./bookmark-list.component.scss']
})
export class BookmarkListComponent implements OnInit {
  folderId: string;
  parentEl: any;
  srcE = null;
  shapeClass = {
    roundedRectangle: this.config.shape === 'roundedRectangle',
    rectangle: this.config.shape === 'rectangle',
    circle: this.config.shape === 'circle',
    oval: this.config.shape === 'oval'
  };

  constructor(
    public bookmarkService: BookmarkService,
    private fileService: FileService,
    private router: ActivatedRoute,
    private config: ConfigService
  ) { }

  ngOnInit() {
    this.router.params.subscribe((params) => {
      this.folderId = params['folderId'] || '';
      this.parentEl = this.bookmarkService.list.filter((obj) => {
        return obj.id == this.folderId;
      })[0];
    });
  }

  handleDragStart(dragItem) {
    this.srcE = dragItem;
  }

  handleDragOver(ev, dragItem) {
    if(!this.srcE) return;
    if(ev.preventDefault)  { ev.preventDefault() ; }
    if(ev.stopPropagation) { ev.stopPropagation(); }
    if(this.config.orderBy !== 'custom') return;
    if(this.srcE == dragItem) return;
    if(dragItem.dataset.up) return;
    var srcIndex = parseInt(this.srcE.dataset.id);
    var desIndex = parseInt(dragItem.dataset.id);
    var srcEl    = this.bookmarkService.list[srcIndex];
    var desEl    = this.bookmarkService.list[desIndex];
    if(desEl.type == 'folder' && this.config.editMode) return;
    this.bookmarkService.list.splice(srcIndex, 1);
    this.bookmarkService.list.splice(desIndex, 0, srcEl);
    this.bookmarkService.set(this.bookmarkService.list);
    return false;
  }

  handleDrop(dragItem){
    if(!this.srcE) return;
    if(!this.config.editMode) return;
    if(this.srcE == this) return;
    var srcIndex = parseInt(this.srcE.dataset.id);
    if(dragItem.dataset.up){
      this.bookmarkService.list[srcIndex].parentId = dragItem.dataset.parentid;
      this.bookmarkService.set(this.bookmarkService.list);
      return;
    }
    var desIndex = parseInt(dragItem.dataset.id);
    var desEl    = this.bookmarkService.list[desIndex];
    if(desEl.type != 'folder') return;
    this.bookmarkService.list[srcIndex].parentId = desEl.id;
    this.bookmarkService.set(this.bookmarkService.list);
    return false;
  }

  gotoLink(index) {
    if(this.config.orderBy !== 'lastVisited') return;
    let data = this.bookmarkService.list[index];
    if(data.type === 'folder') return;
    this.bookmarkService.list.splice(index, 1);
    this.bookmarkService.list.splice(0, 0, data);
    this.bookmarkService.set(this.bookmarkService.list);
  }
}
