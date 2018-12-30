import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageProgressDetailPage } from './image-progress-detail';

@NgModule({
  declarations: [
    ImageProgressDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ImageProgressDetailPage),
  ],
})
export class ImageProgressDetailPageModule {}
