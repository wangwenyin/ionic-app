import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityExamineAddPage } from './security-examine-add';

@NgModule({
  declarations: [
    SecurityExamineAddPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityExamineAddPage),
  ],
  entryComponents:[SecurityExamineAddPage],
})
export class SecurityExamineAddPageModule {}