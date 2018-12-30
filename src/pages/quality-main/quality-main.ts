import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppSessionService } from '../../shared/app-session.service';

/**
 * Generated class for the QualityMainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-quality-main',
  templateUrl: 'quality-main.html',
})
export class QualityMainPage {

  projectName: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private appSessionService: AppSessionService,) {
  }

  ionViewDidLoad() {
    this.projectName = this.appSessionService.projectName;
    console.log('ionViewDidLoad QualityMainPage');
  }

  onOpenExamine() {
    // this.navCtrl.push('QualityManagePage');
    this.navCtrl.push('QualityModelPage',{ page: 'QualityManagePage'});
  }

  onOpenImport() {
    this.navCtrl.push('QualityModelPage',{ page: 'ImportantQualityPage'});
    // this.navCtrl.push('ImportantQualityPage');
  }

  onOpendaily() {
    this.navCtrl.push('QualityModelPage',{ page: 'DailyQualityManagePage'})
    // this.navCtrl.push('DailyQualityManagePage');
  }

  openModel() {
    this.navCtrl.push('QualityModelPage');
  }

}
