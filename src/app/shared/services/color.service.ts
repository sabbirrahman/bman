import { Injectable } from '@angular/core';
declare let ColorThief: any;

@Injectable()
export class ColorService {

  constructor() { }

  showImg(imgId, canvasId, h, w, hideImg?) {
    let srcImg = document.getElementById(imgId);
    let canvas: any  = document.getElementById(canvasId);
    let context = canvas.getContext('2d');
    hideImg = hideImg === undefined ? true : hideImg;
    if (hideImg) srcImg.setAttribute("hidden", "");
    context.clearRect (0, 0, h, w);
    context.drawImage(srcImg, 0, 0, h, w);
  }

  autoDetectColor(imgId) {
    let srcImg = document.getElementById(imgId);
    let colorThief = new ColorThief();
    return colorThief.getColor(srcImg);
  }

  pickColorFromImg(ev, canvasId, offsetLeft, offsetTop) {
    let canvas: any  = document.getElementById(canvasId);
    let context = canvas.getContext && canvas.getContext('2d');

    // getting user coordinates
    offsetLeft = offsetLeft? offsetLeft : 0;
    offsetTop  = offsetTop ? offsetTop  : 0;
    let x = ev.pageX - (canvas.offsetLeft + offsetLeft);
    let y = ev.pageY - (canvas.offsetTop + offsetTop);

    // getting image data and RGB values
    let imgData = context.getImageData(x, y, 1, 1).data;
    let rgb = {
      r : imgData[0],
      g : imgData[1],
      b : imgData[2]
    };
    return rgb;
  }
}
