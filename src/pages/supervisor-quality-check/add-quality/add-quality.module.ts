import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddQualityPage, UserSelectPage } from './add-quality';
import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  declarations: [
    AddQualityPage,
    UserSelectPage,
  ],
  entryComponents: [
    UserSelectPage
  ],
  imports: [
    IonicPageModule.forChild(AddQualityPage),
    ComponentsModule,
  ],
})
export class AddQualityPageModule {}
