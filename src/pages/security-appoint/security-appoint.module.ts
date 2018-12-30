import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityAppointPage } from './security-appoint';

@NgModule({
  declarations: [
    SecurityAppointPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityAppointPage),
  ],
})
export class SecurityAppointPageModule {}
