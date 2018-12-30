import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProcessReportPage } from './process-report';

@NgModule({
  declarations: [
    ProcessReportPage,
  ],
  imports: [
    IonicPageModule.forChild(ProcessReportPage),
  ],
})
export class ProcessReportPageModule {}
