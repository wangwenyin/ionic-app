import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddDesignTaskPage, TaskAddUserPage } from './add-design-task';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    AddDesignTaskPage,
    TaskAddUserPage
  ],
  entryComponents: [
    TaskAddUserPage
  ],
  imports: [
    IonicPageModule.forChild(AddDesignTaskPage),
    ComponentsModule
  ],
})
export class AddDesignTaskPageModule {}
