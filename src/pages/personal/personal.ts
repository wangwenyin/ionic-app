import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AccountServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../shared/app-session.service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PersonalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-personal',
  templateUrl: 'personal.html',
})
export class PersonalPage {

  iconUrl: string;
  userName: string;
  items = ['我的项目', '修改密码', '客户反馈',  '关于我们'];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    private appSessionService: AppSessionService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PersonalPage');

    // this.accountServiceProxy.getHeadImage(this.appSessionService.accountId).subscribe(data => {
    //   if (data.body.lobData !== null && data.body.lobData !== undefined) {
    //     this.iconUrl= data.body.lobData;
    //   }
    // });
    this.iconUrl= this.appSessionService.userHeadImage;
    this.userName = this.appSessionService.logUser;
  }

  itemSelected(value: string) {
    console.log(value);
    switch (value) {
      case '修改密码':
        console.log("修改密码");
        this.navCtrl.push('ChangePasscodePage');
        break;
      case'我的项目':
        console.log("我的项目");
        debugger;
        this.navCtrl.push('MyProjectsPage');
        break;
      case'客户反馈':
        console.log("客户反馈");
        this.navCtrl.push('FeedBackPage');
        break;
      case'关于我们':
        console.log("关于我们");
        this.navCtrl.push('AboutUsPage');
        break;
    }
  }

  logout() {
    this.storage.set('loginUser', null);
    this.navCtrl.push('LoginPage');
  }
}
