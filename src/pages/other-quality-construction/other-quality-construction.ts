import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../shared/app-session.service';
import { FileServiceProxy, QualityServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';

/**
 * Generated class for the OtherQualityConstructionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-other-quality-construction',
  templateUrl: 'other-quality-construction.html',
})
export class OtherQualityConstructionPage {
  // 设置默认选中页面
  public tabs: string = 'deal';

  needCount: number;

  closeCount: number;

  allCount: number;

  size = 8;

  dealParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  checkParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  closeParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  projectName: string;

  checkList = [];

  dealList = [];

  closeList = [];

  okList = [];

  questionList = [];

  all = [];

  dealCount: number;

  checkCount: number;

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
    this.navCtrl.push('AddQualityPatrolPage');
  }

  onShowDetail(item) {
    if (item.questionId === 1) {
      this.navCtrl.push('EngineerQualityDetailPage', {id: item.id});
    } else if (item.questionId === 2) {
      this.navCtrl.push('SupervisorCheckDetailPage', {id: item.id});
    } else if (item.questionId === 3) {
      this.navCtrl.push('SupervisorDailyDetailPage', {id: item.id});
    } else if (item.questionId === 4) {
      this.navCtrl.push('SupervisorImportmentDetailPage', {id: item.id});
    }
    console.log(item);
    // this.navCtrl.push('QualityPatrolDetailPage', { id: item.id });
  }

  goModel() {
    this.navCtrl.push('QualityModelPage', { page: 'DailyQualityManagePage' });
  }

  loadDate(infiniteScroll, isRest) {
    return new Promise((resolve) => {
      if (this.tabs === 'deal') {
        if (isRest) {
          this.dealParams.page = 0;
          this.dealList = [];
        } else {
          this.dealParams.page += 1;
        }
        this.qualityServiceProxy.getQualityAllQuestion(this.dealParams).subscribe(data => {
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
        this.qualityServiceProxy.getQualityAllQuestion(this.checkParams).subscribe(data => {
          this.dealCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['firstImagePath']) {
              item['firstImagePath'] = 'assets/images/one.jpg';
            } else {
              item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
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
        this.qualityServiceProxy.getQualityAllQuestion(this.closeParams).subscribe(data => {
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
    this.qualityServiceProxy.getQualityAllQuestion(this.dealParams).subscribe(data => {
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
    this.qualityServiceProxy.getQualityAllQuestion(this.checkParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.checkList = data.body;
      this.checkCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityAllQuestion(this.closeParams).subscribe(data => {
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

  /**
   *下拉刷新
   * @param {*} event
   * @memberof QualityManagePage
   */
  doRefresh(refresher) {
    this.infiniteScrollEnabled = true;
    this.loadDate(refresher, true);
    // console.log(event);
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
      if (this.checkCount === this.checkList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'close') {
      if (this.closeCount === this.closeList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'deal') {
      if (this.dealCount === this.dealList.length) {
        this.infiniteScrollEnabled = false;
      }
    }
  }

  initParams() {
    if (this.appSessionService.projectId) {
      this.dealParams['projectId.equals'] = this.appSessionService.projectId;
      this.checkParams['projectId.equals'] = this.appSessionService.projectId;
      this.closeParams['projectId.equals'] = this.appSessionService.projectId;
    }
    this.dealParams['isPass.equals'] = false;
    this.checkParams['isPass.equals'] = false;
    this.closeParams['isPass.equals'] = false;
    this.dealParams['state.in'] = ['4'];
    this.checkParams['state.in'] = ['5'];
    this.closeParams['state.in'] = ['8'];
    this.dealParams['questionType.in'] = ['2', '3', '4'];
    this.checkParams['questionType.in'] = ['2', '3', '4'];
    this.closeParams['questionType.in'] = ['2', '3', '4'];
  }
}
