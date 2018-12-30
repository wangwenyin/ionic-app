import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';

/**
 * Generated class for the ProcessSnapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-process-snap',
  templateUrl: 'process-snap.html',
})
export class ProcessSnapPage {

  searchValue: string;

  needParms = {};
  dealParms = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private popoverCtrl: PopoverController
  ) {
  }

  goBack() {
    this.navCtrl.pop();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ProcessSnapPage');
  }

  onSearch(event) {
    let popover = this.popoverCtrl.create("SeachPopPage", {
      searchValue: this.searchValue,
      // startDate: this.startDate ? this.startDate.format('YYYY-MM-DD') : "",
      // endDate: this.endDate ? this.endDate.format('YYYY-MM-DD') : ""
    });
    popover.present({
      ev: event
    });
    popover.onDidDismiss(data => {
      if (data) {
        this.searchValue = data.searchValue;
        this.dealParms['name.contains'] = this.searchValue;
        this.needParms['name.contains'] = this.searchValue;
        // console.log(this.searchValue);
        // this.page = 0;
        // this.refreshData(true);
      }
    })
  }
  /**
   *添加形象进度
   * @memberof ProcessSnapPage
   */
  addProgress() {
    this.navCtrl.push('AddImageProgressPage');
  }

  showDetail() {
    this.navCtrl.push('ImageProgressDetailPage');
  }
}
