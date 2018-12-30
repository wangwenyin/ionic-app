import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TenantManagePage } from './tenant-manage';

@NgModule({
  declarations: [
    TenantManagePage,
  ],
  imports: [
    IonicPageModule.forChild(TenantManagePage),
  ],
})
export class TenantManagePageModule {}
