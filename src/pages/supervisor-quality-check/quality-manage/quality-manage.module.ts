import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityManagePage } from './quality-manage';

@NgModule({
  declarations: [
    QualityManagePage,
  ],
  imports: [
    IonicPageModule.forChild(QualityManagePage),
  ],
})
export class QualityManagePageModule {}
