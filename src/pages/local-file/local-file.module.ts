import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalFilePage } from './local-file';
@NgModule({
  declarations: [
    LocalFilePage,
  ],
  imports: [
    IonicPageModule.forChild(LocalFilePage),
  ]
})
export class LocalFilePageModule {}
