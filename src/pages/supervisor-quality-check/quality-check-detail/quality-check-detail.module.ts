import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityCheckDetailPage } from './quality-check-detail';

@NgModule({
  declarations: [
    QualityCheckDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(QualityCheckDetailPage),
  ],
})
export class QualityCheckDetailPageModule {}
