import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/core';
// Services
import { StorageService } from './services/storage.service';
import { ConfigService } from './services/config.service';
import { ColorService } from './services/color.service';
import { FileService } from './services/file.service';
import { UtilService } from './services/util.service';
// Pipes
import { BypassPipe } from './pipes/bypass.pipe';
import { ColorPipe } from './pipes/color.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BypassPipe,
    ColorPipe
  ],
  exports: [
    BypassPipe,
    ColorPipe
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        StorageService,
        ConfigService,
        ColorService,
        FileService,
        UtilService
      ]
    };
  }
}
