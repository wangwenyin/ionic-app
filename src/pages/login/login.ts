import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CustomerHttp } from '../../shared/customer-http';
import { AppSessionService } from '../../shared/app-session.service';
import { ThsAlertController, ThsLoadingController } from '../../shared/alert.service';
import { AccountServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  userName = '';
  password = '';
  remeber = false;
  private isFistEnter = false;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public appSessionService: AppSessionService,
    private loadCtrl: ThsLoadingController,
    private thsAlertController: ThsAlertController,
    private storage: Storage,
    private customerHttp: CustomerHttp,
    private accountServiceProxy: AccountServiceProxy,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    this.isFistEnter = true;
  }
  ionViewDidEnter() {
    this.storage.get('loginUser').then(data => {
      console.log('loginUser:' + JSON.stringify(data));
      if (data) {
        if (data.userName && data.userName.length > 0) {
          this.userName = data.userName;
        }
        if (data.password && data.password.length > 0) {
          this.password = data.password;
        }
        if (this.isFistEnter === true && this.userName && this.userName.length > 0 && this.password && this.password.length > 0) {
          let thisClone = this;
          thisClone.isFistEnter = false;
          setTimeout(function () {
            thisClone.onLogin(thisClone.userName, thisClone.password);
          }, 50)
        }
      }
    });
  }
  onLogin(userName: string, password: string) {
    try {
      this.loadCtrl.presentLoadingString("正在加载....");
      let loginUser = {
        username: userName,
        password: password
      };
      this.accountServiceProxy.login(loginUser).subscribe((val: any) => {
        if (val.errorKey === "Unauthorized") {
          this.thsAlertController.basicAlert('错误', '账户或用户名错误', '关闭');
          this.loadCtrl.closeLoading();
        } else {
          this.customerHttp.Token = val.access_token;
          sessionStorage.setItem('token', val.access_token)
          this.appSessionService.userName = userName;
          this.appSessionService.accountId = val.account_id;
          this.appSessionService.entityId = val.entity_id;
          this.appSessionService.logUser = val.entity_name;
          this.loadCtrl.closeLoading();
          let loginUser = {
            userName: userName,
            password: password,
            entity_id: val.entity_id
          };
          // if (this.remeber) {
            this.storage.set('loginUser', loginUser);
          // }
          this.accountServiceProxy.getHeadImage(val.account_id).subscribe(data => {
            if (data.body.lobData !== null && data.body.lobData !== undefined) {
              this.appSessionService.userHeadImage = data.body.lobData;
            } else {
              this.appSessionService.userHeadImage = 'assets/default-profile-picture.png'
            }
            // this.navCtrl.push('MapPage');
            this.navCtrl.push('TenantManagePage');
          });
        }
      }, error2 => {
        this.loadCtrl.closeLoading();
        let err = JSON.parse(error2.response).error;
        this.thsAlertController.basicAlert(err.message, err.details, '关闭');
      });

    } catch (e) {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', e.message, '关闭');
    }
    // try {
    //   this.loadCtrl.presentLoadingString("正在加载....");
    //   let authenticateModel: AuthenticateModel = new AuthenticateModel();
    //   // authenticateModel.userNameOrEmailAddress = this.appSessionService.encode(userName);
    //   // authenticateModel.password = this.appSessionService.encode(password);
    //   authenticateModel.userNameOrEmailAddress = userName;
    //   authenticateModel.password = password;
    //   this.appSessionService.logUser = userName;
    //   let loginUser = {
    //     userName: userName,
    //     password: password
    //   };
    //   this.storage.set('loginUser', loginUser);
    //   this.navCtrl.push('MapPage');
    //   //   this._tokenAuthService.authenticate(authenticateModel).subscribe((result) => {
    //   //     this.customerHttp.Token = result.accessToken;
    //   //     this.appSessionService.logUser = userName;
    //   //     this.loadCtrl.closeLoading();
    //   //     let loginUser = {
    //   //       userName: userName,
    //   //       password:password
    //   //     };
    //   //     this.storage.set('loginUser',loginUser);
    //   //     this.navCtrl.push('TenantManagePage');
    //   //   }, error2 => {
    //   //     this.loadCtrl.closeLoading();
    //   //     let err = JSON.parse(error2.response).error;
    //   //     this.thsAlertController.basicAlert(err.message, err.details, '关闭');
    //   //   })
    // } catch (e) {
    //   this.loadCtrl.closeLoading();
    //   this.thsAlertController.basicAlert('错误', e.message, '关闭');
    // }
  }
  // onOpenLocalFile() {
  //   this.navCtrl.push('LocalFilePage');
  // }
  /**
   *忘记密码
   * @memberof LoginPage
   */
  forget() {
    this.navCtrl.push('ForgetPasswordPage');
  }
}
