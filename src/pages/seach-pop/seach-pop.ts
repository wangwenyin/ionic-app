import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
/**
 * Generated class for the SeachPopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-seach-pop',
  templateUrl: 'seach-pop.html',
})
export class SeachPopPage {

  searchValue: string;
  startDate: string;
  endDate: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    let data  = this.navParams.data;
    if(data){
      this.searchValue = data.searchValue;
      this.startDate = data.startDate;
      this.endDate = data.endDate;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SeachPopPage');
  }
  onClose(){
    this.viewCtrl.dismiss({
      searchValue: this.searchValue,
      startDate: this.startDate,
      endDate: this.endDate
    })
  }
  onClean(){
    this.searchValue='';
    this.startDate = null;
    this.endDate = null;
    this.onClose();
  }
}
