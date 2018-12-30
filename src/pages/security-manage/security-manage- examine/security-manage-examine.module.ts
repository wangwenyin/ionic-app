import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityManageExaminePage } from './security-manage-examine';

@NgModule({
  declarations: [
    SecurityManageExaminePage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityManageExaminePage),
  ],
  entryComponents:[SecurityManageExaminePage],
})
export class SecurityManageExaminePageModule {}