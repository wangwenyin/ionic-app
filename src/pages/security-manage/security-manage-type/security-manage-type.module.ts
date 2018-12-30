import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityManageTypePage } from './security-manage-type';

@NgModule({
  declarations: [
    SecurityManageTypePage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityManageTypePage),
  ],
  entryComponents:[SecurityManageTypePage],
})
export class SecurityManageTypePageModule {}