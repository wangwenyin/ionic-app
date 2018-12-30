import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
import { QualityServiceProxy, FileServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';

/**
 * Generated class for the QualityManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-quality-manage',
  templateUrl: 'quality-manage.html',
})
export class QualityManagePage {

  // 设置默认选中页面
  public tabs: string = 'deal';

  needCount: number;

  recheckCount: number;

  dealCount: number;

  okCount: number;

  closeCount: number;

  allCount: number;

  size = 8;

  okParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  allParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  dealParams = {page: 0, size: 8, sort: 'creationTime,desc'};

  recheckParams = {page: 0, size: 8, sort: 'creationTime,desc'};

  closeParams = {page: 0, size: 8, sort: 'creationTime,desc'};

  projectName: string;

  checkList = [];

  dealList = [];

  closeList = [];

  okList = [];

  needList = [];

  questionList = [];

  all = [];

  imgUrl: string;

  infiniteScrollEnabled = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private appSessionService: AppSessionService,
    private qualityServiceProxy: QualityServiceProxy,
    private popoverCtrl: PopoverController,
    private fileServiceProxy: FileServiceProxy,
  ) {
    this.projectName = this.appSessionService.projectName;
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QualityManagePage');
    // var tabs = document.getElementsByClassName('tabbar').item(0);
    // tabs['style'].display = 'none';
    this.initParams();
    
  }

  ionViewDidEnter(){
    this.getQualityData();
  }

  goBack() {
    this.navCtrl.push('MenuOptionPage');
  }

  //离开页面的时候，设置显示下面的tabbar
  // ionViewWillLeave() {
  //   var tabs = document.getElementsByClassName('tabbar').item(0);
  //   tabs['style'].display = 'flex';
  // }

  onSearch(event) {
    let popover = this.popoverCtrl.create("SeachPopPage", {
      // searchValue: this.searchValue,
    });
    popover.present({
      ev: event
    });
    popover.onDidDismiss(data => {
      if (data) {
        // this.searchValue = data.searchValue;
        // this.page = 0;
        // this.refreshData(true);
      }
    })
  }


  addQuality() {
    this.navCtrl.push('AddQualityPage');
  }
  onShowDetail(item) {
    this.navCtrl.push('QualityCheckDetailPage', {id: item.id});
  }

  goModel() {
    this.navCtrl.push('QualityModelPage', { page: 'QualityManagePage' });
  }
  /**
   *获取初始数据
   *
   * @memberof QualityManagePage
   */
  getQualityData() {
    // this.qualityServiceProxy.getQualityKpiChecks(this.allParams).subscribe(data => {
    //   data.body.forEach(item => {
    //     if (!item['firstImagePath']) {
    //       item['firstImagePath'] = 'assets/images/one.jpg';
    //     } else {
    //       item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
    //     }
    //   });
    //   this.all = data.body;
    //   this.allCount = parseInt(data.headers.get('X-Total-Count'));
    //   console.log(data.body);
    // });
    this.qualityServiceProxy.getQualityKpiChecks(this.okParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.okList = data.body;
      this.okCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityKpiChecks(this.dealParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.dealList = data.body;
      this.dealCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityKpiChecks(this.recheckParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.checkList = data.body;
      this.recheckCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityKpiChecks(this.closeParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.closeList = data.body;
      this.closeCount = parseInt(data.headers.get('X-Total-Count'));
    });
  }

  loadDate(infiniteScroll, isRest) {
    return new Promise((resolve) => {
      if (this.tabs === 'all') {
        if (isRest) {
          this.allParams.page = 0;
          this.all = [];
        } else {
          this.allParams.page += 1;
        }

        this.qualityServiceProxy.getQualityKpiChecks(this.allParams).subscribe(data => {
          this.allCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['firstImagePath']) {
              item['firstImagePath'] = 'assets/images/one.jpg';
            } else {
              item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
            }
            this.all.push(item);
          });
          if (this.allCount === this.all.length) {
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
        this.qualityServiceProxy.getQualityKpiChecks(this.okParams).subscribe(data => {
          this.okCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['firstImagePath']) {
              item['firstImagePath'] = 'assets/images/one.jpg';
            } else {
              item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
            }
            this.okList.push(item);
          });
          if (this.okCount === this.okList.length) {
            this.infiniteScrollEnabled = false;
          }
        });
      } if (this.tabs === 'deal') {
        if (isRest) {
          this.dealParams.page = 0;
          this.dealList = [];
        } else {
          this.dealParams.page += 1;
        }
        // this.okParams.page += 1;
        this.qualityServiceProxy.getQualityKpiChecks(this.dealParams).subscribe(data => {
          this.dealCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['firstImagePath']) {
              item['firstImagePath'] = 'assets/images/one.jpg';
            } else {
              item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
            }
            this.dealList.push(item);
          });
          if (this.dealCount === this.dealList.length) {
            this.infiniteScrollEnabled = false;
          }
        });
      } else if (this.tabs === 'recheck') {
        if (isRest) {
          this.recheckParams.page = 0;
          this.checkList = [];
        } else {
          this.recheckParams.page += 1;
        }
        // this.okParams.page += 1;
        this.qualityServiceProxy.getQualityKpiChecks(this.recheckParams).subscribe(data => {
          this.recheckCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['firstImagePath']) {
              item['firstImagePath'] = 'assets/images/one.jpg';
            } else {
              item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
            }
            this.checkList.push(item);
          });
          if (this.recheckCount === this.checkList.length) {
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
        this.qualityServiceProxy.getQualityKpiChecks(this.closeParams).subscribe(data => {
          this.closeCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['firstImagePath']) {
              item['firstImagePath'] = 'assets/images/one.jpg';
            } else {
              item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
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
  // if (this.tabs === 'all') {
  //   this.allParams.page += 1;
  //   this.qualityServiceProxy.getQualityKpiChecks(this.allParams).subscribe(data => {
  //     data.body.forEach(item => {
  //       this.all.push(item);
  //     });
  //     console.log(data.body);
  //   });
  // }

  initParams() {
    if (this.appSessionService.projectId) {
      this.allParams['projectId.equals'] = this.appSessionService.projectId;
      this.okParams['projectId.equals'] = this.appSessionService.projectId;
      this.dealParams['projectId.equals'] = this.appSessionService.projectId;
      this.recheckParams['projectId.equals'] = this.appSessionService.projectId;
      this.closeParams['projectId.equals'] = this.appSessionService.projectId;
    }
    this.okParams['isPass.equals'] = true;
    this.dealParams['isPass.equals'] = false;
    this.recheckParams['isPass.equals'] = false;
    this.closeParams['isPass.equals'] = false;
    this.dealParams['state.in'] = ['1','2','3','4','5'];
    this.recheckParams['state.in'] = ['6','7'];
    this.closeParams['state.in'] = ['8'];
  }
  /**
   *下拉刷新
   * @param {*} event
   * @memberof QualityManagePage
   */
  doRefresh(refresher) {
    this.infiniteScrollEnabled = true;
    this.loadDate(refresher, true);
  }

  segmentChanged(event) {
    this.infiniteScrollEnabled = true;
    if (this.tabs === 'need') {

    } else if (this.tabs === 'recheck') {
      if (this.recheckCount === this.checkList.length) {
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
      if (this.allCount === this.all.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'deal') {
      if (this.dealCount === this.dealList.length) {
        this.infiniteScrollEnabled = false;
      }
    }
  }
}
