import { Injectable } from '@angular/core';
declare let ColorThief: any;

@Injectable()
export class ColorService {

  constructor() { }

  showImg(imgId, canvasId, h, w, hideImg?) {
    const srcImg = document.getElementById(imgId);
    const canvas: any  = document.getElementById(canvasId);
    const context = canvas.getContext('2d');
    hideImg = hideImg === undefined ? true : hideImg;
    if (hideImg) { srcImg.setAttribute('hidden', ''); }
    context.clearRect (0, 0, h, w);
    context.drawImage(srcImg, 0, 0, h, w);
  }

  autoDetectColor(imgId) {
    const srcImg = document.getElementById(imgId);
    const colorThief = new ColorThief();
    return colorThief.getColor(srcImg);
  }

  pickColorFromImg(ev, canvasId, offsetLeft, offsetTop) {
    const canvas: any  = document.getElementById(canvasId);
    const context = canvas.getContext && canvas.getContext('2d');

    // getting user coordinates
    offsetLeft = offsetLeft ? offsetLeft : 0;
    offsetTop  = offsetTop ? offsetTop  : 0;
    const x = ev.pageX - (canvas.offsetLeft + offsetLeft);
    const y = ev.pageY - (canvas.offsetTop + offsetTop);

    // getting image data and RGB values
    const imgData = context.getImageData(x, y, 1, 1).data;
    const rgb = {
      r : imgData[0],
      g : imgData[1],
      b : imgData[2]
    };
    return rgb;
  }
}
