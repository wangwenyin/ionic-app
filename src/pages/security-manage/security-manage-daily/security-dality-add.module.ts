import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityDalityAddPage } from './security-dality-add';

@NgModule({
  declarations: [
    SecurityDalityAddPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityDalityAddPage),
  ],
  entryComponents:[SecurityDalityAddPage],
})
export class SecurityDalityAddPageModule {}