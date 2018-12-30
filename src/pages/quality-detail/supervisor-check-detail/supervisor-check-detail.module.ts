import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SupervisorCheckDetailPage } from './supervisor-check-detail';

@NgModule({
  declarations: [
    SupervisorCheckDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SupervisorCheckDetailPage),
  ],
})
export class SupervisorCheckDetailPageModule {}
