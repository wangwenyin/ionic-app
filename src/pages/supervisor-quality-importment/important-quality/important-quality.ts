import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
// import { getScrollData } from 'ionic-angular/umd/components/input/input';
import { QualityServiceProxy, FileServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';

/**
 * Generated class for the ImportantQualityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-important-quality',
  templateUrl: 'important-quality.html',
})
export class ImportantQualityPage {

  // 设置默认选中页面
  public tabs: string = 'deal';

  toppings: string;

  projectName: string;

  questionList = [];

  allList = [];

  dealList = [];

  checkList = [];

  closeList = [];

  allParams = { page: 0, size: 8 };

  dealParams = { page: 0, size: 8 };

  checkParams = { page: 0, size: 8 };

  closeParams = { page: 0, size: 8 };

  infiniteScrollEnabled = true;

  allCount: number;

  dealCount: number;

  checkCount: number;

  closeCount: number;

  imgUrl: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private appSessionService: AppSessionService,
    private popoverCtrl: PopoverController,
    private qualityServiceProxy: QualityServiceProxy,
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

  ionViewDidEnter() {
    this.getData()
  }

  getData() {

    this.qualityServiceProxy.getQualityHighQuestion(this.dealParams).subscribe(data => {
      this.dealCount = parseInt(data.headers.get('X-Total-Count'));
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.dealList = data.body;
      console.log(this.dealList);
      if (this.dealCount === this.dealList.length) {
        this.infiniteScrollEnabled = false;
      }
    });
    this.qualityServiceProxy.getQualityHighQuestion(this.checkParams).subscribe(data => {
      this.checkCount = parseInt(data.headers.get('X-Total-Count'));
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.checkList = data.body;
      if (this.checkCount === this.checkList.length) {
        this.infiniteScrollEnabled = false;
      }
    });
    this.qualityServiceProxy.getQualityHighQuestion(this.closeParams).subscribe(data => {
      this.closeCount = parseInt(data.headers.get('X-Total-Count'));
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.closeList = data.body;
      if (this.closeCount === this.closeList.length) {
        this.infiniteScrollEnabled = false;
      }
    });
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
    });
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
        this.qualityServiceProxy.getQualityHighQuestion(this.allParams).subscribe(data => {
          this.allCount = parseInt(data.headers.get('X-Total-Count'));
          data.body.forEach(item => {
            if (!item['firstImagePath']) {
              item['firstImagePath'] = 'assets/images/one.jpg';
            } else {
              item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
            }
            this.allList.push(item);
          });
          if (this.allCount === this.allList.length) {
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
        this.qualityServiceProxy.getQualityHighQuestion(this.dealParams).subscribe(data => {
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
      } else if (this.tabs === 'check') {
        if (isRest) {
          this.checkParams.page = 0;
          this.checkList = [];
        } else {
          this.checkParams.page += 1;
        }
        this.qualityServiceProxy.getQualityHighQuestion(this.checkParams).subscribe(data => {
          this.checkCount = parseInt(data.headers.get('X-Total-Count'));
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
        this.qualityServiceProxy.getQualityHighQuestion(this.closeParams).subscribe(data => {
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

  addQuality() {
    this.navCtrl.push('AddImportmentQualityPage');
  }

  showDetail(value) {
    this.navCtrl.push('ImportmentQulityDetailPage', { id: value.id });
  }

  goModel() {
    this.navCtrl.push('QualityModelPage', { page: 'ImportantQualityPage' })
  }

  segmentChanged(event) {
    this.infiniteScrollEnabled = true;
    if (this.tabs === 'need') {

    } else if (this.tabs === 'deal') {
      if (this.dealCount === this.dealList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'close') {
      if (this.closeCount === this.closeList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'all') {
      if (this.allCount === this.allList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'check') {
      if (this.checkCount === this.checkList.length) {
        this.infiniteScrollEnabled = false;
      }
    }
  }

  initParams() {
    this.allParams['projectId.equals'] = this.appSessionService.projectId;
    this.dealParams['projectId.equals'] = this.appSessionService.projectId;
    this.checkParams['projectId.equals'] = this.appSessionService.projectId;
    this.closeParams['projectId.equals'] = this.appSessionService.projectId;
    this.allParams['sort'] = 'creationTime,desc';
    this.dealParams['sort'] = 'creationTime,desc';
    this.checkParams['sort'] = 'creationTime,desc';
    this.closeParams['sort'] = 'creationTime,desc';
    this.dealParams['state.in'] = ['1', '2', '3', '4','5'];
    this.checkParams['state.in'] = ['6','7'];
    this.closeParams['state.equals'] = '8';
  }
}
