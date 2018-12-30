import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecheckListPage } from './recheck-list';

@NgModule({
  declarations: [
    RecheckListPage,
  ],
  imports: [
    IonicPageModule.forChild(RecheckListPage),
  ],
})
export class RecheckListPageModule {}
