import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityCheckInputPage } from './quality-check-input';

@NgModule({
  declarations: [
    QualityCheckInputPage,
  ],
  imports: [
    IonicPageModule.forChild(QualityCheckInputPage),
  ],
})
export class QualityCheckInputPageModule {}
