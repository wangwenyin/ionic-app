import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SupervisorDailyDetailPage } from './supervisor-daily-detail';

@NgModule({
  declarations: [
    SupervisorDailyDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SupervisorDailyDetailPage),
  ],
})
export class SupervisorDailyDetailPageModule {}
