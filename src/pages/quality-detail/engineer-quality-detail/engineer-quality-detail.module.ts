import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EngineerQualityDetailPage } from './engineer-quality-detail';

@NgModule({
  declarations: [
    EngineerQualityDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(EngineerQualityDetailPage),
  ],
})
export class EngineerQualityDetailPageModule {}
