import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'color'
})
export class ColorPipe implements PipeTransform {
  transform(rgb: any, a: any): any {
    return 'rgba(' + rgb + ',' + a + ')';
  }

}
