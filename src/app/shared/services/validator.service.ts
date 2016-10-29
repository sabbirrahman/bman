import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

@Injectable()
export class ValidatorService extends Validators {

  static type(file, validTypes){
    for(var i=0; i < validTypes.length; i++) {
      if(file.type == validTypes[i]) {
        return true;
      }
    }
    return false;
  }

  static size(file, size){
    return !(file.size > (size*1024));
  }

  static isLinkExist(link, bookmarks){
    let result = bookmarks.filter((obj) => {
        return obj.link == link;
    });
    if(result.length < 1) return false;
    else return true;
  }
}
