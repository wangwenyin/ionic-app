import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DailyQualityPage } from './daily-quality';

@NgModule({
  declarations: [
    DailyQualityPage,
  ],
  imports: [
    IonicPageModule.forChild(DailyQualityPage),
  ],
})
export class DailyQualityPageModule {}
