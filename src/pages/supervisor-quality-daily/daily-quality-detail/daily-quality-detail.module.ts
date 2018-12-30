import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DailyQualityDetailPage } from './daily-quality-detail';

@NgModule({
  declarations: [
    DailyQualityDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(DailyQualityDetailPage),
  ],
})
export class DailyQualityDetailPageModule {}
