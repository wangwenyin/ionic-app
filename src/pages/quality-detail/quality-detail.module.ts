import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityDetailPage } from './quality-detail';

@NgModule({
  declarations: [
    QualityDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(QualityDetailPage),
  ],
})
export class QualityDetailPageModule {}
