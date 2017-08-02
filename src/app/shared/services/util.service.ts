import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {

  constructor() { }

  generateRandomString(length) {
    let randomStr;

    do {
      randomStr =
        Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(0, length);
    } while (randomStr.length !== length);

    return randomStr;
  }
}
