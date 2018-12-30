import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChooseModelPage } from './choose-model';

@NgModule({
  declarations: [
    ChooseModelPage,
  ],
  imports: [
    IonicPageModule.forChild(ChooseModelPage),
  ],
})
export class ChooseModelPageModule {}
