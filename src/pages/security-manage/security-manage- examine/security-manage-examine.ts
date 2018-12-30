import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsLoadingController } from '../../../shared/alert.service';
import { ExamineList } from '../security-mange-model';
import { SafeServiceProxy, FileServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';

@IonicPage()
@Component({
  selector: 'page-security-manage-examine',
  templateUrl: 'security-manage-examine.html',
})
export class SecurityManageExaminePage {

  // 设置默认选中页面
  public tabs: string = 'deal';

  toppings: string;
  projectName: string;
  segmentModel: string;
  status: string;
  ExamineList: any[] = [];
  needList = [];
  dealList = [];
  checkList = [];
  okList = [];
  allList = [];
  closeList = [];
  recheckList = [];
  infiniteScrollEnabled = true;
  dealCount: number;
  okCount: number;
  checkCount: number;
  allCount: number;
  closeCount: number;
  imgUrl: string;

  allParams = { page: 0, size: 8, sort: 'creationTime,desc' };
  okParams = { page: 0, siez: 8, sort: 'creationTime,desc' };
  dealParams = { page: 0, siez: 8, sort: 'creationTime,desc' };
  checkParams = { page: 0, siez: 8, sort: 'creationTime,desc' };
  closeParams = { page: 0, siez: 8, sort: 'creationTime,desc' };
  // ExamineList:ExamineList;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private appSessionService: AppSessionService,
    private viewCtrl: ViewController,
    private loadingCtrl: ThsLoadingController,
    private safeServiceProxy: SafeServiceProxy,
    private fileServiceProxy: FileServiceProxy,
  ) {
    this.projectName = this.appSessionService.projectName;
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    this.initParams();
    this.getData();
  }

  onBackPage() {
    // this.viewCtrl.dismiss();
    this.navCtrl.push('MenuOptionPage');
  }
  /**
   * 添加新的质量问题
   */
  onAdd() {
    this.navCtrl.push('SecurityExamineAddPage');
  }

  onShowDetail(info) {
    this.navCtrl.push('SecurityExamineEditPage', { id: info.id });
  }

  goModel() {
    this.navCtrl.push('SecurityManageModelPage', { page: 'SecurityManageExaminePage' });
  }

  getData() {

    this.safeServiceProxy.getKPISecurity(this.allParams).subscribe(data => {
      this.allList = data.body;
    });
    this.safeServiceProxy.getKPISecurity(this.okParams).subscribe(data => {
      this.okCount = parseInt(data.headers.get('X-Total-Count'));
      this.okList = data.body;
    });
    this.safeServiceProxy.getKPISecurity(this.dealParams).subscribe(data => {
      this.dealCount = parseInt(data.headers.get('X-Total-Count'));
      this.dealList = data.body;
    });
    this.safeServiceProxy.getKPISecurity(this.checkParams).subscribe(data => {
      this.checkCount = parseInt(data.headers.get('X-Total-Count'));
      this.checkList = data.body;
    });
    this.safeServiceProxy.getKPISecurity(this.closeParams).subscribe(data => {
      this.closeCount = parseInt(data.headers.get('X-Total-Count'));
      this.closeList = data.body;
    });
  }

  segmentChanged(event) {
    this.infiniteScrollEnabled = true;
    if (this.tabs === 'need') {

    } else if (this.tabs === 'recheck') {
      if (this.checkCount === this.checkList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'close') {
      if (this.closeCount === this.closeList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'ok') {
      if (this.okCount === this.okList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'all') {
      if (this.allCount === this.allList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'deal') {
      if (this.dealCount === this.dealList.length) {
        this.infiniteScrollEnabled = false;
      }
    }
  }

  doRefresh(refresher) {
    this.infiniteScrollEnabled = true;
    this.loadDate(refresher, true);
  }

  loadDate(infiniteScroll, isRest) {
    return new Promise((resolve) => {
      if (this.tabs === 'all') {
        if (isRest) {
          this.allParams.page = 0;
          this.allList = [];
        } else {
          this.allParams.page += 1;
        }
        this.safeServiceProxy.getKPISecurity(this.allParams).subscribe(data => {
          this.allCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['minPath']) {
              item['minPath'] = 'assets/images/one.jpg';
            } else {
              item['minPath'] = this.imgUrl + item['minPath'];
            }
            this.allList.push(item);
          });
          if (this.allCount === this.allList.length) {
            this.infiniteScrollEnabled = false;
          }
        });
      } else if (this.tabs === 'ok') {
        if (isRest) {
          this.okParams.page = 0;
          this.okList = [];
        } else {
          this.okParams.page += 1;
        }
        // this.okParams.page += 1;
        this.safeServiceProxy.getKPISecurity(this.okParams).subscribe(data => {
          this.okCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['minPath']) {
              item['minPath'] = 'assets/images/one.jpg';
            } else {
              item['minPath'] = this.imgUrl + item['minPath'];
            }
            this.okList.push(item);
          });
          if (this.okCount === this.okList.length) {
            this.infiniteScrollEnabled = false;
          }
        });
      } else if (this.tabs === 'deal') {
        if (isRest) {
          this.dealParams.page = 0;
          this.dealList = [];
        } else {
          this.dealParams.page += 1;
        }
        // this.okParams.page += 1;
        this.safeServiceProxy.getKPISecurity(this.dealParams).subscribe(data => {
          this.dealCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['minPath']) {
              item['minPath'] = 'assets/images/one.jpg';
            } else {
              item['minPath'] = this.imgUrl + item['minPath'];
            }
            this.dealList.push(item);
          });
          if (this.dealCount === this.dealList.length) {
            this.infiniteScrollEnabled = false;
          }
        });
      } else if (this.tabs === 'recheck') {
        if (isRest) {
          this.checkParams.page = 0;
          this.checkList = [];
        } else {
          this.checkParams.page += 1;
        }
        // this.okParams.page += 1;
        this.safeServiceProxy.getKPISecurity(this.checkParams).subscribe(data => {
          this.checkCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['minPath']) {
              item['minPath'] = 'assets/images/one.jpg';
            } else {
              item['minPath'] = this.imgUrl + item['minPath'];
            }
            this.checkList.push(item);
          });
          if (this.checkCount === this.checkList.length) {
            this.infiniteScrollEnabled = false;
          }
        });
      } else if (this.tabs === 'close') {
        if (isRest) {
          this.closeParams.page = 0;
          this.closeList = [];
        } else {
          this.closeParams.page += 1;
        }
        // this.okParams.page += 1;
        this.safeServiceProxy.getKPISecurity(this.closeParams).subscribe(data => {
          this.closeCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['minPath']) {
              item['minPath'] = 'assets/images/one.jpg';
            } else {
              item['minPath'] = this.imgUrl + item['minPath'];
            }
            this.closeList.push(item);
          });
          if (this.closeCount === this.closeList.length) {
            this.infiniteScrollEnabled = false;
          }
        });
      }
      infiniteScroll.complete();
      resolve();
    })
  }

  initParams() {
    this.allParams['projectId.equals'] = this.appSessionService.projectId;
    this.okParams['projectId.equals'] = this.appSessionService.projectId;
    this.dealParams['projectId.equals'] = this.appSessionService.projectId;
    this.checkParams['projectId.equals'] = this.appSessionService.projectId;
    this.closeParams['projectId.equals'] = this.appSessionService.projectId;

    this.okParams['isPass.equals'] = true;
    this.dealParams['isPass.equals'] = false;
    this.checkParams['isPass.equals'] = false;
    this.closeParams['isPass.equals'] = false;

    this.dealParams['state.in'] = ['1','2','3','4','5'];
    this.checkParams['state.in'] = ['6','7'];
    this.closeParams['state.equals'] = '8';
  }
}
