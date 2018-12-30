import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NeedTodoPage } from './need-todo';

@NgModule({
  declarations: [
    NeedTodoPage,
  ],
  imports: [
    IonicPageModule.forChild(NeedTodoPage),
  ],
})
export class NeedTodoPageModule {}
