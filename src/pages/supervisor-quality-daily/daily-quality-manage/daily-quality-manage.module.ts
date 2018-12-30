import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DailyQualityManagePage } from './daily-quality-manage';

@NgModule({
  declarations: [
    DailyQualityManagePage,
  ],
  imports: [
    IonicPageModule.forChild(DailyQualityManagePage),
  ],
})
export class DailyQualityManagePageModule {}
