import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecurityManageDalityPage } from './security-manage-dality';

@NgModule({
  declarations: [
    SecurityManageDalityPage,
  ],
  imports: [
    IonicPageModule.forChild(SecurityManageDalityPage),
  ],
  entryComponents:[SecurityManageDalityPage],
})
export class SecurityManageDalityPageModule {}