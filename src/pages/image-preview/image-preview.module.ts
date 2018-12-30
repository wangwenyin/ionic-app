import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagePreviewPage } from './image-preview';

@NgModule({
  declarations: [
    ImagePreviewPage,
  ],
  imports: [
    IonicPageModule.forChild(ImagePreviewPage),
  ],
})
export class ImagePreviewPageModule {}
