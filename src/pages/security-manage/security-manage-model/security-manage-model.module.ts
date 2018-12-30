import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityManageModelPage } from './security-manage-model';
import { AppCommonModule } from '../../../shared/common/app-common.module';

@NgModule({
  declarations: [
    SecurityManageModelPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityManageModelPage),
    AppCommonModule,
  ],
  entryComponents:[SecurityManageModelPage],
})
export class SecurityManageModelPageModule {}