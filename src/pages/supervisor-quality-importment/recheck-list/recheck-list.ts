import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QualityServiceProxy, FileServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';

/**
 * Generated class for the RecheckListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recheck-list',
  templateUrl: 'recheck-list.html',
})
export class RecheckListPage {

  infiniteScrollEnabled = true;

  id: string;

  records = [];

  params: any;

  page = 0;

  size = 8;

  allCount: number;

  imgUrl: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private appSessionService: AppSessionService,
    private fileServiceProxy: FileServiceProxy,
  ) {
    this.id = this.navParams.get('id');
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RecheckListPage');
    this.params = {
      'questionId.equals': this.id,
      'isDeleted.equals': 0,
      sort: 'creationTime,desc',
      page: 0,
      size: 8
    };
    this.getData();
  }

  getData() {
    if (this.id) {
      this.qualityServiceProxy.getQualityHighQuestionRecheck(this.params).subscribe(data => {
        this.allCount = parseInt(data.headers.get('X-Total-Count'));
        data.body.forEach(item => {
          if (item['minPathList']) {
            item['minUrl'] = this.imgUrl + item['minPathList'][0];
          } else {
            item['minUrl'] = 'assets/images/one.jpg';
          }
          // if (!item['minPath'][0]) {
          //   item['minPath'][0] = 'assets/images/one.jpg';
          // } else {
          //   item['minPath'][0] = this.imgUrl + item['minPath'];
          // }
          this.records.push(item);
        });
        if (((this.params.page + 1) * this.params.size) > this.allCount) {
          this.infiniteScrollEnabled = false;
        }
        this.records = data.body;
      })
    }
  }

  doRefresh(refresher) {
    this.infiniteScrollEnabled = true;
    this.loadDate(refresher, true);
  }

  loadDate(infiniteScroll, isRest) {
    return new Promise((resolve) => {

      if (isRest) {
        this.params.page = 0;
        this.records = [];
      } else {
        this.params.page += 1;
      }
      this.qualityServiceProxy.getQualityHighQuestionRecheck(this.params).subscribe(data => {
        this.allCount = parseInt(data.headers.get('X-Total-Count'));
        data.body.forEach(item => {
          if (item['minPathList']) {
            item['minUrl'] = this.imgUrl + item['minPathList'][0];
          } else {
            item['minUrl'] = 'assets/images/one.jpg';
          }
          this.records.push(item);
        });
        if (this.allCount === this.records.length) {
          this.infiniteScrollEnabled = false;
        }
      });
      infiniteScroll.complete();
      resolve();
    })
  }

  addCheck() {
    this.navCtrl.push('AddQualityRecheckPage', { id: this.id });
  }

  onShowDetail(obj) {
    this.navCtrl.push('ImportmentRecheckPage', { id: obj.id })
  }
}
