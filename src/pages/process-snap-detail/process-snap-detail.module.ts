import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessSnapDetailPage } from './process-snap-detail';

@NgModule({
  declarations: [
    ProcessSnapDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessSnapDetailPage),
  ],
})
export class ProcessSnapDetailPageModule {}
