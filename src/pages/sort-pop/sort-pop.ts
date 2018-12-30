import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the SortPopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sort-pop',
  templateUrl: 'sort-pop.html',
})
export class SortPopPage {

  items: Array<string>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    let data  = this.navParams.data;
    if(data && data instanceof Array){
      this.items = data;
    }else {
      this.items = [];
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SortPopPage');
  }
  itemSelected(item: string) {
    this.viewCtrl.dismiss(item);
  }
}
