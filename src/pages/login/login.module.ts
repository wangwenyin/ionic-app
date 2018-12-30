import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    HttpClientModule,
    IonicPageModule.forChild(LoginPage),
  ],
})
export class LoginPageModule {}
