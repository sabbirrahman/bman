import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
  getAll(): any {
    return localStorage;
  }

  get(key): any {
    if (localStorage[key]) {
      return JSON.parse(localStorage.getItem(key));
    } else {
      return undefined;
    }
  }

  set(key, value): boolean {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  isSet(key): boolean {
    return (localStorage[key]) ? true : false;
  }

  delete(key): boolean {
    if (this.isSet(key)) {
      localStorage.removeItem(key);
      return true;
    } else {
      return false;
    }
  }

  deleteAll(): boolean {
    localStorage.clear();
    return true;
  }
}
