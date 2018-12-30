import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
// import { TabsPage } from '../../pages/tabs/tabs';
import { AppSessionService } from '../../shared/app-session.service';
import { ProfileServiceProxy } from '../../shared/service-proxies/service-proxies';
import { AccountServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { TabsPage } from '../tabs/tabs';
/**
 * Generated class for the MenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  rootPage= TabsPage;
  // rootPage= MenuOptionPage;
  userName:string;
  email:string;
  iconUrl: string;
  tenantName: string;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public _profileServiceProxy: ProfileServiceProxy,
              private accountServiceProxy: AccountServiceProxy,
              public  appSessionService: AppSessionService) {
    this.userName='';
    this.email='';
    this.iconUrl = 'assets/default-profile-picture.png';
    this.tenantName = '';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');

    this.accountServiceProxy.getHeadImage(this.appSessionService.accountId).subscribe(data => {
      if (data.body.lobData !== null && data.body.lobData !== undefined) {
        this.iconUrl= data.body.lobData;
      }
    });
    this.iconUrl= this.appSessionService.userHeadImage;
    this.userName = this.appSessionService.logUser;
    // this.email = this.appSessionService.user.emailAddress;
    this.tenantName = this.appSessionService.projectName;
    // this._profileServiceProxy.getProfilePicture().subscribe(result => {
    //   if (result && result.profilePicture) {
    //     this.iconUrl= 'data:image/jpeg;base64,' + result.profilePicture;
    //   }
    // });
  }

  onBackTenant() {
    this.navCtrl.pop();
  }

  goNotice() {
    this.navCtrl.push('NoticePage');
  }

  goPersonal() {
    this.navCtrl.push('PersonalPage');
  }
}
