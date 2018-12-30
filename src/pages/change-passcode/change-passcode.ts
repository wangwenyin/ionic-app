import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ChangePasscodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-passcode',
  templateUrl: 'change-passcode.html',
})
export class ChangePasscodePage {
  oldPassword="";
  newPassword="";
  repeatPassword="";
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangePasscodePage');
  }
  onSaveRecord(){

  }
  changeCode(){

  }
}
