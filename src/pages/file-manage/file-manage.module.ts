import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FileManagePage } from './file-manage';

@NgModule({
  declarations: [
    FileManagePage,
  ],
  imports: [
    IonicPageModule.forChild(FileManagePage),
  ],
})
export class FileManagePageModule {}
