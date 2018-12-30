import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityCheckInputPage } from './security-check-input';

@NgModule({
  declarations: [
    SecurityCheckInputPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityCheckInputPage),
  ],
})
export class SecurityCheckInputPageModule {}
