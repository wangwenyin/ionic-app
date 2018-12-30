import { Component, Inject, Optional, InjectionToken } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { CustomerHttp } from '../../shared/customer-http';
import { AppSessionService } from '../../shared/app-session.service';
import { ThsAlertController, ThsLoadingController } from '../../shared/alert.service';
import { ProjectServiceProxy, Project, FileServiceProxy, AccountServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';

/**
 * Generated class for the TenantManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tenant-manage',
  templateUrl: 'tenant-manage.html',
})

export class TenantManagePage {

  tenantItems: Project[];
  userId: string;
  fileUrl: string;
  searchValue: string = '';
  infiniteScrollEnabled = true;
  params = { page: 0, size: 6 };

  private baseUrl: string;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private thsAlertController: ThsAlertController,
    private customerHttp: CustomerHttp,
    private loadCtrl: ThsLoadingController,
    public appSessionService: AppSessionService,
    private fileServiceProxy: FileServiceProxy,
    private projectServiceProxy: ProjectServiceProxy,
    private popoverCtrl: PopoverController,
    private accountServiceProxy: AccountServiceProxy,
    // private testService: TestService,
  ) {
    this.tenantItems = [];
    this.baseUrl = this.appSessionService.baseUrl;
    this.fileUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TenantManagePage');
    this.getTenant();
    // const elements = document.querySelectorAll(".tabbar");
    // if (elements != null) {
    //   Object.keys(elements).map((key) => {
    //     elements[key].style.display = 'none';
    //   });
    // }
  }

  onBackPage() {
    // this.navCtrl.push('LoginPage');
    this.navCtrl.pop();
  }
  /**
   *获取项目
   *
   * @memberof TenantManagePage
   */
  getTenant() {
    this.userId = this.appSessionService.entityId;
    const ids = [];
    if (this.userId) {
      if (this.userId !== '123') {
        this.projectServiceProxy.listProjects({ 'empId.equals': this.userId, 'isDeleted.equals': '0' }).subscribe(data => {
          data.body.forEach(element => {
            ids.push(element.projectId);
          });
          this.params['id.in'] = ids;
          this.getProjectData();
        });
      } else {
        this.getProjectData();
      }
      // this.employeeServiceProxy.getHrmsByUserId(this.userId).subscribe(data => {
      //   console.log(data);
      // });
    } else {
      this.navCtrl.push('LoginPage');
    }
  }

  onSelectProject(value: Project) {
    try {
      this.loadCtrl.presentLoadingString("正在加载......");
      this.appSessionService.projectId = value.id;
      this.appSessionService.projectName = value.name;
      this.getPromiss(value.id);
      // let authenticateModel: AuthenticateModel = new AuthenticateModel();
      // authenticateModel.userNameOrEmailAddress = this.appSessionService.logUser;  
      // authenticateModel.password = '123qwe';
      // this._tokenAuthService.authenticateEx(authenticateModel, value.id).subscribe((result: AuthenticateResultModel) => {
      //   this.customerHttp.Token = result.accessToken;
      //   this.appSessionService.init().then(result => {
      //     if (result === true) {
      //       if (this.appSessionService.isGranted('Pages.Tenant.Resource')
      //         || this.appSessionService.isGranted('Pages.Design.Teamwork.Task')
      //         || this.appSessionService.isGranted('Pages.Design.Teamwork.View')
      //         || this.appSessionService.isGranted('Pages.Administration.Users')) {
      //         this.navCtrl.push('MenuPage');
      //       } else {
      //         this.loadCtrl.closeLoading();
      //         this.thsAlertController.basicAlert('提示', '无权限', '关闭');
      //       }
      //     }
      //   }).catch( e => {
      //     this.loadCtrl.closeLoading();
      //     this.thsAlertController.basicAlert('错误', e.message, '关闭');
      //   })
      // }, error2 => {
      this.loadCtrl.closeLoading();
      //   this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      // })
    } catch (e) {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', e.message, '关闭');
    }
  }
  /**
   *跳转地图页面
   *
   * @memberof TenantManagePage
   */
  goMap() {
    this.navCtrl.push('MapPage');
  }

  // 获取工程信息
  getProjectData() {
    this.params['sort'] = 'creationTime,desc';
    this.params['isDelete.equals'] = '0';
    this.projectServiceProxy.queryProjects(this.params).subscribe(data => {
      data.body.forEach(item => {
        if (item.thumbnailPath === null) {
          item.thumbnailPath = 'assets/images/default.png';
        } else {
          item.thumbnailPath = this.fileUrl + encodeURIComponent(item.thumbnailPath);
        }
        this.tenantItems.push(item);
      });
      if (((this.params.page + 1) * this.params.size) >= parseInt(data.headers.get('X-Total-Count'))) {
        this.infiniteScrollEnabled = false;
      } else {
        this.infiniteScrollEnabled = true;
      }
    })
  }
  /**
   *下拉刷新
   *
   * @param {*} refresher
   * @memberof TenantManagePage
   */
  doRefresh(refresher) {
    this.params.page = 0;
    this.projectServiceProxy.queryProjects(this.params).subscribe(data => {
      data.body.forEach(item => {
        if (item.thumbnailPath === null) {
          item.thumbnailPath = 'assets/images/default.png';
        } else {
          item.thumbnailPath = this.fileUrl + encodeURIComponent(item.thumbnailPath);
        }

      });
      this.tenantItems = data.body;
      refresher.complete();
    })
  }

  /**
   *上拉加载更多
   *
   * @returns {Promise<any>}
   * @memberof TenantManagePage
   */
  doInfinite(): Promise<any> {

    return new Promise((resolve) => {
      this.params.page += 1;
      this.projectServiceProxy.queryProjects(this.params).subscribe(data => {
        data.body.forEach(item => {
          if (item.thumbnailPath === null) {
            item.thumbnailPath = 'assets/images/default.png';
          } else {
            item.thumbnailPath = this.fileUrl + encodeURIComponent(item.thumbnailPath);
          }
          this.tenantItems.push(item);
        });
        resolve();
      })
    })
  }
  search(info) {
    const value = this.searchValue.trim();
    this.params.page = 0;
    this.tenantItems = [];
    if (value) {
      this.params['name.contains'] = value;
      this.getProjectData();
    } else {
      delete this.params['name.contains'];
      this.getProjectData();
    }
  }

  geCenter() {
    this.navCtrl.push('PersonalPage');
  }

  getPromiss(projectId: string) {
    this.accountServiceProxy.getAllUserPermission(this.appSessionService.accountId, projectId).subscribe(data => {
      this.appSessionService.grantedPermissions = data.body;
      this.appSessionService.init().then(result => {
        if (result === true) {
          console.log(this.appSessionService.grantedPermissions);
          this.navCtrl.push('MenuOptionPage');
          // this.navCtrl.push('MenuPage');
          // const elements = document.querySelectorAll(".tabbar");
          // if (elements != null) {
          //   Object.keys(elements).map((key) => {
          //     elements[key].style.display = 'flex';
          //   });
          // }
        }
      }).catch(e => {
        this.loadCtrl.closeLoading();
        this.thsAlertController.basicAlert('错误', e.message, '关闭');
      });
    }, error2 => {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    })
  }

}
