import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuOptionPage } from './menu-option';

@NgModule({
  declarations: [
    MenuOptionPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuOptionPage),
  ],
})
export class MenuOptionPageModule {}
