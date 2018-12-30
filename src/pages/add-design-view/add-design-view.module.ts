import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddDesignViewPage, PopoverPage } from './add-design-view';
import { ComponentsModule } from '../../components/components.module';
@NgModule({
  declarations: [
    AddDesignViewPage,
    PopoverPage
  ],
  entryComponents: [
    PopoverPage
  ],
  imports: [
    IonicPageModule.forChild(AddDesignViewPage),
    ComponentsModule
  ],
})
export class AddDesignViewPageModule {}
