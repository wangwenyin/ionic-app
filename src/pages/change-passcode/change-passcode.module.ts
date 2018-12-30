import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePasscodePage } from './change-passcode';

@NgModule({
  declarations: [
    ChangePasscodePage,
  ],
  imports: [
    IonicPageModule.forChild(ChangePasscodePage),
  ],
})
export class ChangePasscodePageModule {}
