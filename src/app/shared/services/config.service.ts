import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
// Services
import { StorageService } from './storage.service';

export interface ConfigInterface {
  wallpaper: {
    name: string;
    link: string;
    type: string;
  };
  editMode: boolean;
  orderBy: string;
  shape: string;
}

@Injectable()
export class ConfigService implements ConfigInterface {
  wallpaper = {
    name: '',
    link: '',
    type: ''
  };
  editMode = false;
  orderBy = '';
  shape = '';

  constructor(
    private storage: StorageService
  ) { }

  get() {
    if (!this.storage.isSet('config')) {
      fetch('./assets/js/config.json')
          .then(res => res.json())
          .then((config) => {
            this.set(config);
          });
    } else {
      const config = this.storage.get('config');
      this.set(config);
      return config;
    }
  }

  set(config?) {
    if (config) {
      this.wallpaper = {
        name: config.wallpaper.name,
        link: config.wallpaper.link,
        type: config.wallpaper.type
      };
      this.editMode = config.editMode;
      this.orderBy = config.orderBy;
      this.shape = config.shap;
    } else {
      config = {
        wallpaper: {
          name: this.wallpaper.name,
          link: this.wallpaper.link,
          type: this.wallpaper.type
        },
        editMode: this.editMode,
        orderBy: this.orderBy,
        shape: this.shape
      };
    }
    this.storage.set('config', config);
  }

}
