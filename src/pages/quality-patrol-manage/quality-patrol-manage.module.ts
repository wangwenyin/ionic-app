import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityPatrolManagePage } from './quality-patrol-manage';

@NgModule({
  declarations: [
    QualityPatrolManagePage,
  ],
  imports: [
    IonicPageModule.forChild(QualityPatrolManagePage),
  ],
})
export class QualityPatrolManagePageModule {}
