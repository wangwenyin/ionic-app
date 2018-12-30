import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalFilePreviewPage } from './local-file-preview';
import { AppCommonModule } from '../../shared/common/app-common.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    LocalFilePreviewPage,
  ],
  imports: [
    IonicPageModule.forChild(LocalFilePreviewPage),
    AppCommonModule,
    ComponentsModule
  ],
})
export class LocalFilePreviewPageModule {}
