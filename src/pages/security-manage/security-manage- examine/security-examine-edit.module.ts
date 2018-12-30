import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityExamineEditPage } from './security-examine-edit';

@NgModule({
  declarations: [
    SecurityExamineEditPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityExamineEditPage),
  ],
  entryComponents:[SecurityExamineEditPage],
})
export class SecurityExamineEditPageModule {}