import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityPatrolDetailPage } from './quality-patrol-detail';

@NgModule({
  declarations: [
    QualityPatrolDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(QualityPatrolDetailPage),
  ],
})
export class QualityPatrolDetailPageModule {}
