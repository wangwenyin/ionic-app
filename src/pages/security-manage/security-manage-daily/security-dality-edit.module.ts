import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityDalityEditPage } from './security-dality-edit';

@NgModule({
  declarations: [
    SecurityDalityEditPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityDalityEditPage),
  ],
  entryComponents:[SecurityDalityEditPage],
})
export class SecurityDalityEditPageModule {}