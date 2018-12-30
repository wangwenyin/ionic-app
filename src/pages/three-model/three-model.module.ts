import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ThreeModelPage } from './three-model';
import { AppCommonModule } from '../../shared/common/app-common.module';

@NgModule({
  declarations: [
    ThreeModelPage,
  ],
  imports: [
    IonicPageModule.forChild(ThreeModelPage),
    AppCommonModule
  ],
})
export class ThreeModelPageModule {}
