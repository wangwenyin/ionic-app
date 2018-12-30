import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
import { QualityServiceProxy, FileServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';

/**
 * Generated class for the DailyQualityManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-daily-quality-manage',
  templateUrl: 'daily-quality-manage.html',
})
export class DailyQualityManagePage {

  // 设置默认选中页面
  public tabs: string = 'deal';

  needCount: number;

  recheckCount: number;

  dealCount: number;

  closeCount: number;

  allCount: number;

  size = 8;

  allParams = { page: 0, size: 8, sort: 'creationTime,desc' };
  dealParams = { page: 0, size: 8, sort: 'creationTime,desc' };
  closeParams = { page: 0, size: 8, sort: 'creationTime,desc' };
  checkParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  projectName: string;

  checkList = [];

  dealList = [];

  needList = [];

  closeList = [];

  all = [];

  imgUrl: string;

  infiniteScrollEnabled = true;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
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
    this.getDate();
    this.initParms();
  }
  
  ionViewDidEnter() {
    this.getQualityData();
  }

  goBack() {
    // this.navCtrl.push('MenuPage');
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

  getDate() {
    for (let i = 0; i < 5; i++) {
      this.needList.push({ id: 1, name: '第' + (i + 1) + '个待整改问题', data: new Date(), creater: '张' + i })
      this.dealList.push({ id: 1, name: '第' + (i + 1) + '个待整改问题', data: new Date(), creater: '张' + i })
    }
    this.needList.forEach(item => {
      this.all.push(item);
    });

  }

  addQuality() {
    this.navCtrl.push('DailyQualityPage');
  }
  onShowDetail(item) {
    this.navCtrl.push('DailyQualityDetailPage', { id: item.id });
  }

  goModel() {
    this.navCtrl.push('QualityModelPage', { page: 'DailyQualityManagePage' });
  }

  getQualityData() {
    // this.qualityServiceProxy.getQualityNoKPICheck(this.allParams).subscribe(data => {
    //   data.body.forEach(item => {
    //     if (!item['firstImagePath']) {
    //       item['firstImagePath'] = 'assets/images/one.jpg';
    //     } else {
    //       item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
    //     }
    //   });
    //   this.all = data.body;
    //   this.allCount = parseInt(data.headers.get('X-Total-Count'));
    // });
    this.qualityServiceProxy.getQualityNoKPICheck(this.dealParams).subscribe(data => {
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
    this.qualityServiceProxy.getQualityNoKPICheck(this.checkParams).subscribe(data => {
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
    this.qualityServiceProxy.getQualityNoKPICheck(this.closeParams).subscribe(data => {
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

        this.qualityServiceProxy.getQualityNoKPICheck(this.allParams).subscribe(data => {
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
      } else if (this.tabs === 'deal') {
        if (isRest) {
          this.dealParams.page = 0;
          this.dealList = [];
        } else {
          this.dealParams.page += 1;
        }
        this.qualityServiceProxy.getQualityNoKPICheck(this.dealParams).subscribe(data => {
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
          this.checkParams.page = 0;
          this.checkList = [];
        } else {
          this.checkParams.page += 1;
        }
        this.qualityServiceProxy.getQualityNoKPICheck(this.checkParams).subscribe(data => {
          this.dealCount = parseInt(data.headers.get('X-Total-Count'));
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
        this.qualityServiceProxy.getQualityNoKPICheck(this.closeParams).subscribe(data => {
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

  initParms() {
    if (this.appSessionService.projectId) {
      this.allParams['projectId.equals'] = this.appSessionService.projectId;
      this.dealParams['projectId.equals'] = this.appSessionService.projectId;
      this.checkParams['projectId.equals'] = this.appSessionService.projectId;
      this.closeParams['projectId.equals'] = this.appSessionService.projectId;
    }
    // this.dealParams['isPass.equals'] = false;
    // this.checkParams['isPass.equals'] = false;
    // this.closeParams['isPass.equals'] = false;
    this.dealParams['state.in'] = ['1', '2', '3', '4','5'];
    this.checkParams['state.in'] = ['6', '7'];
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
    // if (this.tabs === 'need') {

    // } else if (this.tabs === 'recheck') {

    // } else if (this.tabs === 'close') {

    // } else if (this.tabs === 'ok') {
    //    if(this.okCount === this.okList.length) {
    //     this.infiniteScrollEnabled = false;
    //    }
    // } else if (this.tabs === 'all') {
    //   if(this.allCount === this.all.length) {
    //     this.infiniteScrollEnabled = false;
    //    }
    // }
    // refresher.complete();
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
