import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppSessionService } from '../../shared/app-session.service';

/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  headImage = '';

  items = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private appSessionService: AppSessionService) {
     
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapPage');
    console.log(this.appSessionService);
    this.headImage = this.appSessionService.userHeadImage;
    this.getDate();
  }
  /**
   *跳转项目列表
   *
   * @memberof MapPage
   */
  goList() {
    this.navCtrl.push('TenantManagePage');
  }

  getDate() {
    for (let i = 1; i < 5; i++) {
      this.items.push('项目' + i);
    }
  }

  geCenter() {
    this.navCtrl.push('PersonalPage');
  }
}
