import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MeSignaturePadPage } from './me-signature-pad';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    MeSignaturePadPage,
  ],
  imports: [
    IonicPageModule.forChild(MeSignaturePadPage),
    SignaturePadModule
  ],
})
export class MeSignaturePadPageModule {}
