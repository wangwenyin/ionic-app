import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QualityModelPage } from './quality-model';
import { AppCommonModule } from '../../shared/common/app-common.module';

@NgModule({
  declarations: [
    QualityModelPage,
  ],
  imports: [
    IonicPageModule.forChild(QualityModelPage),
    AppCommonModule,
  ],
})
export class QualityModelPageModule {}
