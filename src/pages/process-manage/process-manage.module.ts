import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessManagePage } from './process-manage';

@NgModule({
  declarations: [
    ProcessManagePage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessManagePage),
  ],
})
export class ProcessManagePageModule {}
