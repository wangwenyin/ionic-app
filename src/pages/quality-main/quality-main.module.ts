import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityMainPage } from './quality-main';

@NgModule({
  declarations: [
    QualityMainPage,
  ],
  imports: [
    IonicPageModule.forChild(QualityMainPage),
  ],
})
export class QualityMainPageModule {}
