import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FilePreviewPage } from './file-preview';
import { AppCommonModule } from '../../shared/common/app-common.module';
import { ComponentsModule } from '../../components/components.module';
@NgModule({
  declarations: [
    FilePreviewPage
  ],
  imports: [
    IonicPageModule.forChild(FilePreviewPage),
    AppCommonModule,
    ComponentsModule
  ],
})
export class FilePreviewPageModule {}
