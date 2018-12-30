import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';


@IonicPage()
@Component({
  selector: 'page-security-manage-type',
  templateUrl: 'security-manage-type.html',
})
export class SecurityManageTypePage {

  // 设置默认选中页面
  public tabs: string = 'check';

  toppings: string;

  projectName: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private appSessionService: AppSessionService,
    ) {
      this.projectName = this.appSessionService.projectName;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SecurityManageTypePage');
  }

  onOpenExamine() {
    this.navCtrl.push('SecurityManageModelPage', {page: 'SecurityManageExaminePage'});
  }
  onOpenDaily() {
    this.navCtrl.push('SecurityManageModelPage', {page: 'SecurityManageDalityPage'});
  }
  openModel() {
    this.navCtrl.push('SecurityManageModelPage');
  }

}
